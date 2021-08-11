import { Time } from 'e';
import { Task } from 'klasa';
import { toKMB } from 'oldschooljs/dist/util';

import { getBoatType } from '../../../commands/Minion/pestcontrol';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { MinigameActivityTaskOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import itemID from '../../../lib/util/itemID';

export default class extends Task {
	async run(data: MinigameActivityTaskOptions) {
		const { channelID, userID, quantity, duration } = data;
		const user = await this.client.users.fetch(userID);

		const [boatType, pointsPerGame] = getBoatType(user.combatLevel);

		let points = pointsPerGame * quantity;

		// 2x points for Flappy.
		let hasFlappy = false;
		if (user.equippedPet() === itemID('Flappy')) {
			hasFlappy = true;
			points *= 2;
		}

		await user.incrementMinigameScore('PestControl', quantity);
		await user.settings.update(
			UserSettings.PestControlPoints,
			user.settings.get(UserSettings.PestControlPoints) + points
		);

		let perHour = ` (${toKMB((points / (duration / Time.Minute)) * 60)}/Hr)`;
		let str = `${user}, ${
			user.minionName
		} finished ${quantity}x games of Pest Control on the ${boatType} boat. You received ${points}x Void Knight commendation points, you now have ${user.settings.get(
			UserSettings.PestControlPoints
		)} points.${perHour}`;
		if (hasFlappy) str += '\n2x Points for using Flappy.';

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
