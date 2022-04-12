import { User } from '@prisma/client';
import { reduceNumByPercent, Time } from 'e';
import { KlasaUser } from 'klasa';
import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';
import { Bank } from 'oldschooljs';

import { client } from '../../..';
import { userhasDiaryTier, WesternProv } from '../../../lib/diaries';
import { getMinigameScore } from '../../../lib/settings/settings';
import { SkillsEnum } from '../../../lib/skilling/types';
import { MinigameActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration, stringMatches, toTitleCase } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import getOSItem from '../../../lib/util/getOSItem';
import { handleMahojiConfirmation, mahojiUserSettingsUpdate } from '../../mahojiSettings';

let itemBoosts = [
	[['Abyssal whip', 'Abyssal tentacle'].map(getOSItem), 12],
	[['Barrows gloves', 'Ferocious gloves'].map(getOSItem), 4],
	[['Amulet of fury', 'Amulet of torture', 'Amulet of fury (or)', 'Amulet of torture (or)'].map(getOSItem), 5],
	[['Fire cape', 'Infernal cape', 'Fire max cape', 'Infernal max cape'].map(getOSItem), 6],
	[['Dragon claws'].map(getOSItem), 5]
] as const;

export type PestControlBoat = ['veteran' | 'intermediate' | 'novice', 3 | 4 | 5];

export function getBoatType(cbLevel: number): PestControlBoat {
	if (cbLevel >= 100) return ['veteran', 5];
	if (cbLevel >= 70) return ['intermediate', 4];
	return ['novice', 3];
}

let baseStats = {
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
		item: getOSItem('Void knight mace'),
		cost: 250,
		requiredStats: baseStats
	},
	{
		item: getOSItem('Void knight top'),
		cost: 250,
		requiredStats: baseStats
	},
	{
		item: getOSItem('Void knight robe'),
		cost: 250,
		requiredStats: baseStats
	},
	{
		item: getOSItem('Void knight gloves'),
		cost: 150,
		requiredStats: baseStats
	},
	{
		item: getOSItem('Void melee helm'),
		cost: 200,
		requiredStats: baseStats
	},
	{
		item: getOSItem('Void mage helm'),
		cost: 200,
		requiredStats: baseStats
	},
	{
		item: getOSItem('Void ranger helm'),
		cost: 200,
		requiredStats: baseStats
	},
	{
		item: getOSItem('Void seal(8)'),
		cost: 10,
		requiredStats: baseStats
	},
	{
		item: getOSItem('Elite void robe'),
		cost: 200,
		inputItem: getOSItem('Void knight robe'),
		requiredStats: baseStats
	},
	{
		item: getOSItem('Elite void top'),
		cost: 200,
		inputItem: getOSItem('Void knight top'),
		requiredStats: baseStats
	}
];

let xpMultiplier = {
	prayer: 18,
	magic: 32,
	ranged: 32,
	attack: 35,
	strength: 35,
	defence: 35,
	hitpoints: 35
};

export async function pestControlBuyCommand(klasaUser: KlasaUser, user: User, input: string) {
	if (typeof input !== 'string') input = '';
	const buyable = pestControlBuyables.find(i => stringMatches(input, i.item.name));
	if (!buyable) {
		return `Here are the items you can buy: \n\n${pestControlBuyables
			.map(i => `**${i.item.name}:** ${i.cost} points`)
			.join('\n')}.`;
	}

	const { item, cost } = buyable;
	const balance = user.pest_control_points;
	if (balance < cost) {
		return `You don't have enough Void knight commendation points to buy the ${item.name}. You need ${cost}, but you have only ${balance}.`;
	}

	let [hasReqs, str] = klasaUser.hasSkillReqs(buyable.requiredStats);
	if (!hasReqs) {
		return `You need ${str} to buy this item.`;
	}

	if (buyable.inputItem && !klasaUser.owns(buyable.inputItem.id)) {
		return `This item requires that you own a ${buyable.inputItem.name}.`;
	}

	if (buyable.inputItem) {
		const [hasDiary] = await userhasDiaryTier(klasaUser, WesternProv.hard);
		if (!hasDiary) {
			return "You can't buy this because you haven't completed the Western Provinces hard diary.";
		}
		await klasaUser.removeItemsFromBank(new Bank().add(buyable.inputItem.id));
	}
	await mahojiUserSettingsUpdate(client, user.id, {
		pest_control_points: {
			decrement: cost
		}
	});

	await klasaUser.addItemsToBank({ items: { [item.id]: 1 }, collectionLog: true });

	return `Successfully purchased 1x ${item.name} for ${cost} Void knight commendation points.`;
}

export async function pestControlStartCommand(klasaUser: KlasaUser, channelID: bigint) {
	if (klasaUser.minionIsBusy) return `${klasaUser.minionName} is busy.`;
	const { combatLevel } = klasaUser;
	if (combatLevel < 40) {
		return 'You need a combat level of at least 40 to do Pest Control.';
	}

	let gameLength = Time.Minute * 2.8;
	const maxLength = klasaUser.maxTripLength('PestControl');

	let boosts = [];
	const gear = klasaUser.getGear('melee');
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

	let duration = quantity * gameLength;

	await addSubTaskToActivityTask<MinigameActivityTaskOptions>({
		userID: klasaUser.id,
		channelID: channelID.toString(),
		duration,
		type: 'PestControl',
		quantity,
		minigameID: 'pest_control'
	});

	let [boat] = getBoatType(combatLevel);

	let str = `${
		klasaUser.minionName
	} is now doing ${quantity}x Pest Control games on the ${boat} boat. The trip will take ${formatDuration(
		duration
	)}.`;

	if (boosts.length > 0) {
		str += `\n**Boosts:** ${boosts.join(', ')}.`;
	}

	return str;
}

export async function pestControlXPCommand(
	interaction: SlashCommandInteraction,
	klasaUser: KlasaUser,
	user: User,
	skillName: string,
	amount: number
) {
	if (!Object.keys(xpMultiplier).includes(skillName)) {
		return "That's not a valid skill to buy XP for.";
	}
	if (!amount || amount < 1) {
		return "That's not a valid amount of points to spend.}";
	}

	const level = klasaUser.skillLevel(skillName as SkillsEnum);
	if (level < 25) {
		return 'You need at least level 25 to buy XP from Pest Control.';
	}
	const xpPerPoint = Math.floor(Math.pow(level, 2) / 600) * xpMultiplier[skillName as keyof typeof xpMultiplier];

	const balance = user.pest_control_points;
	if (balance < amount) {
		return `You cannot afford this, because you have only ${balance} points.`;
	}
	await handleMahojiConfirmation(
		interaction,
		`Are you sure you want to spend ${amount} points on ${xpPerPoint * amount} ${toTitleCase(skillName)} XP?`
	);
	await mahojiUserSettingsUpdate(client, user.id, {
		pest_control_points: {
			decrement: amount
		}
	});
	const xpRes = await klasaUser.addXP({
		skillName: skillName as SkillsEnum,
		amount: xpPerPoint * amount,
		duration: undefined,
		minimal: false,
		artificial: true
	});

	return `You spent ${amount} points (${xpPerPoint} ${toTitleCase(skillName)} XP per point).
${xpRes}`;
}

export async function pestControlStatsCommand(user: User) {
	const kc = await getMinigameScore(user.id, 'pest_control');
	return `You have ${user.pest_control_points} Void knight commendation points.
You have completed ${kc} games of Pest Control.`;
}
