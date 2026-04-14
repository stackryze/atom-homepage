import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getNotes, createNote, updateNote, deleteNote } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notes = getNotes(user.id);
    return NextResponse.json({ notes });
}

export async function POST(request: NextRequest) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { content, color } = body;
    if (!content || typeof content !== 'string' || content.length > 2000) {
        return NextResponse.json({ error: 'Content required (max 2000 chars)' }, { status: 400 });
    }

    const note = createNote(user.id, content, color || 'default');
    if (!note) {
        return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
    }

    return NextResponse.json({ note }, { status: 201 });
}

export async function PUT(request: NextRequest) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { id, content, color, pinned } = body;
    if (!id || !content || typeof content !== 'string' || content.length > 2000) {
        return NextResponse.json({ error: 'Invalid note data' }, { status: 400 });
    }

    const updated = updateNote(id, user.id, content, color, pinned);
    if (!updated) {
        return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '');

    if (!id || isNaN(id)) {
        return NextResponse.json({ error: 'Valid note ID required' }, { status: 400 });
    }

    const deleted = deleteNote(id, user.id);
    if (!deleted) {
        return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
}
