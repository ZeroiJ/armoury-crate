import { NextRequest, NextResponse } from 'next/server';
import { getTokensFromCode, getLinkedProfiles } from '../../../../services/bungie-auth';
import { SignJWT } from 'jose';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    console.log('[Auth Callback] Starting...');

    const url = new URL(req.url);
    const code = url.searchParams.get('code');

    if (!code) {
        console.error('[Auth Callback] Missing code parameter');
        return NextResponse.json({ error: 'Missing code' }, { status: 400 });
    }

    try {
        console.log('[Auth Callback] Exchanging code for tokens...');
        const tokens = await getTokensFromCode(code);
        console.log('[Auth Callback] Tokens received, fetching profile...');

        const profileData = await getLinkedProfiles(tokens.access_token, tokens.membership_id);
        console.log('[Auth Callback] Profile fetched');

        // Store profile data directly (Gleam parsing removed)
        const characters = profileData;

        // Create Session
        const secret = new TextEncoder().encode(process.env.BUNGIE_CLIENT_SECRET || 'secret');
        const session = await new SignJWT({
            membershipId: tokens.membership_id,
            accessToken: tokens.access_token,
            characters: characters
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('1h')
            .sign(secret);

        console.log('[Auth Callback] Session created, redirecting to dashboard...');

        const response = NextResponse.redirect(new URL('/dashboard', req.url));
        response.cookies.set('session', session, {
            httpOnly: true,
            secure: true,
            path: '/',
            sameSite: 'lax'
        });

        return response;

    } catch (error) {
        console.error('[Auth Callback] Error:', error);
        return NextResponse.json({
            error: 'Auth failed',
            details: String(error)
        }, { status: 500 });
    }
}
