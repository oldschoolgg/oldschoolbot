import { Image } from 'canvas';
import { Canvas } from 'canvas-constructor';
import { MessageAttachment } from 'discord.js';
import { randArrItem, randInt, roll } from 'e';
import fs from 'fs/promises';
import { KlasaUser } from 'klasa';
import { Item } from 'oldschooljs/dist/meta/types';

import { toTitleCase } from './util';
import { canvasImageFromBuffer } from './util/canvasUtil';
import { textBoxFile } from './util/chatHeadImage';
import getOSItem from './util/getOSItem';

interface MonkeyTier {
	id: number;
	name: string;
	greegree: Item;
	image: Promise<Image>;
	strengthLevelReq: number;
	gamesReq: number;
}

export const monkeyTiers: MonkeyTier[] = [
	{
		id: 1,
		name: 'Beginner',
		greegree: getOSItem('Beginner rumble greegree'),
		image: fs.readFile('./src/lib/resources/images/mmmr/beginnermonkey.png').then(canvasImageFromBuffer),
		strengthLevelReq: 80,
		gamesReq: 0
	},
	{
		id: 2,
		name: 'Intermediate',
		greegree: getOSItem('Intermediate rumble greegree'),
		image: fs.readFile('./src/lib/resources/images/mmmr/intermediatemonkey.png').then(canvasImageFromBuffer),
		strengthLevelReq: 90,
		gamesReq: 50
	},
	{
		id: 3,
		name: 'Ninja',
		greegree: getOSItem('Ninja rumble greegree'),
		image: fs.readFile('./src/lib/resources/images/mmmr/ninjamonkey.png').then(canvasImageFromBuffer),
		strengthLevelReq: 100,
		gamesReq: 100
	},
	{
		id: 4,
		name: 'Expert Ninja',
		greegree: getOSItem('Expert ninja rumble greegree'),
		image: fs.readFile('./src/lib/resources/images/mmmr/expertninjamonkey.png').then(canvasImageFromBuffer),
		strengthLevelReq: 110,
		gamesReq: 200
	},
	{
		id: 5,
		name: 'Elder',
		greegree: getOSItem('Elder rumble greegree'),
		image: fs.readFile('./src/lib/resources/images/mmmr/eldermonkey.png').then(canvasImageFromBuffer),
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
	let arr = [];
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
	const canvas = new Canvas(519, 142);
	canvas.context.imageSmoothingEnabled = false;
	const bg = await canvasImageFromBuffer(textBoxFile);
	const headImage = await canvasImageFromBuffer(
		await [...normalHeads, ...specialHeads].find(h => h[1] === monkey.head)![0]
	);

	const image = await canvas
		.addImage(bg as any, 0, 0)
		.addImage(headImage as any, 28, bg.height / 2 - headImage.height / 2)
		.setTextAlign('center')
		.setTextFont('16px RuneScape Quill 8')

		.setColor(monkey.special ? '#924eff' : '#810303')
		.addText(monkey.name, 307, 36)

		.setColor('#000')
		.addMultilineText(content, 307, 58, 361, 18)

		.toBufferAsync();

	return new MessageAttachment(image);
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

export function monkeyTierOfUser(user: KlasaUser) {
	for (const tier of [...monkeyTiers].reverse()) {
		if (user.hasItemEquippedOrInBank(tier.greegree.id)) {
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
