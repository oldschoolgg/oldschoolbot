import { PestControlActivityTaskOptions } from '../../../lib/types/minions';
import { Task } from 'klasa';
import { noOp } from '../../../lib/util';
import { MinigameIDsEnum } from '../../../lib/minions/data/minigames';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { channelIsSendable } from '../../../lib/util/channelIsSendable';
import { roll } from 'oldschooljs/dist/util';
import { MAX_PEST_CONTROL_POINTS } from '../../../lib/constants';
import CommendationPoints = UserSettings.CommendationPoints;

export default class extends Task {
	async run({
		userID,
		channelID,
		quantity,
		duration,
		pointsPerGame
	}: PestControlActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const channel = await this.client.channels.fetch(channelID).catch(noOp);
		const messages = [];

		let wonGames = quantity;

		for (let i = 0; i < quantity; i++) {
			if (roll(10)) {
				wonGames -= 1;
			}
		}

		const pointsToAdd = wonGames * pointsPerGame;

		user.incrementMinigameScore(MinigameIDsEnum.PestControl, quantity);

		messages.push(
			`${user} ${user.minionName} finished playing pest control. You won ${wonGames}/${quantity} games giving you a total of ${pointsToAdd} commendation points.`
		);

		const points = user.settings.get(CommendationPoints);
		const newPoints =
			pointsToAdd + points < MAX_PEST_CONTROL_POINTS
				? pointsToAdd + points
				: MAX_PEST_CONTROL_POINTS;
		messages.push(`You now have ${newPoints} points!`);
		if (newPoints === MAX_PEST_CONTROL_POINTS) {
			messages.push('You have hit the maximum amount of commendation points');
		}
		await user.settings.update(CommendationPoints, newPoints);

		if (!channelIsSendable(channel)) return;

		return channel.send(messages.join('\n'));
	}
}
