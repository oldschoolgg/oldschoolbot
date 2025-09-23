import { Time, reduceNumByPercent } from '@oldschoolgg/toolkit';
import { formatDuration, stringMatches, toTitleCase } from '@oldschoolgg/toolkit/util';
import type { ChatInputCommandInteraction } from 'discord.js';
import { Bank, Items } from 'oldschooljs';

import { WesternProv, userhasDiaryTier } from '@/lib/diaries.js';
import type { SkillsEnum } from '@/lib/skilling/types.js';
import type { MinigameActivityTaskOptionsWithNoChanges } from '@/lib/types/minions.js';
import addSubTaskToActivityTask from '@/lib/util/addSubTaskToActivityTask.js';
import { calcMaxTripLength } from '@/lib/util/calcMaxTripLength.js';
import { handleMahojiConfirmation } from '@/lib/util/handleMahojiConfirmation.js';
import { hasSkillReqs } from '@/lib/util/smallUtils.js';
import { userStatsUpdate } from '@/mahoji/mahojiSettings.js';

const itemBoosts = [
	[Items.resolveFullItems(['Abyssal whip', 'Abyssal tentacle']), 12],
	[Items.resolveFullItems(['Barrows gloves', 'Ferocious gloves']), 4],
	[
		Items.resolveFullItems([
			'Amulet of fury',
			'Amulet of torture',
			'Amulet of fury (or)',
			'Amulet of torture (or)'
		]),
		5
	],
	[Items.resolveFullItems(['Fire cape', 'Infernal cape', 'Fire max cape', 'Infernal max cape']), 6],
	[Items.resolveFullItems(['Dragon claws']), 5]
] as const;

export function getBoatType(user: MUser, cbLevel: number) {
	let type: 'veteran' | 'intermediate' | 'novice' = 'intermediate';
	let pointsPerGame = 1;

	if (cbLevel >= 100) {
		type = 'veteran';
		pointsPerGame = 5;
	} else if (cbLevel >= 70) {
		type = 'intermediate';
		pointsPerGame = 4;
	} else {
		type = 'novice';
		pointsPerGame = 3;
	}

	let bonusPointsPerGame = 0;

	if (user.hasCompletedCATier('hard')) {
		bonusPointsPerGame += 1;
	}

	if (user.hasCompletedCATier('medium')) {
		bonusPointsPerGame += 1;
	}
	if (user.hasCompletedCATier('easy')) {
		bonusPointsPerGame += 1;
	}

	return {
		boatType: type,
		pointsPerGame: pointsPerGame + bonusPointsPerGame,
		bonusPointsPerGame
	};
}

const baseStats = {
	attack: 42,
	strength: 42,
	defence: 42,
	hitpoints: 42,
	ranged: 42,
	magic: 42,
	prayer: 22
};

export const pestControlBuyables = [
	{
		item: Items.getOrThrow('Void knight mace'),
		cost: 250,
		requiredStats: baseStats
	},
	{
		item: Items.getOrThrow('Void knight top'),
		cost: 250,
		requiredStats: baseStats
	},
	{
		item: Items.getOrThrow('Void knight robe'),
		cost: 250,
		requiredStats: baseStats
	},
	{
		item: Items.getOrThrow('Void knight gloves'),
		cost: 150,
		requiredStats: baseStats
	},
	{
		item: Items.getOrThrow('Void melee helm'),
		cost: 200,
		requiredStats: baseStats
	},
	{
		item: Items.getOrThrow('Void mage helm'),
		cost: 200,
		requiredStats: baseStats
	},
	{
		item: Items.getOrThrow('Void ranger helm'),
		cost: 200,
		requiredStats: baseStats
	},
	{
		item: Items.getOrThrow('Void seal(8)'),
		cost: 10,
		requiredStats: baseStats
	},
	{
		item: Items.getOrThrow('Elite void robe'),
		cost: 200,
		inputItem: Items.getOrThrow('Void knight robe'),
		requiredStats: baseStats
	},
	{
		item: Items.getOrThrow('Elite void top'),
		cost: 200,
		inputItem: Items.getOrThrow('Void knight top'),
		requiredStats: baseStats
	}
];

const xpMultiplier = {
	prayer: 18,
	magic: 32,
	ranged: 32,
	attack: 35,
	strength: 35,
	defence: 35,
	hitpoints: 35
};

