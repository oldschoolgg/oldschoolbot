import { Emoji } from '@oldschoolgg/toolkit/constants';
import { dateFm, formatDuration, getNextUTCReset } from '@oldschoolgg/toolkit/util';
import { Time, notEmpty, objectEntries } from 'e';

import { tears_of_guthix_cd } from '@/lib/events';
import { formatSkillRequirements } from '@/lib/util/smallUtils.js';
import { SkillsEnum } from '../../../lib/skilling/types.js';
import type { MinigameActivityTaskOptionsWithNoChanges } from '../../../lib/types/minions.js';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask.js';

export const tearsOfGuthixSkillReqs = {
	[SkillsEnum.Firemaking]: 49,
	[SkillsEnum.Crafting]: 20,
	[SkillsEnum.Mining]: 20
};
export const tearsOfGuthixIronmanReqs = {
	[SkillsEnum.Smithing]: 49,
	[SkillsEnum.Thieving]: 36,
	[SkillsEnum.Slayer]: 35
};

function getTearsOfGuthixMissingIronmanMessage(user: MUser): string | null {
	if (!user.user.minion_ironman) return null;

	const skills = user.skillsAsLevels;
	let skillsMatch = 0;
	for (const [skill, level] of Object.entries(tearsOfGuthixIronmanReqs)) {
		if (skills[skill as SkillsEnum] >= level) skillsMatch++;
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

export async function tearsOfGuthixCommand(user: MUser, channelID: string) {
	if (user.minionIsBusy) return `${user.minionName} is busy.`;
	const currentStats = await user.fetchStats({ last_tears_of_guthix_timestamp: true });
	const lastPlayedDate = Number(currentStats.last_tears_of_guthix_timestamp);
	const nextReset = getNextUTCReset(lastPlayedDate, tears_of_guthix_cd);

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

	await addSubTaskToActivityTask<MinigameActivityTaskOptionsWithNoChanges>({
		minigameID: 'tears_of_guthix',
		userID: user.id,
		channelID: channelID.toString(),
		quantity: 1,
		duration,
		type: 'TearsOfGuthix'
	});

	return `${
		user.minionName
	} is now off to visit Juna and drink from the Tears of Guthix, their trip will take ${formatDuration(duration)}.`;
}
