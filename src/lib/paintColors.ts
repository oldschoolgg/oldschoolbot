import { type Image, createCanvas } from '@napi-rs/canvas';
import { LootTable } from 'oldschooljs';
import type { Item } from 'oldschooljs/dist/meta/types';

import { setCustomItem } from './customItems/util';
import getOSItem from './util/getOSItem';

interface PaintColor {
	name: string;
	rgb: [number, number, number];
	itemId: number;
	paintCanItem: Item;
}

export const paintColors: PaintColor[] = [
	{ itemId: 72_450, name: 'Guthix Green', rgb: [50, 205, 50], paintCanItem: null as any as Item },
	{ itemId: 72_451, name: 'TzHaar Orange', rgb: [245, 158, 66], paintCanItem: null as any as Item },
	{ itemId: 72_452, name: 'Gilded Gold', rgb: [255, 221, 0], paintCanItem: null as any as Item },
	{ itemId: 72_453, name: 'Vorkath Blue', rgb: [0, 251, 255], paintCanItem: null as any as Item },
	{ itemId: 72_454, name: 'Sapphire Blue', rgb: [0, 26, 255], paintCanItem: null as any as Item },
	{ itemId: 72_455, name: 'Pretty Pink', rgb: [252, 150, 255], paintCanItem: null as any as Item },
	{ itemId: 72_456, name: 'Zamorak Red', rgb: [128, 5, 28], paintCanItem: null as any as Item },
	{ itemId: 72_457, name: 'BSO Blurple', rgb: [85, 0, 255], paintCanItem: null as any as Item },
	{ itemId: 72_458, name: 'Abyssal Purple', rgb: [209, 58, 255], paintCanItem: null as any as Item },
	{ itemId: 72_459, name: 'Amethyst Purple', rgb: [165, 120, 255], paintCanItem: null as any as Item },
	{ itemId: 72_460, name: 'Ruby Red', rgb: [255, 0, 0], paintCanItem: null as any as Item },
	{ itemId: 72_461, name: 'Silver Light', rgb: [255, 255, 255], paintCanItem: null as any as Item },
	{ itemId: 72_462, name: 'Drakan Dark', rgb: [0, 0, 0], paintCanItem: null as any as Item },
	{ itemId: 72_463, name: 'Inversion', rgb: [1, 2, 3], paintCanItem: null as any as Item }
];

for (const paintColor of paintColors) {
	setCustomItem(
		paintColor.itemId,
		`${paintColor.name} paint can`,
		'Coal',
		{
			customItemData: {
				cantDropFromMysteryBoxes: true
			}
		},
		100_000
	);

	paintColor.paintCanItem = getOSItem(`${paintColor.name} paint can`);
}

export const paintColorsMap = new Map(paintColors.map(i => [i.itemId, i]));

export const applyPaintToItemIcon = async (img: Image, tintColor: [number, number, number], blackTolerance = 4) => {
	const canvas = createCanvas(img.width, img.height);
	const ctx = canvas.getContext('2d');
	const [r, g, b] = tintColor;
	ctx.drawImage(img, 0, 0, img.width, img.height);
	const imageData = ctx.getImageData(0, 0, img.width, img.height);

	for (let i = 0; i < imageData.data.length; i += 4) {
		const originalRed = imageData.data[i + 0] as number;
		const originalGreen = imageData.data[i + 1] as number;
		const originalBlue = imageData.data[i + 2] as number;

		if (
			(originalRed === 48 && originalGreen === 32 && originalBlue === 32) ||
			(originalRed <= blackTolerance && originalGreen <= blackTolerance && originalBlue <= blackTolerance)
		) {
			// Skip pixels that are black (with tolerance) or exactly r=48, g=32, b=32
			continue;
		}

		// Special case for inversion paint:
		if ([1, 2, 3].every(n => tintColor.includes(n))) {
			imageData.data[i + 0] = 255 - originalRed;
			imageData.data[i + 1] = 255 - originalGreen;
			imageData.data[i + 2] = 255 - originalBlue;
		} else {
			// Strength increases amount of dye color
			const strength = 1.7;
			// Darkness helps preserve darkness / detail. Higher numbers preserve more darkness (very subtle)
			const darkness = 1.5;
			const rF = 1 + strength * (originalRed / 255) ** darkness;
			const gF = 1 + strength * (originalGreen / 255) ** darkness;
			const bF = 1 + strength * (originalBlue / 255) ** darkness;
			// Apply tint only to non-black (with tolerance) pixels
			imageData.data[i + 0] = Math.floor((originalRed + rF * r) / (1 + rF));
			imageData.data[i + 1] = Math.floor((originalGreen + gF * g) / (1 + gF));
			imageData.data[i + 2] = Math.floor((originalBlue + bF * b) / (1 + bF));
		}
	}

	ctx.putImageData(imageData, 0, 0);
	return canvas;
};

export async function getPaintedItemImage(paintColor: PaintColor, itemID: number) {
	const resultingImage = await bankImageGenerator.getItemImage(itemID);
	return applyPaintToItemIcon(resultingImage, paintColor.rgb);
}

export const PaintBoxTable = new LootTable()
	.add('Gilded Gold paint can')
	.add('BSO Blurple paint can')
	.add('Guthix Green paint can')
	.add('TzHaar Orange paint can')
	.add('Vorkath Blue paint can')
	.add('Sapphire Blue paint can')
	.add('Pretty Pink paint can')
	.add('Zamorak Red paint can')
	.add('Abyssal Purple paint can')
	.add('Amethyst Purple paint can')
	.add('Ruby Red paint can')
	.add('Silver Light paint can')
	.add('Drakan Dark paint can')
	.add('Inversion paint can');
