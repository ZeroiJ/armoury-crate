import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest, { params }: { params: Promise<{ route: string[] }> }) {
    const { route } = await params;
    const action = route[0];

    if (action === 'login') {
        return NextResponse.json({ message: "Initiating Login Flow", url: "https://www.bungie.net/en/OAuth/Authorize?..." });
    }

    if (action === 'callback') {
        return NextResponse.json({ message: "Processing Callback" });
    }

    return NextResponse.json({ error: "Unknown auth action" }, { status: 400 });
}
