'use client';

import { useState, useRef } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import styles from './SearchWidget.module.css';

interface SearchWidgetProps {
    engine?: string;
}

const ENGINES: Record<string, { name: string; url: string; icon: string }> = {
    google: { name: 'Google', url: 'https://www.google.com/search?q=', icon: 'G' },
    duckduckgo: { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=', icon: 'D' },
    bing: { name: 'Bing', url: 'https://www.bing.com/search?q=', icon: 'B' },
    brave: { name: 'Brave', url: 'https://search.brave.com/search?q=', icon: 'Br' },
    youtube: { name: 'YouTube', url: 'https://www.youtube.com/results?search_query=', icon: 'YT' },
    github: { name: 'GitHub', url: 'https://github.com/search?q=', icon: 'GH' },
    reddit: { name: 'Reddit', url: 'https://www.reddit.com/search/?q=', icon: 'R' },
    stackoverflow: { name: 'Stack Overflow', url: 'https://stackoverflow.com/search?q=', icon: 'SO' },
};

export default function SearchWidget({ engine = 'google' }: SearchWidgetProps) {
    const [query, setQuery] = useState('');
    const [activeEngine, setActiveEngine] = useState(engine.toLowerCase());
    const [showEngines, setShowEngines] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const currentEngine = ENGINES[activeEngine] || ENGINES.google;

    const handleSearch = () => {
        if (!query.trim()) return;
        window.open(currentEngine.url + encodeURIComponent(query.trim()), '_blank', 'noopener,noreferrer');
        setQuery('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSearch();
        if (e.key === 'Escape') {
            setQuery('');
            setShowEngines(false);
        }
    };

    return (
        <div className={styles.widget}>
            <div className={styles.searchRow}>
                <button
                    className={styles.engineBtn}
                    onClick={() => setShowEngines(!showEngines)}
                    title={`Search with ${currentEngine.name}`}
                >
                    {currentEngine.icon}
                </button>
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Search ${currentEngine.name}...`}
                    className={styles.input}
                />
                <button
                    className={styles.searchBtn}
                    onClick={handleSearch}
                    disabled={!query.trim()}
                >
                    {query.trim() ? <ArrowRight size={16} /> : <Search size={16} />}
                </button>
            </div>

            {showEngines && (
                <div className={styles.engineGrid}>
                    {Object.entries(ENGINES).map(([key, eng]) => (
                        <button
                            key={key}
                            className={`${styles.engineOption} ${activeEngine === key ? styles.active : ''}`}
                            onClick={() => {
                                setActiveEngine(key);
                                setShowEngines(false);
                                inputRef.current?.focus();
                            }}
                        >
                            <span className={styles.engineIcon}>{eng.icon}</span>
                            <span className={styles.engineName}>{eng.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
