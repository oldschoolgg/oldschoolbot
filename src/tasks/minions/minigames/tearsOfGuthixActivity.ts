import { increaseNumByPercent, randInt } from 'e';

import { BitField } from '../../../lib/constants';
import { LumbridgeDraynorDiary, userhasDiaryTier } from '../../../lib/diaries';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { SkillsEnum } from '../../../lib/skilling/types';
import { ActivityTaskOptionsWithQuantity } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export const togTask: MinionTask = {
	type: 'TearsOfGuthix',
	async run(data: ActivityTaskOptionsWithQuantity) {
		const { userID, channelID, duration } = data;
		const user = await mUserFetch(userID);
		await incrementMinigameScore(userID, 'tears_of_guthix', 1);
		await user.update({
			lastTearsOfGuthixTimestamp: new Date().getTime()
		});

		// Find lowest level skill
		let lowestXp = Object.values(user.skillsAsXP)[0];
		let lowestSkill = Object.keys(user.skillsAsXP)[0] as SkillsEnum;
		Object.entries(user.skillsAsXP).forEach(([skill, xp]) => {
			if (xp < lowestXp) {
				lowestXp = xp;
				lowestSkill = skill as SkillsEnum;
			}
		});

		// Calculate number of tears collected
		// QP = Game length in ticks
		const qp = user.QP;
		// Streams last for 9 seconds, 15 game ticks
		const streams = Math.floor(qp / 15);
		let tears = 0;
		for (let stream = 0; stream < streams; stream++) {
			const percentCollected = randInt(40, 95); // Collect 40 - 95% of each stream
			tears += Math.ceil(15 * (percentCollected / 100));
		}

		// Calculate tear value
		const baseXPperTear = 10;
		const xpPerTearScaling = 50 / 29;
		const xpScalingLevelCap = 30;
		const skillLevel = user.skillLevel(lowestSkill);
		const scaledXPperTear =
			skillLevel >= xpScalingLevelCap ? 60 : baseXPperTear + (skillLevel - 1) * xpPerTearScaling;

		let xpToGive = tears * scaledXPperTear;

		// 10% boost for Lumbridge&Draynor Hard
		const [hasDiary] = await userhasDiaryTier(user, LumbridgeDraynorDiary.hard);
		if (hasDiary) xpToGive = increaseNumByPercent(xpToGive, 10);
		const hasEngram = user.bitfield.includes(BitField.HasGuthixEngram);
		if (hasEngram) {
			xpToGive = increaseNumByPercent(xpToGive, 10);
		}

		const xpStr = await user.addXP({ skillName: lowestSkill, amount: xpToGive, duration });

		let output = `${user}, ${
			user.minionName
		} finished telling Juna a story and drinking from the Tears of Guthix and collected ${tears} tears.\nLowest XP skill is ${lowestSkill}.\n${xpStr.toLocaleString()}.${
			hasDiary ? '\n10% XP bonus for Lumbridge & Draynor Hard diary.' : ''
		}`;
		if (hasEngram) {
			output += ' 10% Bonus XP for Guthix engram';
		}

		handleTripFinish(user, channelID, output, undefined, data, null);
	}
};
