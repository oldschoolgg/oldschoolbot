import { Time } from 'e';
import { Task } from 'klasa';
import { toKMB } from 'oldschooljs/dist/util';

import { getBoatType } from '../../../commands/Minion/pestcontrol';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { MinigameActivityTaskOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: MinigameActivityTaskOptions) {
		const { channelID, userID, quantity, duration } = data;
		const user = await this.client.users.fetch(userID);

		const [boatType, pointsPerGame] = getBoatType(user.combatLevel);

		let points = pointsPerGame * quantity;

		await user.incrementMinigameScore('PestControl', quantity);
		await user.settings.update(
			UserSettings.PestControlPoints,
			user.settings.get(UserSettings.PestControlPoints) + points
		);

		let perHour = `(${toKMB((points / (duration / Time.Minute)) * 60)}/Hr)`;
		let str = `${user}, ${
			user.minionName
		} finished ${quantity}x games of Pest Control on the ${boatType} boat. You received ${points}x Void Knight commendation points, you now have ${user.settings.get(
			UserSettings.PestControlPoints
		)} points. ${perHour}`;

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log('continued trip of pestcontrol');
				// @ts-ignore 2339
				return this.client.commands.get('pestcontrol')!.start(res, [quantity]);
			},
			undefined,
			data,
			null
		);
	}
}
