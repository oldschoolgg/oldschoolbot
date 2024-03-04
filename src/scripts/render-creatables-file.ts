import '../lib/data/itemAliases';

import { Stopwatch } from '@sapphire/stopwatch';
import { existsSync, writeFileSync } from 'fs';
import { Bank } from 'oldschooljs';
import { table } from 'table';

import Createables from '../lib/data/createables';
import { md5sum } from '../lib/util';

export function main() {
	const data = [
		['Item name', 'Input Items', 'Output Items', 'GP Cost'],
		...Createables.map(i => {
			return [i.name, `${new Bank(i.inputItems)}`, `${new Bank(i.outputItems)}`, `${i.GPCost ?? 0}`];
		})
	];
	const hash = md5sum(JSON.stringify(data)).slice(0, 5);
	const fileName = `./src/lib/data/creatablesTable_${hash}.txt`;

	const exists = existsSync(fileName);
	if (exists) {
		console.log('No changes to creatables');
		return;
	}

	const stopwatch = new Stopwatch();
	stopwatch.start();
	const creatableTable = table(data);
	stopwatch.stop();
	console.log(`Rendered creatables table in ${stopwatch.toString()}`);

	writeFileSync(fileName, creatableTable);
}

main();
