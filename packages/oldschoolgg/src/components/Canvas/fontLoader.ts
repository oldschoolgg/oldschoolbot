/**
 * Utility for loading OSRS fonts in the browser
 */

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
	}
];

let fontsLoaded = false;
let loadingPromise: Promise<void> | null = null;

export async function loadOSRSFonts(fonts: FontConfig[] = DEFAULT_FONTS): Promise<void> {
	if (fontsLoaded) {
		return;
	}

	if (loadingPromise) {
		return loadingPromise;
	}

	loadingPromise = (async () => {
		try {
			await Promise.all(
				fonts.map(async ({ family, url }) => {
					try {
						const font = new FontFace(family, `url(${url})`);
						await font.load();
						// @ts-expect-error
						document.fonts.add(font);
						console.log(`Loaded font: ${family}`);
					} catch (err) {
						console.warn(`Failed to load font ${family} from ${url}:`, err);
					}
				})
			);
			fontsLoaded = true;
			console.log('All OSRS fonts loaded successfully');
		} catch (err) {
			loadingPromise = null;
			throw new Error(`Failed to load fonts: ${err}`);
		}
	})();

	return loadingPromise;
}

export function areFontsLoaded(): boolean {
	return fontsLoaded;
}

export function resetFontLoadingState(): void {
	fontsLoaded = false;
	loadingPromise = null;
}
