import { evalMathExpression } from '@oldschoolgg/toolkit/util';
import type { Prisma, User, UserStats } from '@prisma/client';
import { isObject, objectEntries, round } from 'e';
import { Bank } from 'oldschooljs';

import type { SelectedUserStats } from '../lib/MUser';
import { globalConfig } from '../lib/constants';
import type { KillableMonster } from '../lib/minions/types';

import { bold } from 'discord.js';
import { userhasDiaryTier } from '../lib/diaries';
import { quests } from '../lib/minions/data/quests';
import type { Rune } from '../lib/skilling/skills/runecraft';
import { hasGracefulEquipped } from '../lib/structures/Gear';
import type { GearBank } from '../lib/structures/GearBank';
import type { ItemBank } from '../lib/types';
import {
	type JsonKeys,
	anglerBoosts,
	formatItemReqs,
	hasSkillReqs,
	itemNameFromID,
	readableStatName,
	resolveItems
} from '../lib/util';
import { getItemCostFromConsumables } from './lib/abstracted_commands/minionKill/handleConsumables';

export function mahojiParseNumber({
	input,
	min,
	max
}: {
	input: number | string | undefined | null;
	min?: number;
	max?: number;
}): number | null {
	if (input === undefined || input === null) return null;
	const parsed = typeof input === 'number' ? input : evalMathExpression(input);
	if (parsed === null) return null;
	if (min && parsed < min) return null;
	if (max && parsed > max) return null;
	if (Number.isNaN(parsed)) return null;
	return parsed;
}

type SelectedUser<T extends Prisma.UserSelect> = {
	[K in keyof T]: K extends keyof User ? User[K] : never;
};

export async function mahojiUsersSettingsFetch<T extends Prisma.UserSelect = Prisma.UserSelect>(
	userID: string | bigint,
	selectKeys: T
): Promise<SelectedUser<T>> {
	const id = BigInt(userID);

	return prisma.user.upsert({
		create: {
			id: id.toString()
		},
		update: {},
		where: {
			id: id.toString()
		},
		select: selectKeys
	}) as SelectedUser<T>;
}

export function patronMsg(tierNeeded: number) {
	return `You need to be a Tier ${
		tierNeeded - 1
	} Patron to use this command. You can become a patron to support the bot here: <https://www.patreon.com/oldschoolbot>`;
}

export function getMahojiBank(user: { bank: Prisma.JsonValue }) {
	return new Bank(user.bank as ItemBank);
}

export async function fetchUserStats<T extends Prisma.UserStatsSelect>(
	userID: string,
	selectKeys: T
): Promise<SelectedUserStats<T>> {
	const keysToSelect = Object.keys(selectKeys).length === 0 ? { user_id: true } : selectKeys;
	let result = await prisma.userStats.findFirst({
		where: {
			user_id: BigInt(userID)
		},
		select: keysToSelect
	});

	if (!result) {
		result = await prisma.userStats.upsert({
			where: {
				user_id: BigInt(userID)
			},
			create: {
				user_id: BigInt(userID)
			},
			update: {},
			select: keysToSelect
		});
	}

	return result as unknown as SelectedUserStats<T>;
}

export async function userStatsUpdate<T extends Prisma.UserStatsSelect = Prisma.UserStatsSelect>(
	userID: string,
	data: Omit<Prisma.UserStatsUpdateInput, 'user_id'>,
	selectKeys?: T
): Promise<SelectedUserStats<T>> {
	const id = BigInt(userID);
	let keys: object | undefined = selectKeys;
	if (!selectKeys || Object.keys(selectKeys).length === 0) {
		keys = { user_id: true };
	}

	return (await prisma.userStats.update({
		data,
		where: {
			user_id: id
		},
		select: keys
	})) as SelectedUserStats<T>;
}

export async function userStatsBankUpdate(user: MUser | string, key: JsonKeys<UserStats>, bank: Bank) {
	if (!key) throw new Error('No key provided to userStatsBankUpdate');
	const userID = typeof user === 'string' ? user : user.id;
	const stats =
		typeof user === 'string'
			? await fetchUserStats(userID, { [key]: true })
			: await user.fetchStats({ [key]: true });
	const currentItemBank = stats[key] as ItemBank;
	if (!isObject(currentItemBank)) {
		throw new Error(`Key ${key} is not an object.`);
	}
	await userStatsUpdate(
		userID,
		{
			[key]: bank.clone().add(currentItemBank).toJSON()
		},
		{ [key]: true }
	);
}

