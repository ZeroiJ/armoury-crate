import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose';

export const runtime = 'edge';

const TOKEN_URL = 'https://www.bungie.net/platform/app/oauth/token/';

/**
 * Server-side OAuth Callback Endpoint
 * Exchanges code for tokens SERVER-SIDE (no Origin header sent)
 * @security client_secret never exposed to browser
 */
export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    console.log('[Auth Callback] Received callback');

    // Validate state
    const cookieStore = await cookies();
    const storedState = cookieStore.get('oauth_state')?.value;

    if (!state || state !== storedState) {
        console.error('[Auth Callback] State mismatch - possible CSRF attack');
        return NextResponse.json({ error: 'Invalid state parameter' }, { status: 400 });
    }

    // Clear state cookie
    cookieStore.delete('oauth_state');

    if (!code) {
        console.error('[Auth Callback] No code in callback');
        return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
    }

    // Get server-side secrets (never exposed to client)
    const clientId = process.env.BUNGIE_CLIENT_ID;
    const clientSecret = process.env.BUNGIE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        console.error('[Auth Callback] Missing server credentials');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    try {
        console.log('[Auth Callback] Exchanging code for tokens (server-to-server)');

        // Server-to-server request - NO Origin header sent
        // This bypasses the OriginHeaderDoesNotMatchKey error
        const tokenResponse = await fetch(TOKEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                // Do NOT send Origin header - this is key
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                client_id: clientId,
                client_secret: clientSecret,
            }),
        });

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error('[Auth Callback] Token exchange failed:', errorText);
            return NextResponse.json({
                error: 'Token exchange failed',
                details: errorText
            }, { status: 500 });
        }

        const tokenData = await tokenResponse.json();
        console.log('[Auth Callback] Token exchange successful');

        // Create session JWT
        const secret = new TextEncoder().encode(clientSecret);
        const session = await new SignJWT({
            membershipId: tokenData.membership_id,
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            accessTokenExpires: Date.now() + (tokenData.expires_in * 1000),
            refreshTokenExpires: Date.now() + (tokenData.refresh_expires_in * 1000),
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('7d')
            .sign(secret);

        console.log('[Auth Callback] Session created, redirecting to dashboard');

        // Set HttpOnly session cookie
        const response = NextResponse.redirect(new URL('/dashboard', req.url));
        response.cookies.set('bnet_session', session, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('[Auth Callback] Unexpected error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: String(error)
        }, { status: 500 });
    }
}
