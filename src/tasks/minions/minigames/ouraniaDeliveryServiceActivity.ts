import { randFloat } from 'e';
import { KlasaMessage, Task } from 'klasa';

import ODSCommand from '../../../commands/Minion/ods';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../../lib/skilling/types';
import { MinigameActivityTaskOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import itemID from '../../../lib/util/itemID';

export default class extends Task {
	async run(data: MinigameActivityTaskOptions) {
		const { channelID, quantity, duration, userID } = data;

		incrementMinigameScore(userID, 'OuraniaDeliveryService', quantity);

		const user = await this.client.users.fetch(userID);
		const level = user.skillLevel(SkillsEnum.Magic);
		let tokens = Math.floor((quantity / 2) * 3.235 * (level / 25 + 1));
		if (user.equippedPet() === itemID('Flappy')) {
			tokens *= 2;
		}

		await user.settings.update(
			UserSettings.OuraniaTokens,
			user.settings.get(UserSettings.OuraniaTokens) + tokens
		);

		let totalXP = level * (quantity * randFloat(39, 41));
		const xpRes = await user.addXP({
			skillName: SkillsEnum.Runecraft,
			amount: totalXP,
			duration
		});

		let str = `${user}, ${user.minionName} finished completing ${quantity}x Ourania deliveries, you received ${tokens} tokens. ${xpRes}`;

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued ods`);
				return (this.client.commands.get('ods') as ODSCommand)!.start(res) as Promise<
					KlasaMessage
				>;
			},
			undefined,
			data,
			null
		);
	}
}
