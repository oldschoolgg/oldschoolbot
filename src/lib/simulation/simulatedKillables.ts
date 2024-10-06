import { Bank } from 'oldschooljs';

import { winterTodtPointsTable } from '../constants';
import { WintertodtCrate } from './wintertodt';

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
