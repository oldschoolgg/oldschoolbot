import { writeFileSync } from 'node:fs';
import { Items } from 'oldschooljs';

import '@/lib/safeglobals';
import { customItems } from '@/lib/customItems/util';

function safeItemName(itemName: string) {
	let key = itemName;
	key = key.replace('3rd', 'third');
	key = key.replace(/[^\w\s]|_/g, '');
	key = key.replace(/\s+/g, '_');
	key = key.toUpperCase();
	return key;
}

const startsWithNumber = (str: string): boolean => /^[0-9]/.test(str);

export async function generateBsoEnum() {
	const enumItems: [string, number][] = [];
	const exitingKeys = new Set<string>();
	const itemsToIgnore = new Set<string>();

	for (const item of customItems) {
		const key = safeItemName(Items.itemNameFromId(item)!);

		if (exitingKeys.has(key)) {
			itemsToIgnore.add(key);
			continue;
		}

		exitingKeys.add(key);
		enumItems.push([key, item]);
	}

	let eItemStr = 'export enum BSOItem {';
	for (const [key, value] of enumItems.sort((a, b) => a[1] - b[1])) {
		let codeKey = startsWithNumber(key) ? `'${key}'` : key;
		if (codeKey.endsWith('_CAPET')) {
			codeKey = codeKey.replace('_CAPET', '_CAPE_TRIMMED');
		}

		eItemStr += `\n\t${codeKey} = ${value},`;
	}
	// Remove last comma
	eItemStr = eItemStr.slice(0, -1);
	eItemStr += '\n}';
	eItemStr += '\n';
	writeFileSync('./src/lib/bso/BSOItem.ts', eItemStr);
}
