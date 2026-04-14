import { NextResponse } from 'next/server';
import ping from 'ping';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Block private/internal IP ranges and metadata endpoints
function isUnsafeHost(host: string): boolean {
    // Block IP-based hosts
    const ipMatch = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipMatch) {
        const [, a, b, c] = ipMatch.map(Number);
        if (a === 127) return true;                           // Loopback
        if (a === 10) return true;                            // Private Class A
        if (a === 172 && b >= 16 && b <= 31) return true;    // Private Class B
        if (a === 192 && b === 168) return true;              // Private Class C
        if (a === 169 && b === 254) return true;              // Link-local / AWS metadata
        if (a === 0) return true;                             // 0.0.0.0
        if (a >= 224) return true;                            // Multicast/reserved
    }
    // Block hostname-based internal targets
    const lower = host.toLowerCase();
    if (lower === 'localhost') return true;
    if (lower.endsWith('.local')) return true;
    if (lower.endsWith('.internal')) return true;
    if (lower === 'metadata.google.internal') return true;
    return false;
}

export async function GET(request: Request) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const host = searchParams.get('host');

    if (!host) {
        return NextResponse.json({ error: 'Host parameter is required' }, { status: 400 });
    }

    // Validate host format (alphanumeric, dots, hyphens only)
    if (!/^[a-zA-Z0-9][a-zA-Z0-9.-]{0,253}[a-zA-Z0-9]$/.test(host) && !/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
        return NextResponse.json({ error: 'Invalid host format' }, { status: 400 });
    }

    // SSRF protection: block internal/private hosts
    if (isUnsafeHost(host)) {
        return NextResponse.json({ error: 'Host not allowed' }, { status: 403 });
    }

    try {
        // ping.promise.probe(host) returns { alive: boolean, time: number, ... }
        // On Windows, time might be 'unknown' or require parsing, but the library generally normalizes it.
        const res = await ping.promise.probe(host, {
            timeout: 2, // seconds
            extra: ["-c", "1"] // Linux/Mac count 1. Windows uses -n 1 by default in the lib?
            // actually the lib handles OS differences mostly, but let's trust defaults first.
        });

        return NextResponse.json({
            alive: res.alive,
            time: typeof res.time === 'number' ? res.time : 0,
            output: res.output
        });
    } catch (error) {
        console.error('Ping error:', error);
        return NextResponse.json({
            alive: false,
            time: 0,
            error: 'Ping failed'
        }, { status: 500 });
    }
}
