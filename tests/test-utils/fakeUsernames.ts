import type { APIUser } from '@oldschoolgg/discord';
import type { RNGProvider } from 'node-rng';
import { cryptoRng } from 'node-rng/crypto';

export const fakeUsernameAdjectives: string[] = [
	'Absurd',
	'Ancient',
	'Baffled',
	'Boiling',
	'Bouncy',
	'Brave',
	'Bumpy',
	'Chaotic',
	'Cheeky',
	'Chunky',
	'Clumsy',
	'Cosmic',
	'Cranky',
	'Crunchy',
	'Dizzy',
	'Drowsy',
	'Electric',
	'Fancy',
	'Ferocious',
	'Floppy',
	'Frosty',
	'Furious',
	'Gilded',
	'Goofy',
	'Grimy',
	'Hasty',
	'Haunted',
	'Jolly',
	'Juicy',
	'Leaky',
	'Lumpy',
	'Magic',
	'Mighty',
	'Moldy',
	'Noisy',
	'Oblong',
	'Peculiar',
	'Pickled',
	'Polite',
	'Prickly',
	'Radiant',
	'Rowdy',
	'Rusty',
	'Sleepy',
	'Spicy',
	'Squiggly',
	'Sturdy',
	'Tiny',
	'Wobbly',
	'Zesty'
];

export const fakeUsernameNouns: string[] = [
	'Anvil',
	'Bagel',
	'Banana',
	'Biscuit',
	'Bucket',
	'Cabbage',
	'Cauldron',
	'Chisel',
	'Cloak',
	'Compass',
	'Crumpet',
	'Dagger',
	'Doorknob',
	'Drumstick',
	'Falafel',
	'Firework',
	'Fossil',
	'Goblet',
	'Helmet',
	'Kebab',
	'Ladle',
	'Lantern',
	'Lobster',
	'Mallet',
	'Meatball',
	'Muffin',
	'Mustache',
	'Noodle',
	'Omelette',
	'Onion',
	'Pancake',
	'Pickaxe',
	'Pretzel',
	'Pumpkin',
	'Quill',
	'Radish',
	'Rucksack',
	'Sandwich',
	'Sausage',
	'Shovel',
	'Spoon',
	'Teapot',
	'Turnip',
	'Waffle',
	'Wizard',
	'Yoyo',
	'Zipper',
	'Boot',
	'Cape',
	'Pebble'
];

export function generateFakeUsername(rng: RNGProvider = cryptoRng): string {
	const name = [rng.pick(fakeUsernameAdjectives), rng.pick(fakeUsernameNouns)].join(rng.pick([' ', '_', '-', '']));
	if (!rng.roll(2)) return name;

	const suffix = rng.randInt(1, 10) <= 6 ? rng.randInt(0, 9) : rng.randInt(1, 999);
	return `${name}#${suffix}`;
}

export function mockAPIUser(userId: string, rng: RNGProvider = cryptoRng): APIUser {
	return {
		id: userId,
		username: generateFakeUsername(rng),
		discriminator: '0',
		global_name: null,
		avatar: null,
		bot: false
	};
}
