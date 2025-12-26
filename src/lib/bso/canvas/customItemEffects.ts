import { BSOItem } from '@/lib/bso/BSOItem.js';
import { getPaintedItemImage, paintColorsMap } from '@/lib/bso/paintColors.js';

import { randFloat, randInt } from '@oldschoolgg/rng';
import { EItem } from 'oldschooljs';
import { type Canvas, loadImage } from 'skia-canvas';

import { itemEffectImageCache } from '@/lib/cache.js';
import { type CanvasImage, canvasToBuffer, createCanvas } from '@/lib/canvas/canvasUtil.js';
import { OSRSCanvas } from '@/lib/canvas/OSRSCanvas.js';
import { BitField } from '@/lib/constants.js';

type CustomItemEffectCallBack = (img: CanvasImage | Canvas, user: MUser) => Canvas | null;

export const customItemEffect = new Map<number, CustomItemEffectCallBack>([
	[
		BSOItem.EGGY,
		(img, user) => {
			const canvas = createCanvas(img.width, img.height);
			const ctx = canvas.getContext('2d');
			ctx.filter = `hue-rotate(${user.id.slice(-3)}deg) saturate(.45)`;
			ctx.drawImage(img, 0, 0);
			return canvas;
		}
	],
	[
		EItem.RIFT_GUARDIAN,
		(img, user) => {
			if (!user.bitfield.includes(BitField.HasEarnedRiftGuardianFromStar)) return null;
			const canvas = createCanvas(img.width, img.height);
			const ctx = canvas.getContext('2d');

			ctx.save();
			ctx.fillStyle = '#f0e0af';
			for (let i = 0; i < 40; i++) {
				if (i % 12 !== 0) {
					ctx.filter = `saturate(0.${randInt(50, 70)}) brightness(${randFloat(0.7, 1.3)})`;
					ctx.globalAlpha = randFloat(0.3, 0.8);
				}
				ctx.fillRect(randInt(4, canvas.width - 4), randInt(2, canvas.height - 2), 1, 1);
			}
			ctx.restore();

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
	const effectedImageCanvas = await effect(resultingImage, user);
	const effectedImage = await canvasToBuffer(effectedImageCanvas ?? resultingImage);
	const image = await loadImage(effectedImage);
	itemEffectImageCache.set(key, image);
	return image;
}
