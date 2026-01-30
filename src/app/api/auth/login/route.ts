import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const runtime = 'edge';

/**
 * Server-side OAuth Login Endpoint - SAFETY MODE
 * Full error visibility for debugging
 */
export async function GET() {
    try {
        console.log('[Auth Login] Starting...');

        const clientId = process.env.BUNGIE_CLIENT_ID;
        console.log('[Auth Login] Checking Client ID:', !!clientId);

        if (!clientId) {
            throw new Error('BUNGIE_CLIENT_ID is missing from environment variables');
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

        console.log('[Auth Login] Redirecting to:', authUrl.toString());
        return NextResponse.redirect(authUrl.toString());

    } catch (error: unknown) {
        const err = error as Error;
        console.error('[Auth Login] CRASH:', err);

        return NextResponse.json({
            error: 'Login Route Crashed',
            details: err.message,
            env_client_id_exists: !!process.env.BUNGIE_CLIENT_ID
        }, { status: 500 });
    }
}
