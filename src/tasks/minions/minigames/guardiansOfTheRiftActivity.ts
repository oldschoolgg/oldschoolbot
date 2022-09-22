import { Bank } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import { incrementMinigameScore } from '../../../lib/settings/minigames';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { GuardiansOfTheRiftActivityTaskOptions } from './../../../lib/types/minions';

export const guardiansOfTheRiftTask: MinionTask = {
	type: 'GuardiansOfTheRift',
	async run(data: GuardiansOfTheRiftActivityTaskOptions) {
		const { channelID, userID, quantity, duration } = data;
		const user = await mUserFetch(userID);

		await incrementMinigameScore(userID, 'guardians_of_the_rift', quantity);

		const bank = new Bank();
		const itemCost = new Bank();
		let hunterXP = 0;

		let str = `<@${userID}>, ${user.minionName} finished Guardians Of The Rift. `;

		const xpStr = await user.addXP({ skillName: SkillsEnum.Hunter, amount: hunterXP, duration });

		str += xpStr;
		await transactItems({
			userID: user.id,
			itemsToAdd: bank,
			collectionLog: true,
			itemsToRemove: itemCost
		});

		handleTripFinish(user, channelID, str, ['minigames', { gotr: { start: {} } }, true], undefined, data, null);
	}
};
