import '../src/lib/safeglobals.js';
import { spectatorClothes } from '@/lib/bso/collection-log/main.js';
import { allDyedItems } from '@/lib/bso/dyedItems.js';
import { cmbClothes } from '@/lib/bso/openables/cmb.js';

import { writeFileSync } from 'node:fs';

import customItems from '../data/bso/custom-items.json' with { type: 'json' };

let eItemStr = 'export enum BSOItem {';

function safeItemName(itemName: string) {
	let key = itemName;
	key = key.replace('3rd', 'third');
	key = key.replace(/[^\w\s]|_/g, '');
	key = key.replace(/\s+/g, '_');
	key = key.toUpperCase();
	return key;
}

const startsWithNumber = (str: string): boolean => /^[0-9]/.test(str);

const ignoredItems = [...cmbClothes, ...allDyedItems, ...spectatorClothes];

const ignoredNames = ['easter', 'ghostly', 'christmas'];

for (const item of customItems) {
	if (ignoredItems.includes(item.id)) continue;
	if (ignoredNames.some(name => item.name.toLowerCase().includes(name))) continue;
	const key = safeItemName(item.name);
	let codeKey = startsWithNumber(key) ? `'${key}'` : key;
	if (codeKey.endsWith('_CAPET')) {
		codeKey = codeKey.replace('_CAPET', '_CAPE_TRIMMED');
	}

	eItemStr += `\n\t${codeKey} = ${item.id},`;
}

writeFileSync('src/lib/bso/BSOItem.ts', `${eItemStr}\n}\n`);
