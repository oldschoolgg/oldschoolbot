import { KlasaMessage, Task } from 'klasa';
import { Bank } from 'oldschooljs';

import CastleWarsCommand from '../../../commands/Minion/castlewars';
import { monkeyTierOfUser } from '../../../lib/monkeyRumble';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { SkillsEnum } from '../../../lib/skilling/types';
import { MonkeyRumbleOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: MonkeyRumbleOptions) {
		const { channelID, quantity, userID, monkey, duration } = data;

		await incrementMinigameScore(userID, 'MadMarimbosMonkeyRumble', quantity);

		const user = await this.client.fetchUser(userID);
		const loot = new Bank();
		await user.addItemsToBank(loot, true);

		const strXP = quantity * (monkeyTierOfUser(user) * 2.5 * (user.skillLevel(SkillsEnum.Strength) * 10.6));
		let xpStr = await user.addXP({
			skillName: SkillsEnum.Strength,
			amount: strXP,
			duration
		});
		xpStr += await user.addXP({ skillName: SkillsEnum.Agility, amount: strXP / 5, duration });

		handleTripFinish(
			this.client,
			user,
			channelID,
			`${user}, ${user.minionName} finished ${quantity}x Rumble fights against ${monkey.name} and received ${loot}. ${xpStr}`,
			res => {
				user.log('continued castle wars');
				return (this.client.commands.get('castlewars') as unknown as CastleWarsCommand)!.play(
					res
				) as Promise<KlasaMessage>;
			},
			undefined,
			data,
			loot.bank
		);
	}
}
