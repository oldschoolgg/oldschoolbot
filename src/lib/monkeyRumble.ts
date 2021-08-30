import { Image } from 'canvas';
import fs from 'fs';
import { Item } from 'oldschooljs/dist/meta/types';

import { canvasImageFromBuffer } from './util/canvasUtil';
import getOSItem from './util/getOSItem';

interface MonkeyTier {
	id: number;
	name: string;
	greegree: Item;
	image: Promise<Image>;
}

export const monkeyTiers: MonkeyTier[] = [
	{
		id: 1,
		name: 'Beginner',
		greegree: getOSItem('Beginner rumble greegree'),
		image: canvasImageFromBuffer(fs.readFileSync('./src/lib/resources/images/mmmr/beginnermonkey.png'))
	},
	{
		id: 2,
		name: 'Intermediate',
		greegree: getOSItem('Intermediate rumble greegree'),
		image: canvasImageFromBuffer(fs.readFileSync('./src/lib/resources/images/mmmr/intermediatemonkey.png'))
	},
	{
		id: 3,
		name: 'Ninja',
		greegree: getOSItem('Ninja rumble greegree'),
		image: canvasImageFromBuffer(fs.readFileSync('./src/lib/resources/images/mmmr/ninjamonkey.png'))
	},
	{
		id: 4,
		name: 'Expert Ninja',
		greegree: getOSItem('Expert ninja rumble greegree'),
		image: canvasImageFromBuffer(fs.readFileSync('./src/lib/resources/images/mmmr/expertninjamonkey.png'))
	},
	{
		id: 5,
		name: 'Elder',
		greegree: getOSItem('Elder rumble greegree'),
		image: canvasImageFromBuffer(fs.readFileSync('./src/lib/resources/images/mmmr/eldermonkey.png'))
	}
];
