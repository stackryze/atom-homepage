import { NextRequest, NextResponse } from 'next/server';
import { checkServiceStatus } from '@/lib/status-checker';
import { getCurrentUser } from '@/lib/auth';
import { recordUptime } from '@/lib/db';
import { z } from 'zod';

const urlSchema = z.string().url('Invalid URL format');

export async function GET(request: NextRequest) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const urlString = searchParams.get('url');

    if (!urlString) {
        return NextResponse.json({ error: 'URL required' }, { status: 400 });
    }

    // Validate URL format
    const validationResult = urlSchema.safeParse(urlString);
    if (!validationResult.success) {
        return NextResponse.json(
            { error: validationResult.error.issues[0]?.message || 'Invalid URL' },
            { status: 400 }
        );
    }

    try {
        const result = await checkServiceStatus(validationResult.data);

        // Record uptime history
        const serviceId = searchParams.get('id') || validationResult.data;
        const status = result.up ? (result.latency > 500 ? 'slow' : 'up') : 'down';
        recordUptime(serviceId, status as 'up' | 'down' | 'slow', result.status, result.latency);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Status check error:', error);
        return NextResponse.json({ error: 'Failed to check service status' }, { status: 500 });
    }
}
