'use client';

import { useState, useEffect } from 'react';
import { useConfig } from '@/context/ConfigContext';
import styles from './UptimeWidget.module.css';

interface UptimeSummary {
    uptime_percent: number;
    avg_latency: number;
    total_checks: number;
}

interface UptimeRecord {
    status: 'up' | 'down' | 'slow';
    latency: number;
    checked_at: string;
}

export default function UptimeWidget() {
    const { config } = useConfig();
    const [summaries, setSummaries] = useState<Record<string, UptimeSummary>>({});
    const [historyMap, setHistoryMap] = useState<Record<string, UptimeRecord[]>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const fetchData = async () => {
            try {
                // Fetch summaries for all services
                const sumRes = await fetch('/api/uptime?summary=true&hours=24');
                if (sumRes.ok && mounted) {
                    const data = await sumRes.json();
                    setSummaries(data.summaries || {});
                }

                // Fetch recent history for top services
                if (config?.services && config.services.length > 0) {
                    const topServices = config.services.slice(0, 6);
                    const historyPromises = topServices.map(async (service) => {
                        const res = await fetch(`/api/uptime?service_id=${encodeURIComponent(service.url)}&hours=24`);
                        if (res.ok) {
                            const data = await res.json();
                            return { id: service.url, history: data.history || [] };
                        }
                        return { id: service.url, history: [] };
                    });

                    const results = await Promise.all(historyPromises);
                    if (mounted) {
                        const map: Record<string, UptimeRecord[]> = {};
                        results.forEach(r => { map[r.id] = r.history; });
                        setHistoryMap(map);
                    }
                }
            } catch (e) {
                console.error('Failed to fetch uptime data:', e);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 60000); // Refresh every minute

        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, [config?.services]);

    if (loading) {
        return <div className={styles.loading}>Loading uptime data...</div>;
    }

    if (!config?.services || config.services.length === 0) {
        return <div className={styles.empty}>No services to monitor</div>;
    }

    // Show top 6 services
    const displayServices = config.services.slice(0, 6);

    // Generate bars from history (last 30 data points)
    const getBars = (serviceUrl: string, count: number = 30) => {
        const history = historyMap[serviceUrl] || [];
        if (history.length === 0) {
            return Array(count).fill({ status: 'none', latency: 0 });
        }

        // Take last N records
        const recent = history.slice(-count);

        // Pad left if not enough data
        const padded = [
            ...Array(Math.max(0, count - recent.length)).fill({ status: 'none', latency: 0 }),
            ...recent,
        ];

        return padded;
    };

    const getUptimeClass = (pct: number) => {
        if (pct >= 99) return styles.good;
        if (pct >= 95) return styles.warn;
        return styles.bad;
    };

    return (
        <div className={styles.card}>
            {displayServices.map(service => {
                const summary = summaries[service.url];
                const bars = getBars(service.url, 30);
                const uptimePct = summary?.uptime_percent ?? 100;
                const avgLatency = summary?.avg_latency ?? 0;

                return (
                    <div key={service.id} className={styles.serviceRow}>
                        <div className={styles.serviceHeader}>
                            <span className={styles.serviceName} title={service.name}>{service.name}</span>
                            <span className={`${styles.uptimePercent} ${getUptimeClass(uptimePct)}`}>
                                {summary?.total_checks ? `${uptimePct}%` : '—'}
                            </span>
                        </div>
                        <div className={styles.barsContainer}>
                            {bars.map((bar, i) => (
                                <div
                                    key={i}
                                    className={`${styles.bar} ${styles[bar.status] || styles.none}`}
                                    style={{ height: bar.status === 'none' ? '4px' : `${Math.max(20, Math.min(100, (bar.latency || 0) / 2))}%` }}
                                    title={bar.status !== 'none' ? `${bar.status} — ${bar.latency}ms` : 'No data'}
                                />
                            ))}
                        </div>
                        <div className={styles.latencyRow}>
                            <span>24h ago</span>
                            <span>{avgLatency > 0 ? `avg ${avgLatency}ms` : ''}</span>
                            <span>now</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
