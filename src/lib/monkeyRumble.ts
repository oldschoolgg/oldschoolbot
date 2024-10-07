import fs from 'node:fs/promises';
import { toTitleCase } from '@oldschoolgg/toolkit';
import { randArrItem, randInt, roll } from 'e';
import type { Item } from 'oldschooljs/dist/meta/types';

import { type CanvasImage, canvasToBuffer, createCanvas, loadImage, printWrappedText } from './util/canvasUtil';
import { textBoxFile } from './util/chatHeadImage';
import getOSItem from './util/getOSItem';

interface MonkeyTier {
	id: number;
	name: string;
	greegrees: Item[];
	image: Promise<CanvasImage>;
	strengthLevelReq: number;
	gamesReq: number;
}

export const monkeyTiers: MonkeyTier[] = [
	{
		id: 1,
		name: 'Beginner',
		greegrees: [getOSItem('Beginner rumble greegree')],
		image: loadImage('./src/lib/resources/images/mmmr/beginnermonkey.png'),
		strengthLevelReq: 80,
		gamesReq: 0
	},
	{
		id: 2,
		name: 'Intermediate',
		greegrees: [getOSItem('Intermediate rumble greegree')],
		image: loadImage('./src/lib/resources/images/mmmr/intermediatemonkey.png'),
		strengthLevelReq: 90,
		gamesReq: 50
	},
	{
		id: 3,
		name: 'Ninja',
		greegrees: [getOSItem('Ninja rumble greegree')],
		image: loadImage('./src/lib/resources/images/mmmr/ninjamonkey.png'),
		strengthLevelReq: 100,
		gamesReq: 100
	},
	{
		id: 4,
		name: 'Expert Ninja',
		greegrees: [getOSItem('Expert ninja rumble greegree')],
		image: loadImage('./src/lib/resources/images/mmmr/expertninjamonkey.png'),
		strengthLevelReq: 110,
		gamesReq: 200
	},
	{
		id: 5,
		name: 'Elder',
		greegrees: [getOSItem('Elder rumble greegree'), getOSItem('Gorilla rumble greegree')],
		image: loadImage('./src/lib/resources/images/mmmr/eldermonkey.png'),
		strengthLevelReq: 120,
		gamesReq: 500
	}
];

const firstNames = [
	'Daw',
	'Dee',
	'Mah',
	'Bana',
	'Wur',
	'Erc',
	'Bom',
	'Wud',
	'Pog',
	'Veg',
	'Yu',
	'Tuff',
	'Gid',
	'Mac',
	'Cap',
	'Chi',
	'Balr',
	'Abu',
	'Habu',
	'Lomp',
	'Mongo',
	'Munk',
	'Toff',
	'Gree',
	'Musel',
	'Rog',
	'Rok',
	'Fadt',
	'Big',
	'Smol',
	'Mi',
	'Rik'
];
const lastNames = [
	'Mu',
	'Lu',
	'Jo',
	'Buu',
	'Nana',
	'Ko',
	'Ku',
	'Qa',
	'Cha',
	'Ueu',
	'Itu',
	'Suk',
	'In',
	'Mo',
	'Gree',
	'Edin',
	'Lyf',
	'Boi'
];
const titles = [
	'undefeated',
	'strong',
	'great',
	'big',
	'legendary',
	'crusher',
	'warlord',
	'simple',
	'colossus',
	'beast',
	'champion',
	'merciful',
	'grumpy',
	'short-tempered',
	'powerful',
	'slayer',
	'primate',
	'supreme',
	'wild',
	'unstoppable',
	'mountain',
	'tank',
	'hairy',
	'over-confident',
	'vicious',
	'monkey',
	'polite',
	'relentless',
	'brute',
	'savage',
	'monster',
	'thug',
	'aggressive',
	'friendly',
	'challenger'
];

export const fightingMessages = [
	'I will crush you.',
	'Prepare to die.',
	'You will lose.',
	'I will feast on your corpse.',
	'You will regret opposing me.',
	"I'm going to destroy you, and I'm going to enjoy it, very very much.",
	'I will end you.',
	'I will snap you in half.'
];

