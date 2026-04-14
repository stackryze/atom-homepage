import { NextRequest, NextResponse } from 'next/server';
import { fetchOIDCConfiguration } from '@/lib/oidc/client-discovery';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    // Only authenticated admins can use discovery (prevents SSRF)
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    // Validate it's a proper HTTPS URL (or localhost for dev)
    try {
        const parsed = new URL(url);
        if (!['https:', 'http:'].includes(parsed.protocol)) {
            return NextResponse.json({ error: 'Invalid URL protocol' }, { status: 400 });
        }
    } catch {
        return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    try {
        const config = await fetchOIDCConfiguration(url);
        return NextResponse.json(config);
    } catch (error) {
        console.error('Proxy discovery failed:', error);
        return NextResponse.json({ error: 'Failed to discover OIDC configuration' }, { status: 500 });
    }
}
