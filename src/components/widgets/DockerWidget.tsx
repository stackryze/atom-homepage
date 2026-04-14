'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Box, ArrowUpRight, Play, Square } from 'lucide-react';
import styles from './DockerWidget.module.css';

interface ContainerInfo {
    id: string;
    name: string;
    state: string;
    status: string;
    cpu?: number;
    memPercent?: number;
    memory?: string;
    image: string;
}

export default function DockerWidget() {
    const [containers, setContainers] = useState<ContainerInfo[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        const controller = new AbortController();

        const fetchStats = async () => {
            try {
                const res = await fetch('/api/docker/containers', { signal: controller.signal });
                if (!mounted) return;
                if (res.ok) {
                    const data = await res.json();
                    setContainers(data.containers || []);
                    setError(null);
                } else {
                    const data = await res.json();
                    setError(data.error || 'Failed to fetch');
                }
            } catch (e) {
                if (mounted && !(e instanceof DOMException && e.name === 'AbortError')) {
                    console.error(e);
                    setError('Network Error');
                }
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 5000);
        return () => {
            mounted = false;
            controller.abort();
            clearInterval(interval);
        };
    }, []);

    const running = containers.filter(c => c.state === 'running');
    const stopped = containers.filter(c => c.state !== 'running');

    if (error) {
        return (
            <div className={styles.widget} style={{ cursor: 'default' }}>
                <div className={styles.header}>
                    <Box size={20} className={styles.icon} />
                    <span>Docker</span>
                </div>
                <div style={{ color: '#ef4444', fontSize: '0.75rem' }}>{error}</div>
            </div>
        );
    }

    if (containers.length === 0) {
        return (
            <div className={styles.widget} style={{ cursor: 'default' }}>
                <div className={styles.header}>
                    <Box size={20} className={styles.icon} />
                    <span>Docker</span>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Loading...</div>
            </div>
        );
    }

    return (
        <div className={styles.enhanced}>
            <Link href="/docker" className={styles.enhancedHeader}>
                <div className={styles.leftSection}>
                    <div className={styles.iconBox}>
                        <Box size={18} />
                    </div>
                    <div className={styles.meta}>
                        <span className={styles.title}>Docker</span>
                        <span className={styles.subtitle}>{containers.length} containers</span>
                    </div>
                </div>
                <div className={styles.statsSection}>
                    <div className={styles.statItem}>
                        <span className={styles.statValue} style={{ color: '#22c55e' }}>{running.length}</span>
                        <span className={styles.statLabel}>Running</span>
                    </div>
                    {stopped.length > 0 && (
                        <div className={styles.statItem}>
                            <span className={styles.statValue} style={{ color: 'var(--text-muted)' }}>{stopped.length}</span>
                            <span className={styles.statLabel}>Stopped</span>
                        </div>
                    )}
                    <ArrowUpRight size={14} className={styles.arrow} />
                </div>
            </Link>

            {/* Container list */}
            <div className={styles.containerList}>
                {running.slice(0, 8).map(c => (
                    <div key={c.id} className={styles.containerRow}>
                        <div className={styles.containerInfo}>
                            <Play size={10} style={{ color: '#22c55e', flexShrink: 0 }} />
                            <span className={styles.containerName}>{c.name}</span>
                        </div>
                        <div className={styles.containerStats}>
                            {c.cpu !== undefined && c.cpu > 0 && (
                                <span className={styles.containerStat}>
                                    <span className={styles.containerStatBar} style={{ width: `${Math.min(c.cpu, 100)}%`, background: c.cpu > 80 ? '#ef4444' : c.cpu > 50 ? '#f59e0b' : '#22c55e' }} />
                                    {c.cpu}%
                                </span>
                            )}
                            {c.memPercent !== undefined && c.memPercent > 0 && (
                                <span className={styles.containerStat}>
                                    <span className={styles.containerStatBar} style={{ width: `${Math.min(c.memPercent, 100)}%`, background: c.memPercent > 80 ? '#ef4444' : c.memPercent > 50 ? '#f59e0b' : '#3b82f6' }} />
                                    {c.memory || `${c.memPercent}%`}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
                {stopped.slice(0, 3).map(c => (
                    <div key={c.id} className={`${styles.containerRow} ${styles.stopped}`}>
                        <div className={styles.containerInfo}>
                            <Square size={10} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                            <span className={styles.containerName}>{c.name}</span>
                        </div>
                        <span className={styles.containerStatus}>{c.status}</span>
                    </div>
                ))}
                {containers.length > 11 && (
                    <Link href="/docker" className={styles.moreLink}>
                        +{containers.length - 11} more...
                    </Link>
                )}
            </div>
        </div>
    );
}
