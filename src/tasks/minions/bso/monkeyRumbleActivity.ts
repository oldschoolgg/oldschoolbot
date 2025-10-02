import { monkeyHeadImage, monkeyTierOfUser } from '@/lib/bso/minigames/monkey-rumble/monkeyRumble.js';

import { randArrItem, roll } from '@oldschoolgg/rng';
import { Time, uniqueArr } from '@oldschoolgg/toolkit';
import { Bank, LootTable } from 'oldschooljs';

import type { MonkeyRumbleOptions } from '@/lib/types/minions.js';
import { handleTripFinish } from '@/lib/util/handleTripFinish.js';

const rewardTable = new LootTable().add('Monkey egg').add('Monkey dye').add('Big banana');
const baseTable = new LootTable().tertiary(25, 'Monkey crate');

const gotUniqueMessages = [
	'You fought well. Take this as a reward.',
	'You fight well. I respect little monkey, take this reward.',
	'You did well in the arena, we should fight again. Take these items.'
];

export const mrTask: MinionTask = {
	type: 'MonkeyRumble',
	async run(data: MonkeyRumbleOptions) {
		const { channelID, quantity, userID, monkeys, duration } = data;
		const user = await mUserFetch(userID);

		await user.incrementMinigameScore('monkey_rumble', quantity);

		const newMonkeysFought: string[] = uniqueArr([...user.user.monkeys_fought, ...monkeys.map(m => m.nameKey)]);
		await user.update({
			monkeys_fought: newMonkeysFought
		});

		const monkeyTier = monkeyTierOfUser(user);
		const tierBonusXP = quantity * monkeyTier * 1233;
		const strengthBonusXP = quantity * user.skillLevel('strength') * 1000;
		const strXP = Math.floor(tierBonusXP + strengthBonusXP) / 5;

		let xpStr = await user.addXP({
			skillName: 'strength',
			amount: strXP,
			duration,
			minimal: true
		});
		xpStr += await user.addXP({
			skillName: 'agility',
			amount: Math.floor(strXP / 4),
			duration,
			minimal: true
		});
		xpStr += await user.addXP({
			skillName: 'defence',
			amount: Math.floor(strXP / 6.5),
			duration,
			minimal: true
		});

		const tokens = Math.ceil(quantity * (monkeyTier / 1.2));
		const loot = new Bank().add('Rumble token', tokens);

		const files = [];
		const specialMonkeys = monkeys.filter(m => m.special);
		for (const monkey of specialMonkeys) {
			const unique = rewardTable.roll();
			if (roll(4) && monkeyTier === 5) {
				loot.add('Marimbo statue');
			}
			files.push(
				await monkeyHeadImage({
					monkey,
					content: unique.has('Monkey egg')
						? 'You are strong warrior. Take this monkey egg, raise him well and take care of him or I find you and crush you.'
						: randArrItem(gotUniqueMessages)
				})
			);
			loot.add(unique);
		}
		for (let i = 0; i < monkeys.length; i++) {
			loot.add(baseTable.roll());
		}

		await user.addItemsToBank({ items: loot, collectionLog: true });
		await ClientSettings.updateBankSetting('mr_loot', loot);

		const rumbleTokensPerHour = `${Math.round((tokens / (duration / Time.Minute)) * 60).toLocaleString()}`;
		const fightsPerHour = `${Math.round((quantity / (duration / Time.Minute)) * 60).toLocaleString()}`;

		handleTripFinish(
			user,
			channelID,
			`${user}, ${user.minionName} finished fighting ${quantity}x monkeys, your monkey tier is ${monkeyTier}. ${rumbleTokensPerHour} tokens/hr, ${fightsPerHour} fights/hr
${xpStr}
You received **${loot}.**`,
			files[0],
			data,
			loot
		);
	}
};
