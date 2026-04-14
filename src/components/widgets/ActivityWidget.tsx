'use client';

import { useState, useEffect, useCallback } from 'react';
import { Activity, User, Settings, Shield, Database, RefreshCw } from 'lucide-react';
import styles from './ActivityWidget.module.css';

interface ActivityEntry {
    id: number;
    user_id: number;
    username: string;
    action: string;
    details: string;
    ip_address: string;
    created_at: string;
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
    login: <User size={14} />,
    logout: <User size={14} />,
    config_update: <Settings size={14} />,
    service_add: <Database size={14} />,
    service_delete: <Database size={14} />,
    user_create: <Shield size={14} />,
    user_delete: <Shield size={14} />,
    backup_export: <Database size={14} />,
    backup_import: <Database size={14} />,
};

function timeAgo(dateStr: string): string {
    const now = Date.now();
    const date = new Date(dateStr).getTime();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

export default function ActivityWidget() {
    const [activities, setActivities] = useState<ActivityEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchActivity = useCallback(async () => {
        try {
            const res = await fetch('/api/activity?limit=15');
            if (res.ok) {
                const data = await res.json();
                setActivities(data.activities || []);
            }
        } catch {
            console.error('Failed to fetch activity');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchActivity();
        const interval = setInterval(fetchActivity, 30000);
        return () => clearInterval(interval);
    }, [fetchActivity]);

    return (
        <div className={styles.widget}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <Activity size={14} />
                    <span>Recent Activity</span>
                </div>
                <button className={styles.refreshBtn} onClick={fetchActivity} title="Refresh">
                    <RefreshCw size={12} />
                </button>
            </div>

            {loading ? (
                <div className={styles.loading}>Loading activity...</div>
            ) : activities.length === 0 ? (
                <div className={styles.empty}>No activity recorded yet</div>
            ) : (
                <div className={styles.list}>
                    {activities.map((entry) => (
                        <div key={entry.id} className={styles.entry}>
                            <div className={styles.entryIcon}>
                                {ACTION_ICONS[entry.action] || <Activity size={14} />}
                            </div>
                            <div className={styles.entryContent}>
                                <div className={styles.entryAction}>
                                    <span className={styles.username}>{entry.username}</span>
                                    <span className={styles.action}>{entry.action.replace(/_/g, ' ')}</span>
                                </div>
                                {entry.details && (
                                    <div className={styles.entryDetails}>{entry.details}</div>
                                )}
                            </div>
                            <span className={styles.entryTime}>{timeAgo(entry.created_at)}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