export async function pestControlBuyCommand(user: MUser, input: string) {
	if (typeof input !== 'string') input = '';
	const buyable = pestControlBuyables.find(i => stringMatches(input, i.item.name));
	if (!buyable) {
		return `Here are the items you can buy: \n\n${pestControlBuyables
			.map(i => `**${i.item.name}:** ${i.cost} points`)
			.join('\n')}.`;
	}

	const { item, cost } = buyable;
	const { pest_control_points: balance } = await user.fetchStats({ pest_control_points: true });
	if (balance < cost) {
		return `You don't have enough Void knight commendation points to buy the ${item.name}. You need ${cost}, but you have only ${balance}.`;
	}

	const [hasReqs, str] = hasSkillReqs(user, buyable.requiredStats);
	if (!hasReqs) {
		return `You need ${str} to buy this item.`;
	}

	if (buyable.inputItem && !user.owns(buyable.inputItem.id)) {
		return `This item requires that you own a ${buyable.inputItem.name}.`;
	}

	if (buyable.inputItem) {
		const [hasDiary] = await userhasDiaryTier(user, WesternProv.hard);
		if (!hasDiary) {
			return "You can't buy this because you haven't completed the Western Provinces hard diary.";
		}
		await user.transactItems({ itemsToRemove: new Bank().add(buyable.inputItem.id) });
	}
	await userStatsUpdate(
		user.id,
		{
			pest_control_points: {
				decrement: cost
			}
		},
		{}
	);
	const loot = new Bank().add(item.id);
	await user.transactItems({ itemsToAdd: loot, collectionLog: true });

	return `Successfully purchased ${loot} for ${cost} Void knight commendation points.`;
}

export async function pestControlStartCommand(user: MUser, channelID: string) {
	if (user.minionIsBusy) return `${user.minionName} is busy.`;
	if (user.combatLevel < 40) {
		return 'You need a combat level of at least 40 to do Pest Control.';
	}

	let gameLength = Time.Minute * 2.8;
	const maxLength = calcMaxTripLength(user, 'PestControl');
	const gear = user.gear.melee;

	const boosts = [];
	for (const [items, percent] of itemBoosts) {
		for (const item of items) {
			if (gear.hasEquipped(item.name)) {
				gameLength = reduceNumByPercent(gameLength, percent);
				boosts.push(`${percent}% for ${item.name}`);
				break;
			}
		}
	}

	const quantity = Math.floor(maxLength / gameLength);

	const duration = quantity * gameLength;

	await addSubTaskToActivityTask<MinigameActivityTaskOptionsWithNoChanges>({
		userID: user.id,
		channelID: channelID.toString(),
		duration,
		type: 'PestControl',
		quantity,
		minigameID: 'pest_control'
	});

	const { boatType } = getBoatType(user, user.combatLevel);

	let str = `${
		user.minionName
	} is now doing ${quantity}x Pest Control games on the ${boatType} boat. The trip will take ${formatDuration(
		duration
	)}.`;

	if (boosts.length > 0) {
		str += `\n**Boosts:** ${boosts.join(', ')}.`;
	}

	return str;
}

export async function pestControlXPCommand(
	interaction: ChatInputCommandInteraction,
	user: MUser,
	skillName: string,
	amount: number
) {
	if (!Object.keys(xpMultiplier).includes(skillName)) {
		return "That's not a valid skill to buy XP for.";
	}
	if (!amount || amount < 1) {
		return "That's not a valid amount of points to spend.}";
	}

	const level = user.skillLevel(skillName as SkillsEnum);
	if (level < 25) {
		return 'You need at least level 25 to buy XP from Pest Control.';
	}
	const xpPerPoint = Math.floor(Math.pow(level, 2) / 600) * xpMultiplier[skillName as keyof typeof xpMultiplier];

	const { pest_control_points: balance } = await user.fetchStats({ pest_control_points: true });
	if (balance < amount) {
		return `You cannot afford this, because you have only ${balance} points.`;
	}
	await handleMahojiConfirmation(
		interaction,
		`Are you sure you want to spend ${amount} points on ${xpPerPoint * amount} ${toTitleCase(skillName)} XP?`
	);
	await userStatsUpdate(
		user.id,
		{
			pest_control_points: {
				decrement: amount
			}
		},
		{}
	);
	const xpRes = await user.addXP({
		skillName: skillName as SkillsEnum,
		amount: xpPerPoint * amount,
		duration: undefined,
		minimal: false,
		artificial: true
	});

	return `You spent ${amount} points (${xpPerPoint} ${toTitleCase(skillName)} XP per point).
${xpRes}`;
}

export async function pestControlStatsCommand(user: MUser) {
	const [kc, stats] = await Promise.all([
		user.fetchMinigameScore('pest_control'),
		user.fetchStats({ pest_control_points: true })
	]);
	return `You have ${stats.pest_control_points} Void knight commendation points.
You have completed ${kc} games of Pest Control.`;
}
