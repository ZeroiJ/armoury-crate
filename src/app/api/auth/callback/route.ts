import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
    try {
        // 1. Debug: Print Env Vars (Safe versions) to Console
        console.log("Debug: Starting Callback");
        const clientId = process.env.BUNGIE_CLIENT_ID;
        const clientSecret = process.env.BUNGIE_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            throw new Error(`Missing Env Vars! ID: ${clientId ? 'OK' : 'MISSING'}, Secret: ${clientSecret ? 'OK' : 'MISSING'}`);
        }

        // 2. Get Code
        const searchParams = request.nextUrl.searchParams;
        const code = searchParams.get('code');

        if (!code) {
            throw new Error("No code provided by Bungie");
        }

        // 3. Attempt Token Exchange (The likely crash point)
        console.log("Debug: Fetching Token...");
        const tokenResponse = await fetch("https://www.bungie.net/platform/app/oauth/token/", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
                // Note: NO Origin header to avoid CORS errors
            },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code: code,
                client_id: clientId,
                client_secret: clientSecret,
            }),
        });

        const data = await tokenResponse.json();

        if (!tokenResponse.ok) {
            throw new Error(`Bungie Error: ${JSON.stringify(data)}`);
        }

        // 4. If we get here, it worked!
        return NextResponse.json({ success: true, message: "Token Received!", data: data });

    } catch (error: unknown) {
        // CRITICAL: Return the error as JSON so the user sees it in the browser
        const err = error as Error;
        console.error("Auth Crash:", err);
        return NextResponse.json(
            { error: "Callback Crashed", details: err.message, stack: err.stack },
            { status: 500 }
        );
    }
}
