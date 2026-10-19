import { AdeptSack, Bank, BasicSack, ExpertSack, type Item, Items, MasterSack, resolveItems } from 'oldschooljs';

import type { UnifiedOpenable } from '@/lib/openables.js';
import creatures from '@/lib/skilling/skills/hunter/creatures/index.js';
import type { Creature } from '@/lib/skilling/types.js';

export const RumourOptions = ['novice', 'adept', 'expert', 'master'] as const;
export type RumourOption = (typeof RumourOptions)[number];
export const RumourHunterIDs = ['gilman', 'cervus', 'ornus', 'aco', 'teco', 'wolf'] as const;
export type RumourHunterID = (typeof RumourHunterIDs)[number];
export type RumourBlockList = Partial<Record<RumourHunterID, number>>;

interface RumourHunter {
	id: RumourHunterID;
	tier: RumourOption;
	label: string;
	creatures?: readonly string[];
}

export const RumourHunters: readonly RumourHunter[] = [
	{ id: 'gilman', tier: 'novice', label: 'Novice (Gilman)' },
	{
		id: 'cervus',
		tier: 'adept',
		label: 'Adept (Cervus)',
		creatures: [
			'Swamp lizard',
			'Horned graahk',
			'Spotted kebbit',
			'Black warlock',
			'Orange salamander',
			'Razor-backed kebbit',
			'Sabre-toothed kebbit',
			'Chinchompa',
			'Dark kebbit',
			'Pyre fox',
			'Carnivorous chinchompa',
			'Sunlight moth'
		]
	},
	{
		id: 'ornus',
		tier: 'adept',
		label: 'Adept (Ornus)',
		creatures: [
			'Spined larupia',
			'Snowy knight',
			'Embertailed jerboa',
			'Spotted kebbit',
			'Orange salamander',
			'Sabre-toothed kebbit',
			'Sabre-toothed kyatt',
			'Pyre fox',
			'Red salamander',
			'Carnivorous chinchompa'
		]
	},
	{
		id: 'aco',
		tier: 'expert',
		label: 'Expert (Aco)',
		creatures: [
			'Orange salamander',
			'Sabre-toothed kebbit',
			'Chinchompa',
			'Sabre-toothed kyatt',
			'Dark kebbit',
			'Red salamander',
			'Carnivorous chinchompa',
			'Dashing kebbit',
			'Sunlight antelope',
			'Tecu salamander',
			'Moonlight moth'
		]
	},
	{
		id: 'teco',
		tier: 'expert',
		label: 'Expert (Teco)',
		creatures: [
			'Sabre-toothed kebbit',
			'Chinchompa',
			'Sabre-toothed kyatt',
			'Dark kebbit',
			'Red salamander',
			'Carnivorous chinchompa',
			'Dashing kebbit',
			'Sunlight antelope',
			'Sunlight moth',
			'Herbiboar'
		]
	},
	{
		id: 'wolf',
		tier: 'master',
		label: 'Master (Wolf)',
		creatures: [
			'Red salamander',
			'Carnivorous chinchompa',
			'Dashing kebbit',
			'Sunlight antelope',
			'Tecu salamander',
			'Herbiboar',
			'Moonlight moth',
			'Moonlight antelope'
		]
	}
];

const defaultRumourHunters: Record<RumourOption, RumourHunterID> = {
	novice: 'gilman',
	adept: 'cervus',
	expert: 'aco',
	master: 'wolf'
};

export function getRumourHunter(input: RumourHunterID | RumourOption): RumourHunter {
	const id = defaultRumourHunters[input as RumourOption] ?? input;
	const hunter = RumourHunters.find(hunter => hunter.id === id);
	if (!hunter) throw new Error(`Unknown rumour hunter: ${input}`);
	return hunter;
}

export function canAssignRumour(hunter: RumourHunter, creature: Creature): boolean {
	// Gilman can assign every supported rumour creature.
	return hunter.creatures?.includes(creature.name) ?? Boolean(creature.tier?.includes('novice'));
}

