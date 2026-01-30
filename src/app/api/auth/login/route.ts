import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const runtime = 'edge';

/**
 * Server-side OAuth Login Endpoint
 * Generates auth URL and redirects to Bungie
 * @security Server-side only - no client secrets exposed
 */
export async function GET() {
    const clientId = process.env.BUNGIE_CLIENT_ID;

    if (!clientId) {
        console.error('[Auth Login] BUNGIE_CLIENT_ID not configured');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Generate state for CSRF protection
    const state = crypto.randomUUID();

    // Store state in cookie for validation in callback
    const cookieStore = await cookies();
    cookieStore.set('oauth_state', state, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 300, // 5 minutes
        path: '/',
    });

    const authUrl = new URL('https://www.bungie.net/en/OAuth/Authorize');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('state', state);

    console.log('[Auth Login] Redirecting to Bungie OAuth');
    return NextResponse.redirect(authUrl.toString());
}
