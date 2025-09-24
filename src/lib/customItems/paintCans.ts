import type { Item } from 'oldschooljs';

import type { PaintColor } from '@/lib/bso/paintColors.js';
import { setCustomItem } from '@/lib/customItems/util.js';

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

	paintColor.paintCanItem = Items.getOrThrow(`${paintColor.name} paint can`);
}
