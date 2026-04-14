import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

// GET /api/favicon?url=https://example.com
// Returns favicon URL using Google's favicon service
export async function GET(request: NextRequest) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = request.nextUrl.searchParams.get('url');
    if (!url) {
        return NextResponse.json({ error: 'URL parameter required' }, { status: 400 });
    }

    try {
        const parsed = new URL(url);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return NextResponse.json({ error: 'Invalid protocol' }, { status: 400 });
        }
        
        const domain = parsed.hostname;
        
        // Return multiple favicon source options
        return NextResponse.json({
            domain,
            favicons: [
                `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
                `https://icons.duckduckgo.com/ip3/${domain}.ico`,
                `https://${domain}/favicon.ico`,
            ]
        });
    } catch {
        return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }
}
