import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
    // Step 1: Basic response test
    console.log('[Login] Step 1: Handler invoked');

    try {
        // Step 2: Check env vars
        const clientId = process.env.BUNGIE_CLIENT_ID;
        console.log('[Login] Step 2: BUNGIE_CLIENT_ID exists:', !!clientId);

        if (!clientId) {
            return NextResponse.json({
                error: 'BUNGIE_CLIENT_ID missing',
                step: 2
            }, { status: 500 });
        }

        // Step 3: Build redirect URL
        console.log('[Login] Step 3: Building redirect URL');
        const url = `https://www.bungie.net/en/OAuth/Authorize?client_id=${clientId}&response_type=code`;

        // Step 4: Redirect
        console.log('[Login] Step 4: Redirecting to:', url);
        return NextResponse.redirect(url);

    } catch (error) {
        console.error('[Login] Uncaught error:', error);
        return NextResponse.json({
            error: 'Unexpected error',
            message: String(error)
        }, { status: 500 });
    }
}
