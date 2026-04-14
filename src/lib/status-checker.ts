import tcpPing from 'tcp-ping';

export type StatusResult = {
    up: boolean;
    status: number;
    latency: number;
    method: 'tcp-ping' | 'fetch';
    error?: string;
};

// Helper to determine if a hostname is likely internal
function isInternal(hostname: string): boolean {
    if (hostname === 'localhost') return true;
    const privateIpRegex = /^(127\.|192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/;
    if (privateIpRegex.test(hostname)) return true;
    if (!hostname.includes('.') || hostname.endsWith('.local')) return true;
    return false;
}

export async function checkServiceStatus(urlString: string): Promise<StatusResult> {
    const start = Date.now();

    try {
        const u = new URL(urlString);
        const internal = isInternal(u.hostname);

        if (internal) {
            return new Promise((resolve) => {
                const port = parseInt(u.port) || (u.protocol === 'https:' ? 443 : 80);

                tcpPing.ping({
                    address: u.hostname,
                    port: port,
                    attempts: 1,
                    timeout: 2000
                }, (err, data) => {
                    const result = data.results[0];
                    const isValid = !err && result && typeof result.time === 'number' && !Number.isNaN(result.time);
                    const finalLatency = isValid && result.time ? Math.round(result.time) : 0;

                    resolve({
                        up: isValid,
                        status: isValid ? 200 : 0,
                        latency: finalLatency,
                        method: 'tcp-ping'
                    });
                });
            });
        } else {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            try {
                // Use HEAD to measure latency without downloading the full response body.
                // Don't follow redirects — a 3xx still means the server is alive,
                // and following adds extra DNS+TLS round trips (e.g. google.com → www.google.com).
                let response = await fetch(urlString, {
                    method: 'HEAD',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                    },
                    signal: controller.signal,
                    cache: 'no-store',
                    redirect: 'manual'
                });

                const latency = Date.now() - start;

                // Some servers reject HEAD — retry with GET but abort the body immediately
                if (response.status === 405) {
                    const retryStart = Date.now();
                    response = await fetch(urlString, {
                        method: 'GET',
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                        },
                        signal: controller.signal,
                        cache: 'no-store',
                        redirect: 'manual'
                    });
                    clearTimeout(timeoutId);
                    try { response.body?.cancel(); } catch { /* ignore */ }

                    const retryLatency = Date.now() - retryStart;
                    return {
                        up: response.status > 0 && response.status < 500,
                        status: response.status,
                        latency: retryLatency,
                        method: 'fetch' as const
                    };
                }

                clearTimeout(timeoutId);

                // Discard the body to free resources
                try { response.body?.cancel(); } catch { /* ignore */ }

                // Treat 2xx and 3xx (redirects) as UP — the server responded
                const isUp = response.status > 0 && response.status < 500;

                return {
                    up: isUp,
                    status: response.status,
                    latency: latency,
                    method: 'fetch'
                };
            } catch (fetchErr) {
                // Ensure timeout is cleared even on error
                clearTimeout(timeoutId);
                return {
                    up: false,
                    status: 0,
                    error: (fetchErr as Error).message,
                    latency: Date.now() - start, // Calculate latency even on error
                    method: 'fetch'
                };
            }
        }
    } catch (error: unknown) {
        return {
            up: false,
            status: 0,
            error: error instanceof Error ? error.message : String(error),
            latency: 0,
            method: 'fetch'
        };
    }
}
