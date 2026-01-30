import { NextRequest, NextResponse } from 'next/server';
import { getTokensFromCode, getLinkedProfiles } from '../../../../services/bungie-auth';
import { SignJWT } from 'jose';

export const runtime = 'edge';

export async function GET(req: NextRequest, { params }: { params: Promise<{ route: string[] }> }) {
    const { route } = await params;
    const action = route[0];

    if (action === 'login') {
        const clientId = process.env.BUNGIE_CLIENT_ID;
        console.log("Auth Login: Checking Client ID");

        if (!clientId) {
            console.error("Auth Error: BUNGIE_CLIENT_ID is missing from environment variables.");
            return NextResponse.json({
                error: "Configuration Error",
                message: "BUNGIE_CLIENT_ID is not defined. Please check Cloudflare Pages settings."
            }, { status: 500 });
        }

        const redirectUrl = new URL('https://www.bungie.net/en/OAuth/Authorize');
        redirectUrl.searchParams.set('client_id', clientId);
        redirectUrl.searchParams.set('response_type', 'code');

        return NextResponse.redirect(redirectUrl);
    }

    if (action === 'callback') {
        const url = new URL(req.url);
        const code = url.searchParams.get('code');

        if (!code) {
            return NextResponse.json({ error: "Missing code" }, { status: 400 });
        }

        try {
            // 1. Exchange Code for Tokens
            const tokens = await getTokensFromCode(code);

            // 2. Fetch Profile
            const profileData = await getLinkedProfiles(tokens.access_token, tokens.membership_id);

            // 3. Parse with Gleam
            const profileJson = JSON.stringify(profileData);

            // Dynamic import to prevent route crash if Gleam module fails to load
            const { parse_linked_profiles } = await import('../../../../../core_logic/build/dev/javascript/core_logic/profile/parser.mjs');
            const characters = parse_linked_profiles(profileJson);

            // 4. Create Session
            const secret = new TextEncoder().encode(process.env.BUNGIE_CLIENT_SECRET || 'secret');
            const session = await new SignJWT({
                membershipId: tokens.membership_id,
                accessToken: tokens.access_token,
                characters: characters
            })
                .setProtectedHeader({ alg: 'HS256' })
                .setExpirationTime('1h')
                .sign(secret);

            const response = NextResponse.redirect(new URL('/dashboard', req.url));
            response.cookies.set('session', session, {
                httpOnly: true,
                secure: true,
                path: '/',
                sameSite: 'lax'
            });

            return response;

        } catch (error) {
            console.error("Auth Callback Error:", error);
            return NextResponse.json({ error: "Auth failed", details: String(error) }, { status: 500 });
        }
    }

    return NextResponse.json({ error: "Unknown auth action" }, { status: 400 });
}
