import { useEffect, useMemo, useRef } from 'preact/hooks';

type Theme = 'auto' | 'light' | 'dark';

const STORAGE_KEY = 'starlight-theme';

const parseTheme = (t: unknown): Theme => (t === 'auto' || t === 'light' || t === 'dark' ? t : 'auto');

const canUseDOM = typeof window !== 'undefined' && typeof document !== 'undefined' && typeof navigator !== 'undefined';

const getStoredTheme = (): Theme => {
	if (!canUseDOM || typeof localStorage === 'undefined') return 'auto';
	return parseTheme(localStorage.getItem(STORAGE_KEY));
};

const storeTheme = (t: Theme) => {
	if (!canUseDOM || typeof localStorage === 'undefined') return;
	localStorage.setItem(STORAGE_KEY, t === 'light' || t === 'dark' ? t : '');
};

const getPreferredColorScheme = (): Exclude<Theme, 'auto'> => {
	if (!canUseDOM || typeof matchMedia !== 'function') return 'light';
	return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

const addMQChangeListener = (mql: MediaQueryList, cb: (e: MediaQueryListEvent) => void) => {
	if (mql.addEventListener) {
		mql.addEventListener('change', cb as unknown as EventListener);
		return () => (mql as any).removeEventListener('change', cb as unknown as EventListener);
	}
	(mql as any).addListener?.(cb);
};

export const PreactThemeSelect = () => {
	const btnRef = useRef<HTMLButtonElement>(null);

	const applyTheme = (t: Theme) => {
		if (!canUseDOM) return;
		const active = t === 'auto' ? getPreferredColorScheme() : t;
		document.documentElement.dataset.theme = active;
		storeTheme(t);

		const btn = btnRef.current;
		if (btn) {
			btn.setAttribute('aria-label', `${active} theme`);
			btn.setAttribute('aria-pressed', String(active === 'dark'));
			btn.dataset.userTheme = t;
			btn.dataset.themeState = t;
		}
	};

	useEffect(() => {
		if (!canUseDOM) return;

		const btn = btnRef.current;
		if (!btn) {
			console.error('No theme toggle button found');
			return;
		}

		const mq = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: light)') : null;

		const onSystemChange = () => {
			if (getStoredTheme() === 'auto') applyTheme('auto');
		};

		const onClick = () => {
			const current = getStoredTheme();
			const next: Theme = current === 'auto' ? 'light' : current === 'light' ? 'dark' : 'auto';
			applyTheme(next);
		};

		applyTheme(getStoredTheme());

		const disposeMQ = mq ? addMQChangeListener(mq, onSystemChange) : undefined;
		btn.addEventListener('click', onClick);

		return () => {
			btn.removeEventListener('click', onClick);
			disposeMQ?.();
		};
	}, [applyTheme]);

	const maskId = useMemo(() => `moon-mask-${Math.random().toString(36).slice(2)}`, []);

	return (
		<button
			ref={btnRef}
			type="button"
			class="theme-toggle social-icon"
			id="theme-toggle"
			title="Toggle theme (auto / light / dark)"
			aria-label="light theme"
			aria-live="polite"
			aria-pressed="false"
		>
			<svg class="sun-and-moon" aria-hidden="true" width="24" height="24" viewBox="0 0 24 24">
				<mask class="moon" id={maskId}>
					<rect x="0" y="0" width="100%" height="100%" fill="white" />
					<circle cx="24" cy="10" r="6" fill="black" />
				</mask>
				<circle class="sun" cx="12" cy="12" r="6" mask={`url(#${maskId})`} fill="currentColor" />
				<g class="sun-beams" stroke="currentColor">
					<line x1="12" y1="1" x2="12" y2="3" />
					<line x1="12" y1="21" x2="12" y2="23" />
					<line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
					<line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
					<line x1="1" y1="12" x2="3" y2="12" />
					<line x1="21" y1="12" x2="23" y2="12" />
					<line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
					<line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
				</g>
			</svg>
		</button>
	);
};

export default PreactThemeSelect;