export const monkeyPhrases = ['Ah Ah!', 'Ah Uh Ah!', 'Ah!', 'Ook Ah Ook!', 'Ook Ah Uh!', 'Ook Ook!', 'Ook!', 'Ook.'];
export const getMonkeyPhrase = () => {
	const arr = [];
	for (let i = 0; i < randInt(5, 10); i++) {
		arr.push(randArrItem(monkeyPhrases));
	}
	return arr.join(' ');
};

export const normalHeads: [Promise<Buffer>, number][] = [1464, 1469, 1825, 1826, 5267, 5268, 5270, 5271, 5276].map(
	id => [fs.readFile(`./src/lib/resources/images/mmmr/heads/${id}.png`), id]
);
export const specialHeads: [Promise<Buffer>, number][] = [1234, 1467, 3542].map(id => [
	fs.readFile(`./src/lib/resources/images/mmmr/heads/${id}.png`),
	id
]);

export async function monkeyHeadImage({ monkey, content }: { monkey: Monkey; content: string }) {
	const canvas = createCanvas(519, 142);
	const ctx = canvas.getContext('2d');
	ctx.imageSmoothingEnabled = false;
	const bg = await textBoxFile;
	const headImage = await loadImage(await [...normalHeads, ...specialHeads].find(h => h[1] === monkey.head)![0]);
	ctx.font = '16px RuneScape Quill 8';
	ctx.drawImage(bg, 0, 0);
	ctx.drawImage(headImage, 28, bg.height / 2 - headImage.height / 2);
	ctx.fillStyle = monkey.special ? '#924eff' : '#810303';
	const nameWidth = Math.floor(ctx.measureText(monkey.name).width);
	ctx.fillText(monkey.name, 307 - nameWidth / 2, 36);
	ctx.fillStyle = '#000';
	printWrappedText(ctx, content, 316, 58, 361);

	return canvasToBuffer(canvas);
}

export interface Monkey {
	name: string;
	nameKey: string;
	head: number;
	special: boolean;
}

export function getRandomMonkey(exclude: Monkey[], chanceOfSpecial: number): Monkey {
	const firstName = randArrItem(firstNames);
	const lastName = randArrItem(lastNames);
	const title = toTitleCase(randArrItem(titles));
	const name = `${firstName} ${lastName} the ${title}`;
	const nameKey = `${firstName.toLowerCase()}-${lastName.toLowerCase()}-${title.toLowerCase()}`;
	if (exclude.some(m => m.nameKey === nameKey)) return getRandomMonkey(exclude, chanceOfSpecial);

	const special = roll(chanceOfSpecial);
	const randomHead = randArrItem(special ? specialHeads : normalHeads);

	const monkey: Monkey = {
		name,
		nameKey,
		head: randomHead[1],
		special
	};
	return monkey;
}

export function monkeyTierOfUser(user: MUser) {
	for (const tier of [...monkeyTiers].reverse()) {
		if (tier.greegrees.some(gg => user.hasEquippedOrInBank(gg.id))) {
			return tier.id;
		}
	}
	return 1;
}

export const TOTAL_MONKEYS = firstNames.length * lastNames.length * titles.length;

interface MonkeyEatable {
	item: Item;
	boost?: number;
}

export const monkeyEatables: MonkeyEatable[] = [
	{ item: getOSItem('Lychee'), boost: 9 },
	{ item: getOSItem('Mango'), boost: 6 },
	{ item: getOSItem('Avocado'), boost: 3 },
	{ item: getOSItem('Coconut') },
	{ item: getOSItem('Dragonfruit') },
	{ item: getOSItem('Banana') },
	{ item: getOSItem('Orange') },
	{ item: getOSItem('Pineapple') },
	{ item: getOSItem('Strawberry') },
	{ item: getOSItem('Watermelon') },
	{ item: getOSItem('Tomato') },
	{ item: getOSItem('Papaya fruit') },
	{ item: getOSItem('Grapes') },
	{ item: getOSItem('Lemon') },
	{ item: getOSItem('Lime') },
	{ item: getOSItem('Peach') }
];
