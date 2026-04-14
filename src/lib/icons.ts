import type { SimpleIcon } from 'simple-icons';

// Cache resolved icons to avoid repeated lookups
const iconCache = new Map<string, SimpleIcon | null>();

/**
 * Get a simple-icon by slug name (e.g. 'plex', 'docker', 'github')
 * Uses dynamic import to avoid loading the entire 15MB+ simple-icons bundle
 */
export function getSimpleIcon(iconSlug: string): SimpleIcon | null {
    if (!iconSlug) return null;

    if (iconCache.has(iconSlug)) {
        return iconCache.get(iconSlug)!;
    }

    try {
        // simple-icons exports each icon as siName where Name is PascalCase
        const pascalName = 'si' + iconSlug.charAt(0).toUpperCase() + iconSlug.slice(1);
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const icons = require('simple-icons');
        const icon = icons[pascalName] as SimpleIcon | undefined;
        iconCache.set(iconSlug, icon || null);
        return icon || null;
    } catch {
        iconCache.set(iconSlug, null);
        return null;
    }
}

/**
 * Get all icon slugs for the icon picker (lazy — only computed once)
 */
let allIconsCache: { slug: string; title: string; path: string; hex: string }[] | null = null;

export function getAllIcons(): { slug: string; title: string; path: string; hex: string }[] {
    if (allIconsCache) return allIconsCache;

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const icons = require('simple-icons');
    allIconsCache = Object.values(icons)
        .filter((icon): icon is SimpleIcon => typeof icon === 'object' && icon !== null && 'slug' in icon)
        .map((icon) => ({
            slug: icon.slug,
            title: icon.title,
            path: icon.path,
            hex: icon.hex
        }));

    return allIconsCache;
}
