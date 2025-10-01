import { randInt } from '@oldschoolgg/rng';
import { increaseNumByPercent } from '@oldschoolgg/toolkit';

import { LumbridgeDraynorDiary, userhasDiaryTier } from '@/lib/diaries.js';
import type { SkillNameType } from '@/lib/skilling/types.js';
import type { ActivityTaskOptionsWithQuantity } from '@/lib/types/minions.js';

export const togTask: MinionTask = {
	type: 'TearsOfGuthix',
	async run(data: ActivityTaskOptionsWithQuantity, { user, handleTripFinish }) {
		const { channelID, duration } = data;

		await user.incrementMinigameScore('tears_of_guthix', 1);
		await user.statsUpdate({
			last_tears_of_guthix_timestamp: Date.now()
		});

		// Find lowest level skill
		let lowestXp = Object.values(user.skillsAsXP)[0];
		let lowestSkill = Object.keys(user.skillsAsXP)[0] as SkillNameType;
		Object.entries(user.skillsAsXP).forEach(([skill, xp]) => {
			if (xp < lowestXp) {
				lowestXp = xp;
				lowestSkill = skill as SkillNameType;
			}
		});

		// Calculate number of tears collected
		// QP = Game length in ticks
		const qp = user.QP;
		// Streams last for 9 seconds, 15 game ticks
		const streams = Math.floor(qp / 15);
		let tears = 0;
		for (let stream = 0; stream < streams; stream++) {
			const percentCollected = randInt(80, 100); // Collect 80 - 100% of each stream, depending on RNG of spawn and Runelite
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

		const xpStr = await user.addXP({ skillName: lowestSkill, amount: xpToGive, duration, source: 'TearsOfGuthix' });

		const output = `${user}, ${
			user.minionName
		} finished telling Juna a story and drinking from the Tears of Guthix and collected ${tears} tears.\nLowest XP skill is ${lowestSkill}.\n${xpStr.toLocaleString()}.${
			hasDiary ? '\n10% XP bonus for Lumbridge & Draynor Hard diary.' : ''
		}`;

		handleTripFinish(user, channelID, output, undefined, data, null);
	}
};
