import { notEmpty, roll } from 'e';
import { Bank, Monsters } from 'oldschooljs';
import { ChambersOfXeric } from 'oldschooljs/dist/simulation/misc';

import { allCollectionLogsFlat } from './data/Collections';
import { chambersOfXericNormalCL, wintertodtCL } from './data/CollectionsExport';
import pets from './data/pets';
import { WintertodtCrate } from './simulation/wintertodt';
import { stringMatches } from './util/cleanString';
import itemID from './util/itemID';

interface KillArgs {
	accumulatedLoot: Bank;
}

interface Finishable {
	name: string;
	cl: number[];
	kill: (args: KillArgs) => Bank;
	customResponse?: (kc: number) => string;
	maxAttempts?: number;
}

export const finishables: Finishable[] = [
	{
		name: 'Chambers of Xeric (Solo, Non-CM)',
		cl: chambersOfXericNormalCL,
		kill: () => ChambersOfXeric.complete({ team: [{ id: '1', personalPoints: 25_000 }] })['1']
	},
	{
		name: 'Wintertodt (500pt crates, Max stats)',
		cl: wintertodtCL,
		kill: ({ accumulatedLoot }) =>
			new Bank(
				WintertodtCrate.open({
					points: 500,
					itemsOwned: accumulatedLoot.bank,
					skills: {
						herblore: 99,
						firemaking: 99,
						woodcutting: 99,
						fishing: 99,
						mining: 99,
						crafting: 99,
						farming: 99
					}
				})
			)
	}
];

const monsterPairedCLs = Monsters.map(mon => {
	const cl = allCollectionLogsFlat.find(c => stringMatches(c.name, mon.name));
	if (!cl) return null;
	if (!cl.items.every(id => mon.allItems.includes(id))) return null;
	return {
		name: mon.name,
		cl: cl.items,
		mon
	};
}).filter(notEmpty);

for (const mon of monsterPairedCLs) {
	finishables.push({
		name: mon.name,
		cl: mon.cl,
		kill: () => mon.mon.kill(1, {})
	});
}

for (const pet of pets) {
	finishables.push({
		name: `${pet.name} Pet`,
		cl: [itemID(pet.name)],
		maxAttempts: 1_000_000,
		kill: () => {
			const bank = new Bank();
			if (roll(pet.chance)) bank.add(itemID(pet.name));
			return bank;
		},
		customResponse: kc => pet.formatFinish(kc)
	});
}
