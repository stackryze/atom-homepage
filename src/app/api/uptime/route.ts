import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getUptimeHistory, getUptimeSummary, getAllUptimeSummaries } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/uptime?service_id=xxx&hours=24 — Get uptime history for a service
 * GET /api/uptime?summary=true&hours=24 — Get summary for all services
 */
export async function GET(request: NextRequest) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const serviceId = searchParams.get('service_id');
    const hours = parseInt(searchParams.get('hours') || '24');
    const summary = searchParams.get('summary') === 'true';

    if (hours < 1 || hours > 720) {
        return NextResponse.json({ error: 'Hours must be between 1 and 720' }, { status: 400 });
    }

    if (summary) {
        const summaries = getAllUptimeSummaries(hours);
        return NextResponse.json({ summaries });
    }

    if (!serviceId) {
        return NextResponse.json({ error: 'service_id required' }, { status: 400 });
    }

    const history = getUptimeHistory(serviceId, hours);
    const serviceSummary = getUptimeSummary(serviceId, hours);

    return NextResponse.json({
        service_id: serviceId,
        hours,
        summary: serviceSummary,
        history,
    });
}
