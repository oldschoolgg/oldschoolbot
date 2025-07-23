import { promises as fsPromises } from 'node:fs';
import type { Item } from 'oldschooljs';
import { loadImage } from 'skia-canvas';

import type { CanvasImage } from '@/lib/canvas/canvasUtil';
import getOSItem from '@/lib/util/getOSItem';

interface TransmogItem {
	item: Item;
	image: Promise<CanvasImage>;
	maxHeight?: number;
}

export const transmogItems: TransmogItem[] = [
	{
		item: getOSItem('Gorilla rumble greegree'),
		image: fsPromises.readFile('./src/lib/resources/images/mmmr/gorilla.png').then(loadImage),
		maxHeight: 170
	},
	{
		item: getOSItem('Gastly ghost cape'),
		image: fsPromises.readFile('./src/lib/resources/images/ghost.png').then(loadImage),
		maxHeight: 170
	},
	{
		item: getOSItem('Spooky cat ears'),
		image: fsPromises.readFile('./src/lib/resources/images/cat.png').then(loadImage),
		maxHeight: 74
	},
	{
		item: getOSItem('Pumpkinpole'),
		image: fsPromises.readFile('./src/lib/resources/images/pumpkin.png').then(loadImage),
		maxHeight: 180
	}
];

export const gearImages = [
	{
		id: 0,
		template: fsPromises.readFile('./src/lib/resources/images/gear_template.png').then(loadImage),
		templateCompact: fsPromises.readFile('./src/lib/resources/images/gear_template_compact.png').then(loadImage),
		name: 'Default'
	},
	{
		id: 1,
		template: fsPromises.readFile('./src/lib/resources/images/gear_template_hween.png').then(loadImage),
		templateCompact: fsPromises
			.readFile('./src/lib/resources/images/gear_template_compact_hween.png')
			.then(loadImage),
		name: 'Spooky'
	}
] as const;
