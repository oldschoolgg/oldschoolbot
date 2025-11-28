import { useEffect, useState } from 'react';

import { useImage } from '@/hooks/useImage.tsx';

type SpritesheetData = Record<string, [number, number, number, number]>;

export class Spritesheet {
	private cache = new Map<string, HTMLCanvasElement>();

	constructor(
		public image: HTMLImageElement,
		private data: SpritesheetData
	) {}

	get(name: string): HTMLCanvasElement {
		if (!this.cache.has(name)) {
			const coords = this.data[name];
			if (!coords) {
				throw new Error(`Sprite "${name}" not found in spritesheet`);
			}
			const [x, y, width, height] = coords;
			this.cache.set(name, this.extractSprite(x, y, width, height));
		}
		const result = this.cache.get(name)!;
		if (result.width === 0 || result.height === 0) {
			throw new Error(`Sprite "${name}" has zero width or height`);
		}
		return result;
	}

	private extractSprite(x: number, y: number, width: number, height: number): HTMLCanvasElement {
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext('2d')!;
		ctx.drawImage(this.image, x, y, width, height, 0, 0, width, height);
		return canvas;
	}
}

export function useSpritesheet(imageSource: string | { src: string }, data: SpritesheetData): Spritesheet | null {
	const imageSrc = typeof imageSource === 'string' ? imageSource : imageSource.src;
	const [image] = useImage(imageSrc);
	const [spritesheet, setSpritesheet] = useState<Spritesheet | null>(null);

	useEffect(() => {
		if (image) {
			setSpritesheet(new Spritesheet(image, data));
		}
	}, [image, data]);

	return spritesheet;
}
