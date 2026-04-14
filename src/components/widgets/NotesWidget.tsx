'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pin, Trash2, StickyNote } from 'lucide-react';
import styles from './NotesWidget.module.css';

interface Note {
    id: number;
    content: string;
    color: string;
    pinned: number;
    created_at: string;
    updated_at: string;
}

const COLOR_MAP: Record<string, string> = {
    default: '#888',
    red: '#ef4444',
    orange: '#f97316',
    yellow: '#eab308',
    green: '#22c55e',
    blue: '#3b82f6',
    purple: '#a855f7',
};

function timeAgo(dateStr: string): string {
    const now = Date.now();
    const date = new Date(dateStr + 'Z').getTime();
    const diff = now - date;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export default function NotesWidget() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNote, setNewNote] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchNotes = useCallback(async () => {
        try {
            const res = await fetch('/api/notes');
            if (res.ok) {
                const data = await res.json();
                setNotes(data.notes);
            }
        } catch (e) {
            console.error('Failed to fetch notes:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    const addNote = async () => {
        if (!newNote.trim()) return;

        try {
            const res = await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newNote.trim() }),
            });
            if (res.ok) {
                setNewNote('');
                fetchNotes();
            }
        } catch (e) {
            console.error('Failed to add note:', e);
        }
    };

    const togglePin = async (note: Note) => {
        try {
            await fetch('/api/notes', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: note.id,
                    content: note.content,
                    color: note.color,
                    pinned: !note.pinned,
                }),
            });
            fetchNotes();
        } catch (e) {
            console.error('Failed to toggle pin:', e);
        }
    };

    const removeNote = async (id: number) => {
        try {
            await fetch(`/api/notes?id=${id}`, { method: 'DELETE' });
            setNotes(prev => prev.filter(n => n.id !== id));
        } catch (e) {
            console.error('Failed to delete note:', e);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            addNote();
        }
    };

    if (loading) {
        return <div className={styles.card}><div className={styles.empty}>Loading notes...</div></div>;
    }

    return (
        <div className={styles.card}>
            <div className={styles.addForm}>
                <input
                    className={styles.addInput}
                    placeholder="Add a quick note..."
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    onKeyDown={handleKeyDown}
                    maxLength={2000}
                    aria-label="New note"
                />
                <button
                    className={styles.addBtn}
                    onClick={addNote}
                    disabled={!newNote.trim()}
                    aria-label="Add note"
                >
                    <Plus size={16} />
                </button>
            </div>

            {notes.length === 0 ? (
                <div className={styles.empty}>
                    <StickyNote size={20} style={{ marginBottom: 4, opacity: 0.4 }} />
                    <div>No notes yet. Add one above!</div>
                </div>
            ) : (
                <div className={styles.notesList}>
                    {notes.map(note => (
                        <div
                            key={note.id}
                            className={`${styles.noteItem} ${note.pinned ? styles.pinned : ''}`}
                        >
                            <div
                                className={styles.noteColorDot}
                                style={{ background: COLOR_MAP[note.color] || COLOR_MAP.default }}
                            />
                            <div style={{ flex: 1 }}>
                                <div className={styles.noteContent}>{note.content}</div>
                                <div className={styles.noteTime}>{timeAgo(note.updated_at)}</div>
                            </div>
                            <div className={styles.noteActions}>
                                <button
                                    className={styles.noteActionBtn}
                                    onClick={() => togglePin(note)}
                                    title={note.pinned ? 'Unpin' : 'Pin'}
                                >
                                    <Pin size={12} style={{ opacity: note.pinned ? 1 : 0.5 }} />
                                </button>
                                <button
                                    className={`${styles.noteActionBtn} ${styles.danger}`}
                                    onClick={() => removeNote(note.id)}
                                    title="Delete"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
