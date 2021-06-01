import { randFloat } from 'e';
import { KlasaMessage, Task } from 'klasa';

import ODSCommand from '../../../commands/Minion/ods';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../../lib/skilling/types';
import { MinigameActivityTaskOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: MinigameActivityTaskOptions) {
		const { channelID, quantity, duration, userID } = data;

		incrementMinigameScore(userID, 'OuraniaDeliveryService', quantity);

		const user = await this.client.users.fetch(userID);
		const level = user.skillLevel(SkillsEnum.Magic);
		const tokens = Math.floor((quantity / 2) * 3.235 * (level / 25 + 1));

		await user.settings.update(
			UserSettings.OuraniaTokens,
			user.settings.get(UserSettings.OuraniaTokens) + tokens
		);

		let totalXP = level * (quantity * randFloat(39, 41));
		const xpRes = await user.addXP(SkillsEnum.Runecraft, totalXP, duration);

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
