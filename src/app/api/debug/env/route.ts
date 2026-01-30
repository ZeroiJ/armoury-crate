import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
    // This endpoint checks if environment variables are accessible
    // It does NOT reveal the actual values
    const vars = {
        BUNGIE_CLIENT_ID: !!process.env.BUNGIE_CLIENT_ID,
        BUNGIE_CLIENT_SECRET: !!process.env.BUNGIE_CLIENT_SECRET,
        BUNGIE_API_KEY: !!process.env.BUNGIE_API_KEY,
    };

    const allPresent = Object.values(vars).every(Boolean);

    return NextResponse.json({
        status: allPresent ? 'OK' : 'MISSING_VARS',
        vars,
        timestamp: new Date().toISOString(),
    });
}
