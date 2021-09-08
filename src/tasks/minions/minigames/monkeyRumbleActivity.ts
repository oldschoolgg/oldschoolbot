import { roll, Time } from 'e';
import { KlasaMessage, Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { monkeyTierOfUser } from '../../../lib/monkeyRumble';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { SkillsEnum } from '../../../lib/skilling/types';
import { MonkeyRumbleOptions } from '../../../lib/types/minions';
import getOSItem from '../../../lib/util/getOSItem';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

const rewards = [
	[getOSItem('Monkey egg'), 1000],
	[getOSItem('Monkey dye'), 1000]
] as const;

export default class extends Task {
	async run(data: MonkeyRumbleOptions) {
		const { channelID, quantity, userID, monkeys, duration } = data;
		const user = await this.client.fetchUser(userID);

		await incrementMinigameScore(userID, 'MadMarimbosMonkeyRumble', quantity);

		const monkeyTier = monkeyTierOfUser(user);
		const strXP = quantity * (monkeyTier * 2.5 * (user.skillLevel(SkillsEnum.Strength) * 10.6));
		let xpStr = await user.addXP({
			skillName: SkillsEnum.Strength,
			amount: strXP,
			duration,
			minimal: true
		});
		xpStr += await user.addXP({ skillName: SkillsEnum.Agility, amount: strXP / 5, duration, minimal: true });
		xpStr += await user.addXP({ skillName: SkillsEnum.Defence, amount: strXP / 10, duration, minimal: true });

		const tokens = Math.ceil(quantity * (monkeyTier / 2));
		const loot = new Bank().add('Rumble token', tokens);

		let debugstr = '';
		// let gotRare = false;
		for (const [reward, chance] of rewards) {
			const realChance = Math.floor(chance * 5 - monkeyTier) / quantity;
			debugstr += `1 in ${realChance} of ${reward.name}`;
			if (roll(realChance)) {
				loot.add(reward.id);
				// gotRare = true;
				break;
			}
		}

		await user.addItemsToBank(loot, true);

		const rumbleTokensPerHour = `${Math.round((tokens / (duration / Time.Minute)) * 60).toLocaleString()}`;
		const fightsPerHour = `${Math.round((quantity / (duration / Time.Minute)) * 60).toLocaleString()}`;

		handleTripFinish(
			this.client,
			user,
			channelID,
			`${user}, ${user.minionName} finished ${quantity}x Rumble fights against ${quantity}x monkeys (${monkeys
				.map(m => m.name)
				.join(
					', '
				)}), your monkey tier is ${monkeyTier}. ${rumbleTokensPerHour} tokens/hr, ${fightsPerHour} fights/hr\n${xpStr}\nYou received **${loot}.**\n\n${debugstr}`,
			res => {
				user.log('continued mmmr');
				return (this.client.commands.get('mmmr') as unknown as any)!.start(res) as Promise<KlasaMessage>;
			},
			undefined,
			data,
			loot.bank
		);
	}
}
