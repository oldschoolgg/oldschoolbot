import { monkeyTiers } from '@/lib/bso/minigames/monkey-rumble/monkeyRumble.js';

import { Bank, Items } from 'oldschooljs';

import type { Buyable } from '@/lib/data/buyables/buyables.js';

export const monkeyRumbleBuyables: Buyable[] = [
	{
		name: Items.getOrThrow('Banana enchantment scroll').name,
		itemCost: new Bank().add('Rumble token', 200)
	},
	{
		name: Items.getOrThrow('Monkey dye').name,
		itemCost: new Bank().add('Rumble token', 500)
	},
	{
		name: Items.getOrThrow('Monkey crate').name,
		itemCost: new Bank().add('Rumble token', 35)
	},
	{
		name: Items.getOrThrow('Gorilla rumble greegree').name,
		itemCost: new Bank().add('Rumble token', 1000),
		skillsNeeded: {
			strength: 120
		},
		minigameScoreReq: ['monkey_rumble', 1000]
	},
	{
		name: "M'speak amulet",
		gpCost: 100_000
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
