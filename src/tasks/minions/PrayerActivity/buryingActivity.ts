import { Bank } from 'oldschooljs';

import Prayer from '../../../lib/skilling/skills/prayer';
import { SkillsEnum } from '../../../lib/skilling/types';
import type { BuryingActivityTaskOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export const buryingTask: MinionTask = {
	type: 'Burying',
	async run(data: BuryingActivityTaskOptions) {
		const { boneID, quantity, userID, channelID } = data;
		const user = await mUserFetch(userID);

		const bone = Prayer.Bones.find(bone => bone.inputId === boneID);

		if (!bone) return;

		const XPMod = 1;
		const xpReceived = quantity * bone.xp * XPMod;

		const xpRes = await user.addXP({ skillName: SkillsEnum.Prayer, amount: xpReceived, duration: data.duration });

		let str = `${user}, ${user.minionName} finished burying ${quantity} ${bone.name}, ${xpRes}.`;

		if (
			user.hasEquipped(['Iron dagger', 'Bronze arrow', 'Iron med helm'], true) &&
			!user.hasEquippedOrInBank(['Clue hunter garb'])
		) {
			await transactItems({
				userID,
				itemsToAdd: new Bank({ 'Clue hunter garb': 1, 'Clue hunter trousers': 1 }),
				collectionLog: true
			});
			str += '\n\nWhile digging a hole to bury bones in, you find a garb and pair of trousers.';
		}

		handleTripFinish(user, channelID, str, undefined, data, null);
	}
};
