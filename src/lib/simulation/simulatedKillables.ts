import { randArrItem, randInt } from 'e';
import { Bank, Misc } from 'oldschooljs';

import { DOANonUniqueTable } from '../../tasks/minions/bso/doaActivity';
import { nexUniqueDrops } from '../data/CollectionsExport';
import { chanceOfDOAUnique, pickUniqueToGiveUser } from '../depthsOfAtlantis';
import { MoktangLootTable } from '../minions/data/killableMonsters/custom/bosses/Moktang';
import { NEX_UNIQUE_DROPRATE, nexLootTable } from '../nex';
import { roll } from '../util';
import { WintertodtCrate } from './wintertodt';

interface SimulatedKillable {
	name: string;
	isCustom: Boolean;
	loot: (quantity: number) => Bank;
}

export const simulatedKillables: SimulatedKillable[] = [
	{
		name: 'Wintertodt',
		isCustom: false,
		loot: (quantity: number) => {
			const loot = new Bank();
			for (let i = 0; i < quantity; i++) {
				const points = randInt(1000, 5000);

				loot.add(
					WintertodtCrate.open({
						points,
						itemsOwned: {},
						skills: {
							firemaking: 99,
							herblore: 99,
							woodcutting: 99,
							crafting: 99,
							fishing: 99,
							mining: 99,
							farming: 99
						},
						firemakingXP: 1
					})
				);
			}
			return loot;
		}
	},
	{
		name: 'The Nightmare',
		isCustom: false,
		loot: (quantity: number) => {
			let bank = new Bank();
			for (let i = 0; i < quantity; i++) {
				bank.add(Misc.Nightmare.kill({ team: [{ damageDone: 2400, id: 'id' }], isPhosani: false }).id);
			}
			return bank;
		}
	},
	{
		name: "Phosani's Nightmare",
		isCustom: false,
		loot: (quantity: number) => {
			let bank = new Bank();
			for (let i = 0; i < quantity; i++) {
				bank.add(Misc.Nightmare.kill({ team: [{ damageDone: 2400, id: 'id' }], isPhosani: true }).id);
			}
			return bank;
		}
	},
	{
		name: 'Depths of Atlantis (DOA) - Solo',
		isCustom: true,
		loot: (quantity: number) => {
			const chanceOfUnique = chanceOfDOAUnique(1, false);
			const loot = new Bank();
			for (let i = 0; i < quantity; i++) {
				if (roll(chanceOfUnique)) {
					loot.add(pickUniqueToGiveUser(loot));
				} else {
					loot.add(DOANonUniqueTable.roll());
				}
			}
			return loot;
		}
	},
	{
		name: 'Nex',
		isCustom: true,
		loot: (quantity: number) => {
			let loot = new Bank();
			for (let i = 0; i < quantity; i++) {
				if (roll(NEX_UNIQUE_DROPRATE(1))) {
					loot.add(randArrItem(nexUniqueDrops), 1);
				}
				loot.add(nexLootTable.roll());
			}
			return loot;
		}
	},
	{
		name: 'Moktang',
		isCustom: true,
		loot: (quantity: number) => {
			return MoktangLootTable.roll(quantity);
		}
	}
];
