import { writeFileSync } from 'node:fs';
import { miniID, seedShuffle } from '@oldschoolgg/toolkit';
import { clamp, objectEntries, shuffleArr } from 'e';
import { Bank, Items } from 'oldschooljs';
import { umbTable } from './bsoOpenables';
import { overallPlusItems } from './data/Collections';
import { RelicID } from './relics';
import { SkillsArray } from './skilling/types';
import type { ItemBank } from './types';
import { resolveItems } from './util';

declare module 'oldschooljs' {
	interface Bank {
		wasRemapped: boolean;
	}
}
const itemsNotRandomized = resolveItems(['Coins', 'Untradeable Mystery Box']);

const allItems = Array.from(Items.keys()).sort((a, b) => b - a);
const allItemsToRandomize = Array.from(Items.keys())
	.sort((a, b) => b - a)
	.filter(i => !itemsNotRandomized.includes(i));
const clItemsToRandomize: number[] = [];
const notCLItemsToRandomize: number[] = [];
const notCLUMBItemsToRandomize: number[] = [];

for (const item of allItems) {
	if (itemsNotRandomized.includes(item)) continue;
	if (overallPlusItems.includes(item)) {
		clItemsToRandomize.push(item);
	} else if (!umbTable.includes(item)) {
		notCLItemsToRandomize.push(item);
	} else {
		notCLUMBItemsToRandomize.push(item);
	}
}
writeFileSync(
	'pool1-cl.txt',
	`1st Item Pool (Overall+ CL Items)\n${overallPlusItems.map(i => Items.get(i)!.name).join('\n')}`
);
writeFileSync(
	'pool2-cl.txt',
	`2nd Item Pool (Not CL and not UMB)\n${notCLItemsToRandomize.map(i => Items.get(i)!.name).join('\n')}`
);
writeFileSync(
	'pool3-cl.txt',
	`3rd Item Pool (Not CL and in UMB)\n${notCLUMBItemsToRandomize.map(i => Items.get(i)!.name).join('\n')}`
);

export function remapBank(user: MUser, bank: Bank) {
	if (bank.wasRemapped) return bank;
	const map = user.user.item_map as ItemBank;
	const newBank: ItemBank = {};
	for (const [_id, qty] of Object.entries(bank.bank)) {
		const id = Number.parseInt(_id);
		const newItemID = map[id];
		if (typeof newItemID === 'undefined') {
			throw new Error(`${user.id} tried to have their bank remapped, but item[${id}] has no mapping`);
		}
		newBank[newItemID] = clamp(qty, 0, id === 995 ? 1_000_000_000_000 : 10_000_000);
	}
	const remapped = new Bank(newBank);
	remapped.wasRemapped = true;
	return remapped;
}

export function buildItemMapFromList(key: string, items: number[]) {
	const shuffledArrayOfItemIDs = seedShuffle(items, key);
	const obj: Record<number, number> = {};
	for (let i = 0; i < shuffledArrayOfItemIDs.length; i++) {
		const fromID = shuffledArrayOfItemIDs[i];
		const toID = items[i];
		if (typeof fromID === 'undefined' || typeof toID === 'undefined') {
			throw new Error(`Undefined mapping: ${fromID} -> ${toID}`);
		}
		obj[fromID] = toID;
	}

	return obj;
}

export const randomizationMethods = [
	{
		id: 1,
		name: 'True Random',
		desc: 'Every item is randomly mapped to another item, with no restrictions.'
	},
	{
		id: 2,
		name: 'CL to CL',
		desc: 'CL items are only mapped to other CL items, and non-CL items are only mapped to other non-CL items.'
	}
] as const;

export function buildItemMap(method: (typeof randomizationMethods)[number], key: string) {
	let finalItemMap: ItemBank = {};
	if (method.id === 2) {
		for (const p of [clItemsToRandomize, notCLItemsToRandomize, notCLUMBItemsToRandomize]) {
			const shuffled = buildItemMapFromList(key, p);
			finalItemMap = { ...finalItemMap, ...shuffled };
		}
	} else {
		finalItemMap = buildItemMapFromList(key, allItemsToRandomize);
	}

	finalItemMap[995] = 995;
	finalItemMap[19_939] = 19_939;

	let i = 0;
	for (const item of allItems) {
		if (typeof finalItemMap[item] === 'undefined') {
			i++;
			finalItemMap[item] = item;
		}
	}
	console.log(`${key} - ${i} items not mapped`);

	if (finalItemMap[995] !== 995) {
		throw new Error('Invalid coins mapping!');
	}

	if (finalItemMap[19_939] !== 19_939) {
		throw new Error('Invalid coins mapping!');
	}

	return finalItemMap;
}

