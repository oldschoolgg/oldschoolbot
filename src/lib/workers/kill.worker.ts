import '../customItems/customItems';
import '../data/itemAliases';

import { stringMatches } from '@oldschoolgg/toolkit';
import { Bank, Misc, Monsters } from 'oldschooljs';

import { production } from '../../config';
import { YETI_ID } from '../constants';
import { MoktangLootTable } from '../minions/data/killableMonsters/custom/bosses/Moktang';
import killableMonsters from '../minions/data/killableMonsters/index';
import type { KillWorkerArgs, KillWorkerReturn } from '.';

export default async ({
	quantity,
	bossName,
	catacombs,
	onTask,
	limit,
	lootTableTertiaryChanges
}: KillWorkerArgs): KillWorkerReturn => {
	const osjsMonster = Monsters.find(mon => mon.aliases.some(alias => stringMatches(alias, bossName)));

	if (osjsMonster) {
		if (osjsMonster.id === YETI_ID && production) {
			return { error: 'The bot is too scared to simulate fighting the yeti.' };
		}
		if (quantity > limit) {
			return {
				error:
					`The quantity you gave exceeds your limit of ${limit.toLocaleString()}! ` +
					'*You can increase your limit by up to 1 million by becoming a patron at <https://www.patreon.com/oldschoolbot>'
			};
		}

		const result = {
			bank: osjsMonster.kill(quantity, {
				inCatacombs: catacombs,
				onSlayerTask: onTask,
				lootTableOptions: {
					tertiaryItemPercentageChanges: new Map(lootTableTertiaryChanges)
				}
			})
		};

		const killableMonster = killableMonsters.find(mon => mon.id === osjsMonster.id);
		if (killableMonster && killableMonster.specialLoot) {
			killableMonster.specialLoot({ ownedItems: result.bank, loot: result.bank, quantity, cl: new Bank() });
		}

		return result;
	}

	if (['nightmare', 'the nightmare'].some(alias => stringMatches(alias, bossName))) {
		let bank = new Bank();
		if (quantity > 10_000) {
			return { error: 'I can only kill a maximum of 10k nightmares a time!' };
		}
		for (let i = 0; i < quantity; i++) {
			bank.add(Misc.Nightmare.kill({ team: [{ damageDone: 2400, id: 'id' }], isPhosani: false }).id);
		}
		return { bank };
	}

	if (stringMatches(bossName, 'moktang')) {
		return { bank: MoktangLootTable.roll(quantity) };
	}

	return { error: "I don't have that monster!" };
};
