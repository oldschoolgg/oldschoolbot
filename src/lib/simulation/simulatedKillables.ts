import { SimpleTable } from '@oldschoolgg/toolkit/structures';
import { Bank } from 'oldschooljs';

import { WintertodtCrate } from './wintertodt';

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
	loot: (quantity: number) => Bank;
}
const emptyBank = new Bank();
export const simulatedKillables: SimulatedKillable[] = [
	{
		name: 'Wintertodt',
		loot: (quantity: number) => {
			const loot = new Bank();
			for (let i = 0; i < quantity; i++) {
				const points = winterTodtPointsTable.rollOrThrow();

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
	}
];
