import Prayer from '../../../lib/skilling/skills/prayer';
import { SkillsEnum } from '../../../lib/skilling/types';
import { ScatteringActivityTaskOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export const scatteringTask: MinionTask = {
	type: 'Scattering',
	async run(data: ScatteringActivityTaskOptions) {
		const { ashID, quantity, userID, channelID } = data;
		const user = await mUserFetch(userID);

		const currentLevel = user.skillLevel(SkillsEnum.Prayer);

		const ash = Prayer.Ashes.find(ash => ash.inputId === ashID);

		if (!ash) return;

		const XPMod = 1;
		const xpReceived = quantity * ash.xp * XPMod;

		await user.addXP({ skillName: SkillsEnum.Prayer, amount: xpReceived });
		const newLevel = user.skillLevel(SkillsEnum.Prayer);

		let str = `${user}, ${user.minionName} finished scattering ${quantity} ${
			ash.name
		}, you also received ${xpReceived.toLocaleString()} XP.`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Prayer level is now ${newLevel}!`;
		}

		handleTripFinish(user, channelID, str, undefined, data, null);
	}
};
