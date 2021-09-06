import { KlasaMessage, Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { monkeyTierOfUser } from '../../../lib/monkeyRumble';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { SkillsEnum } from '../../../lib/skilling/types';
import { MonkeyRumbleOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

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

		const loot = new Bank().add('Rumble token', Math.ceil(quantity * (monkeyTier / 2)));
		await user.addItemsToBank(loot, true);

		handleTripFinish(
			this.client,
			user,
			channelID,
			`${user}, ${user.minionName} finished ${quantity}x Rumble fights against ${quantity}x monkeys (${monkeys
				.map(m => m.name)
				.join(', ')}), your monkey tier is ${monkeyTier}.\n${xpStr}\nYou received **${loot}.**`,
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
