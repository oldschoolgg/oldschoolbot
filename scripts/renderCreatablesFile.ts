import { writeFile } from 'node:fs/promises';
import { Table } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';
import '../src/lib/safeglobals';

import Createables from '../src/lib/data/createables';

async function renderCreatablesFile() {
	const table = new Table();
	table.addHeader('Item name', 'Input Items', 'Output Items', 'GP Cost');

	for (const i of Createables) {
		table.addRow(i.name, `${new Bank(i.inputItems)}`, `${new Bank(i.outputItems)}`, `${i.GPCost ?? 0}`);
	}

	await writeFile('./src/lib/data/creatablesTable.txt', table.toString());
}

renderCreatablesFile();
