import { useEffect } from 'preact/hooks';

export const PreactThemeSelect = () => {
	const storageKey = 'starlight-theme';
	const parseTheme = (theme: unknown) => (theme === 'auto' || theme === 'dark' || theme === 'light' ? theme : 'auto');

	const loadTheme = () => parseTheme(typeof localStorage !== 'undefined' && localStorage.getItem(storageKey));

	const storeTheme = (theme: string) => {
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(storageKey, theme === 'light' || theme === 'dark' ? theme : '');
		}
	};

	const getPreferredColorScheme = () => (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');

	const onThemeChange = (theme: string) => {
		document.documentElement.dataset.theme = theme === 'auto' ? getPreferredColorScheme() : theme;
		storeTheme(theme);

		const toggle = document.querySelector('#theme-toggle');
		if (toggle) {
			toggle.setAttribute('aria-label', theme);
		} else {
			console.error('No theme toggle found');
		}
	};

	useEffect(() => {
		const preferredSchemeChangeListener = () => {
			if (loadTheme() === 'auto') onThemeChange('auto');
		};

		matchMedia('(prefers-color-scheme: light)').addEventListener('change', preferredSchemeChangeListener);

		const toggle = document.querySelector('#theme-toggle');
		if (toggle) {
			toggle.addEventListener('click', () => onThemeChange(loadTheme() === 'light' ? 'dark' : 'light'));
		} else {
			console.error('No theme toggle found');
		}

		onThemeChange(loadTheme() || 'auto');

		return () => {
			matchMedia('(prefers-color-scheme: light)').removeEventListener('change', preferredSchemeChangeListener);
		};
	}, []);

	return (
		<button
			type="button"
			class="theme-toggle"
			id="theme-toggle"
			title="Toggles light & dark"
			aria-label="auto"
			aria-live="polite"
		>
			<svg class="sun-and-moon" aria-hidden="true" width="24" height="24" viewBox="0 0 24 24">
				<mask class="moon" id="moon-mask">
					<rect x="0" y="0" width="100%" height="100%" fill="white" />
					<circle cx="24" cy="10" r="6" fill="black" />
				</mask>
				<circle class="sun" cx="12" cy="12" r="6" mask="url(#moon-mask)" fill="currentColor" />
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
