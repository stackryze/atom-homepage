import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { Service } from '@/types';

// POST /api/services/bulk - Import services from JSON or CSV text
export async function POST(request: NextRequest) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { format, data } = body;

        if (!data || typeof data !== 'string') {
            return NextResponse.json({ error: 'Data string is required' }, { status: 400 });
        }

        let services: Partial<Service>[] = [];

        if (format === 'json') {
            try {
                const parsed = JSON.parse(data);
                if (Array.isArray(parsed)) {
                    services = parsed;
                } else if (parsed.services && Array.isArray(parsed.services)) {
                    services = parsed.services;
                } else {
                    return NextResponse.json({ error: 'JSON must be an array of services or have a services array' }, { status: 400 });
                }
            } catch {
                return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
            }
        } else if (format === 'csv') {
            const lines = data.trim().split('\n');
            if (lines.length < 2) {
                return NextResponse.json({ error: 'CSV must have header and at least one data row' }, { status: 400 });
            }

            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            const nameIdx = headers.indexOf('name');
            const urlIdx = headers.indexOf('url');

            if (nameIdx === -1 || urlIdx === -1) {
                return NextResponse.json({ error: 'CSV must have "name" and "url" columns' }, { status: 400 });
            }

            const iconIdx = headers.indexOf('icon');
            const categoryIdx = headers.indexOf('category');
            const descriptionIdx = headers.indexOf('description');
            const tagsIdx = headers.indexOf('tags');

            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.trim());
                if (!values[nameIdx] || !values[urlIdx]) continue;

                const svc: Partial<Service> = {
                    name: values[nameIdx],
                    url: values[urlIdx],
                };
                if (iconIdx !== -1 && values[iconIdx]) svc.icon = values[iconIdx];
                if (categoryIdx !== -1 && values[categoryIdx]) svc.category = values[categoryIdx];
                if (descriptionIdx !== -1 && values[descriptionIdx]) svc.description = values[descriptionIdx];
                if (tagsIdx !== -1 && values[tagsIdx]) svc.tags = values[tagsIdx].split(';').map(t => t.trim()).filter(Boolean);

                services.push(svc);
            }
        } else {
            return NextResponse.json({ error: 'Format must be "json" or "csv"' }, { status: 400 });
        }

        // Validate all services have required fields
        const validServices: Service[] = [];
        const errors: string[] = [];

        for (const svc of services) {
            if (!svc.name) { errors.push(`Missing name for service`); continue; }
            if (!svc.url) { errors.push(`Missing URL for "${svc.name}"`); continue; }

            try {
                const parsed = new URL(svc.url);
                if (!['http:', 'https:'].includes(parsed.protocol)) {
                    errors.push(`Invalid protocol for "${svc.name}": ${svc.url}`);
                    continue;
                }
            } catch {
                errors.push(`Invalid URL for "${svc.name}": ${svc.url}`);
                continue;
            }

            validServices.push({
                id: svc.id || Date.now().toString() + '-' + Math.random().toString(36).substring(2, 7),
                name: svc.name,
                url: svc.url,
                icon: svc.icon || '',
                category: svc.category || '',
                description: svc.description || '',
                tags: svc.tags || [],
                createdAt: Date.now(),
                updatedAt: Date.now(),
            });
        }

        return NextResponse.json({
            services: validServices,
            imported: validServices.length,
            errors,
        });
    } catch {
        return NextResponse.json({ error: 'Failed to process import' }, { status: 500 });
    }
}
