import '../lib/data/itemAliases';

import { writeFileSync } from 'fs';
import { Bank } from 'oldschooljs';

import Createables from '../lib/data/createables';
import { makeTable } from '../lib/util/smallUtils';

export function main() {
	const headers = ['Item name', 'Input Items', 'Output Items', 'GP Cost'];
	const rows = Createables.map(i => {
		return [i.name, `${new Bank(i.inputItems)}`, `${new Bank(i.outputItems)}`, `${i.GPCost ?? 0}`];
	});

	writeFileSync('./src/lib/data/creatablesTable.txt', makeTable(headers, rows));
}

main();
