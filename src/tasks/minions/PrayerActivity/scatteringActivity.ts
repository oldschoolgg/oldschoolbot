import { Bank } from 'oldschooljs';

import Prayer from '../../../lib/skilling/skills/prayer';
import { SkillsEnum } from '../../../lib/skilling/types';
import type { ScatteringActivityTaskOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { userStatsBankUpdate } from '../../../mahoji/mahojiSettings';

export const scatteringTask: MinionTask = {
	type: 'Scattering',
	async run(data: ScatteringActivityTaskOptions) {
		const { ashID, quantity, userID, channelID, duration } = data;
		const user = await mUserFetch(userID);

		const ash = Prayer.Ashes.find(ash => ash.inputId === ashID)!;
		const xpReceived = quantity * ash.xp;

		const xpRes = await user.addXP({
			skillName: SkillsEnum.Prayer,
			amount: xpReceived,
			source: 'ScatteringAshes',
			duration
		});

		const str = `${user}, ${user.minionName} finished scattering ${quantity}x ${ash.name}. ${xpRes}`;

		await userStatsBankUpdate(user, 'scattered_ashes_bank', new Bank().add(ash.inputId, quantity));

		handleTripFinish(user, channelID, str, undefined, data, null);
	}
};
