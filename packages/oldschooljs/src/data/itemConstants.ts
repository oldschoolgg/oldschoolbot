import type { Item } from '../meta/types';
import { getItemOrThrow, resolveItems } from '../util/util';

export const allTeamCapes: Item[] = [];

for (let i = 1; i < 51; i++) {
	allTeamCapes.push(getItemOrThrow(`Team-${i} cape`));
}

export const beekeeperOutfit = resolveItems([
	"Beekeeper's hat",
	"Beekeeper's top",
	"Beekeeper's legs",
	"Beekeeper's gloves",
	"Beekeeper's boots"
]);

export const camoOutfit = resolveItems(['Camo helmet', 'Camo top', 'Camo bottoms']);

export const lederhosenOutfit = resolveItems(['Lederhosen hat', 'Lederhosen top', 'Lederhosen shorts']);

export const zombieOutfit = resolveItems([
	'Zombie mask',
	'Zombie shirt',
	'Zombie trousers',
	'Zombie gloves',
	'Zombie boots'
]);

export const mimeOutfit = resolveItems(['Mime mask', 'Mime top', 'Mime legs', 'Mime gloves', 'Mime boots']);
