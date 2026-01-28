import { NextRequest, NextResponse } from 'next/server';

// @ts-expect-error - Gleam build output might not be typed initially or path might need adjustment
import { hello } from '../../../../core_logic/build/dev/javascript/core_logic/gl/core_logic.mjs';
// Note: Adjusted path based on typical gleam build output 'build/dev/javascript/PROJECT/MODULE.mjs'
// However, 'package' name is 'core_logic'. 
// We will verify the path after build. For now guessing standard location.
// Actually standard is: ../../../../core_logic/build/dev/javascript/core_logic/core_logic.mjs

export const runtime = 'edge';

export async function GET() {
    // Dynamic import if needed, or static if build is prevalent.
    // For now using static import which requires build:gleam to run before Next.js build.

    // Wait, we need to import dynamically or ensure file exists.
    // But Next.js dev server might complain if missing.
    // We will assume `npm run build:gleam` is run at least once.

    try {
        const { hello } = await import('../../../../core_logic/build/dev/javascript/core_logic/core_logic.mjs');
        return NextResponse.json({ message: hello() });
    } catch (e) {
        return NextResponse.json({ error: "Gleam bridge failed", details: String(e) }, { status: 500 });
    }
}
