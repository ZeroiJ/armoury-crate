import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
    try {
        console.log('[Auth Login] Starting...');

        const clientId = process.env.BUNGIE_CLIENT_ID;

        console.log('[Auth Login] BUNGIE_CLIENT_ID present:', !!clientId);

        if (!clientId) {
            console.error('[Auth Login] BUNGIE_CLIENT_ID is missing!');
            return NextResponse.json({
                error: 'Configuration Error',
                message: 'BUNGIE_CLIENT_ID is not defined. Please check Cloudflare Pages settings.'
            }, { status: 500 });
        }

        const redirectUrl = new URL('https://www.bungie.net/en/OAuth/Authorize');
        redirectUrl.searchParams.set('client_id', clientId);
        redirectUrl.searchParams.set('response_type', 'code');

        console.log('[Auth Login] Redirecting to Bungie...');

        return NextResponse.redirect(redirectUrl.toString());
    } catch (error) {
        console.error('[Auth Login] Unexpected error:', error);
        return NextResponse.json({
            error: 'Unexpected Error',
            message: String(error)
        }, { status: 500 });
    }
}
