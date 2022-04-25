import '../data/itemAliases';

import { Bank, Misc, Monsters } from 'oldschooljs';
import { addBanks } from 'oldschooljs/dist/util/bank';

import { handleNexKills } from '../simulation/nex';
import { calcDropRatesFromBank } from '../util';
import { stringMatches } from '../util/cleanString';
import resolveItems from '../util/resolveItems';
import { KillWorkerArgs, KillWorkerReturn } from '.';

export default ({ quantity, bossName, limit, catacombs, onTask }: KillWorkerArgs): KillWorkerReturn => {
	const osjsMonster = Monsters.find(mon => mon.aliases.some(alias => stringMatches(alias, bossName)));

	if (osjsMonster) {
		if (quantity > limit) {
			return {
				error:
					`The quantity you gave exceeds your limit of ${limit.toLocaleString()}! ` +
					'*You can increase your limit by up to 1 million by becoming a patron at <https://www.patreon.com/oldschoolbot>'
			};
		}

		return { bank: osjsMonster.kill(quantity, { inCatacombs: catacombs, onSlayerTask: onTask }) };
	}

	if (['nightmare', 'the nightmare'].some(alias => stringMatches(alias, bossName))) {
		let bank = {};
		if (quantity > 10_000) {
			return { error: 'I can only kill a maximum of 10k nightmares a time!' };
		}
		for (let i = 0; i < quantity; i++) {
			bank = addBanks([
				bank,
				Misc.Nightmare.kill({ team: [{ damageDone: 2400, id: 'id' }], isPhosani: false }).id
			]);
		}
		return { bank: new Bank(bank) };
	}

	if (['nex', 'next'].some(alias => stringMatches(alias, bossName))) {
		if (quantity > 3000) {
			return { error: 'I can only kill a maximum of 3k Nex a time!' };
		}
		const loot = handleNexKills({
			quantity,
			team: [
				{ id: '1', contribution: 100, deaths: [] },
				{ id: '2', contribution: 100, deaths: [] },
				{ id: '3', contribution: 100, deaths: [] },
				{ id: '4', contribution: 100, deaths: [] }
			]
		});
		return {
			bank: loot.get('1'),
			title: `Personal Loot From ${quantity}x Nex, Team of 4`,
			content: calcDropRatesFromBank(
				loot.get('1'),
				quantity,
				resolveItems([
					'Nexling',
					'Ancient hilt',
					'Nihil horn',
					'Zaryte vambraces',
					'Torva full helm (damaged)',
					'Torva platebody (damaged)',
					'Torva platelegs (damaged)'
				])
			)
		};
	}

	return { error: "I don't have that monster!" };
};
