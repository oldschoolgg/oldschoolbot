import { notEmpty, objectEntries, Time } from 'e';
import { KlasaUser } from 'klasa';

import { Emoji } from '../../../lib/constants';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../../lib/skilling/types';
import { MinigameActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration, formatSkillRequirements } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';

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

export async function tearsOfGuthixCommand(user: KlasaUser, channelID: bigint) {
	if (user.minionIsBusy) return `${user.minionName} is busy.`;
	await user.settings.sync();
	const currentDate = new Date().getTime();
	const lastPlayedDate = user.settings.get(UserSettings.LastTearsOfGuthixTimestamp);
	const difference = currentDate - lastPlayedDate;

	// If they have already claimed a ToG in the past 7days
	if (difference < Time.Day * 7) {
		const duration = formatDuration(Date.now() - (lastPlayedDate + Time.Day * 7));
		return `**${Emoji.Snake} Juna says...** You can drink from the Tears of Guthix in ${duration}.`;
	}

	// 43 QP for the quest
	const userQP = user.settings.get(UserSettings.QP);
	if (userQP < 43) {
		return `**${Emoji.Snake} Juna says...** You can drink from the Tears of Guthix when you have 43+ QP.`;
	}

	let missingIronmanSkills = false;
	// Extra requirements if Ironman
	if (user.isIronman) {
		let skillsMatch = 0;
		Object.entries(ironmanExtraReqs).forEach(([skill, level]) => {
			if (user.skillLevel(skill as SkillsEnum) >= level) skillsMatch += 1;
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
	if (!user.hasSkillReqs(skillReqs)[0]) {
		const missingSkillsMessage = objectEntries(skillReqs)
			.map(s => {
				return user.skillLevel(s[0]) < s[1] ? formatSkillRequirements({ [s[0]]: s[1] }, true) : undefined;
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

	await addSubTaskToActivityTask<MinigameActivityTaskOptions>({
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
