import { formatDuration } from '@oldschoolgg/toolkit';
import { Time, notEmpty, objectEntries } from 'e';
import { Bank } from 'oldschooljs';
import { SkillsEnum } from '../../../lib/skilling/types';
import type { ManagingMiscellaniaActivityTaskOptions } from '../../../lib/types/minions';
import { formatSkillRequirements, hasSkillReqs } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { minionIsBusy } from '../../../lib/util/minionIsBusy';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';

export const managingMicellaniaChoices = [
	'Herbs',
	'Flax',
	'Wood',
	'Mining',
	'Fishing',
	'Cooked Fish',
	'Mahogany',
	'Teak',
	'Hardwood (Mahogany and Teak)',
	'Farm'
].map(smc => {
	return { name: smc, value: smc };
});

const skillReqs = {
	[SkillsEnum.Agility]: 40,
	[SkillsEnum.Slayer]: 40,
	[SkillsEnum.Cooking]: 53,
	[SkillsEnum.Fishing]: 53,
	[SkillsEnum.Herblore]: 25,
	[SkillsEnum.Mining]: 50,
	[SkillsEnum.Crafting]: 31,
	[SkillsEnum.Woodcutting]: 36,
	[SkillsEnum.Farming]: 10
};
const ironmanExtraReqs = {
	[SkillsEnum.Fletching]: 25,
	[SkillsEnum.Woodcutting]: 40,
	[SkillsEnum.Crafting]: 40
};

export async function managingMiscellaniaCommand(
	user: MUser,
	channelID: string,
	main_Collect: string,
	secondary_Collect: string
) {
	if (minionIsBusy(user.id)) return `${user.minionName} is busy.`;
	const currentDate = new Date().getTime();

	const currentStats = await user.fetchStats({ last_managing_miscellania_timestamp: true });

	const lastPlayedDate = Number(currentStats.last_managing_miscellania_timestamp);
	const difference = currentDate - lastPlayedDate;

	const main = main_Collect;
	const secondary = secondary_Collect;

	// Define the number of milliseconds in a day using Time.Day
	const millisecondsInADay = Time.Day;

	// Convert the difference into days
	const daysDifference = difference / millisecondsInADay;

	// If they have already claimed a Managing Miscellania in the past day
	if (difference < millisecondsInADay) {
		const duration = formatDuration(Date.now() - (lastPlayedDate + millisecondsInADay));
		return `You can claim from the Kingdom in ${duration}.`;
	}

	// 61 QP for the quest
	const userQP = user.QP;
	if (userQP < 61) {
		return 'You can manage the Kingdom when you have 61+ QP.';
	}

	const skills = user.skillsAsLevels;
	let missingIronmanSkills = false;
	// Extra requirements if Ironman
	if (user.user.minion_ironman) {
		let skillsMatch = 0;
		for (const [skill, level] of Object.entries(ironmanExtraReqs)) {
			if (skills[skill as SkillsEnum] >= level) {
				skillsMatch += 1;
			}
		}
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

		return `You are not skilled enough to manage the Kingdom. You need the following requirements: ${missingSkillsMessage}. ${
			missingIronmanSkills ? missingIronmanSkillMessage : ''
		}`;
	} else if (missingIronmanSkills) {
		return `You are not skilled enough to manage the Kingdom. ${missingIronmanSkillMessage}`;
	}

	type CollectType = (typeof managingMicellaniaChoices)[number]['value'];

	// Conflict Pairs
	const conflictPairs: Record<CollectType, CollectType[]> = {
		Herbs: ['Flax'],
		Flax: ['Herbs'],
		Fishing: ['Cooked Fish'],
		'Cooked Fish': ['Fishing'],
		Teak: ['Mahogany', 'Hardwood (Mahogany and Teak)'],
		Mahogany: ['Teak', 'Hardwood (Mahogany and Teak)'],
		'Hardwood (Mahogany and Teak)': ['Mahogany', 'Teak'],
		Wood: [],
		Mining: [],
		Farm: []
	};

	const conflictString = `You are unable to assign the workers ${main} and ${secondary} simultaneously.`;

	// Check for conflicts
	if (conflictPairs[main]?.includes(secondary)) {
		return conflictString;
	}

	if (main === secondary) return 'You are unable to allocate workers to the same area.';

	let duration = Time.Minute * 1;

	duration += Time.Second * 5 * daysDifference;

	const cofferCost = Math.min(daysDifference * 7_500, 750_000);

	const userGP = user.GP;

	if (cofferCost > userGP) {
		return `You need ${cofferCost} GP to collect from your kingdom.`;
	}

	const cost = new Bank().add('Coins', cofferCost);

	await user.removeItemsFromBank(cost);
	await updateBankSetting('managing_miscellania_cost', cost);

	await addSubTaskToActivityTask<ManagingMiscellaniaActivityTaskOptions>({
		type: 'ManagingMiscellania',
		duration,
		main_Collect,
		secondary_Collect,
		userID: user.id,
		channelID: channelID.toString(),
		cofferCost
	});

	const str = `${user.minionName} is now collecting from the Kingdom. They'll come back in around ${formatDuration(duration)}`;

	return str;
}
