import '../lib/data/itemAliases';

import { writeFileSync } from 'fs';
import { Bank } from 'oldschooljs';
import { table } from 'table';

import Createables from '../lib/data/createables';

export function makeCreatablesTable() {
	const creatableTable = table([
		['Item name', 'Input Items', 'Output Items', 'GP Cost'],
		...Createables.map(i => {
			return [i.name, `${new Bank(i.inputItems)}`, `${new Bank(i.outputItems)}`, `${i.GPCost ?? 0}`];
		})
	]);

	return creatableTable;
}

writeFileSync('./src/lib/data/creatablesTable.txt', makeCreatablesTable());
