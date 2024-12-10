import { writeFile } from 'node:fs/promises';
import { isFunction } from 'e';
import { Bank } from 'oldschooljs';
import '../src/lib/safeglobals';

import Createables from '../src/lib/data/createables';
import { makeTable } from '../src/lib/util';

async function renderCreatablesFile() {
	const headers = ['Item name', 'Input Items', 'Output Items', 'GP Cost'];
	const rows = Createables.map(i => {
		return [
			i.name,
			`${isFunction(i.inputItems) ? 'Unknown/Dynamic' : new Bank(i.inputItems)}`,
			`${isFunction(i.outputItems) ? 'Unknown/Dynamic' : new Bank(i.outputItems)}`,
			`${i.GPCost ?? 0}`
		];
	});

	await writeFile('./src/lib/data/creatablesTable.txt', makeTable(headers, rows));
}

renderCreatablesFile();
