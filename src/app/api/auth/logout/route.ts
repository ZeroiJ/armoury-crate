import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const runtime = 'edge';

/**
 * Logout Endpoint
 * Clears the session cookie and redirects to home
 */
export async function GET(req: NextRequest) {
    const cookieStore = await cookies();
    cookieStore.delete('bnet_session');

    return NextResponse.redirect(new URL('/', req.url));
}
