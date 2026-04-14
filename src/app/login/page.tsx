'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { getSafeRedirectUrl } from '@/lib/redirect-utils';
import styles from './page.module.css';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);
    const [providers, setProviders] = useState<{ name: string; slug: string }[]>([]);
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