export async function updateClientGPTrackSetting(
	setting:
		| 'gp_luckypick'
		| 'gp_pickpocket'
		| 'gp_alch'
		| 'gp_slots'
		| 'gp_dice'
		| 'gp_open'
		| 'gp_daily'
		| 'gp_sell'
		| 'gp_pvm'
		| 'economyStats_duelTaxBank',
	amount: number
) {
	await prisma.clientStorage.update({
		where: {
			id: globalConfig.clientID
		},
		data: {
			[setting]: {
				increment: Math.floor(amount)
			}
		},
		select: {
			id: true
		}
	});
}
export async function updateGPTrackSetting(
	setting: 'gp_dice' | 'gp_luckypick' | 'gp_slots',
	amount: number,
	user: MUser
) {
	await userStatsUpdate(user.id, {
		[setting]: {
			increment: amount
		}
	});
}

export function userHasGracefulEquipped(user: MUser) {
	const rawGear = user.gear;
	for (const i of Object.values(rawGear)) {
		if (hasGracefulEquipped(i)) return true;
	}
	return false;
}

export function anglerBoostPercent(user: MUser) {
	const skillingSetup = user.gear.skilling;
	let amountEquipped = 0;
	let boostPercent = 0;
	for (const [id, percent] of anglerBoosts) {
		if (skillingSetup.hasEquipped([id])) {
			boostPercent += percent;
			amountEquipped++;
		}
	}
	if (amountEquipped === 4) {
		boostPercent += 0.5;
	}
	return round(boostPercent, 1);
}

const rogueOutfit = resolveItems(['Rogue mask', 'Rogue top', 'Rogue trousers', 'Rogue gloves', 'Rogue boots']);

export function rogueOutfitPercentBonus(user: MUser): number {
	const skillingSetup = user.gear.skilling;
	let amountEquipped = 0;
	for (const id of rogueOutfit) {
		if (skillingSetup.hasEquipped([id])) {
			amountEquipped++;
		}
	}
	return amountEquipped * 20;
}

