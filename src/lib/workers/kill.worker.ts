import '../../lib/data/itemAliases';
import '../../lib/customItems';

import { Misc } from 'oldschooljs';
import { addBanks } from 'oldschooljs/dist/util/bank';

import { KillWorkerArgs } from '.';
import { findMonster } from '../../lib/util/findMonster';

export function cleanString(str: string) {
	return str.replace(/[^0-9a-zA-Z]/gi, '').toUpperCase();
}

export function stringMatches(str: string, str2: string) {
	return cleanString(str) === cleanString(str2);
}


export default ({ quantity, bossName, limit }: KillWorkerArgs) => {
	const osjsMonster = findMonster(bossName);

	if (osjsMonster) {
		if (quantity > limit) {
			return (
				`The quantity you gave exceeds your limit of ${limit.toLocaleString()}! ` +
				`*You can increase your limit by up to 1 million by becoming a patron at <https://www.patreon.com/oldschoolbot>, ` +
				`or 50,000 by nitro boosting the support server.*`
			);
		}

		return osjsMonster.table.kill(quantity);
	}

	if (['nightmare', 'the nightmare'].some(alias => stringMatches(alias, bossName))) {
		let bank = {};
		if (quantity > 10_000) {
			return `I can only kill a maximum of 10k nightmares a time!`;
		}
		for (let i = 0; i < quantity; i++) {
			bank = addBanks([
				bank,
				Misc.Nightmare.kill({ team: [{ damageDone: 2400, id: 'id' }] }).id
			]);
		}
		return bank;
	}

	switch (cleanString(bossName)) {
		default:
			return "I don't have that monster!";
	}
};
