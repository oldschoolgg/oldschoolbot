import { calcPercentOfNum, calcWhatPercent, noOp, randInt } from 'e';
import { Task } from 'klasa';

import { KandarinDiary, userhasDiaryTier } from '../../../lib/diaries';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { BarbarianAssaultActivityTaskOptions } from '../../../lib/types/minions';
import { sendToChannelID } from '../../../lib/util/webhook';

function generateExpertiseString(totalLevel: number) {
	if (totalLevel === 4) {
		return 'Your team are all level 1, and new to Barbarian Assault.';
	}
	if (totalLevel <= 10) {
		return 'Some members of your team have a decent amount of experience with Barbarian Assault.';
	}
	if (totalLevel <= 15) {
		return 'Your team is quite skilled at Barbarian Assault.';
	}
	return 'Your team are the best-of-the-best at Barbarian Assault!';
}

export default class extends Task {
	async run({ channelID, leader, users, quantity, totalLevel }: BarbarianAssaultActivityTaskOptions) {
		let basePoints = 35;
		let resultStr = 'The base amount of points is 35. ';
		resultStr += `Your teams total level is ${totalLevel}/${users.length * 5}. `;

		const teamSkillPercent = calcWhatPercent(totalLevel, users.length * 5);
		// You get up to 20% extra points for your team being higher levelled
		basePoints += calcPercentOfNum(teamSkillPercent, 20);
		resultStr += `Your team receives ${calcPercentOfNum(
			teamSkillPercent,
			users.length * 5
		)} extra points for your honour levels. \n`;

		for (const id of users) {
			const user = await this.client.fetchUser(id).catch(noOp);
			if (!user) continue;
			let pts = basePoints + randInt(-3, 3);
			const [hasDiary] = await userhasDiaryTier(user, KandarinDiary.hard);
			if (hasDiary) {
				pts *= 1.1;
				resultStr += `${user.username} received 10% extra pts for kandarin hard diary. `;
			}
			let totalPoints = Math.floor(pts * quantity);

			user.incrementMinigameScore('BarbarianAssault', quantity);

			await user.settings.update(
				UserSettings.HonourPoints,
				user.settings.get(UserSettings.HonourPoints) + totalPoints
			);

			resultStr += `${user} received ${totalPoints} points\n`;
		}

		const leaderUser = await this.client.fetchUser(leader);

		resultStr = `${leaderUser}, your team finished doing ${quantity} waves of Barbarian Assault. ${generateExpertiseString(
			totalLevel
		)}
${resultStr}`;

		sendToChannelID(this.client, channelID, { content: resultStr });
	}
}