export async function updateUsersRandomizerMap(user: MUser, method: (typeof randomizationMethods)[number]) {
	const key = miniID(10);

	const sourceSkills = shuffleArr(SkillsArray);
	const shuffledSkills = seedShuffle(SkillsArray, key);

	const skillMapping: Record<string, string> = {};
	for (let i = 0; i < sourceSkills.length; i++) {
		skillMapping[sourceSkills[i]] = shuffledSkills[i];
	}

	const map: any = buildItemMap(method, key);
	Object.freeze(map);
	const reverseItemMap: any = {};
	for (const [key, val] of objectEntries(map)) {
		reverseItemMap[Number(val)] = Number(key);
	}

	console.log(
		new Set(Object.values(map)).size,
		Object.values(map).length,
		Object.values(reverseItemMap).length,
		allItems.length
	);
	console.log(
		Object.keys(map).length,
		Object.entries(map).length,
		Object.keys(reverseItemMap).length,
		allItems.length
	);

	if (Object.keys(map).length !== allItems.length) {
		throw new Error(
			`${user.usernameOrMention} has a map that doesn't have all items mapped: ${Object.keys(map).length} vs ${allItems.length}: missing these items ${allItems.filter(i => typeof map[i] === 'undefined')}`
		);
	}

	if (Object.keys(reverseItemMap).length !== allItems.length) {
		throw new Error(
			`${user.usernameOrMention} has a reverse map that doesn't have all items mapped: ${Object.keys(reverseItemMap).length} vs ${allItems.length}, missing these: ${allItems.slice(0, 5).filter(i => typeof reverseItemMap[i] === 'undefined')}`
		);
	}

	if (Object.values(map).length !== new Set(Object.values(map)).size) {
		throw new Error(`${user.usernameOrMention} has a map with duplicate values.`);
	}
	await user.update({ item_map: map, item_map_key: key, reverse_item_map: reverseItemMap, skill_map: skillMapping });

	const testBank = new Bank();
	for (const item of allItems) {
		testBank.add(item, 1);
	}
	remapBank(user, testBank);
}

export const relics = [
	{
		id: RelicID.XP,
		name: 'Relic of XP',
		desc: '10% bonus xp, plus 1% in your lowest skill'
	},
	{
		id: RelicID.Repetition,
		name: 'Relic of Repetition',
		desc: '1/3 chance to automatically repeat most trips, global 30% max trip length increase'
	},
	{
		id: RelicID.Randomness,
		name: 'Relic of Randomness',
		desc: 'Twice as likely to receive a UMB, and 50% chance of one reroll when opening a UMB if its an item you already have.'
	},
	{
		id: RelicID.Loot,
		name: 'Relic of Loot',
		desc: 'Double loot on every trip (for most types) for your minion and tame.'
	},
	{
		id: RelicID.Speed,
		name: 'Relic of Speed',
		desc: 'You kill monsters 30% faster, your tame kills monsters 30% faster.'
	},
	{
		id: RelicID.Slay,
		name: 'Relic of Slaying',
		desc: 'Unlimited slayer task block list, and 2x slayer points.'
	},
	{
		id: RelicID.Gambling,
		name: 'Relic of Gambling',
		desc: "One time use; a 50/50 chance to either add 50 items to your cl(that aren't there already) + double the XP of your lowest skill OR remove 50 items from your cl (and from your bank), and half the XP of your highest skill."
	}
];

export const RANDOMIZER_HELP = (user: MUser) => `**Help/Information:** <https://wiki.oldschool.gg/randomizer>
**Your randomization method:** ${user.getRandomizeMethod()!.name} (${user.getRandomizeMethod()?.desc})
**Your Relics:** ${user.user.relics.length === 0 ? `You haven't picked a relic yet.` : user.user.relics.map(id => relics.find(t => t.id === id)!.name).join(', ')}`;