export function normaliseRumourBlockList(
	stored: Partial<Record<RumourHunterID | RumourOption, number>>
): RumourBlockList {
	const blockList: RumourBlockList = {};
	for (const hunter of RumourHunters) {
		if (stored[hunter.id]) blockList[hunter.id] = stored[hunter.id];
	}
	// Preserve old tier-based blocks in a hunter slot that can assign that creature.
	for (const tier of RumourOptions) {
		const creature = creatures.find(creature => creature.id === stored[tier]);
		if (!creature || Object.values(blockList).includes(creature.id)) continue;
		const hunter = RumourHunters.find(
			hunter => hunter.tier === tier && !blockList[hunter.id] && canAssignRumour(hunter, creature)
		);
		if (hunter) blockList[hunter.id] = creature.id;
	}
	return blockList;
}

export interface Rumour {
	creatureID: number;
	duration: number;
	quantity: number;
}

const sacks = [BasicSack, AdeptSack, ExpertSack, MasterSack];

const outfitPieces = resolveItems([
	'Guild hunter headwear',
	'Guild hunter top',
	'Guild hunter legs',
	'Guild hunter boots'
]);

export const tierToHunterLevel = {
	novice: 46,
	adept: 57,
	expert: 72,
	master: 91
};

export function openHunterSack({
	item,
	qty,
	allItemsOwned,
	hunterXP,
	rng
}: {
	allItemsOwned: Bank;
	item: Item;
	qty: number;
	hunterXP: number;
	rng: RNGProvider;
}) {
	const sack = sacks.find(i => i.id === item.id);
	if (!sack) throw new Error(`No sack found for item ${item.name}.`);

	const loot = new Bank();
	const effectiveOwnedItems = allItemsOwned.clone();

	for (let i = 0; i < qty; i++) {
		const thisLoot = sack.table.roll();
		const unownedPieces = outfitPieces.filter(i => !effectiveOwnedItems.has(i));

		if (rng.roll(50)) {
			if (sack.id === 29_248 || sack.id === 29_246) {
				if (rng.roll(20)) {
					thisLoot.add('Quetzin');
				}
				if (rng.roll(5)) {
					thisLoot.add("Huntsman's kit");
				} else {
					if (unownedPieces.length > 0) {
						thisLoot.add(unownedPieces[0]);
					} else {
						thisLoot.add(rng.pick(outfitPieces));
					}
				}
			} else if (sack.id === 29_244) {
				if (rng.roll(5)) {
					thisLoot.add("Huntsman's kit");
				} else {
					if (unownedPieces.length > 0) {
						thisLoot.add(unownedPieces[0]);
					} else {
						thisLoot.add(rng.pick(outfitPieces));
					}
				}
			} else {
				if (unownedPieces.length > 0) {
					thisLoot.add(unownedPieces[0]);
				} else {
					thisLoot.add(rng.pick(outfitPieces));
				}
			}
		}

		if (!thisLoot.has('Quetzin') && hunterXP >= 200_000_000) {
			if (sack.id === 29_248 || sack.id === 29_246) {
				if (rng.roll(67)) thisLoot.add('Quetzin');
			}
		}

		loot.add(thisLoot);

		effectiveOwnedItems.add(thisLoot);
	}
	return { bank: loot };
}

export const hunterSackOpenables: UnifiedOpenable[] = [];

for (const sack of sacks) {
	hunterSackOpenables.push({
		name: sack.name,
		id: sack.id,
		openedItem: Items.getOrThrow(sack.id),
		aliases: sack.aliases,
		output: async args =>
			openHunterSack({
				item: args.self.openedItem,
				allItemsOwned: args.user.allItemsOwned,
				qty: args.quantity,
				hunterXP: args.user.skillsAsXP.hunter,
				rng: args.rng
			}),
		allItems: [
			...new Set([...sack.table.allItems, ...outfitPieces, ...resolveItems(['Quetzin', "Huntsman's kit"])])
		]
	});
}
