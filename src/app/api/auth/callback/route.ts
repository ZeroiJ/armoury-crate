import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose';

export const runtime = 'edge';

const TOKEN_URL = 'https://www.bungie.net/platform/app/oauth/token/';

/**
 * Server-side OAuth Callback Endpoint - SAFETY MODE
 * Full error visibility for debugging
 */
export async function GET(req: NextRequest) {
    // SAFETY: Wrap everything in try/catch
    try {
        console.log('[Auth Callback] === START ===');

        // STEP 1: Check environment variables FIRST
        const clientId = process.env.BUNGIE_CLIENT_ID;
        const clientSecret = process.env.BUNGIE_CLIENT_SECRET;

        console.log('[Auth Callback] Env check - CLIENT_ID exists:', !!clientId);
        console.log('[Auth Callback] Env check - CLIENT_SECRET exists:', !!clientSecret);

        if (!clientId || !clientSecret) {
            throw new Error(`Missing Env Vars: CLIENT_ID=${!!clientId}, CLIENT_SECRET=${!!clientSecret}`);
        }

        // STEP 2: Get URL params
        const url = new URL(req.url);
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');

        console.log('[Auth Callback] Received - code:', !!code, 'state:', !!state);

        if (!code) {
            throw new Error('Missing authorization code in callback URL');
        }

        // STEP 3: Validate state (CSRF protection)
        const cookieStore = await cookies();
        const storedState = cookieStore.get('oauth_state')?.value;

        console.log('[Auth Callback] State check - stored:', !!storedState, 'received:', !!state);

        if (!state || state !== storedState) {
            throw new Error(`State mismatch: stored=${storedState}, received=${state}`);
        }

        // Clear state cookie
        cookieStore.delete('oauth_state');

        // STEP 4: Exchange code for tokens (SERVER-TO-SERVER - NO ORIGIN HEADER)
        console.log('[Auth Callback] Exchanging code for tokens...');

        const tokenResponse = await fetch(TOKEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                client_id: clientId,
                client_secret: clientSecret,
            }),
        });

        console.log('[Auth Callback] Token response status:', tokenResponse.status);

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error('[Auth Callback] Token exchange failed:', errorText);
            throw new Error(`Token exchange failed (${tokenResponse.status}): ${errorText}`);
        }

        const tokenData = await tokenResponse.json();
        console.log('[Auth Callback] Token data received, membership_id:', tokenData.membership_id);

        // STEP 5: Create JWT session
        console.log('[Auth Callback] Creating JWT session...');

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

        console.log('[Auth Callback] JWT created, redirecting to dashboard...');

        // STEP 6: Set cookie and redirect
        const response = NextResponse.redirect(new URL('/dashboard', req.url));
        response.cookies.set('bnet_session', session, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        console.log('[Auth Callback] === SUCCESS ===');
        return response;

    } catch (error) {
        // SAFETY: Catch everything and display the error
        const err = error as Error;
        console.error('[Auth Callback] === CRASH ===', err.message, err.stack);

        return NextResponse.json({
            error: err.message,
            stack: err.stack,
            timestamp: new Date().toISOString(),
        }, { status: 500 });
    }
}
