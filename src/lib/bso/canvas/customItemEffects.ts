import { getPaintedItemImage, paintColorsMap } from '@/lib/bso/paintColors.js';

import { itemID } from 'oldschooljs';
import { type Canvas, loadImage } from 'skia-canvas';

import { itemEffectImageCache } from '@/lib/cache.js';
import { type CanvasImage, canvasToBuffer, createCanvas } from '@/lib/canvas/canvasUtil.js';
import { OSRSCanvas } from '@/lib/canvas/OSRSCanvas.js';

export const customItemEffect = new Map([
	[
		itemID('Eggy'),
		(img: CanvasImage | Canvas, userID: string | undefined) => {
			const userIDEffective = userID ?? '11111';
			const canvas = createCanvas(img.width, img.height);
			const ctx = canvas.getContext('2d');
			ctx.filter = `hue-rotate(${userIDEffective.slice(-3)}deg) saturate(.45)`;
			ctx.drawImage(img, 0, 0);
			return canvas;
		}
	]
]);

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
	const resultingImage = await OSRSCanvas.getItemImage({ itemID: item });
	const effectedImageCanvas = await effect(resultingImage, user.id);
	const effectedImage = await canvasToBuffer(effectedImageCanvas);
	const image = await loadImage(effectedImage);
	itemEffectImageCache.set(key, image);
	return image;
}
