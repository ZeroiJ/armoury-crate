import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest, { params }: { params: Promise<{ route: string[] }> }) {
    const { route } = await params;
    const action = route[0];

    if (action === 'login') {
        const clientId = process.env.BUNGIE_CLIENT_ID;
        if (!clientId) {
            return NextResponse.json({ error: "Missing BUNGIE_CLIENT_ID" }, { status: 500 });
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
        return NextResponse.json({ message: "Processing Callback" });
    }

    return NextResponse.json({ error: "Unknown auth action" }, { status: 400 });
}
