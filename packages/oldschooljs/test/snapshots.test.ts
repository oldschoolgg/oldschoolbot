import { writeFileSync } from 'node:fs';
import { test } from 'vitest';

import { type Bank, Clues, Monsters } from '../src';

export function calcDropRatesFromBankWithoutUniques(bank: Bank, iterations: number) {
	const results: string[] = [];
	for (const [item, qty] of bank.items().sort((a, b) => a[1] - b[1])) {
		const rate = Math.round(iterations / qty);
		if (rate < 2) continue;
		results.push(`${item.name} (1 in ${rate})`);
	}
	return results;
}

function doSnapshot(its: number, bank: Bank, name: string) {
	writeFileSync(
		`./test/snapshots/${name}.txt`,
		calcDropRatesFromBankWithoutUniques(bank, its)
			.sort((a, b) => b.localeCompare(a))
			.join('\n')
	);
}

Object.entries(Clues).map(([name, table]) => {
	const its = 100_000_000;
	test.concurrent.skip(name, () => {
		doSnapshot(its, table.roll(its), name);
	});
});

[Monsters.CorporealBeast, Monsters.AbyssalDemon, Monsters.BlueDragon, Monsters.FemaleHamMember].map(mon => {
	const its = 100_000_000;
	test.concurrent.skip(mon.name, () => {
		doSnapshot(its, mon.kill(its), mon.name);
	});
});
