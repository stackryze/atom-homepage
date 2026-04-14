'use client';

import { useState } from 'react';
import { ExternalLink, Maximize2, Minimize2 } from 'lucide-react';
import styles from './IframeWidget.module.css';

interface IframeWidgetProps {
    url?: string;
    height?: number;
    title?: string;
}

export default function IframeWidget({ url, height = 300, title = 'Embed' }: IframeWidgetProps) {
    const [expanded, setExpanded] = useState(false);

    if (!url) {
        return (
            <div className={styles.widget}>
                <div className={styles.empty}>
                    <ExternalLink size={20} />
                    <span>Set embed URL in widget options</span>
                </div>
            </div>
        );
    }

    // Basic URL validation
    let validUrl: URL;
    try {
        validUrl = new URL(url);
        if (!['http:', 'https:'].includes(validUrl.protocol)) {
            throw new Error('Invalid protocol');
        }
    } catch {
        return (
            <div className={styles.widget}>
                <div className={styles.error}>Invalid URL. Must be http:// or https://</div>
            </div>
        );
    }

    return (
        <div className={`${styles.widget} ${expanded ? styles.expanded : ''}`}>
            <div className={styles.header}>
                <span className={styles.title}>{title}</span>
                <div className={styles.actions}>
                    <a href={url} target="_blank" rel="noopener noreferrer" className={styles.actionBtn} title="Open in new tab">
                        <ExternalLink size={14} />
                    </a>
                    <button className={styles.actionBtn} onClick={() => setExpanded(!expanded)} title={expanded ? 'Collapse' : 'Expand'}>
                        {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    </button>
                </div>
            </div>
            <div className={styles.iframeContainer} style={{ height: expanded ? '600px' : `${height}px` }}>
                <iframe
                    src={validUrl.toString()}
                    title={title}
                    className={styles.iframe}
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                />
            </div>
        </div>
    );
}
