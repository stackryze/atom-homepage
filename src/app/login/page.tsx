'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { getSafeRedirectUrl } from '@/lib/redirect-utils';
import styles from './page.module.css';

function ProviderIcon({ name, slug }: { name: string; slug: string }) {
    const key = (name || slug).toLowerCase();
    if (key.includes('google')) return (
        <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
    );
    if (key.includes('github')) return (
        <svg width="18" height="18" viewBox="0 0 98 96" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"/></svg>
    );
    if (key.includes('microsoft') || key.includes('azure')) return (
        <svg width="18" height="18" viewBox="0 0 23 23"><path fill="#f35325" d="M1 1h10v10H1z"/><path fill="#81bc06" d="M12 1h10v10H12z"/><path fill="#05a6f0" d="M1 12h10v10H1z"/><path fill="#ffba08" d="M12 12h10v10H12z"/></svg>
    );
    if (key.includes('gitlab')) return (
        <svg width="18" height="18" viewBox="0 0 380 380"><path fill="#e24329" d="m190.4 361.8-68.3-210.2h136.7z"/><path fill="#fc6d26" d="m190.4 361.8-68.3-210.2H42.1z"/><path fill="#fca326" d="M42.1 151.6 18.6 223.9a16 16 0 0 0 5.8 17.8l166 120.6z"/><path fill="#e24329" d="M42.1 151.6h80l-34.4-106a8 8 0 0 0-15.3 0z"/><path fill="#fc6d26" d="m190.4 361.8 68.4-210.2h80z"/><path fill="#fca326" d="m338.8 151.6 23.6 72.3a16 16 0 0 1-5.8 17.8l-166 120.6z"/><path fill="#e24329" d="M338.8 151.6h-80l34.4-106a8 8 0 0 1 15.3 0z"/></svg>
    );
    // Generic fallback with first letter
    return (
        <span style={{ width: 18, height: 18, borderRadius: 4, background: 'var(--accent-color)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>
            {(name || slug)[0]?.toUpperCase()}
        </span>
    );
}

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);
    const [providers, setProviders] = useState<{ name: string; slug: string; auto_launch?: boolean }[]>([]);
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnTo = searchParams.get('returnTo');

    // Check if onboarding is needed & Check for errors & fetch providers
    useEffect(() => {
        // Parse URL params for errors
        const errorMsg = searchParams.get('error');
        if (errorMsg) {
            setError(decodeURIComponent(errorMsg));
        }

        // Fetch Providers
        fetch('/api/auth/providers')
            .then(res => res.json())
            .then((data: { name: string; slug: string; auto_launch?: boolean }[]) => {
                if (Array.isArray(data)) {
                    setProviders(data);

                    // Auto-launch if exactly one provider with auto_launch enabled
                    const autoLaunchProviders = data.filter((p) => p.auto_launch);
                    // Preserve returnTo when auto-launching
                    const returnToParam = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : '';

                    if (autoLaunchProviders.length === 1) {
                        const provider = autoLaunchProviders[0];
                        window.location.href = `/api/auth/${provider.slug}/login${returnToParam}`;
                        return; // Exit early since we're redirecting
                    }
                }
            })
            .catch(console.error);

        // Safety timeout in case fetch hangs
        const timeout = setTimeout(() => setChecking(false), 5000);

        fetch('/api/auth/session', { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                clearTimeout(timeout);
                if (data.needsOnboarding) {
                    router.push('/onboard');
                } else if (data.user) {
                    router.push('/');
                } else {
                    setChecking(false);
                }
            })
            .catch(() => {
                clearTimeout(timeout);
                setChecking(false);
            });

        return () => clearTimeout(timeout);
    }, [router, searchParams, returnTo]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    password,
                    returnTo: returnTo || undefined
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Login failed');
                return;
            }

            // Use validated redirect URL from server or fallback to root
            const redirectUrl = getSafeRedirectUrl(
                data.redirect || returnTo,
                '/',
                window.location.origin
            );

            router.push(redirectUrl);
        } catch {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (checking) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <Image src="/atom-logo.png" alt="Atom" width={48} height={48} className={styles.logo} />
                    <p className={styles.subtitle}>Initializing...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <Image src="/atom-logo.png" alt="Atom" width={48} height={48} className={styles.logo} />
                <h1 className={styles.title}>Welcome Back</h1>
                <p className={styles.subtitle}>Sign in to your Atom dashboard</p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="admin"
                            required
                            autoFocus
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

                    <button type="submit" className={styles.button} disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                {providers.length > 0 && (
                    <>
                        <div className={styles.divider}>or</div>
                        <div className={styles.providers}>
                            {providers.map(p => {
                                const providerUrl = returnTo
                                    ? `/api/auth/${p.slug}/login?returnTo=${encodeURIComponent(returnTo)}`
                                    : `/api/auth/${p.slug}/login`;

                                return (
                                    <button
                                        key={p.slug}
                                        type="button"
                                        className={styles.providerButton}
                                        onClick={() => window.location.href = providerUrl}
                                    >
                                        <ProviderIcon name={p.name} slug={p.slug} />
                                        Sign in with {p.name}
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}

                <div className={styles.footer}>Powered by Atom</div>
            </div>
        </div>
    );
}
