import { LRUCache } from 'lru-cache';

import { getPaintedItemImage, paintColorsMap } from '../paintColors';
import { type CanvasImage, canvasToBuffer, createCanvas, loadImage } from './canvasUtil';
import itemID from './itemID';

export const customItemEffect = new Map([
	[
		itemID('Eggy'),
		(img: CanvasImage, userID: string | undefined) => {
			const userIDEffective = userID ?? '11111';
			const canvas = createCanvas(img.width, img.height);
			const ctx = canvas.getContext('2d');
			ctx.filter = `hue-rotate(${userIDEffective.slice(-3)}deg) saturate(.45)`;
			ctx.drawImage(img, 0, 0);
			return canvas;
		}
	]
]);

export const itemEffectImageCache = new LRUCache<string, CanvasImage>({ max: 1000 });

export async function applyCustomItemEffects(user: MUser | null, item: number) {
	if (!user) return null;
	const key = `${user.id}-${item}`;
	const cached = itemEffectImageCache.get(key);
	if (cached) return cached;

	const paintedColor = user.paintedItems.get(item);
	if (paintedColor) {
		const paint = paintColorsMap.get(paintedColor)!;
		const canvas = await getPaintedItemImage(paint, item);
		const paintedImg = await canvasToBuffer(canvas);
		const image = await loadImage(paintedImg);
		itemEffectImageCache.set(key, image);
		return image;
	}

	const effect = customItemEffect.get(item);
	if (!effect) return null;
	const resultingImage = await bankImageGenerator.getItemImage(item);
	const effectedImageCanvas = await effect(resultingImage, user.id);
	const effectedImage = await canvasToBuffer(effectedImageCanvas);
	const image = await loadImage(effectedImage);
	itemEffectImageCache.set(key, image);
	return image;
}
