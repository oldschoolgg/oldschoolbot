import { Time, notEmpty, objectEntries } from 'e';

import { formatDuration } from '@oldschoolgg/toolkit/util';
import { Emoji } from '../../../lib/constants';
import { SkillsEnum } from '../../../lib/skilling/types';
import type { MinigameActivityTaskOptionsWithNoChanges } from '../../../lib/types/minions';
import { formatSkillRequirements, hasSkillReqs } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { minionIsBusy } from '../../../lib/util/minionIsBusy';

const skillReqs = {
	[SkillsEnum.Firemaking]: 49,
	[SkillsEnum.Crafting]: 20,
	[SkillsEnum.Mining]: 20
};
const ironmanExtraReqs = {
	[SkillsEnum.Smithing]: 49,
	[SkillsEnum.Thieving]: 36,
	[SkillsEnum.Slayer]: 35
};

export async function tearsOfGuthixCommand(user: MUser, channelID: string) {
	if (minionIsBusy(user.id)) return `${user.minionName} is busy.`;
	const currentDate = new Date().getTime();

	const currentStats = await user.fetchStats({ last_tears_of_guthix_timestamp: true });

	const lastPlayedDate = Number(currentStats.last_tears_of_guthix_timestamp);
	const difference = currentDate - lastPlayedDate;

	// If they have already claimed a ToG in the past 7days
	if (difference < Time.Day * 7) {
		const duration = formatDuration(Date.now() - (lastPlayedDate + Time.Day * 7));
		return `**${Emoji.Snake} Juna says...** You can drink from the Tears of Guthix in ${duration}.`;
	}

	// 43 QP for the quest
	const userQP = user.QP;
	if (userQP < 43) {
		return `**${Emoji.Snake} Juna says...** You can drink from the Tears of Guthix when you have 43+ QP.`;
	}

	const skills = user.skillsAsLevels;
	let missingIronmanSkills = false;
	// Extra requirements if Ironman
	if (user.user.minion_ironman) {
		let skillsMatch = 0;
		Object.entries(ironmanExtraReqs).forEach(([skill, level]) => {
			if (skills[skill as SkillsEnum] >= level) skillsMatch += 1;
		});
		if (skillsMatch === 0) {
			missingIronmanSkills = true;
		}
	}

	const missingIronmanSkillMessage = `As an Ironman, you also need one of the following requirements:${formatSkillRequirements(
		ironmanExtraReqs,
		true
	)}`;
	// Skills required for quest
	if (!hasSkillReqs(user, skillReqs)[0]) {
		const missingSkillsMessage = objectEntries(skillReqs)
			.map(s => {
				return skills[s[0]] < s[1] ? formatSkillRequirements({ [s[0]]: s[1] }, true) : undefined;
			})
			.filter(notEmpty)
			.join(', ');

		return `You are not skilled enough to participate in Tears of Guthix. You need the following requirements: ${missingSkillsMessage}. ${
			missingIronmanSkills ? missingIronmanSkillMessage : ''
		}`;
	} else if (missingIronmanSkills) {
		return `You are not skilled enough to participate in Tears of Guthix. ${missingIronmanSkillMessage}`;
	}

	let duration = Time.Minute * 2;
	duration += Time.Second * 0.6 * userQP;
	if (duration > Time.Minute * 30) duration = Time.Minute * 30;

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
