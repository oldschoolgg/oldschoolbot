import '../customItems/customItems';
import '../data/itemAliases';

import { stringMatches } from '@oldschoolgg/toolkit';
import { Bank, Monsters } from 'oldschooljs';

import type { KillWorkerArgs, KillWorkerReturn } from '.';
import { production } from '../../config';
import { YETI_ID } from '../constants';
import killableMonsters from '../minions/data/killableMonsters/index';
import { simulatedKillables } from '../simulation/simulatedKillables';

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
				error: `The quantity you gave exceeds your limit of ${limit.toLocaleString()}! *You can increase your limit by up to 1 million by becoming a patron at <https://www.patreon.com/oldschoolbot>`
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

	const simulatedKillable = simulatedKillables.find(i => stringMatches(i.name, bossName));
	if (simulatedKillable) {
		if (quantity > limit) {
			return {
				error: `The quantity you gave exceeds your limit of ${limit.toLocaleString()}! *You can increase your limit by up to 1 million by becoming a patron at <https://www.patreon.com/oldschoolbot>`
			};
		}

		return { bank: simulatedKillable.loot(quantity) };
	}

	return { error: "I don't have that monster!" };
};
