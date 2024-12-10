import { Bank } from 'oldschooljs';

import { monkeyTiers } from '../../monkeyRumble';
import getOSItem from '../../util/getOSItem';
import type { Buyable } from './buyables';

export const monkeyRumbleBuyables: Buyable[] = [
	{
		name: getOSItem('Banana enchantment scroll').name,
		itemCost: new Bank().add('Rumble token', 200)
	},
	{
		name: getOSItem('Monkey dye').name,
		itemCost: new Bank().add('Rumble token', 500)
	},
	{
		name: getOSItem('Monkey crate').name,
		itemCost: new Bank().add('Rumble token', 35)
	},
	{
		name: getOSItem('Gorilla rumble greegree').name,
		itemCost: new Bank().add('Rumble token', 1000),
		skillsNeeded: {
			strength: 120
		},
		minigameScoreReq: ['monkey_rumble', 1000]
	}
];

for (const tier of monkeyTiers) {
	const index = monkeyTiers.indexOf(tier);
	monkeyRumbleBuyables.push({
		name: tier.greegrees[0].name,
		minigameScoreReq: ['monkey_rumble', tier.gamesReq],
		skillsNeeded: {
			strength: tier.strengthLevelReq
		},
		itemCost:
			index === 0
				? new Bank().add('Coins', 50_000)
				: new Bank().add('Rumble token', Math.floor((index + 1) * 8.5)),
		customReq: async (user: MUser) => {
			if (user.owns(tier.greegrees[0].id)) {
				return [false, 'You already own this greegree.'];
			}
			return [true];
		}
	});
}
