import '../customItems/customItems.js';
import '../data/itemAliases.js';

import { ORI_DISABLED_MONSTERS } from '@/lib/bso/bsoConstants.js';
import { EBSOMonster } from '@/lib/bso/EBSOMonster.js';
import { bsoKillableMonsters } from '@/lib/bso/monsters/bsoKillableMonsters.js';

import { stringMatches } from '@oldschoolgg/toolkit';
import { Bank, Monsters } from 'oldschooljs';

import killableMonsters from '@/lib/minions/data/killableMonsters/index.js';
import { simulatedKillables } from '@/lib/simulation/simulatedKillables.js';
import type { KillWorkerArgs, KillWorkerReturn } from '@/lib/workers/index.js';

if (global.prisma) {
	throw new Error('Prisma is loaded in the kill worker!');
}
export default async ({
	quantity,
	bossName,
	catacombs,
	onTask,
	slayerMaster,
	limit,
	ori,
	lootTableTertiaryChanges
}: KillWorkerArgs): KillWorkerReturn => {
	const simulatedKillable = simulatedKillables.find(i => stringMatches(i.name, bossName));
	if (simulatedKillable) {
		if (quantity > limit) {
			return {
				error: `The quantity you gave exceeds your limit of ${limit.toLocaleString()}! *You can increase your limit by up to 1 million by becoming a patron at <https://www.patreon.com/oldschoolbot>`
			};
		}
		return {
			content: simulatedKillable.message,
			bank: simulatedKillable.loot(quantity).toJSON()
		};
	}

	const osjsMonster = Monsters.find(mon => mon.aliases.some(alias => stringMatches(alias, bossName)));
	if (osjsMonster) {
		if (osjsMonster.id === EBSOMonster.YETI) {
			return { error: 'The bot is too scared to simulate fighting the yeti.' };
		}
		if (quantity > limit) {
			return {
				error: `The quantity you gave exceeds your limit of ${limit.toLocaleString()}! *You can increase your limit by up to 1 million by becoming a patron at <https://www.patreon.com/oldschoolbot>`
			};
		}

		// Add this logging RIGHT where you have the ori check
		console.log('=== ORI CHECK DEBUG ===');
		console.log('ori value:', ori);
		console.log('ori type:', typeof ori);
		console.log('ori truthy:', !!ori);
		console.log('monster name:', osjsMonster.name);
		console.log('monster name (stringified):', JSON.stringify(osjsMonster.name));

		// Test the array check
		const matchTest = ORI_DISABLED_MONSTERS.some(m => {
		const result = stringMatches(m, osjsMonster.name);
		console.log(`  stringMatches("${m}", "${osjsMonster.name}") = ${result}`);
		return result;
		});
		console.log('any matches found:', matchTest);
		console.log('condition result (ori && matches):', ori && matchTest);
		console.log('=== END DEBUG ===');

		if (ori && ORI_DISABLED_MONSTERS.some(m => stringMatches(m, osjsMonster.name))) {
		return { error: "Ori doesn't work here." };
		}

		let qtyToKill = quantity;
		if (ori) {
			qtyToKill = Math.ceil(quantity * 1.25);
		}

		const result = {
			bank: osjsMonster.kill(qtyToKill, {
				inCatacombs: catacombs,
				onSlayerTask: onTask,
				slayerMaster: slayerMaster,
				lootTableOptions: {
					tertiaryItemPercentageChanges: new Map(lootTableTertiaryChanges)
				}
			})
		};

		const killableMonster = [...killableMonsters, ...bsoKillableMonsters].find(mon => mon.id === osjsMonster.id);
		if (killableMonster?.specialLoot) {
			killableMonster.specialLoot({
				ownedItems: result.bank,
				loot: result.bank,
				quantity: qtyToKill,
				cl: new Bank()
			});
		}
		return { bank: result.bank.toJSON() };
	}

	return { error: "I don't have that monster!" };
};
