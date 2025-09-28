import { chanceOfDOAUnique, pickUniqueToGiveUser } from '@/lib/bso/depthsOfAtlantis.js';
import { DOANonUniqueTable } from '@/lib/bso/doa/doaLootTable.js';
import { NEX_UNIQUE_DROPRATE, nexLootTable } from '@/lib/bso/monsters/nex.js';

import { randArrItem, randInt, roll } from '@oldschoolgg/toolkit';
import { SimpleTable } from '@oldschoolgg/toolkit/structures';
import { Bank, Misc } from 'oldschooljs';

import { nexUniqueDrops } from '@/lib/data/CollectionsExport.js';
import {
	KalphiteKingMonster,
	kalphiteKingLootTable
} from '@/lib/minions/data/killableMonsters/custom/bosses/KalphiteKing.js';
import { KingGoldemarLootTable } from '@/lib/minions/data/killableMonsters/custom/bosses/KingGoldemar.js';
import { MoktangLootTable } from '@/lib/minions/data/killableMonsters/custom/bosses/Moktang.js';
import { WintertodtCrate } from '@/lib/simulation/wintertodt.js';
import { zygomiteFarmingSource } from '@/lib/skilling/skills/farming/zygomites.js';
import { calcDwwhChance } from '@/lib/structures/Boss.js';

export const winterTodtPointsTable = new SimpleTable<number>()
	.add(420)
	.add(470)
	.add(500)
	.add(505)
	.add(510)
	.add(520)
	.add(550)
	.add(560)
	.add(590)
	.add(600)
	.add(620)
	.add(650)
	.add(660)
	.add(670)
	.add(680)
	.add(700)
	.add(720)
	.add(740)
	.add(750)
	.add(780)
	.add(850);

interface SimulatedKillable {
	name: string;
	isCustom: boolean;
	message?: string;
	loot: (quantity: number) => Bank;
}
const emptyBank = new Bank();
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
						itemsOwned: emptyBank,
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
			const bank = new Bank();
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
			const bank = new Bank();
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
			const loot = new Bank();
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
		name: 'King Goldemar',
		isCustom: true,
		message: '**Assumptions**:\n- Solo\n- Ring of Luck equipped',
		loot: (quantity: number): Bank => {
			const loot = new Bank();
			for (let i = 0; i < quantity; i++) {
				if (roll(calcDwwhChance(1, true))) {
					loot.add('Broken dwarven warhammer');
				}
			}
			loot.add(KingGoldemarLootTable.roll(quantity));
			return loot;
		}
	},
	{
		name: 'Moktang',
		isCustom: true,
		loot: (quantity: number) => {
			return MoktangLootTable.roll(quantity);
		}
	},
	{
		name: 'Kalphite King',
		isCustom: true,
		loot: (quantity: number) => {
			const loot = new Bank();
			for (let i = 0; i < quantity; i++) {
				KalphiteKingMonster.specialLoot?.({
					loot: loot,
					ownedItems: new Bank(),
					quantity: 1,
					cl: loot
				});
			}
			loot.add(kalphiteKingLootTable.roll(quantity));
			return loot;
		}
	},
	...zygomiteFarmingSource.map(src => ({
		name: src.name,
		isCustom: true,
		loot: (quantity: number) => {
			const loot = new Bank();
			for (let i = 0; i < quantity; i++) {
				loot.add(src.lootTable?.roll());
			}
			return loot;
		}
	}))
];
