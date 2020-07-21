import Loot from 'oldschooljs/dist/structures/Loot';
import { Items } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';
import ClueTiers from '../minions/data/clueTiers';
import { ClueTier } from '../minions/types';

function findNonDuplicate(item: Item): number | null {
	const nonDuplicate = Items.find(i => i.name === item.name) as Item | null;

	return nonDuplicate?.id ?? null;
}

function getClueTier(item: Item, type: 'casket' | 'clue'): ClueTier | null {
	const clueRegex = item.name.startsWith('Clue scroll')
		? /Clue scroll \((.*)\)/
		: /Challenge scroll \((.*)\)/;
	const matchRegex = type === 'casket' ? /Casket \((.*)\)/ : clueRegex;

	const tierMatch = item.name.match(matchRegex);
	const tier = tierMatch ? tierMatch[1] : 'beginner';

	return ClueTiers.find(clueTier => clueTier.name.toLowerCase() === tier.toLowerCase()) ?? null;
}

function getRandomItemId(): number {
	const item = Items.random() as Item;

	if (item.name.startsWith('Casket')) {
		return getClueTier(item, 'casket')?.id ?? getRandomItemId();
	}

	if (item.name.startsWith('Challenge scroll') || item.name.startsWith('Clue scroll')) {
		return getClueTier(item, 'clue')?.scrollID ?? getRandomItemId();
	}

	if (item.duplicate) {
		return findNonDuplicate(item) ?? getRandomItemId();
	}

	return item.id;
}

export const mysteryBox = (qty = 1) => {
	const loot = new Loot();

	for (let i = 0; i < qty; i++) {
		loot.add(getRandomItemId(), 1);
	}

	return loot.values();
};
