import { evalMathExpression } from '@oldschoolgg/toolkit';
import type { Prisma, User, UserStats } from '@prisma/client';
import { isObject, notEmpty, objectEntries, round } from 'e';
import { Bank } from 'oldschooljs';

import type { SelectedUserStats } from '../lib/MUser';
import { globalConfig } from '../lib/constants';
import { getSimilarItems } from '../lib/data/similarItems';
import { type GearSetupType, GearStat } from '../lib/gear';
import type { KillableMonster } from '../lib/minions/types';

import { bold } from 'discord.js';
import { userhasDiaryTier } from '../lib/diaries';
import { BSOMonsters } from '../lib/minions/data/killableMonsters/custom/customMonsters';
import { quests } from '../lib/minions/data/quests';
import type { Rune } from '../lib/skilling/skills/runecraft';
import { addStatsOfItemsTogether, hasGracefulEquipped } from '../lib/structures/Gear';
import type { GearBank } from '../lib/structures/GearBank';
import type { ItemBank } from '../lib/types';
import {
	type JsonKeys,
	anglerBoosts,
	formatItemReqs,
	hasSkillReqs,
	itemNameFromID,
	readableStatName
} from '../lib/util';
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

export type ClientBankKey = Parameters<typeof trackClientBankStats>['0'];
export async function trackClientBankStats(
	key: 'clue_upgrader_loot' | 'portable_tanner_loot' | 'turaels_trials_cost_bank' | 'turaels_trials_loot_bank',
	newItems: Bank
) {
	const currentTrackedLoot = await mahojiClientSettingsFetch({ [key]: true });
	await mahojiClientSettingsUpdate({
		[key]: new Bank(currentTrackedLoot[key] as ItemBank).add(newItems).toJSON()
	});
}

export async function fetchUserStats<T extends Prisma.UserStatsSelect>(
	userID: string,
	selectKeys: T
): Promise<SelectedUserStats<T>> {
	const keysToSelect = Object.keys(selectKeys).length === 0 ? { user_id: true } : selectKeys;
	const result = await prisma.userStats.upsert({
		where: {
			user_id: BigInt(userID)
		},
		create: {
			user_id: BigInt(userID)
		},
		update: {},
		select: keysToSelect
	});

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
	await prisma.userStats.upsert({
		create: {
			user_id: id
		},
		update: {},
		where: {
			user_id: id
		},
		select: keys
	});

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
			return `You need to have completed the ${bold(
				quests.find(i => i.id === incompleteQuest)!.name
			)} quest to kill ${monster.name}.`;
		}
	}

	if (monster.degradeableItemUsage) {
		for (const set of monster.degradeableItemUsage) {
			const equippedInThisSet = set.items.find(item => user.gear[set.gearSetup].hasEquipped(item.itemID));

			if (set.required && !equippedInThisSet) {
				return `You need one of these items equipped in your ${set.gearSetup} setup to kill ${
					monster.name
				}: ${set.items
					.map(i => i.itemID)
					.map(itemNameFromID)
					.join(', ')}.`;
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
				if (setup === 'wildy' && user.gear.wildy.hasEquipped('Hellfire bow')) {
					const attackOverrides = [
						GearStat.AttackSlash,
						GearStat.AttackCrush,
						GearStat.AttackStab,
						GearStat.MeleeStrength,
						GearStat.AttackMagic,
						GearStat.MagicDamage
					];
					for (const override of attackOverrides) {
						delete requirements[override];
					}
				}
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
			return `${user.minionName} is missing the ${diaryGroup.name} ${monster.diaryRequirement[1]} diary to kill ${monster.name}.`;
		}
	}

	if (monster.itemCost) {
		const cost = new Bank(monster.itemCost.itemCost);
		if (!user.bank.has(cost)) {
			return [false, `You don't have the items needed to kill this monster. You need: ${cost}.`];
		}
	}

	const monsterScores = await user.fetchMonsterScores();

	if (monster.kcRequirements) {
		for (const [key, val] of Object.entries(monster.kcRequirements)) {
			const { id } = BSOMonsters[key as keyof typeof BSOMonsters];

			const kc = monsterScores[id] ?? 0;

			if (kc < val) {
				return `You need at least ${val} ${key} KC to kill ${monster.name}, you have ${kc}.`;
			}
		}
	}

	if (monster.minimumWeaponShieldStats) {
		for (const [setup, minimum] of Object.entries(monster.minimumWeaponShieldStats)) {
			const gear = user.gear[setup as GearSetupType];
			const stats = addStatsOfItemsTogether(
				[gear['2h']?.item, gear.weapon?.item, gear.shield?.item].filter(notEmpty)
			);

			for (const [key, requiredValue] of Object.entries(minimum)) {
				if (requiredValue < 1) continue;
				const theirValue = stats[key as GearStat] ?? 0;
				if (theirValue < requiredValue) {
					return `Your ${setup} weapons/shield need to have at least ${requiredValue} ${readableStatName(
						key
					)} to kill ${monster.name}, you have ${theirValue}.`;
				}
			}
		}
	}

	if (monster.customRequirement && monsterScores[monster.id] === 0) {
		const reasonDoesntHaveReq = await monster.customRequirement(user);
		if (reasonDoesntHaveReq) {
			return `You don't meet the requirements to kill this monster: ${reasonDoesntHaveReq}.`;
		}
	}

	if (monster.requiredBitfield && !user.bitfield.includes(monster.requiredBitfield)) {
		return "You haven't unlocked this monster.";
	}

	const rangeAmmo = user.gear.range.ammo?.item;
	if (
		monster.projectileUsage?.requiredAmmo &&
		(!rangeAmmo || !monster.projectileUsage?.requiredAmmo.includes(rangeAmmo))
	) {
		return `You need to be using one of these projectiles to fight ${
			monster.name
		}: ${monster.projectileUsage.requiredAmmo.map(itemNameFromID).join(', ')}.`;
	}

	return [true];
}

export function resolveAvailableItemBoosts(
	gearBank: GearBank,
	monster: KillableMonster,
	_isInWilderness = false
): Bank {
	const boosts = new Bank();
	if (monster.itemInBankBoosts) {
		for (const boostSet of monster.itemInBankBoosts) {
			let highestBoostAmount = 0;
			let highestBoostItem = 0;

			// find the highest boost that the player has
			for (const [itemID, boostAmount] of Object.entries(boostSet)) {
				const parsedId = Number.parseInt(itemID);
				if (!gearBank.hasEquippedOrInBank(parsedId)) {
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
