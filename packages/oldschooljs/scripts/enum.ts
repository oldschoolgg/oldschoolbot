import { existsSync, readFileSync, writeFileSync } from 'node:fs';

import type { Item } from '@/meta/item.js';
import { Monsters } from '@/simulation/monsters/index.js';
import { Items } from '@/structures/Items.js';
import spritesheetJSON from '../../../src/lib/resources/spritesheets/items-spritesheet.json' with { type: 'json' };

export function safeItemName(itemName: string) {
	let key = itemName;
	key = key.replace('3rd', 'third');
	key = key.replace(/[^\w\s]|_/g, '');
	key = key.replace(/\s+/g, '_');
	key = key.toUpperCase();
	return key;
}

const startsWithNumber = (str: string): boolean => /^[0-9]/.test(str);

type EnumEntry = [string, number];

function readExistingEnumEntries(filePath: string): EnumEntry[] {
	if (!existsSync(filePath)) return [];

	return [...readFileSync(filePath, 'utf8').matchAll(/^\t'?([^'=]+)'? = ([0-9]+),?$/gm)].map(match => [
		match[1]!,
		Number(match[2]!)
	]);
}

function preserveExistingEnumEntries(enumEntries: EnumEntry[], filePath: string) {
	const existingKeys = new Set(enumEntries.map(([key]) => key));
	for (const [key, id] of readExistingEnumEntries(filePath)) {
		if (!existingKeys.has(key)) enumEntries.push([key, id]);
	}
}

async function main() {
	const osbItems = new Set(Object.keys(spritesheetJSON).map(stringID => Number(stringID)));

	function shouldIgnoreItem(item: Item) {
		return !osbItems.has(item.id);
	}

	const enumItems: EnumEntry[] = [];
	const exitingKeys = new Set<string>();
	const itemsToIgnore = new Set<string>();

	for (const item of Items.values()) {
		if (shouldIgnoreItem(item)) continue;
		const key = safeItemName(item.name);

		if (exitingKeys.has(key)) {
			itemsToIgnore.add(key);
			continue;
		}

		exitingKeys.add(key);
		enumItems.push([key, item.id]);
	}

	enumItems.push(['EMPTY_BIRD_NEST', 5075]);
	const forcedChanges = [
		['Ultor ring', 25485],
		['Bellator ring', 25488],
		['Magus ring', 25486],
		['Venator ring', 25487]
	] as [string, number][];
	const forcedChangedIDs = new Set(forcedChanges.map(([, id]) => id));
	const enumItemEntries: EnumEntry[] = [];
	const enumGear: EnumEntry[] = [];

	let eGearStr = 'export enum EGear {';
	let eItemStr = 'export enum EItem {';
	for (const [key, value] of enumItems) {
		if (itemsToIgnore.has(key) && !forcedChangedIDs.has(value)) continue;
		let enumKey = key;
		if (enumKey.endsWith('_CAPET')) {
			enumKey = enumKey.replace('_CAPET', '_CAPE_TRIMMED');
		}

		enumItemEntries.push([enumKey, value]);
		const _item = Items.get(value)!;
		if (
			_item.equipable &&
			_item.equipment?.slot &&
			(_item.tradeable_on_ge ||
				[
					'black mask',
					'slayer',
					'collection'
					// TODO
					// ...Object.values(SkillsEnum).map(n => `${n.toLowerCase()} `)
				].some(_str => _item.name.toLowerCase().includes(_str)))
		) {
			enumGear.push([enumKey, value]);
		}
	}

	preserveExistingEnumEntries(enumItemEntries, './src/EItem.ts');
	preserveExistingEnumEntries(enumGear, './src/EGear.ts');

	for (const [key, value] of enumItemEntries.sort((a, b) => a[1] - b[1])) {
		const codeKey = startsWithNumber(key) ? `'${key}'` : key;
		eItemStr += `\n\t${codeKey} = ${value},`;
	}
	// Remove last comma
	eItemStr = eItemStr.slice(0, -1);
	eItemStr += '\n}';
	eItemStr += '\n';
	writeFileSync('./src/EItem.ts', eItemStr);

	for (const [key, value] of enumGear.sort((a, b) => a[1] - b[1])) {
		const codeKey = startsWithNumber(key) ? `'${key}'` : key;
		eGearStr += `\n\t${codeKey} = ${value},`;
	}

	eGearStr = eGearStr.slice(0, -1);
	eGearStr += '\n}';
	eGearStr += '\n';
	writeFileSync('./src/EGear.ts', eGearStr);

	// EMonster
	let monsterEnumStr = 'export enum EMonster {';
	const monstersToEnum: EnumEntry[] = [
		...Monsters.map(_m => [_m.name, _m.id]),
		['PHOSANI_NIGHTMARE', 9416],
		['NIGHTMARE', 9415],
		['MIMIC', 23_184],
		['ZALCANO', 9049],
		['NEX', 11_278],
		['DOOM_OF_MOKHAIOTL', 14_708],
		['BRANDA', 12_596],
		['ELDRIC', 14_147],
		['ROYAL_TITANS', 14_148],
		['POLLNIVNIAN_BANDIT', 736]
	] as EnumEntry[];
	const monsterEntries: EnumEntry[] = [];

	for (const [name, id] of monstersToEnum.sort((a, b) => a[0].localeCompare(b[0]))) {
		let key = name.replaceAll(' ', '_');
		key = key.replace(/[^a-zA-Z0-9_]/g, '').toUpperCase();
		monsterEntries.push([key, id]);
	}
	preserveExistingEnumEntries(monsterEntries, './src/EMonster.ts');

	for (const [key, id] of monsterEntries) {
		monsterEnumStr += `\n\t${key} = ${id},`;
	}

	monsterEnumStr = monsterEnumStr.slice(0, -1); //remove last comma
	monsterEnumStr += '\n}';
	monsterEnumStr += '\n';
	writeFileSync('./src/EMonster.ts', monsterEnumStr);
}

main();
