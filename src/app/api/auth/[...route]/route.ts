import { NextRequest, NextResponse } from 'next/server';
import { getTokensFromCode, getLinkedProfiles } from '../../../../services/bungie-auth';

import { parse_linked_profiles } from '../../../../../core_logic/build/dev/javascript/core_logic/profile/parser.mjs';
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

        // Construct Bungie OAuth URL
        // Scope is typically basic profile, but we might need more later.
        // state parameter should be used for CSRF protection in production.
        const redirectUrl = new URL('https://www.bungie.net/en/OAuth/Authorize');
        redirectUrl.searchParams.set('client_id', clientId);
        redirectUrl.searchParams.set('response_type', 'code');
        // redirectUrl.searchParams.set('state', 'SOME_RANDOM_STATE'); // TODO: Add state

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
            // We use '254' (BungieNext) temporarily to find linked profiles if membershipId is generic.
            // But tokens return 'membership_id'.
            const profileData = await getLinkedProfiles(tokens.access_token, tokens.membership_id);

            // 3. Parse with Gleam
            // We need to stringify because Gleam expects a JSON string to parse.
            const profileJson = JSON.stringify(profileData);
            const characters = parse_linked_profiles(profileJson);

            // 4. Create Session (Simplified for First Light)
            // In production, we'd encrypt this properly.
            const secret = new TextEncoder().encode(process.env.BUNGIE_CLIENT_SECRET || 'secret');
            const session = await new SignJWT({
                membershipId: tokens.membership_id,
                accessToken: tokens.access_token,
                characters: characters // Store parsed info in session for easy access
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
