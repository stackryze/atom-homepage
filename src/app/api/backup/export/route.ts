import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getConfig, saveConfig } from '@/lib/config';
import { logActivity } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/backup/export — Export full configuration as JSON
 */
export async function GET() {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const config = await getConfig();

    const exportData = {
        version: '1.0',
        exported_at: new Date().toISOString(),
        exported_by: user.username,
        config,
    };

    logActivity(user.id, user.username, 'config_export', 'config', 'Exported configuration');

    return new NextResponse(JSON.stringify(exportData, null, 2), {
        headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="atom-backup-${new Date().toISOString().split('T')[0]}.json"`,
        },
    });
}

/**
 * POST /api/backup/export — Import configuration from JSON
 */
export async function POST(request: NextRequest) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON file' }, { status: 400 });
    }

    // Validate import structure
    if (!body.config || !body.version) {
        return NextResponse.json({ error: 'Invalid backup file format. Must have version and config fields.' }, { status: 400 });
    }

    // Basic validation of config shape
    const config = body.config;
    if (!config.title || !config.services || !config.layout) {
        return NextResponse.json({ error: 'Invalid config structure. Missing required fields.' }, { status: 400 });
    }

    await saveConfig(config);
    logActivity(user.id, user.username, 'config_import', 'config', `Imported configuration (v${body.version})`);

    return NextResponse.json({ success: true, message: 'Configuration imported successfully' });
}
