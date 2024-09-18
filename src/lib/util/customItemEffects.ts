import { Canvas, type Image, loadImage } from '@napi-rs/canvas';
import { LRUCache } from 'lru-cache';

import { getPaintedItemImage, paintColorsMap } from '../paintColors';
import itemID from './itemID';

export const customItemEffect = new Map([
	[
		itemID('Eggy'),
		(img: Image, userID: string | undefined) => {
			const userIDEffective = userID ?? '11111';
			const canvas = new Canvas(img.width, img.height);
			const ctx = canvas.getContext('2d');
			ctx.filter = `hue-rotate(${userIDEffective.slice(-3)}deg) saturate(.45)`;
			ctx.drawImage(img, 0, 0);
			return canvas;
		}
	]
]);

export const itemEffectImageCache = new LRUCache<string, Image>({ max: 1000 });

export async function applyCustomItemEffects(user: MUser | null, img: Image, item: number) {
	if (!user) return null;
	const key = `${user.id}-${item}`;
	const cached = itemEffectImageCache.get(key);
	if (cached) return cached;

	const paintedColor = user.paintedItems.get(item);
	if (paintedColor) {
		const paint = paintColorsMap.get(paintedColor)!;
		const canvas = await getPaintedItemImage(paint, item);
		const paintedImg = await canvas.encode('png');
		const image = await loadImage(paintedImg);
		itemEffectImageCache.set(key, image);
		return image;
	}

	const effect = customItemEffect.get(item);
	if (!effect) return null;
	const image = await loadImage(await (await effect(img, user.id)).encode('png'));
	itemEffectImageCache.set(key, image);
	return image;
}
