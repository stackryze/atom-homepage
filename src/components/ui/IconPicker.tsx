'use client';

import { useState, useMemo } from 'react';
import { getAllIcons } from '@/lib/icons';
import { Search, X } from 'lucide-react';
import styles from './IconPicker.module.css';

interface IconPickerProps {
    onSelect: (slug: string) => void;
    onClose: () => void;
}

const ALL_ICONS = getAllIcons();

export default function IconPicker({ onSelect, onClose }: IconPickerProps) {
    const [query, setQuery] = useState('');

    const filteredIcons = useMemo(() => {
        if (!query) return ALL_ICONS.slice(0, 50); // Show top 50 by default
        const lowerQuery = query.toLowerCase();
        return ALL_ICONS.filter(icon =>
            icon.title.toLowerCase().includes(lowerQuery) ||
            icon.slug.toLowerCase().includes(lowerQuery)
        ).slice(0, 50); // Limit results for performance
    }, [query]);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.searchWrapper}>
                    <Search size={16} className={styles.searchIcon} />
                    <input
                        autoFocus
                        className={styles.input}
                        placeholder="Search brand icons..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                </div>
                <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
            </div>

            <div className={styles.grid}>
                {filteredIcons.map(icon => (
                    <button
                        key={icon.slug}
                        className={styles.iconBtn}
                        onClick={() => onSelect(icon.slug)}
                        title={icon.title}
                    >
                        <svg viewBox="0 0 24 24" className={styles.svg}>
                            <path d={icon.path} fill="currentColor" />
                        </svg>
                        <span className={styles.label}>{icon.title}</span>
                    </button>
                ))}
                {filteredIcons.length === 0 && (
                    <div className={styles.empty}>No icons found</div>
                )}
            </div>
        </div>
    );
}
