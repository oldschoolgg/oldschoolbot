import '../data/itemAliases';

import { stringMatches } from '@oldschoolgg/toolkit/util';
import { Bank, Misc, Monsters, calcDropRatesFromBank } from 'oldschooljs';

import { resolveItems } from 'oldschooljs/dist/util/util';
import type { KillWorkerArgs, KillWorkerReturn } from '.';
import killableMonsters from '../minions/data/killableMonsters';
import { handleNexKills } from '../simulation/nex';
import { simulatedKillables } from '../simulation/simulatedKillables';

if (global.prisma || global.redis) {
	throw new Error('Prisma/Redis is loaded in the kill worker!');
}

export default async ({
	quantity,
	bossName,
	catacombs,
	onTask,
	slayerMaster,
	limit,
	lootTableTertiaryChanges
}: KillWorkerArgs): KillWorkerReturn => {
	const osjsMonster = Monsters.find(mon => mon.aliases.some(alias => stringMatches(alias, bossName)));
	if (osjsMonster) {
		if (quantity > limit) {
			return {
				error: `The quantity you gave exceeds your limit of ${limit.toLocaleString()}! *You can increase your limit by up to 1 million by becoming a patron at <https://www.patreon.com/oldschoolbot>`
			};
		}

		const result = {
			bank: osjsMonster.kill(quantity, {
				inCatacombs: catacombs,
				onSlayerTask: onTask,
				slayerMaster: slayerMaster,
				lootTableOptions: {
					tertiaryItemPercentageChanges: new Map(lootTableTertiaryChanges)
				}
			})
		};

		const killableMonster = killableMonsters.find(mon => mon.id === osjsMonster.id);
		if (killableMonster?.specialLoot) {
			killableMonster.specialLoot({ ownedItems: result.bank, loot: result.bank, quantity, cl: new Bank() });
		}

		return { bank: result.bank.toJSON() };
	}

	const simulatedKillable = simulatedKillables.find(i => stringMatches(i.name, bossName));
	if (simulatedKillable) {
		if (quantity > limit) {
			return {
				error: `The quantity you gave exceeds your limit of ${limit.toLocaleString()}! *You can increase your limit by up to 1 million by becoming a patron at <https://www.patreon.com/oldschoolbot>`
			};
		}

		return { bank: simulatedKillable.loot(quantity).toJSON() };
	}

	if (['nightmare', 'the nightmare'].some(alias => stringMatches(alias, bossName))) {
		const bank = new Bank();
		if (quantity > 10_000) {
			return { error: 'I can only kill a maximum of 10k nightmares a time!' };
		}
		for (let i = 0; i < quantity; i++) {
			bank.add(Misc.Nightmare.kill({ team: [{ damageDone: 2400, id: 'id' }], isPhosani: false }).id);
		}
		return { bank: bank.toJSON() };
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
			bank: loot.get('1').toJSON(),
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
