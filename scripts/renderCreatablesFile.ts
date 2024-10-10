import { writeFileSync } from 'node:fs';
import { Bank } from 'oldschooljs';
import Createables from '../src/lib/data/createables';
import { makeTable } from '../src/lib/util';

export function renderCreatablesFile() {
	const headers = ['Item name', 'Input Items', 'Output Items', 'GP Cost'];
	const rows = Createables.map(i => {
		return [i.name, `${new Bank(i.inputItems)}`, `${new Bank(i.outputItems)}`, `${i.GPCost ?? 0}`];
	});

	writeFileSync('./src/lib/data/creatablesTable.txt', makeTable(headers, rows));
}
