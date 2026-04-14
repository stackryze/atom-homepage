// Redirect utility functions to prevent open redirect vulnerabilities

export function isValidRedirectUrl(url: string, baseUrl: string): boolean {
    if (!url) return false;

    try {
        if (url.startsWith('/')) {
            // Block protocol-relative URLs and path traversal
            if (url.startsWith('//')) return false;
            // Normalize and check for path traversal
            const normalized = new URL(url, baseUrl).pathname;
            if (normalized.includes('..')) return false;
            return true;
        }

        const parsed = new URL(url, baseUrl);
        return parsed.origin === new URL(baseUrl).origin;
    } catch {
        return false;
    }
}

export function getSafeRedirectUrl(
    url: string | null | undefined,
    fallback: string,
    baseUrl: string
): string {
    if (!url) return fallback;
    return isValidRedirectUrl(url, baseUrl) ? url : fallback;
}


export function isValidServerRedirect(url: string, requestUrl: string): boolean {
    if (!url) return false;

    try {
        if (url.startsWith('/')) {
            if (url.startsWith('//')) return false;
            return true;
        }

        const requestOrigin = new URL(requestUrl).origin;
        const redirectUrl = new URL(url);

        return redirectUrl.origin === requestOrigin;
    } catch {
        return false;
    }
}
