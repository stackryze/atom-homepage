'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Globe, Edit3, Copy, Check, Zap, Shield, ExternalLink, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import styles from './AuthProviderManager.module.css';

interface AuthProvider {
    name: string;
    slug: string;
    issuer: string;
    client_id: string;
    enabled: boolean;
    authorization_endpoint?: string;
    token_endpoint?: string;
    userinfo_endpoint?: string;
    scopes?: string;
    user_match_field?: 'email' | 'username' | 'sub';
    auto_register?: boolean;
    auto_launch?: boolean;
}

function ProviderIcon({ name, size = 18 }: { name: string; size?: number }) {
    const key = name.toLowerCase();
    if (key.includes('google')) return (
        <svg width={size} height={size} viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
    );
    if (key.includes('github')) return (
        <svg width={size} height={size} viewBox="0 0 98 96" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"/></svg>
    );
    if (key.includes('microsoft') || key.includes('azure') || key.includes('entra')) return (
        <svg width={size} height={size} viewBox="0 0 23 23"><path fill="#f35325" d="M1 1h10v10H1z"/><path fill="#81bc06" d="M12 1h10v10H12z"/><path fill="#05a6f0" d="M1 12h10v10H1z"/><path fill="#ffba08" d="M12 12h10v10H12z"/></svg>
    );
    if (key.includes('gitlab')) return (
        <svg width={size} height={size} viewBox="0 0 380 380"><path fill="#e24329" d="m190.4 361.8-68.3-210.2h136.7z"/><path fill="#fc6d26" d="m190.4 361.8-68.3-210.2H42.1z"/><path fill="#fca326" d="M42.1 151.6 18.6 223.9a16 16 0 0 0 5.8 17.8l166 120.6z"/><path fill="#e24329" d="M42.1 151.6h80l-34.4-106a8 8 0 0 0-15.3 0z"/><path fill="#fc6d26" d="m190.4 361.8 68.4-210.2h80z"/><path fill="#fca326" d="m338.8 151.6 23.6 72.3a16 16 0 0 1-5.8 17.8l-166 120.6z"/><path fill="#e24329" d="M338.8 151.6h-80l34.4-106a8 8 0 0 1 15.3 0z"/></svg>
    );
    if (key.includes('authentik')) return (
        <svg width={size} height={size} viewBox="0 0 256 256" fill="none"><rect width="256" height="256" rx="40" fill="#fd4b2d"/><path d="M128 50l70 140H58L128 50z" fill="#fff"/></svg>
    );
    if (key.includes('keycloak')) return (
        <svg width={size} height={size} viewBox="0 0 256 256" fill="none"><rect width="256" height="256" rx="40" fill="#4d9fdb"/><path d="M80 80h96l-48 96L80 80z" fill="#fff"/></svg>
    );
    return null;
}

const PROVIDER_PRESETS: { name: string; issuer: string; scopes?: string; color: string; endpoints?: Partial<AuthProvider> }[] = [
    { name: 'Google', issuer: 'https://accounts.google.com', scopes: 'openid profile email', color: '#4285F4' },
    { name: 'GitHub', issuer: 'https://github.com', scopes: 'read:user user:email', color: '#333',
        endpoints: {
            authorization_endpoint: 'https://github.com/login/oauth/authorize',
            token_endpoint: 'https://github.com/login/oauth/access_token',
            userinfo_endpoint: 'https://api.github.com/user'
        }
    },
    { name: 'Microsoft', issuer: 'https://login.microsoftonline.com/common/v2.0', scopes: 'openid profile email', color: '#00a4ef' },
    { name: 'Authentik', issuer: '', scopes: 'openid profile email', color: '#fd4b2d' },
    { name: 'Keycloak', issuer: '', scopes: 'openid profile email', color: '#4d9fdb' },
    { name: 'GitLab', issuer: 'https://gitlab.com', scopes: 'openid profile email', color: '#fc6d26' },
];

