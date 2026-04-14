'use client';

import { Bookmark, ExternalLink } from 'lucide-react';
import { Link as AppLink } from '@/types';
import styles from './BookmarksWidget.module.css';

interface BookmarksWidgetProps {
    links: AppLink[];
}

export default function BookmarksWidget({ links }: BookmarksWidgetProps) {
    if (links.length === 0) {
        return (
            <div className={styles.widget}>
                <div className={styles.empty}>
                    <Bookmark size={16} />
                    <span>No bookmarks added yet</span>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.widget}>
            <div className={styles.list}>
                {links.slice(0, 10).map(link => (
                    <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.item}
                    >
                        <Bookmark size={12} className={styles.icon} />
                        <span className={styles.title}>{link.title}</span>
                        <ExternalLink size={10} className={styles.external} />
                    </a>
                ))}
            </div>
        </div>
    );
}
