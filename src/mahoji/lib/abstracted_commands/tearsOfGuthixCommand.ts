import { dateFm } from '@oldschoolgg/discord';
import { Emoji, formatDuration, getNextUTCReset, notEmpty, objectEntries, Time } from '@oldschoolgg/toolkit';

import { TEARS_OF_GUTHIX_CD } from '@/lib/events.js';
import type { SkillNameType } from '@/lib/skilling/types.js';
import type { MinigameActivityTaskOptionsWithNoChanges } from '@/lib/types/minions.js';
import { formatSkillRequirements } from '@/lib/util/smallUtils.js';

export const tearsOfGuthixSkillReqs = {
	firemaking: 49,
	crafting: 20,
	mining: 20
};
export const tearsOfGuthixIronmanReqs = {
	smithing: 49,
	thieving: 36,
	slayer: 35
};

function getTearsOfGuthixMissingIronmanMessage(user: MUser): string | null {
	if (!user.user.minion_ironman) return null;

	const skills = user.skillsAsLevels;
	let skillsMatch = 0;
	for (const [skill, level] of Object.entries(tearsOfGuthixIronmanReqs) as [SkillNameType, number][]) {
		if (skills[skill] >= level) skillsMatch++;
	}

	if (skillsMatch === 0) {
		return `As an Ironman, you also need one of the following requirements:${formatSkillRequirements(
			tearsOfGuthixIronmanReqs,
			true
		)}`;
	}

	return null;
}

function getTearsOfGuthixMissingSkillMessage(user: MUser): string | null {
	const skills = user.skillsAsLevels;
	const missing = objectEntries(tearsOfGuthixSkillReqs)
		.filter(([skill, level]) => skills[skill] < level)
		.map(([skill, level]) => formatSkillRequirements({ [skill]: level }, true))
		.filter(notEmpty)
		.join(', ');

	return missing.length > 0 ? `You need the following requirements: ${missing}.` : null;
}

export async function tearsOfGuthixCommand(user: MUser, channelId: string) {
	if (user.minionIsBusy) return `${user.minionName} is busy.`;
	const currentStats = await user.fetchStats();
	const lastPlayedDate = Number(currentStats.last_tears_of_guthix_timestamp);
	const nextReset = getNextUTCReset(lastPlayedDate, TEARS_OF_GUTHIX_CD);

	// If they have already claimed a ToG in the past 7days
	if (Date.now() < nextReset) {
		return `**${Emoji.Snake} Juna says...** You can drink from the Tears of Guthix in ${dateFm(new Date(nextReset))}`;
	}

	// 43 QP for the quest
	const userQP = user.QP;
	if (userQP < 43) {
		return `**${Emoji.Snake} Juna says...** You can drink from the Tears of Guthix when you have 43+ QP.`;
	}

	const missingSkillsMessage = getTearsOfGuthixMissingSkillMessage(user);
	const missingIronmanSkillMessage = getTearsOfGuthixMissingIronmanMessage(user);

	if (missingSkillsMessage || missingIronmanSkillMessage) {
		return `You are not skilled enough to participate in Tears of Guthix. ${
			missingSkillsMessage ?? ''
		} ${missingIronmanSkillMessage ?? ''}`.trim();
	}

	const duration = Math.min(Time.Minute * 2 + Time.Second * 0.6 * userQP, Time.Minute * 30);

	await ActivityManager.startTrip<MinigameActivityTaskOptionsWithNoChanges>({
		minigameID: 'tears_of_guthix',
		userID: user.id,
		channelId,
		quantity: 1,
		duration,
		type: 'TearsOfGuthix'
	});

	return `${
		user.minionName
	} is now off to visit Juna and drink from the Tears of Guthix, their trip will take ${formatDuration(duration)}.`;
}
