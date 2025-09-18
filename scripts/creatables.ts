import { readFileSync, writeFileSync } from 'node:fs';
import { md5sum } from '@oldschoolgg/toolkit/node';
import { Stopwatch } from '@oldschoolgg/toolkit/structures';
import { DateTime } from 'luxon';
import { Bank } from 'oldschooljs';

import { BOT_TYPE } from '@/lib/constants.js';
import Createables from '@/lib/data/createables.js';

export async function renderCreatablesFile() {
	const stopwatch = new Stopwatch();
	const creatables = [];

	for (const c of Createables) {
		const itemsRequired = new Bank(c.inputItems);
		if (c.GPCost) {
			itemsRequired.add('Coins', c.GPCost);
		}
		creatables.push({
			name: c.name,
			items_created: new Bank(c.outputItems).toNamedBank(),
			items_required: new Bank(c.inputItems).toNamedBank(),
			required_stats: c.requiredSkills ?? {},
			qp_required: c.QPRequired ?? 0,
			required_slayer_unlocks: c.requiredSlayerUnlocks ?? []
		});
	}

	creatables.sort((a, b) => a.name.localeCompare(b.name));
	const filePath = `data/${BOT_TYPE.toLowerCase()}/creatables.json`;
	const previousHash = JSON.parse(readFileSync(filePath, 'utf-8')).hash || '';

	const hash = md5sum(JSON.stringify(creatables));
	if (hash === previousHash) {
		console.log('Creatables JSON file is up to date');
		return;
	}
	writeFileSync(
		filePath,
		`${JSON.stringify(
			{
				hash,
				date: DateTime.utc().toISO(),
				data: creatables
			},
			null,
			'	'
		)}\n`
	);
	stopwatch.check('Finished creatables file.');
}
