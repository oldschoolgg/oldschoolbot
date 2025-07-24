import { promises as fsPromises } from 'node:fs';
import { type Item, Items } from 'oldschooljs';
import { loadImage } from 'skia-canvas';

import type { CanvasImage } from '@/lib/canvas/canvasUtil';

interface TransmogItem {
	item: Item;
	image: Promise<CanvasImage>;
	maxHeight?: number;
}

export const transmogItems: TransmogItem[] = [
	{
		item: Items.getOrThrow('Banana'),
		image: fsPromises.readFile('./src/lib/resources/images/minimus.png').then(loadImage),
		maxHeight: 170
	}
];

export const gearImages = [
	{
		id: 0,
		template: fsPromises.readFile('./src/lib/resources/images/gear_templates/gear_template.png').then(loadImage),
		templateCompact: fsPromises
			.readFile('./src/lib/resources/images/gear_templates/gear_template_compact.png')
			.then(loadImage),
		name: 'Default'
	},
	{
		id: 1,
		template: fsPromises
			.readFile('./src/lib/resources/images/gear_templates/gear_template_hween.png')
			.then(loadImage),
		templateCompact: fsPromises
			.readFile('./src/lib/resources/images/gear_templates/gear_template_compact_hween.png')
			.then(loadImage),
		name: 'Spooky'
	}
] as const;
