import { createCanvas, Image } from '@napi-rs/canvas';
import { LootTable } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

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
	{ itemId: 72_455, name: 'Pretty Pink', rgb: [252, 89, 255], paintCanItem: null as any as Item },
	{ itemId: 72_456, name: 'Zamorak Red', rgb: [128, 5, 28], paintCanItem: null as any as Item },
	{ itemId: 72_457, name: 'BSO Blurple', rgb: [85, 0, 255], paintCanItem: null as any as Item },
	{ itemId: 72_458, name: 'Abyssal Purple', rgb: [209, 58, 255], paintCanItem: null as any as Item },
	{ itemId: 72_459, name: 'Amethyst Purple', rgb: [165, 120, 255], paintCanItem: null as any as Item },
	{ itemId: 72_460, name: 'Ruby Red', rgb: [255, 0, 0], paintCanItem: null as any as Item }
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
		const originalRed = imageData.data[i + 0];
		const originalGreen = imageData.data[i + 1];
		const originalBlue = imageData.data[i + 2];

		if (
			(originalRed === 48 && originalGreen === 32 && originalBlue === 32) ||
			(originalRed <= blackTolerance && originalGreen <= blackTolerance && originalBlue <= blackTolerance)
		) {
			// Skip pixels that are black (with tolerance) or exactly r=48, g=32, b=32
			continue;
		}

		// Apply tint only to non-black (with tolerance) pixels
		imageData.data[i + 0] = originalRed + (r - originalRed) / 2.5;
		imageData.data[i + 1] = originalGreen + (g - originalGreen) / 2.5;
		imageData.data[i + 2] = originalBlue + (b - originalBlue) / 2.5;
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
	.add('Ruby Red paint can');
