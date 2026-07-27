export interface FontCharacter {
	width: number;
	offset: [number, number];
	rect: [number, number, number, number];
}

export interface LoadedFont {
	image: HTMLImageElement;
	characters: Record<string, FontCharacter>;
}

export interface FontJsonConfig {
	base: number;
	bold: number;
	charHeight: number;
	charSpacing: number;
	face: string;
	italic: number;
	lineSpacing: number;
	size: number;
	smooth: number;
	textureFile: string;
	textureHeight: number;
	textureWidth: number;
}

export interface FontJsonSymbol {
	height: number;
	id: number;
	width: number;
	x: number;
	xadvance: number;
	xoffset: number;
	y: number;
	yoffset: number;
}

export interface FontJson {
	config: FontJsonConfig;
	kerning: unknown[];
	symbols: FontJsonSymbol[];
}

export async function loadFont(imgSrc: string, jsonUrl: string): Promise<LoadedFont> {
	const res = await fetch(jsonUrl);
	if (!res.ok) {
		throw new Error(`Failed to fetch font json: ${res.status} ${res.statusText}`);
	}

	const data = (await res.json()) as unknown as FontJson;

	if (!data || typeof data !== 'object' || !data.config || !Array.isArray(data.symbols)) {
		throw new Error('Unexpected JSON Format');
	}

	const characters: Record<string, FontCharacter> = {};

	for (const s of data.symbols) {
		const codepoint = s.id;
		const ch = String.fromCodePoint(codepoint);

		characters[ch] = {
			width: s.xadvance,
			offset: [s.xoffset, s.yoffset],
			rect: [s.x, s.y, s.width, s.height]
		};
	}

	const image = await new Promise<HTMLImageElement>((resolve, reject) => {
		const img = new Image();
		img.addEventListener('load', () => resolve(img), { once: true });
		img.addEventListener('error', e => reject(e), { once: true });
		img.src = imgSrc;
	});

	return {
		image,
		characters
	};
}
