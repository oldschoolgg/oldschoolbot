import { ClueTiers } from '@/lib/clues/clueTiers.js';
import '../src/lib/safeglobals';
import { TSVWriter } from '@oldschoolgg/toolkit/structures';
import { Bank } from 'oldschooljs';

const qty = 100_000_000;

const writer = new TSVWriter('data/clue_data.tsv');
writer.writeRow(['Tier', 'Loot']);

for (const clue of ClueTiers) {
	const _loot = clue.table.roll(qty, {
		targetBank: undefined,
		cl: new Bank()
	});
	const uniques = new Bank();
	for (const item of clue.cl) {
		const amnt = _loot.amount(item);
		uniques.add(item, amnt);
	}

	const results: string[] = [];
	for (const [item, amnt] of uniques.items().sort((a, b) => a[0].name.localeCompare(b[0].name))) {
		const rate = Math.round(qty / amnt);
		results.push(`${item.name} (1 in ${Math.round(rate / 3) * 3})`);
	}
	writer.writeRow([clue.name, results.join(' | ')]);
}

writer.end().then(() => process.exit());
