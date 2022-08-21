import { Time } from 'e';
import { Task } from 'klasa';
import { toKMB } from 'oldschooljs/dist/util';

import { incrementMinigameScore } from '../../../lib/settings/settings';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { MinigameActivityTaskOptions } from '../../../lib/types/minions';
import { combatLevel } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { getBoatType } from '../../../mahoji/lib/abstracted_commands/pestControlCommand';
import { mahojiUsersSettingsFetch } from '../../../mahoji/mahojiSettings';

export default class extends Task {
	async run(data: MinigameActivityTaskOptions) {
		const { channelID, userID, quantity, duration } = data;
		const user = await this.client.fetchUser(userID);
		const mahojiUser = await mahojiUsersSettingsFetch(user.id);

		const [boatType, pointsPerGame] = getBoatType(combatLevel(mahojiUser));

		let points = pointsPerGame * quantity;

		await incrementMinigameScore(userID, 'pest_control', quantity);
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
			user,
			channelID,
			str,
			['minigames', { pest_control: { start: {} } }, true, 'start'],
			undefined,
			data,
			null
		);
	}
}
