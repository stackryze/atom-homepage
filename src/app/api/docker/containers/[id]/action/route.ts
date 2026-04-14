import { NextRequest, NextResponse } from 'next/server';
import Docker from 'dockerode';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // Authentication check
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Validate container ID format
    if (!/^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,63}$/.test(id)) {
        return NextResponse.json({ error: 'Invalid container ID' }, { status: 400 });
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const { action } = body;

    try {
        const docker = new Docker();
        const container = docker.getContainer(id);

        let message = '';

        switch (action) {
            case 'start':
                await container.start();
                message = 'Container started successfully';
                break;
            case 'stop':
                await container.stop();
                message = 'Container stopped successfully';
                break;
            case 'restart':
                await container.restart();
                message = 'Container restarted successfully';
                break;
            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                );
        }

        return NextResponse.json({ success: true, message });
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Docker Action Error (${action}):`, error);
        return NextResponse.json(
            { error: `Failed to ${action} container`, details: errorMsg },
            { status: 500 }
        );
    }
}