export default function AuthProviderManager() {
    const [providers, setProviders] = useState<AuthProvider[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingSlug, setEditingSlug] = useState<string | null>(null);
    const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
    const [testResult, setTestResult] = useState<{ slug: string; ok: boolean; msg: string } | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [issuer, setIssuer] = useState('');
    const [clientId, setClientId] = useState('');
    const [clientSecret, setClientSecret] = useState('');
    const [authEndpoint, setAuthEndpoint] = useState('');
    const [tokenEndpoint, setTokenEndpoint] = useState('');
    const [userInfoEndpoint, setUserInfoEndpoint] = useState('');
    const [scopes, setScopes] = useState('');
    const [userMatchField, setUserMatchField] = useState<'email' | 'username' | 'sub'>('email');
    const [autoRegister, setAutoRegister] = useState(true);
    const [autoLaunch, setAutoLaunch] = useState(false);

    const fetchProviders = useCallback(async () => {
        try {
            const res = await fetch('/api/auth/providers?all=true');
            if (res.ok) {
                const data = await res.json();
                setProviders(data);
            }
        } catch {
            toast.error('Failed to load identity providers');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchProviders(); }, [fetchProviders]);

    const resetForm = () => {
        setName(''); setSlug(''); setIssuer(''); setClientId(''); setClientSecret('');
        setAuthEndpoint(''); setTokenEndpoint(''); setUserInfoEndpoint('');
        setScopes(''); setUserMatchField('email'); setAutoRegister(true); setAutoLaunch(false);
        setEditingSlug(null); setShowForm(false);
    };

    const applyPreset = (preset: typeof PROVIDER_PRESETS[0]) => {
        setName(preset.name);
        setSlug(preset.name.toLowerCase().replace(/[^a-z0-9]/g, ''));
        if (preset.issuer) setIssuer(preset.issuer);
        if (preset.scopes) setScopes(preset.scopes);
        if (preset.endpoints) {
            if (preset.endpoints.authorization_endpoint) setAuthEndpoint(preset.endpoints.authorization_endpoint);
            if (preset.endpoints.token_endpoint) setTokenEndpoint(preset.endpoints.token_endpoint);
            if (preset.endpoints.userinfo_endpoint) setUserInfoEndpoint(preset.endpoints.userinfo_endpoint);
        }
    };

    const handleEdit = (provider: AuthProvider) => {
        setName(provider.name);
        setSlug(provider.slug);
        setIssuer(provider.issuer);
        setClientId(provider.client_id);
        setClientSecret('');
        setAuthEndpoint(provider.authorization_endpoint || '');
        setTokenEndpoint(provider.token_endpoint || '');
        setUserInfoEndpoint(provider.userinfo_endpoint || '');
        setScopes(provider.scopes || '');
        setUserMatchField(provider.user_match_field || 'email');
        setAutoRegister(provider.auto_register !== false);
        setAutoLaunch(provider.auto_launch || false);
        setEditingSlug(provider.slug);
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = editingSlug ? 'PUT' : 'POST';
            const body: Record<string, unknown> = {
                name,
                slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                issuer,
                client_id: clientId,
                authorization_endpoint: authEndpoint || undefined,
                token_endpoint: tokenEndpoint || undefined,
                userinfo_endpoint: userInfoEndpoint || undefined,
                scopes: scopes || undefined,
                enabled: true,
                user_match_field: userMatchField,
                auto_register: autoRegister,
                auto_launch: autoLaunch
            };

            if (!editingSlug || clientSecret) {
                body.client_secret = clientSecret;
            }

            const res = await fetch('/api/auth/providers', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to save provider');

            toast.success(editingSlug ? 'Provider updated' : 'Provider added');
            resetForm();
            fetchProviders();
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'An error occurred');
        }
    };

    const handleToggle = async (provider: AuthProvider) => {
        try {
            const res = await fetch('/api/auth/providers', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug: provider.slug, enabled: !provider.enabled })
            });
            if (!res.ok) throw new Error();
            toast.success(`${provider.name} ${provider.enabled ? 'disabled' : 'enabled'}`);
            fetchProviders();
        } catch {
            toast.error('Failed to toggle provider');
        }
    };

    const handleDelete = async (slugToDelete: string) => {
        if (!confirm('Delete this provider? Users linked via this provider will lose this login method.')) return;
        try {
            const res = await fetch('/api/auth/providers', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug: slugToDelete })
            });
            if (!res.ok) throw new Error();
            toast.success('Provider deleted');
            fetchProviders();
        } catch {
            toast.error('Failed to delete provider');
        }
    };

    const handleTestConnection = async (provider: AuthProvider) => {
        setTestResult(null);
        const toastId = toast.loading(`Testing ${provider.name}...`);
        try {
            const res = await fetch(`/api/auth/discovery?url=${encodeURIComponent(provider.issuer)}`);
            if (res.ok) {
                const data = await res.json();
                const found = [
                    data.authorization_endpoint && 'auth',
                    data.token_endpoint && 'token',
                    data.userinfo_endpoint && 'userinfo'
                ].filter(Boolean).join(', ');
                setTestResult({ slug: provider.slug, ok: true, msg: `Connected! Found: ${found} endpoints` });
                toast.success('Connection successful', { id: toastId });
            } else {
                setTestResult({ slug: provider.slug, ok: false, msg: 'Discovery failed — endpoints may need manual configuration' });
                toast.error('Discovery failed', { id: toastId });
            }
        } catch {
            setTestResult({ slug: provider.slug, ok: false, msg: 'Could not reach issuer' });
            toast.error('Connection failed', { id: toastId });
        }
    };

    const copyCallbackUrl = (providerSlug: string) => {
        const url = `${window.location.origin}/api/auth/${providerSlug}/callback`;
        navigator.clipboard.writeText(url);
        setCopiedSlug(providerSlug);
        toast.success('Callback URL copied');
        setTimeout(() => setCopiedSlug(null), 2000);
    };

    const handleAutoDiscover = async () => {
        if (!issuer) { toast.error('Enter an Issuer URL first'); return; }
        const toastId = toast.loading('Discovering endpoints...');
        try {
            const res = await fetch(`/api/auth/discovery?url=${encodeURIComponent(issuer)}`);
            if (!res.ok) throw new Error();
            const config = await res.json();
            if (config.authorization_endpoint) setAuthEndpoint(config.authorization_endpoint);
            if (config.token_endpoint) setTokenEndpoint(config.token_endpoint);
            if (config.userinfo_endpoint) setUserInfoEndpoint(config.userinfo_endpoint);
            toast.success('Endpoints auto-filled!', { id: toastId });
        } catch {
            toast.error('Discovery failed — enter endpoints manually', { id: toastId });
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h3 className={styles.title}>Identity Providers</h3>
                    <p className={styles.subtitle}>Configure external SSO providers for user authentication.</p>
                </div>
                {!showForm && (
                    <button className={styles.addButton} onClick={() => { resetForm(); setShowForm(true); }}>
                        <Plus size={15} /> Add Provider
                    </button>
                )}
            </div>

            {showForm && (
                <div className={styles.formCard}>
                    <h4 className={styles.formTitle}>{editingSlug ? 'Edit Provider' : 'Add Provider'}</h4>

                    {!editingSlug && (
                        <>
                            <p className={styles.formHint} style={{ marginBottom: '0.75rem' }}>Quick start with a preset, or configure manually below.</p>
                            <div className={styles.presetGrid}>
                                {PROVIDER_PRESETS.map(preset => (
                                    <button
                                        key={preset.name}
                                        type="button"
                                        className={styles.presetBtn}
                                        onClick={() => applyPreset(preset)}
                                    >
                                        <span className={styles.presetIcon} style={{ background: !ProviderIcon({ name: preset.name }) ? preset.color : 'transparent' }}>
                                            {ProviderIcon({ name: preset.name, size: 18 }) || <span style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}>{preset.name[0]}</span>}
                                        </span>
                                        {preset.name}
                                    </button>
                                ))}
                            </div>
                            <hr className={styles.divider} />
                        </>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Display Name</label>
                                <input
                                    type="text" placeholder="e.g. Authentik" value={name}
                                    onChange={e => { setName(e.target.value); if (!editingSlug && !slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-')); }}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Slug</label>
                                <input
                                    type="text" placeholder="e.g. authentik" value={slug}
                                    onChange={e => setSlug(e.target.value)}
                                    required disabled={!!editingSlug}
                                />
                                <span className={styles.formHint}>/api/auth/{slug || '...'}/login</span>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Issuer URL</label>
                            <div className={styles.issuerRow}>
                                <input
                                    type="url" placeholder="https://authentik.company.com/application/o/atom/"
                                    value={issuer} onChange={e => setIssuer(e.target.value)} required
                                />
                                <button type="button" className={styles.autoFillBtn} onClick={handleAutoDiscover}>
                                    <Zap size={13} style={{ marginRight: '0.3rem', display: 'inline', verticalAlign: 'middle' }} />
                                    Discover
                                </button>
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Client ID</label>
                                <input type="text" value={clientId} onChange={e => setClientId(e.target.value)} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Client Secret {editingSlug && <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(blank = keep)</span>}</label>
                                <input
                                    type="password" value={clientSecret}
                                    onChange={e => setClientSecret(e.target.value)}
                                    required={!editingSlug}
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Scopes</label>
                            <input type="text" placeholder="openid profile email" value={scopes} onChange={e => setScopes(e.target.value)} />
                            <span className={styles.formHint}>Space-separated. Defaults to &apos;openid profile email&apos;.</span>
                        </div>

                        <hr className={styles.divider} />
                        <h4 className={styles.sectionLabel}>
                            <Shield size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.35rem' }} />
                            User Matching &amp; Behavior
                        </h4>

                        <div className={styles.formGroup}>
                            <label style={{ marginBottom: '0.5rem' }}>Match existing users by</label>
                            <div className={styles.matchFieldGrid}>
                                {(['email', 'username', 'sub'] as const).map(field => (
                                    <button
                                        key={field}
                                        type="button"
                                        className={`${styles.matchFieldBtn} ${userMatchField === field ? styles.matchFieldBtnActive : ''}`}
                                        onClick={() => setUserMatchField(field)}
                                    >
                                        {field === 'email' ? 'Email' : field === 'username' ? 'Username' : 'OpenID Subject'}
                                    </button>
                                ))}
                            </div>
                            <span className={styles.formHint}>
                                {userMatchField === 'email' && 'Match by email address (recommended for most providers)'}
                                {userMatchField === 'username' && 'Match by username (for internal SSO systems)'}
                                {userMatchField === 'sub' && 'Match only by subject ID (most secure, requires explicit linking)'}
                            </span>
                        </div>

                        <div className={styles.toggleRow}>
                            <div>
                                <div className={styles.toggleLabel}>Auto-register new users</div>
                                <div className={styles.toggleHint}>Create accounts automatically on first SSO login</div>
                            </div>
                            <label className={styles.toggle}>
                                <input type="checkbox" checked={autoRegister} onChange={e => setAutoRegister(e.target.checked)} />
                                <span className={styles.toggleTrack}><span className={styles.toggleThumb} /></span>
                            </label>
                        </div>

                        <div className={styles.toggleRow}>
                            <div>
                                <div className={styles.toggleLabel}>Auto-launch on login page</div>
                                <div className={styles.toggleHint}>Skip login form and redirect straight to this provider</div>
                            </div>
                            <label className={styles.toggle}>
                                <input type="checkbox" checked={autoLaunch} onChange={e => setAutoLaunch(e.target.checked)} />
                                <span className={styles.toggleTrack}><span className={styles.toggleThumb} /></span>
                            </label>
                        </div>

                        <hr className={styles.divider} />
                        <h4 className={styles.sectionLabel}>
                            <Link2 size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.35rem' }} />
                            Manual Endpoints <span style={{ fontWeight: 400, fontSize: '0.78rem', color: 'var(--text-muted)' }}>(optional — auto-discovered if blank)</span>
                        </h4>

                        <div className={styles.formGroup}>
                            <label>Authorization Endpoint</label>
                            <input type="url" placeholder="https://provider.com/authorize" value={authEndpoint} onChange={e => setAuthEndpoint(e.target.value)} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Token Endpoint</label>
                            <input type="url" placeholder="https://provider.com/token" value={tokenEndpoint} onChange={e => setTokenEndpoint(e.target.value)} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>User Info Endpoint</label>
                            <input type="url" placeholder="https://provider.com/userinfo" value={userInfoEndpoint} onChange={e => setUserInfoEndpoint(e.target.value)} />
                        </div>

                        <div className={styles.formActions}>
                            <button type="button" className={styles.cancelBtn} onClick={resetForm}>Cancel</button>
                            <button type="submit" className={styles.saveBtn}>{editingSlug ? 'Update' : 'Save'} Provider</button>
                        </div>
                    </form>
                </div>
            )}

            <div className={styles.providerList}>
                {loading ? (
                    <div className={styles.loading}>Loading providers...</div>
                ) : providers.length === 0 && !showForm ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}><Globe size={36} /></div>
                        No identity providers configured yet.
                        <br /><span style={{ fontSize: '0.8rem' }}>Click &quot;Add Provider&quot; to set up SSO with Google, GitHub, Authentik, and more.</span>
                    </div>
                ) : (
                    providers.map(p => (
                        <div key={p.slug} className={`${styles.providerCard} ${!p.enabled ? styles.providerCardDisabled : ''}`}>
                            <div className={styles.providerTop}>
                                <div className={styles.providerInfo}>
                                    <div className={styles.providerName}>
                                        <ProviderIcon name={p.name} size={16} />
                                        {p.name}
                                        <span className={styles.providerSlug}>{p.slug}</span>
                                    </div>
                                    <div className={styles.providerIssuer}>
                                        <Globe size={12} /> {p.issuer}
                                    </div>
                                    <div className={styles.providerMeta}>
                                        <span className={`${styles.badge} ${p.enabled ? styles.badgeEnabled : styles.badgeDisabled}`}>
                                            {p.enabled ? 'Enabled' : 'Disabled'}
                                        </span>
                                        {p.auto_register && <span className={`${styles.badge} ${styles.badgeInfo}`}>Auto-register</span>}
                                        {p.auto_launch && <span className={`${styles.badge} ${styles.badgeInfo}`}>Auto-launch</span>}
                                        {p.user_match_field && <span className={`${styles.badge} ${styles.badgeInfo}`}>Match: {p.user_match_field}</span>}
                                    </div>
                                </div>
                                <div className={styles.providerActions}>
                                    <label className={styles.toggle} title={p.enabled ? 'Disable' : 'Enable'}>
                                        <input type="checkbox" checked={p.enabled} onChange={() => handleToggle(p)} />
                                        <span className={styles.toggleTrack}><span className={styles.toggleThumb} /></span>
                                    </label>
                                    <button className={styles.iconBtn} onClick={() => handleTestConnection(p)} title="Test Connection">
                                        <Zap size={15} />
                                    </button>
                                    <button className={styles.iconBtn} onClick={() => handleEdit(p)} title="Edit Provider">
                                        <Edit3 size={15} />
                                    </button>
                                    <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => handleDelete(p.slug)} title="Delete Provider">
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>

                            {testResult && testResult.slug === p.slug && (
                                <div className={`${styles.testResult} ${testResult.ok ? styles.testSuccess : styles.testError}`}>
                                    {testResult.ok ? <Check size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.3rem' }} /> : null}
                                    {testResult.msg}
                                </div>
                            )}

                            <div className={styles.callbackRow}>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', flexShrink: 0 }}>Callback:</span>
                                <span className={styles.callbackUrl}>
                                    {typeof window !== 'undefined' ? window.location.origin : ''}/api/auth/{p.slug}/callback
                                </span>
                                <button className={styles.copyBtn} onClick={() => copyCallbackUrl(p.slug)} title="Copy Callback URL">
                                    {copiedSlug === p.slug ? <Check size={14} className={styles.iconBtnSuccess} /> : <Copy size={14} />}
                                </button>
                                <a
                                    href={`/api/auth/${p.slug}/login`}
                                    target="_blank" rel="noopener noreferrer"
                                    className={styles.copyBtn}
                                    title="Test Login Flow"
                                >
                                    <ExternalLink size={14} />
                                </a>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
