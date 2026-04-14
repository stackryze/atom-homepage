import { NextRequest, NextResponse } from 'next/server';
import Docker from 'dockerode';
import { Duplex } from 'stream';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Max concurrent sessions to prevent memory exhaustion
const MAX_SESSIONS = 20;
const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes

// Store active exec sessions in memory (consider Redis for production)
const activeSessions = new Map<string, { stream: Duplex; exec: Docker.Exec }>();

// Validate container ID format (hex string, 12-64 chars)
function isValidContainerId(id: string): boolean {
    return /^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,63}$/.test(id);
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // Authentication check
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Validate container ID
    if (!isValidContainerId(id)) {
        return NextResponse.json({ error: 'Invalid container ID' }, { status: 400 });
    }

    // Enforce max sessions
    if (activeSessions.size >= MAX_SESSIONS) {
        return NextResponse.json({ error: 'Too many active sessions' }, { status: 429 });
    }

    try {
        const docker = new Docker();
        const container = docker.getContainer(id);

        // Create exec instance for interactive shell
        const exec = await container.exec({
            Cmd: ['/bin/sh'],
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
        });

        // Start exec and get stream
        const stream = await exec.start({
            hijack: true,
            stdin: true,
            Tty: true,
        }) as unknown as Duplex;

        // Store session for input handling
        const sessionId = `${id}-${Date.now()}`;
        activeSessions.set(sessionId, { stream, exec });

        // Clean up after timeout
        setTimeout(() => {
            activeSessions.delete(sessionId);
            stream.destroy();
        }, SESSION_TIMEOUT);

        // Create readable stream for response
        const readableStream = new ReadableStream({
            start(controller) {
                // Send session ID as first message
                controller.enqueue(new TextEncoder().encode(`SESSION:${sessionId}\n`));

                stream.on('data', (chunk: Buffer) => {
                    controller.enqueue(chunk);
                });

                stream.on('end', () => {
                    activeSessions.delete(sessionId);
                    controller.close();
                });

                stream.on('error', (err: Error) => {
                    console.error('Exec stream error:', err);
                    activeSessions.delete(sessionId);
                    controller.error(err);
                });
            },
            cancel() {
                activeSessions.delete(sessionId);
                stream.destroy();
            }
        });

        return new NextResponse(readableStream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
                'X-Content-Type-Options': 'nosniff',
                'X-Session-Id': sessionId,
            },
        });
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error('Docker Exec Error:', error);
        return NextResponse.json(
            { error: 'Failed to create exec session', details: errorMsg },
            { status: 500 }
        );
    }
}

// Handle input to exec session
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // Authentication check
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await params; // consume params

    try {
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
        }
        const { sessionId, data } = body;

        if (!sessionId || data === undefined) {
            return NextResponse.json({ error: 'Missing sessionId or data' }, { status: 400 });
        }

        const session = activeSessions.get(sessionId);
        if (!session) {
            return NextResponse.json({ error: 'Session not found or expired' }, { status: 404 });
        }

        // Write data to stdin
        session.stream.write(data);

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error('Exec input error:', error);
        return NextResponse.json({ error: 'Failed to send input', details: errorMsg }, { status: 500 });
    }
}
