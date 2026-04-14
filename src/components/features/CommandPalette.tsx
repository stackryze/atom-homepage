'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    Search, Settings, Moon, Sun, Grid3X3, Grid2X2, List,
    ExternalLink, Box, Terminal, RefreshCw, LogOut, Users,
    Shield, LayoutDashboard, Keyboard, ArrowUp, ArrowDown,
    CornerDownLeft, Zap, Globe
} from 'lucide-react';
import { useConfig } from '@/context/ConfigContext';
import { useTheme } from '@/context/ThemeContext';
import styles from './CommandPalette.module.css';

interface CommandItem {
    id: string;
    label: string;
    meta?: string;
    icon: React.ReactNode;
    group: string;
    action: () => void;
    keywords?: string[];
    shortcut?: string;
}

interface CommandPaletteProps {
    onClose: () => void;
}

export default function CommandPalette({ onClose }: CommandPaletteProps) {
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { config } = useConfig();
    const { theme, toggleTheme } = useTheme();

    // Build command list
    const commands = useMemo<CommandItem[]>(() => {
        const items: CommandItem[] = [];

        // Navigation commands
        items.push({
            id: 'nav-dashboard',
            label: 'Go to Dashboard',
            icon: <LayoutDashboard size={18} />,
            group: 'Navigation',
            action: () => { router.push('/'); onClose(); },
            keywords: ['home', 'main'],
            shortcut: 'H',
        });
        items.push({
            id: 'nav-settings',
            label: 'Go to Settings',
            icon: <Settings size={18} />,
            group: 'Navigation',
            action: () => { router.push('/settings'); onClose(); },
            keywords: ['config', 'preferences'],
            shortcut: 'S',
        });
        items.push({
            id: 'nav-docker',
            label: 'Go to Docker',
            icon: <Box size={18} />,
            group: 'Navigation',
            action: () => { router.push('/docker'); onClose(); },
            keywords: ['containers'],
            shortcut: 'D',
        });
        items.push({
            id: 'nav-status',
            label: 'Service Status',
            icon: <Box size={18} />,
            group: 'Navigation',
            action: () => { router.push('/apps'); onClose(); },
            keywords: ['uptime', 'health', 'overview'],
        });
        items.push({
            id: 'nav-users',
            label: 'User Management',
            icon: <Users size={18} />,
            group: 'Navigation',
            action: () => { router.push('/settings'); onClose(); },
            keywords: ['accounts', 'admin'],
        });
        items.push({
            id: 'nav-oauth',
            label: 'OAuth Clients',
            icon: <Shield size={18} />,
            group: 'Navigation',
            action: () => { router.push('/settings'); onClose(); },
            keywords: ['sso', 'oidc', 'saml'],
        });

        // Action commands
        items.push({
            id: 'action-theme',
            label: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
            icon: theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />,
            group: 'Actions',
            action: () => { toggleTheme(); onClose(); },
            keywords: ['dark', 'light', 'appearance'],
        });
        items.push({
            id: 'action-refresh',
            label: 'Refresh Status Checks',
            icon: <RefreshCw size={18} />,
            group: 'Actions',
            action: () => {
                window.dispatchEvent(new CustomEvent('atom:refresh-status'));
                onClose();
            },
            keywords: ['reload', 'ping'],
        });
        items.push({
            id: 'action-shortcuts',
            label: 'Show Keyboard Shortcuts',
            icon: <Keyboard size={18} />,
            group: 'Actions',
            action: () => {
                window.dispatchEvent(new CustomEvent('atom:show-shortcuts'));
                onClose();
            },
            shortcut: '?',
        });
        items.push({
            id: 'action-logout',
            label: 'Sign Out',
            icon: <LogOut size={18} />,
            group: 'Actions',
            action: async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                router.push('/login');
                onClose();
            },
            keywords: ['logout', 'exit'],
        });

        // Service commands - open services directly
        if (config?.services) {
            for (const service of config.services) {
                items.push({
                    id: `service-${service.id}`,
                    label: service.name,
                    meta: service.url.replace(/^https?:\/\//, ''),
                    icon: <ExternalLink size={18} />,
                    group: 'Services',
                    action: () => {
                        window.open(service.url, '_blank', 'noopener,noreferrer');
                        onClose();
                    },
                    keywords: [service.category || '', service.description || '', service.url],
                });
            }
        }

        return items;
    }, [config, theme, router, onClose, toggleTheme]);

    // Filter commands
    const filtered = useMemo(() => {
        if (!query.trim()) return commands;
        const q = query.toLowerCase();
        return commands.filter(cmd => {
            if (cmd.label.toLowerCase().includes(q)) return true;
            if (cmd.meta?.toLowerCase().includes(q)) return true;
            if (cmd.keywords?.some(k => k.toLowerCase().includes(q))) return true;
            return false;
        });
    }, [query, commands]);

    // Group results
    const grouped = useMemo(() => {
        const groups: Record<string, CommandItem[]> = {};
        for (const item of filtered) {
            if (!groups[item.group]) groups[item.group] = [];
            groups[item.group].push(item);
        }
        return groups;
    }, [filtered]);

    // Flat list for keyboard nav
    const flatList = useMemo(() => filtered, [filtered]);

    // Reset active index on query change
    useEffect(() => {
        setActiveIndex(0);
    }, [query]);

    // Auto-focus input
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Scroll active item into view
    useEffect(() => {
        const active = resultsRef.current?.querySelector(`.${styles.active}`);
        active?.scrollIntoView({ block: 'nearest' });
    }, [activeIndex]);

    // Keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setActiveIndex(i => Math.min(i + 1, flatList.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setActiveIndex(i => Math.max(i - 1, 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (flatList[activeIndex]) {
                    flatList[activeIndex].action();
                }
                break;
            case 'Escape':
                e.preventDefault();
                onClose();
                break;
        }
    }, [flatList, activeIndex, onClose]);

    let itemIndex = -1;

    return (
        <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-label="Command Palette">
            <div className={styles.palette} onClick={e => e.stopPropagation()} onKeyDown={handleKeyDown}>
                <div className={styles.searchSection}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        ref={inputRef}
                        className={styles.searchInput}
                        placeholder="Type a command or search..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        aria-label="Search commands"
                    />
                    <span className={styles.badge}>ESC</span>
                </div>

                <div className={styles.results} ref={resultsRef}>
                    {flatList.length === 0 ? (
                        <div className={styles.empty}>
                            <Zap size={32} className={styles.emptyIcon} />
                            <div>No results for &ldquo;{query}&rdquo;</div>
                        </div>
                    ) : (
                        Object.entries(grouped).map(([group, items]) => (
                            <div key={group} className={styles.group}>
                                <div className={styles.groupLabel}>{group}</div>
                                {items.map(item => {
                                    itemIndex++;
                                    const idx = itemIndex;
                                    return (
                                        <button
                                            key={item.id}
                                            className={`${styles.item} ${idx === activeIndex ? styles.active : ''}`}
                                            onClick={() => item.action()}
                                            onMouseEnter={() => setActiveIndex(idx)}
                                        >
                                            <span className={styles.itemIcon}>{item.icon}</span>
                                            <span className={styles.itemContent}>
                                                <span className={styles.itemLabel}>{item.label}</span>
                                                {item.meta && <span className={styles.itemMeta}>{item.meta}</span>}
                                            </span>
                                            {item.shortcut && (
                                                <span className={styles.shortcutKey}>{item.shortcut}</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ))
                    )}
                </div>

                <div className={styles.footer}>
                    <div className={styles.footerHints}>
                        <span className={styles.footerHint}>
                            <ArrowUp size={12} /> <ArrowDown size={12} /> navigate
                        </span>
                        <span className={styles.footerHint}>
                            <CornerDownLeft size={12} /> select
                        </span>
                        <span className={styles.footerHint}>
                            esc close
                        </span>
                    </div>
                    <span><Globe size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} /> Atom</span>
                </div>
            </div>
        </div>
    );
}
