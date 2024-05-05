import { randArrItem, roll, Time, uniqueArr } from 'e';
import { Bank, LootTable } from 'oldschooljs';

import { monkeyHeadImage, monkeyTierOfUser } from '../../../lib/monkeyRumble';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { SkillsEnum } from '../../../lib/skilling/types';
import { MonkeyRumbleOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';

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

		await incrementMinigameScore(userID, 'monkey_rumble', quantity);

		const newMonkeysFought: string[] = uniqueArr([...user.user.monkeys_fought, ...monkeys.map(m => m.nameKey)]);
		await user.update({
			monkeys_fought: newMonkeysFought
		});

		const monkeyTier = monkeyTierOfUser(user);
		let tierBonusXP = quantity * monkeyTier * 1233;
		let strengthBonusXP = quantity * user.skillLevel(SkillsEnum.Strength) * 1000;
		const strXP = Math.floor(tierBonusXP + strengthBonusXP) / 5;

		let xpStr = await user.addXP({
			skillName: SkillsEnum.Strength,
			amount: strXP,
			duration,
			minimal: true
		});
		xpStr += await user.addXP({
			skillName: SkillsEnum.Agility,
			amount: Math.floor(strXP / 4),
			duration,
			minimal: true
		});
		xpStr += await user.addXP({
			skillName: SkillsEnum.Defence,
			amount: Math.floor(strXP / 6.5),
			duration,
			minimal: true
		});

		const tokens = Math.ceil(quantity * (monkeyTier / 1.2));
		const loot = new Bank().add('Rumble token', tokens);

		let files = [];
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
		updateBankSetting('mr_loot', loot);

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