export async function hasMonsterRequirements(user: MUser, monster: KillableMonster) {
	if (monster.qpRequired && user.QP < monster.qpRequired) {
		return [
			false,
			`You need ${monster.qpRequired} QP to kill ${monster.name}. You can get Quest Points through questing with \`/activities quest\``
		];
	}

	if (monster.requiredQuests) {
		const incompleteQuest = monster.requiredQuests.find(quest => !user.user.finished_quest_ids.includes(quest));
		if (incompleteQuest) {
			return [
				false,
				`You need to have completed the ${bold(
					quests.find(i => i.id === incompleteQuest)!.name
				)} quest to kill ${monster.name}.`
			];
		}
	}

	if (monster.degradeableItemUsage) {
		for (const set of monster.degradeableItemUsage) {
			const equippedInThisSet = set.items.find(item => user.gear[set.gearSetup].hasEquipped(item.itemID));

			if (set.required && !equippedInThisSet) {
				return [
					false,
					`You need one of these items equipped in your ${set.gearSetup} setup to kill ${
						monster.name
					}: ${set.items
						.map(i => i.itemID)
						.map(itemNameFromID)
						.join(', ')}.`
				];
			}
		}
	}

	if (monster.itemsRequired) {
		const itemsRequiredStr = formatItemReqs(monster.itemsRequired);
		for (const item of monster.itemsRequired) {
			if (Array.isArray(item)) {
				if (!item.some(itemReq => user.hasEquippedOrInBank(itemReq as number))) {
					return [false, `You need these items to kill ${monster.name}: ${itemsRequiredStr}`];
				}
			} else if (!user.hasEquippedOrInBank(item)) {
				return [
					false,
					`You need ${itemsRequiredStr} to kill ${monster.name}. You're missing ${itemNameFromID(item)}.`
				];
			}
		}
	}

	if (monster.levelRequirements) {
		const [hasReqs, str] = hasSkillReqs(user, monster.levelRequirements);
		if (!hasReqs) {
			return [false, `You don't meet the skill requirements to kill ${monster.name}, you need: ${str}.`];
		}
	}

	if (monster.minimumGearRequirements) {
		for (const [setup, requirements] of objectEntries(monster.minimumGearRequirements)) {
			const gear = user.gear[setup];
			if (setup && requirements) {
				const [meetsRequirements, unmetKey, has] = gear.meetsStatRequirements(requirements);
				if (!meetsRequirements) {
					return [
						false,
						`You don't have the requirements to kill ${monster.name}! Your ${readableStatName(
							unmetKey!
						)} stat in your ${setup} setup is ${has}, but you need at least ${
							monster.minimumGearRequirements[setup]?.[unmetKey!]
						}.`
					];
				}
			}
		}
	}

	if (monster.diaryRequirement) {
		const [hasDiary, _, diaryGroup] = await userhasDiaryTier(user, monster.diaryRequirement);
		if (!hasDiary) {
			return [
				false,
				`${user.minionName} is missing the ${diaryGroup.name} ${monster.diaryRequirement[1]} diary to kill ${monster.name}.`
			];
		}
	}

	if (monster.itemCost) {
		const timeToFinish = monster.timeToFinish;
		const consumablesCost = getItemCostFromConsumables({
			consumableCosts: Array.isArray(monster.itemCost) ? monster.itemCost : [monster.itemCost],
			gearBank: user.gearBank,
			inputQuantity: 1,
			timeToFinish,
			maxTripLength: timeToFinish * 1.5,
			slayerKillsRemaining: null
		});
		if (consumablesCost.itemCost && !user.bank.has(consumablesCost.itemCost)) {
			const items = Array.isArray(monster.itemCost) ? monster.itemCost : [monster.itemCost];
			const messages: string[] = [];
			for (const group of items) {
				if (group.optional) continue;
				if (user.owns(group.itemCost)) {
					continue;
				}
				if (group.alternativeConsumables?.some(alt => user.owns(alt.itemCost))) {
					continue;
				}
				messages.push(
					`This monster requires: ${group.itemCost.items().map(i => i[0].name)}${
						group.alternativeConsumables
							? `, OR ${group.alternativeConsumables?.map(alt => alt.itemCost.items().map(i => i[0].name)).join(', ')}`
							: '.'
					}`
				);
			}
			return [false, `You don't have the items needed to kill this monster. ${messages.join(' ')}`];
		}
	}

	return [true];
}

export function resolveAvailableItemBoosts(gearBank: GearBank, monster: KillableMonster, isInWilderness = false): Bank {
	const boosts = new Bank();
	if (monster.itemInBankBoosts) {
		for (const boostSet of monster.itemInBankBoosts) {
			let highestBoostAmount = 0;
			let highestBoostItem = 0;

			// find the highest boost that the player has
			for (const [itemID, boostAmount] of Object.entries(boostSet)) {
				const parsedId = Number.parseInt(itemID);
				if (!gearBank.wildyGearCheck(parsedId, isInWilderness)) {
					continue;
				}
				if (boostAmount > highestBoostAmount) {
					highestBoostAmount = boostAmount;
					highestBoostItem = parsedId;
				}
			}

			if (highestBoostAmount && highestBoostItem) {
				boosts.add(highestBoostItem, highestBoostAmount);
			}
		}
	}
	return boosts;
}

export function calcMaxRCQuantity(rune: Rune, user: MUser) {
	const level = user.skillLevel('runecraft');
	for (let i = rune.levels.length; i > 0; i--) {
		const [levelReq, qty] = rune.levels[i - 1];
		if (level >= levelReq) return qty;
	}

	return 0;
}

export async function addToGPTaxBalance(userID: string | string, amount: number) {
	await Promise.all([
		prisma.clientStorage.update({
			where: {
				id: globalConfig.clientID
			},
			data: {
				gp_tax_balance: {
					increment: amount
				}
			},
			select: {
				id: true
			}
		}),
		userStatsUpdate(
			userID,
			{
				total_gp_traded: {
					increment: amount
				}
			},
			{}
		)
	]);
}

export async function addToOpenablesScores(user: MUser, kcBank: Bank) {
	const stats = await user.fetchStats({ openable_scores: true });
	const { openable_scores: newOpenableScores } = await userStatsUpdate(
		user.id,
		{
			openable_scores: new Bank(stats.openable_scores as ItemBank).add(kcBank).toJSON()
		},
		{ openable_scores: true }
	);
	return new Bank(newOpenableScores as ItemBank);
}
