import { calcWhatPercent, formatDuration, reduceNumByPercent, Time } from '@oldschoolgg/toolkit';

import { QuestID, quests } from '@/lib/minions/data/quests.js';
import type { DoomOfMokhaiotlOptions } from '@/lib/types/minions.js';
import { formatTripDuration } from '@/lib/util/minionUtils.js';
import { formatSkillRequirements } from '@/lib/util/smallUtils.js';

const doomQuestRequirements = [
	QuestID.ChildrenOfTheSun,
	QuestID.TwilightsPromise,
	QuestID.TheHeartOfDarkness,
	QuestID.TheFinalDawn
];

const doomSkillRequirements = {
	attack: 80,
	strength: 80,
	defence: 80,
	ranged: 80,
	magic: 80,
	hitpoints: 80,
	prayer: 70,
	agility: 70
};

function missingQuestNames(user: MUser) {
	return doomQuestRequirements
		.filter(questID => !user.user.finished_quest_ids.includes(questID))
		.map(questID => quests.find(quest => quest.id === questID)?.name ?? questID.toString());
}

function doomProficiency(kc: number) {
	return Math.min(1, 1 - Math.exp(-kc / 31));
}

function calcDoomRunTime(user: MUser, delveLevel: number, kc: number, rng: RNGProvider) {
	const boosts: string[] = [];
	let runTime = Time.Minute * (2.5 + delveLevel * 1.5);

	const combatStats = ['attack', 'strength', 'defence', 'ranged', 'magic', 'hitpoints', 'prayer'] as const;
	const combatPercent = calcWhatPercent(
		combatStats.reduce((sum, skill) => sum + Math.min(99, user.skillsAsLevels[skill]), 0),
		combatStats.length * 99
	);
	const statBoost = Math.max(0, Math.min(12.5, combatPercent / 8));
	if (statBoost > 0) {
		runTime = reduceNumByPercent(runTime, statBoost);
		boosts.push(`${statBoost.toFixed(2)}% for combat stats`);
	}

	const proficiencyBoost = doomProficiency(kc) * 15;
	if (proficiencyBoost >= 1) {
		runTime = reduceNumByPercent(runTime, proficiencyBoost);
		boosts.push(`${proficiencyBoost.toFixed(2)}% for Doom KC proficiency`);
	}

	if (user.skillsAsLevels.agility >= 83) {
		runTime = reduceNumByPercent(runTime, 6);
		boosts.push('6% for 83 Agility');
	} else if (user.skillsAsLevels.agility >= 73) {
		runTime = reduceNumByPercent(runTime, 3);
		boosts.push('3% for 73 Agility');
	}

	return {
		runTime: rng.randomVariation(runTime, 5),
		boosts
	};
}

export async function doomOfMokhaiotlCommand(
	rng: RNGProvider,
	user: MUser,
	channelId: string,
	delveLevel: number,
	quantity?: number
) {
	if (await user.minionIsBusy()) return `${user.minionName} is busy.`;
	if (delveLevel < 1 || delveLevel > 8) return 'Delve level must be between 1 and 8.';

	const missingQuests = missingQuestNames(user);
	if (missingQuests.length > 0) {
		return `You need to complete these quests before doing Doom of Mokhaiotl: ${missingQuests.join(', ')}.`;
	}

	if (!user.hasSkillReqs(doomSkillRequirements)) {
		return `You need these stats to do Doom of Mokhaiotl: ${formatSkillRequirements(doomSkillRequirements)}.`;
	}

	const kc = await user.getKC(14_707);
	const { runTime, boosts } = calcDoomRunTime(user, delveLevel, kc, rng);
	const maxTripLength = await user.calcMaxTripLength('DoomOfMokhaiotl');
	const maxQuantity = Math.max(1, Math.floor(maxTripLength / runTime));
	quantity = quantity ?? maxQuantity;
	if (quantity < 1) return 'Quantity must be at least 1.';
	if (quantity > maxQuantity) {
		return `${user.minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}. The highest amount of delve ${delveLevel} Doom of Mokhaiotl runs you can do is ${maxQuantity}.`;
	}

	const duration = quantity * runTime;
	await ActivityManager.startTrip<DoomOfMokhaiotlOptions>({
		userID: user.id,
		channelId,
		quantity,
		duration,
		type: 'DoomOfMokhaiotl',
		delveLevel: delveLevel as DoomOfMokhaiotlOptions['delveLevel']
	});

	const boostsStr = boosts.length > 0 ? `\n\n**Boosts:** ${boosts.join(', ')}.` : '';
	return `${user.minionName} is now doing ${quantity}x Doom of Mokhaiotl delve run${
		quantity === 1 ? '' : 's'
	} to delve ${delveLevel}. The trip will return in about ${formatTripDuration(
		user,
		duration
	)} (${formatDuration(runTime)} per run).${boostsStr}`;
}
