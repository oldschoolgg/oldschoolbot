import { evalMathExpression } from '@oldschoolgg/toolkit/dist/util/expressionParser';
import type { Prisma, User, UserStats } from '@prisma/client';
import { isFunction, objectEntries, round } from 'e';
import { Bank } from 'oldschooljs';

import { globalConfig } from '../lib/constants';
import { getSimilarItems } from '../lib/data/similarItems';
import type { KillableMonster } from '../lib/minions/types';
import type { SelectedUserStats } from '../lib/MUser';
import { prisma } from '../lib/settings/prisma';
import { Rune } from '../lib/skilling/skills/runecraft';
import { hasGracefulEquipped } from '../lib/structures/Gear';
import type { ItemBank } from '../lib/types';
import { anglerBoosts, formatItemReqs, hasSkillReqs, itemNameFromID, readableStatName } from '../lib/util';
import { mahojiClientSettingsFetch, mahojiClientSettingsUpdate } from '../lib/util/clientSettings';
import resolveItems from '../lib/util/resolveItems';

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

export type SelectedUser<T extends Prisma.UserSelect> = {
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

export async function trackClientBankStats(
	key: 'clue_upgrader_loot' | 'portable_tanner_loot' | 'turaels_trials_cost_bank' | 'turaels_trials_loot_bank',
	newItems: Bank
) {
	const currentTrackedLoot = await mahojiClientSettingsFetch({ [key]: true });
	await mahojiClientSettingsUpdate({
		[key]: new Bank(currentTrackedLoot[key] as ItemBank).add(newItems).bank
	});
}

export async function userStatsUpdate<T extends Prisma.UserStatsSelect = Prisma.UserStatsSelect>(
	userID: string,
	data: Omit<Prisma.UserStatsUpdateInput, 'user_id'> | ((u: UserStats) => Prisma.UserStatsUpdateInput),
	selectKeys?: T
): Promise<SelectedUserStats<T>> {
	const id = BigInt(userID);

	let keys: object | undefined = selectKeys;
	if (!selectKeys || Object.keys(selectKeys).length === 0) {
		keys = { user_id: true };
	}

	if (isFunction(data)) {
		const userStats = await prisma.userStats.upsert({
			create: {
				user_id: id
			},
			update: {},
			where: {
				user_id: id
			}
		});

		return (await prisma.userStats.update({
			data: data(userStats),
			where: {
				user_id: id
			},
			select: keys
		})) as SelectedUserStats<T>;
	}

	await prisma.userStats.upsert({
		create: {
			user_id: id
		},
		update: {},
		where: {
			user_id: id
		},
		select: undefined
	});

	return (await prisma.userStats.update({
		data,
		where: {
			user_id: id
		},
		select: keys
	})) as SelectedUserStats<T>;
}

export async function userStatsBankUpdate(userID: string, key: keyof UserStats, bank: Bank) {
	await userStatsUpdate(
		userID,
		u => ({
			[key]: bank.clone().add(u[key] as ItemBank).bank
		}),
		{}
	);
}

export async function multipleUserStatsBankUpdate(userID: string, updates: Partial<Record<keyof UserStats, Bank>>) {
	await userStatsUpdate(
		userID,
		u => {
			let updateObj: Prisma.UserStatsUpdateInput = {};
			for (const [key, bank] of objectEntries(updates)) {
				updateObj[key] = bank!.clone().add(u[key] as ItemBank).bank;
			}
			return updateObj;
		},
		{}
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
		| 'economyStats_duelTaxBank'
		| 'gp_ic',
	amount: number
) {
	await prisma.clientStorage.update({
		where: {
			id: globalConfig.clientID
		},
		data: {
			[setting]: {
				increment: amount
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

const masterFarmerOutfit = resolveItems([
	'Master farmer hat',
	'Master farmer jacket',
	'Master farmer pants',
	'Master farmer gloves',
	'Master farmer boots'
]);

export function userHasMasterFarmerOutfit(user: MUser) {
	const allItems = user.allItemsOwned;
	for (const item of masterFarmerOutfit) {
		if (!allItems.has(item)) return false;
	}
	return true;
}

export function userHasGracefulEquipped(user: MUser) {
	const rawGear = user.gear;
	for (const i of Object.values(rawGear)) {
		if (hasGracefulEquipped(i)) return true;
	}
	return false;
}

export function anglerBoostPercent(user: MUser) {
	let amountEquipped = 0;
	let boostPercent = 0;
	for (const [id, percent] of anglerBoosts) {
		if (user.hasEquippedOrInBank(id)) {
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
	let amountEquipped = 0;
	for (const id of rogueOutfit) {
		if (user.hasEquippedOrInBank(id)) {
			amountEquipped++;
		}
	}
	return amountEquipped * 20;
}

export function hasMonsterRequirements(user: MUser, monster: KillableMonster) {
	if (monster.qpRequired && user.QP < monster.qpRequired) {
		return [
			false,
			`You need ${monster.qpRequired} QP to kill ${monster.name}. You can get Quest Points through questing with \`/activities quest\``
		];
	}

	if (monster.itemsRequired) {
		const itemsRequiredStr = formatItemReqs(monster.itemsRequired);
		for (const item of monster.itemsRequired) {
			if (Array.isArray(item)) {
				if (!item.some(itemReq => user.hasEquippedOrInBank(itemReq as number))) {
					return [false, `You need these items to kill ${monster.name}: ${itemsRequiredStr}`];
				}
			} else if (!getSimilarItems(item).some(id => user.hasEquippedOrInBank(id))) {
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
						)} stat in your ${setup} setup is ${has}, but you need atleast ${
							monster.minimumGearRequirements[setup]![unmetKey!]
						}.`
					];
				}
			}
		}
	}

	return [true];
}

export function resolveAvailableItemBoosts(user: MUser, monster: KillableMonster) {
	const boosts = new Bank();
	if (monster.itemInBankBoosts) {
		for (const boostSet of monster.itemInBankBoosts) {
			let highestBoostAmount = 0;
			let highestBoostItem = 0;

			// find the highest boost that the player has
			for (const [itemID, boostAmount] of Object.entries(boostSet)) {
				const parsedId = parseInt(itemID);
				if (!user.hasEquippedOrInBank(parsedId)) {
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
	return boosts.bank;
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

export async function addToOpenablesScores(mahojiUser: MUser, kcBank: Bank) {
	const { openable_scores: newOpenableScores } = await userStatsUpdate(
		mahojiUser.id,
		({ openable_scores }) => ({
			openable_scores: new Bank(openable_scores as ItemBank).add(kcBank).bank
		}),
		{ openable_scores: true }
	);
	return new Bank(newOpenableScores as ItemBank);
}
