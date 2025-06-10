import { writeFileSync } from 'node:fs';

import { type Item, Items, Monsters } from '../src';

export function safeItemName(itemName: string) {
	let key = itemName;
	key = key.replace('3rd', 'third');
	key = key.replace(/[^\w\s]|_/g, '');
	key = key.replace(/\s+/g, '_');
	key = key.toUpperCase();
	return key;
}

const startsWithNumber = (str: string): boolean => /^[0-9]/.test(str);

async function main() {
	const spritesheetJSON = await fetch(
		'https://raw.githubusercontent.com/oldschoolgg/oldschoolbot/refs/heads/master/src/lib/resources/images/spritesheet.json'
	).then(res => res.json());
	const osbItems = new Set(Object.keys(spritesheetJSON).map(stringID => Number(stringID)));

	function shouldIgnoreItem(item: Item) {
		return !osbItems.has(item.id);
	}

	const enumItems: [string, number][] = [];
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

	const forcedChanges = [
		['Ultor ring', 25485],
		['Bellator ring', 25488],
		['Magus ring', 25486],
		['Venator ring', 25487]
	] as [string, number][];
	const forcedChangedIDs = new Set(forcedChanges.map(([, id]) => id));

	let eGearStr = 'export enum EGear {';
	let eItemStr = 'export enum EItem {';
	for (const [key, value] of enumItems.sort((a, b) => a[1] - b[1])) {
		if (itemsToIgnore.has(key) && !forcedChangedIDs.has(value)) continue;
		const codeKey = startsWithNumber(key) ? `'${key}'` : key;
		eItemStr += `\n\t${codeKey} = ${value},`;
		const _item = Items.get(value)!;
		if (_item.equipable && _item.equipment?.slot && _item.tradeable_on_ge) {
			eGearStr += `\n\t${codeKey} = ${value},`;
		}
	}
	// Remove last comma
	eItemStr = eItemStr.slice(0, -1);
	eItemStr += '\n}';
	eItemStr += '\n';
	writeFileSync('./src/EItem.ts', eItemStr);

	eGearStr = eGearStr.slice(0, -1);
	eGearStr += '\n}';
	eGearStr += '\n';
	writeFileSync('./src/EGear.ts', eGearStr);

	// EMonster
	let monsterEnumStr = 'export enum EMonster {';
	for (const monster of Monsters.values()) {
		let key = monster.name;
		key = key.replaceAll(' ', '_');
		key = key.replace(/[^a-zA-Z0-9_]/g, '').toUpperCase();
		monsterEnumStr += `\n\t${key} = ${monster.id},`;
	}
	monsterEnumStr = monsterEnumStr.slice(0, -1); //remove last comma
	monsterEnumStr += '\n}';
	monsterEnumStr += '\n';
	writeFileSync('./src/EMonster.ts', monsterEnumStr);
}

main();
