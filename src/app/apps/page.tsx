'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Circle, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useConfig } from '@/context/ConfigContext';
import { useStatus } from '@/context/StatusContext';
import styles from './page.module.css';

interface UptimeSummary {
    service_id: string;
    uptime_percent: number;
    avg_latency: number;
    total_checks: number;
}

export default function StatusPage() {
    const { config, loading } = useConfig();
    const { statuses, checkMany } = useStatus();
    const [uptimeSummaries, setUptimeSummaries] = useState<UptimeSummary[]>([]);

    useEffect(() => {
        fetch('/api/uptime?summary=true')
            .then(r => r.ok ? r.json() : { summaries: [] })
            .then(d => setUptimeSummaries(d.summaries || []))
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (config?.services) checkMany(config.services);
    }, [config?.services, checkMany]);

    const stats = useMemo(() => {
        if (!config?.services) return { total: 0, up: 0, down: 0, slow: 0 };
        let up = 0, down = 0, slow = 0;
        config.services.forEach(s => {
            const st = statuses[s.id || s.url];
            if (!st) return;
            if (st.state === 'up') up++;
            else if (st.state === 'down') down++;
            else if (st.state === 'slow') slow++;
        });
        return { total: config.services.length, up, down, slow };
    }, [config?.services, statuses]);

    if (loading || !config) return <div className={styles.loading}>Loading...</div>;

    return (
        <div className={styles.wrapper}>
            <header className={styles.header}>
                <h1>Service Status</h1>
                <Link href="/" className={styles.backBtn}>
                    <ArrowLeft size={16} /> Dashboard
                </Link>
            </header>

            {/* Summary Cards */}
            <div className={styles.summary}>
                <div className={styles.summaryCard}>
                    <div className={styles.summaryValue}>{stats.total}</div>
                    <div className={styles.summaryLabel}>Total Services</div>
                </div>
                <div className={styles.summaryCard}>
                    <div className={styles.summaryValue} style={{ color: '#10b981' }}>{stats.up}</div>
                    <div className={styles.summaryLabel}>Operational</div>
                </div>
                <div className={styles.summaryCard}>
                    <div className={styles.summaryValue} style={{ color: '#f59e0b' }}>{stats.slow}</div>
                    <div className={styles.summaryLabel}>Degraded</div>
                </div>
                <div className={styles.summaryCard}>
                    <div className={styles.summaryValue} style={{ color: '#ef4444' }}>{stats.down}</div>
                    <div className={styles.summaryLabel}>Down</div>
                </div>
            </div>

            {/* Service List */}
            <div className={styles.serviceList}>
                {config.services.map(service => {
                    const status = statuses[service.id || service.url];
                    const uptimeData = uptimeSummaries.find(u => u.service_id === service.id);
                    const state = status?.state || 'loading';

                    return (
                        <div key={service.id} className={styles.serviceRow}>
                            <div style={{ flexShrink: 0 }}>
                                {state === 'up' && <CheckCircle size={18} style={{ color: '#10b981' }} />}
                                {state === 'down' && <XCircle size={18} style={{ color: '#ef4444' }} />}
                                {state === 'slow' && <AlertTriangle size={18} style={{ color: '#f59e0b' }} />}
                                {state === 'loading' && <Circle size={18} style={{ color: 'var(--text-muted)' }} />}
                            </div>

                            <div className={styles.serviceInfo}>
                                <span className={styles.serviceName}>{service.name}</span>
                                <span className={styles.serviceUrl}>{service.url}</span>
                            </div>

                            <span className={`${styles.statusBadge} ${
                                state === 'up' ? styles.statusUp :
                                state === 'down' ? styles.statusDown :
                                state === 'slow' ? styles.statusSlow :
                                styles.statusLoading
                            }`}>
                                {state}
                            </span>

                            <span className={styles.latencyValue}>
                                {status?.latency ? `${status.latency}ms` : '—'}
                            </span>

                            {uptimeData && (
                                <span className={styles.latencyValue} style={{ color: uptimeData.uptime_percent >= 99 ? '#10b981' : uptimeData.uptime_percent >= 95 ? '#f59e0b' : '#ef4444' }}>
                                    {uptimeData.uptime_percent.toFixed(1)}%
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
