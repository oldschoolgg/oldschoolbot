import { formatDuration } from '@oldschoolgg/toolkit';
import { Time, objectEntries } from 'e';
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
].map(smc => ({ name: smc, value: smc }));

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
	main_collect: string,
	secondary_collect: string
) {
	if (minionIsBusy(user.id)) return `${user.minionName} is busy.`;

	// Ensure inputs are defined and valid
	if (!main_collect || !secondary_collect) {
		return 'Both main and secondary collection areas must be specified.';
	}

	const main = main_collect.toLowerCase();
	const secondary = secondary_collect.toLowerCase();
	const validChoices = managingMicellaniaChoices.map(choice => choice.value.toLowerCase());

	if (!validChoices.includes(main) || !validChoices.includes(secondary)) {
		return 'Invalid collection areas specified.';
	}

	// Date and time calculations
	const currentDate = Date.now();
	const lastPlayedDate = Number(
		(await user.fetchStats({ last_managing_miscellania_timestamp: true })).last_managing_miscellania_timestamp
	);
	const difference = currentDate - lastPlayedDate;
	const millisecondsInADay = Time.Day;
	const daysDifference = Math.min(difference / millisecondsInADay, 100);

	if (difference < millisecondsInADay) {
		return `You can claim from the Kingdom in ${formatDuration(lastPlayedDate + millisecondsInADay - currentDate)}.`;
	}

	// Quest and skill requirements check
	if (user.QP < 61) {
		return 'You can manage the Kingdom when you have 61+ QP.';
	}

	const skills = user.skillsAsLevels;

	const missingSkills = objectEntries(skillReqs).filter(([skill, level]) => skills[skill as SkillsEnum] < level);
	const missingSkillsMessage = missingSkills
		.map(([skill, level]) => formatSkillRequirements({ [skill]: level }, true))
		.join(', ');

	const missingIronmanSkillsMessage = `As an Ironman, you also need one of the following requirements: ${formatSkillRequirements(ironmanExtraReqs, true)}`;

	if (missingSkills.length > 0) {
		const ironmanMessage = user.user.minion_ironman ? ` ${missingIronmanSkillsMessage}` : '';
		return `You are not skilled enough to manage the Kingdom. You need the following requirements: ${missingSkillsMessage}.${ironmanMessage}`;
	}

	if (user.user.minion_ironman && !hasSkillReqs(user, ironmanExtraReqs)[0]) {
		return `You are not skilled enough to manage the Kingdom. ${missingIronmanSkillsMessage}`;
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

	// Ensure main and secondary are of type CollectType
	const mainPair: CollectType = main_collect as CollectType;
	const secondaryPair: CollectType = secondary_collect as CollectType;

	// Conflict Check
	const conflictString = `You are unable to assign the workers ${mainPair} and ${secondaryPair} simultaneously.`;

	if (conflictPairs[mainPair]?.includes(secondaryPair)) {
		return conflictString;
	}

	if (mainPair === secondaryPair) {
		return 'You are unable to allocate workers to the same area.';
	}
	const duration = Time.Minute * 1 + Time.Second * 5 * daysDifference;

	const daysDifferenceInteger = Math.floor(daysDifference);
	const cofferCostInteger = Math.min(daysDifferenceInteger * 7_500, 750_000);

	const cofferCost = BigInt(cofferCostInteger);

	const cofferCostNumber = Number(cofferCost);

	const userGPNumber = Number(user.GP);

	if (cofferCostNumber > userGPNumber) {
		return `You need ${cofferCostNumber.toLocaleString()} GP to collect from your kingdom.`;
	}

	const cost = new Bank().add('Coins', cofferCostNumber);

	await user.removeItemsFromBank(cost);
	await updateBankSetting('managing_miscellania_cost', cost);

	await addSubTaskToActivityTask<ManagingMiscellaniaActivityTaskOptions>({
		type: 'ManagingMiscellania',
		duration,
		main_collect,
		secondary_collect,
		userID: user.id,
		channelID: channelID.toString(),
		cofferCost: cofferCostNumber
	});

	return `${user.minionName} is now collecting from the Kingdom. Removed ${cofferCostNumber.toLocaleString()} GP. They'll come back in around ${formatDuration(duration)}`;
}
