import { useEffect, useState } from 'react';

export interface FontConfig {
	family: string;
	url: string;
}

const DEFAULT_FONTS: FontConfig[] = [
	{
		family: 'OSRSFontCompact',
		url: 'https://cdn.oldschool.gg/fonts/osrs-font-compact.otf'
	},
	{
		family: 'RuneScape Bold 12',
		url: 'https://cdn.oldschool.gg/fonts/osrs-font-bold.ttf'
	},
	{
		family: 'quaver',
		url: 'https://cdn.oldschool.gg/fonts/quaver.woff2'
	}
];

let fontsLoaded = false;
let loadingPromise: Promise<void> | null = null;

async function loadFonts(fonts: FontConfig[]): Promise<void> {
	if (fontsLoaded) return;
	if (loadingPromise) return loadingPromise;

	loadingPromise = Promise.all(
		fonts.map(async ({ family, url }) => {
			const font = new FontFace(family, `url(${url})`);
			await font.load();
			// @ts-expect-error
			document.fonts.add(font);
		})
	).then(() => {
		fontsLoaded = true;
	});

	return loadingPromise;
}

export function useOSRSFonts(fonts: FontConfig[] = DEFAULT_FONTS): boolean {
	const [loaded, setLoaded] = useState<boolean>(fontsLoaded);

	useEffect(() => {
		if (fontsLoaded) {
			setLoaded(true);
			return;
		}

		loadFonts(fonts)
			.then(() => setLoaded(true))
			.catch(() => setLoaded(false));
	}, [fonts]);

	return loaded;
}
