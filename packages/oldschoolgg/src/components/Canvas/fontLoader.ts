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

/**
 * Load OSRS fonts. Can be called multiple times safely.
 */
export async function loadOSRSFonts(fonts: FontConfig[] = DEFAULT_FONTS): Promise<void> {
	// If fonts are already loaded, return immediately
	if (fontsLoaded) {
		return;
	}

	// If loading is in progress, return the existing promise
	if (loadingPromise) {
		return loadingPromise;
	}

	// Start loading fonts
	loadingPromise = (async () => {
		try {
			await Promise.all(
				fonts.map(async ({ family, url }) => {
					try {
						const font = new FontFace(family, `url(${url})`);
						await font.load();
						document.fonts.add(font);
						console.log(`Loaded font: ${family}`);
					} catch (err) {
						console.warn(`Failed to load font ${family} from ${url}:`, err);
						// Don't throw, just warn - some fonts may be optional
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

/**
 * Check if fonts are loaded
 */
export function areFontsLoaded(): boolean {
	return fontsLoaded;
}

/**
 * Reset the font loading state (useful for testing)
 */
export function resetFontLoadingState(): void {
	fontsLoaded = false;
	loadingPromise = null;
}
