import { Bank } from 'oldschooljs';

import Prayer from '../../../lib/skilling/skills/prayer';
import { SkillsEnum } from '../../../lib/skilling/types';
import { ScatteringActivityTaskOptions } from '../../../lib/types/minions';
import { calcPerHour, toKMB } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { userStatsBankUpdate } from '../../../mahoji/mahojiSettings';

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

		await user.addXP({ skillName: SkillsEnum.Prayer, amount: xpReceived, source: 'ScatteringAshes' });
		const newLevel = user.skillLevel(SkillsEnum.Prayer);

		let str = `${user}, ${user.minionName} finished scattering ${quantity} ${
			ash.name
		}, you also received ${xpReceived.toLocaleString()} XP (${toKMB(calcPerHour(xpReceived, data.duration))}/hr).`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Prayer level is now ${newLevel}!`;
		}

		await userStatsBankUpdate(user.id, 'scattered_ashes_bank', new Bank().add(ash.inputId, quantity));

		handleTripFinish(user, channelID, str, undefined, data, null);
	}
};
