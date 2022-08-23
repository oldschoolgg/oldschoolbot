import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import Prayer from '../../../lib/skilling/skills/prayer';
import { SkillsEnum } from '../../../lib/skilling/types';
import { BuryingActivityTaskOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { mUserFetch } from '../../../mahoji/mahojiSettings';

export default class extends Task {
	async run(data: BuryingActivityTaskOptions) {
		const { boneID, quantity, userID, channelID } = data;
		const user = await mUserFetch(userID);

		const currentLevel = user.skillLevel(SkillsEnum.Prayer);

		const bone = Prayer.Bones.find(bone => bone.inputId === boneID);

		if (!bone) return;

		const XPMod = 1;
		const xpReceived = quantity * bone.xp * XPMod;

		await user.addXP({ skillName: SkillsEnum.Prayer, amount: xpReceived });
		const newLevel = user.skillLevel(SkillsEnum.Prayer);

		let str = `${user}, ${user.minionName} finished burying ${quantity} ${
			bone.name
		}, you also received ${xpReceived.toLocaleString()} XP.`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Prayer level is now ${newLevel}!`;
		}

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

		handleTripFinish(
			user,
			channelID,
			str,
			['activities', { bury: { quantity, name: bone.name } }, true],
			undefined,
			data,
			null
		);
	}
}
