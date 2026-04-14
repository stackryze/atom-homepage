'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, AlertTriangle, CheckCircle, Info, XCircle, BellOff } from 'lucide-react';
import { useStatus } from '@/context/StatusContext';
import { useConfig } from '@/context/ConfigContext';
import styles from './NotificationCenter.module.css';

type NotificationType = 'error' | 'success' | 'warning' | 'info';

interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    meta: string;
    timestamp: number;
    read: boolean;
}

function timeAgo(ts: number): string {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

const ICON_MAP: Record<NotificationType, React.ReactNode> = {
    error: <XCircle size={16} />,
    success: <CheckCircle size={16} />,
    warning: <AlertTriangle size={16} />,
    info: <Info size={16} />,
};

export default function NotificationCenter() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const panelRef = useRef<HTMLDivElement>(null);
    const { statuses } = useStatus();
    const { config } = useConfig();
    const prevStatuses = useRef<Record<string, string>>({});

    // Generate notifications from status changes
    useEffect(() => {
        if (!config?.services) return;

        const newNotifications: Notification[] = [];

        for (const service of config.services) {
            const key = service.id || service.url;
            const current = statuses[key];
            const previousState = prevStatuses.current[key];

            if (current && previousState && current.state !== previousState) {
                if (current.state === 'down' && previousState !== 'loading') {
                    newNotifications.push({
                        id: `${key}-down-${Date.now()}`,
                        type: 'error',
                        title: `${service.name} is down`,
                        meta: current.code ? `HTTP ${current.code}` : 'Connection failed',
                        timestamp: Date.now(),
                        read: false,
                    });
                } else if (current.state === 'up' && previousState === 'down') {
                    newNotifications.push({
                        id: `${key}-up-${Date.now()}`,
                        type: 'success',
                        title: `${service.name} is back online`,
                        meta: `${current.latency}ms response time`,
                        timestamp: Date.now(),
                        read: false,
                    });
                } else if (current.state === 'slow' && previousState === 'up') {
                    newNotifications.push({
                        id: `${key}-slow-${Date.now()}`,
                        type: 'warning',
                        title: `${service.name} is responding slowly`,
                        meta: `${current.latency}ms latency`,
                        timestamp: Date.now(),
                        read: false,
                    });
                }
            }

            if (current && current.state !== 'loading') {
                prevStatuses.current[key] = current.state;
            }
        }

        if (newNotifications.length > 0) {
            setNotifications(prev => [...newNotifications, ...prev].slice(0, 50));
        }
    }, [statuses, config?.services]);

    // Close panel on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClick);
        }
        return () => document.removeEventListener('mousedown', handleClick);
    }, [isOpen]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    const handleOpen = () => {
        setIsOpen(!isOpen);
        // Mark all as read on open
        if (!isOpen) {
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        }
    };

    return (
        <div style={{ position: 'relative' }} ref={panelRef}>
            <button className={styles.trigger} onClick={handleOpen} aria-label="Notifications">
                <Bell size={18} />
                {unreadCount > 0 && <span className={styles.badge} />}
            </button>

            {isOpen && (
                <div className={styles.panel}>
                    <div className={styles.header}>
                        <span className={styles.headerTitle}>Notifications</span>
                        {notifications.length > 0 && (
                            <button className={styles.clearBtn} onClick={clearAll}>
                                Clear all
                            </button>
                        )}
                    </div>

                    <div className={styles.list}>
                        {notifications.length === 0 ? (
                            <div className={styles.empty}>
                                <BellOff size={28} className={styles.emptyIcon} />
                                <div>No notifications</div>
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`${styles.item} ${!notification.read ? styles.unread : ''}`}
                                >
                                    <div className={`${styles.iconCircle} ${styles[notification.type]}`}>
                                        {ICON_MAP[notification.type]}
                                    </div>
                                    <div className={styles.itemContent}>
                                        <div className={styles.itemTitle}>{notification.title}</div>
                                        <div className={styles.itemMeta}>
                                            {notification.meta} · {timeAgo(notification.timestamp)}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
