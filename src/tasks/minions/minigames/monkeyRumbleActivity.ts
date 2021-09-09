import { randArrItem, Time } from 'e';
import { KlasaMessage, Task } from 'klasa';
import { Bank, LootTable } from 'oldschooljs';

import { monkeyHeadImage, monkeyTierOfUser } from '../../../lib/monkeyRumble';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { SkillsEnum } from '../../../lib/skilling/types';
import { MonkeyRumbleOptions } from '../../../lib/types/minions';
import { updateBankSetting } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

const rewardTable = new LootTable().add('Monkey egg').add('Monkey dye');

const gotUniqueMessages = [
	'You fought well. Take this as a reward.',
	'You fight well. I respect little monkey, take this reward.',
	'You did well in the arena, we should fight again. Take these items.'
];

export default class extends Task {
	async run(data: MonkeyRumbleOptions) {
		const { channelID, quantity, userID, monkeys, duration } = data;
		const user = await this.client.fetchUser(userID);

		await incrementMinigameScore(userID, 'MadMarimbosMonkeyRumble', quantity);

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

		const tokens = Math.ceil(quantity * (monkeyTier / 2));
		const loot = new Bank().add('Rumble token', tokens);

		let files = [];
		const specialMonkeys = monkeys.filter(m => m.special);
		for (const monkey of specialMonkeys) {
			const unique = rewardTable.roll();
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

		await user.addItemsToBank(loot, true);
		updateBankSetting(this.client, ClientSettings.EconomyStats.MonkeyRumbleLoot, loot);

		const rumbleTokensPerHour = `${Math.round((tokens / (duration / Time.Minute)) * 60).toLocaleString()}`;
		const fightsPerHour = `${Math.round((quantity / (duration / Time.Minute)) * 60).toLocaleString()}`;

		handleTripFinish(
			this.client,
			user,
			channelID,
			`${user}, ${user.minionName} finished ${quantity}x fights against ${quantity}x monkeys, your monkey tier is ${monkeyTier}. ${rumbleTokensPerHour} tokens/hr, ${fightsPerHour} fights/hr
${xpStr}
You received **${loot}.**`,
			res => {
				user.log('continued mmmr');
				return (this.client.commands.get('mmmr') as unknown as any)!.start(res) as Promise<KlasaMessage>;
			},
			files[0],
			data,
			loot.bank
		);
	}
}
