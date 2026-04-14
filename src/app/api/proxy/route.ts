import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Block private/internal IP ranges to prevent SSRF
function isUnsafeUrl(urlString: string): boolean {
    try {
        const url = new URL(urlString);
        // Only allow http and https protocols
        if (!['http:', 'https:'].includes(url.protocol)) return true;

        const hostname = url.hostname.toLowerCase();

        // Block localhost variants
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname === '[::1]') return true;
        if (hostname.endsWith('.local') || hostname.endsWith('.internal')) return true;
        if (hostname === '0.0.0.0') return true;
        if (hostname === 'metadata.google.internal') return true;

        // Block private IP ranges
        const ipMatch = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
        if (ipMatch) {
            const [, a, b] = ipMatch.map(Number);
            if (a === 127) return true;                           // Loopback
            if (a === 10) return true;                            // Private Class A
            if (a === 172 && b >= 16 && b <= 31) return true;    // Private Class B
            if (a === 192 && b === 168) return true;              // Private Class C
            if (a === 169 && b === 254) return true;              // Link-local / AWS metadata
            if (a === 0) return true;                             // 0.0.0.0/8
            if (a >= 224) return true;                            // Multicast/reserved
        }

        return false;
    } catch {
        return true; // Invalid URL = unsafe
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

    // Security: Ensure user is authenticated to prevent open proxy abuse
    const user = await getCurrentUser();
    if (!user) {
        console.error('Proxy Auth Failed: No user found via getCurrentUser');
        return NextResponse.json({ error: 'Atom Proxy Unauthorized: Please log in again.' }, { status: 403 });
    }

    if (!targetUrl) {
        return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
    }

    // SSRF protection: validate URL scheme and block internal targets
    if (isUnsafeUrl(targetUrl)) {
        return NextResponse.json({ error: 'URL not allowed' }, { status: 403 });
    }

    try {
        const headers = new Headers();
        const userAgent = request.headers.get('user-agent');
        if (userAgent) {
            headers.set('User-Agent', userAgent);
        } else {
            headers.set('User-Agent', 'Atom-Dashboard-Proxy/1.0');
        }

        const res = await fetch(targetUrl, { headers });

        if (!res.ok) {
            return NextResponse.json(
                { error: `Proxy received ${res.status} from target` },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Proxy error for ${targetUrl}:`, error);
        return NextResponse.json(
            { error: 'Failed to fetch target URL', details: errorMsg },
            { status: 502 }
        );
    }
}
