import { NextResponse } from 'next/server';

import { hello } from '../../../../core_logic/build/dev/javascript/core_logic/core_logic.mjs';

export const runtime = 'edge';

export async function GET() {
    return NextResponse.json({ message: hello() });
}
