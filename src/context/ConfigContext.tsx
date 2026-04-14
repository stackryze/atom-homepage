'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AppConfig } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { toast } from 'sonner';

interface ConfigContextType {
    config: AppConfig | null;
    loading: boolean;
    refreshConfig: () => Promise<void>;
    updateConfig: (newConfig: AppConfig) => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: ReactNode }) {
    const [config, setConfig] = useState<AppConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();

    const refreshConfig = useCallback(async () => {
        try {
            const res = await fetch('/api/config', { cache: 'no-store' });
            if (!res.ok) throw new Error('Failed to fetch config');
            const data = await res.json();
            setConfig(data);
        } catch (error) {
            console.error('Failed to load config:', error);
            toast.error('Failed to load configuration');
        } finally {
            setLoading(false);
        }
    }, []);

    const updateConfig = useCallback(async (newConfig: AppConfig) => {
        // Optimistic update
        setConfig(newConfig);

        try {
            const res = await fetch('/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newConfig)
            });
            if (!res.ok) throw new Error('Failed to save config');
        } catch (error) {
            console.error('Failed to save config:', error);
            toast.error('Failed to save changes');
            // Revert on failure (optional, but good practice. For now simpler to just warn)
            refreshConfig();
        }
    }, [refreshConfig]);

    useEffect(() => {
        refreshConfig();
    }, [refreshConfig]);

    // Apply theme colors from config as CSS custom properties
    useEffect(() => {
        const root = document.documentElement;

        // Clear all inline overrides first so CSS [data-theme] rules take effect
        root.style.removeProperty('--accent-color');
        root.style.removeProperty('--border-accent');
        root.style.removeProperty('--accent-glow');
        root.style.removeProperty('--accent-secondary');
        root.style.removeProperty('--bg-primary');
        root.style.removeProperty('--bg-image');

        if (!config?.theme) return;

        // Apply custom accent color in both themes
        if (config.theme.primaryColor) {
            root.style.setProperty('--accent-color', config.theme.primaryColor);
            root.style.setProperty('--border-accent', config.theme.primaryColor);
            const hex = config.theme.primaryColor;
            const r = parseInt(hex.slice(1,3), 16);
            const g = parseInt(hex.slice(3,5), 16);
            const b = parseInt(hex.slice(5,7), 16);
            root.style.setProperty('--accent-glow', `rgba(${r}, ${g}, ${b}, 0.12)`);
            root.style.setProperty('--accent-secondary', config.theme.primaryColor);
        }

        // Only apply custom background in dark mode
        // In light mode, let CSS [data-theme="light"] handle backgrounds
        if (theme === 'dark' && config.theme.backgroundColor) {
            root.style.setProperty('--bg-primary', config.theme.backgroundColor);
        }

        if (config.theme.backgroundImage) {
            root.style.setProperty('--bg-image', `url(${config.theme.backgroundImage})`);
        }
    }, [config?.theme, theme]);

    return (
        <ConfigContext.Provider value={{ config, loading, refreshConfig, updateConfig }}>
            {children}
        </ConfigContext.Provider>
    );
}

export function useConfig() {
    const context = useContext(ConfigContext);
    if (context === undefined) {
        throw new Error('useConfig must be used within a ConfigProvider');
    }
    return context;
}
