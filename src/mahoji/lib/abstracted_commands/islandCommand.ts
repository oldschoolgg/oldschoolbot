import {
	ASSIGNMENT_BOOST,
	ASSIGNMENT_PENALTY,
	ASSIGNMENT_TRIP_COSTS,
	ASSIGNMENT_TRIP_ITEM,
	type AssignableCategory,
	calculateAccumulatedYields,
	defaultIslandContributions,
	defaultIslandUpgrades,
	defaultLastCollected,
	defaultMaintenanceTimestamps,
	formatDuration,
	getActiveAssignment,
	getTier,
	getUpgradeCost,
	type IslandLastCollected,
	type IslandMaintenanceTimestamps,
	type IslandUpgradeContributions,
	type IslandUpgradeTiers,
	isCategoryMaintained,
	PASSIVE_ACCUM_CAP_MS,
	SKILL_CATEGORIES,
	type SkillCategory,
	type UpgradeCategory,
	upgradeCategoryMeta,
	upgradeDefinitions
} from '@/lib/bso/commands/islandUpgrades.js';

import { Bank, type ItemBank } from 'oldschooljs';

import type { Prisma } from '@/prisma/main.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';

type IslandUpgradesJson = IslandUpgradeTiers & {
	contributions?: IslandUpgradeContributions;
	maintenance?: IslandMaintenanceTimestamps;
	assignment?: AssignableCategory | null;
	lastCollected?: IslandLastCollected;
	lifetimeCollected?: ItemBank;
	maintenanceSpent?: ItemBank;
};

export function readState(user: { user: { island_upgrades: unknown } }): {
	upgrades: IslandUpgradeTiers;
	contributions: IslandUpgradeContributions;
	maintenance: IslandMaintenanceTimestamps;
	assignment: AssignableCategory | null;
	lastCollected: IslandLastCollected;
	lifetimeCollected: ItemBank;
	maintenanceSpent: ItemBank;
} {
	const raw = (user.user.island_upgrades ?? {}) as IslandUpgradesJson;
	const { contributions, maintenance, assignment, lastCollected, lifetimeCollected, maintenanceSpent, ...tiers } =
		raw;
	return {
		upgrades: { ...defaultIslandUpgrades, ...tiers },
		contributions: { ...defaultIslandContributions, ...(contributions ?? {}) },
		maintenance: { ...defaultMaintenanceTimestamps, ...(maintenance ?? {}) },
		assignment: assignment ?? null,
		lastCollected: { ...defaultLastCollected, ...(lastCollected ?? {}) },
		lifetimeCollected: lifetimeCollected ?? {},
		maintenanceSpent: maintenanceSpent ?? {}
	};
}

export function hasCampsReadyToCollect(user: MUser, now: number = Date.now()): boolean {
	const { upgrades, maintenance, assignment, lastCollected } = readState(user);
	const activeAssignment = getActiveAssignment(assignment, maintenance, now);

	for (const category of SKILL_CATEGORIES) {
		const tier = getTier(upgrades, category);
		if (tier === 0) continue;
		if (!isCategoryMaintained(maintenance, category, now)) continue;

		const skillLevel = user.skillLevel(category);
		const lastAt = lastCollected[category];
		const mult = accumulationMultiplier(category, activeAssignment);
		const yields = calculateAccumulatedYields(category, tier, skillLevel, lastAt, now, mult, user.id);
		if (yields.length > 0) return true;
	}
	return false;
}

export function calculateLifetimeSpent(user: MUser): Bank {
	const { upgrades, contributions, maintenanceSpent } = readState(user);
	const totalSpent = new Bank(maintenanceSpent);

	for (const [category, tier] of Object.entries(upgrades)) {
		const cat = category as UpgradeCategory;
		const catTiers = upgradeDefinitions[cat] ?? [];
		for (let i = 0; i < tier && i < catTiers.length; i++) {
			const tierCost = getUpgradeCost(catTiers[i], user.isIronman);
			totalSpent.add(tierCost);
		}
	}

	for (const contribMap of Object.values(contributions)) {
		for (const [itemId, qty] of Object.entries(contribMap)) {
			totalSpent.add(Number(itemId), qty);
		}
	}

	return totalSpent;
}

export async function viewLifetimeSpentIsland(user: MUser): Promise<SendableMessage> {
	const bank = calculateLifetimeSpent(user);

	if (bank.length === 0) {
		return 'You have not spent any materials on island maintenance or upgrades yet.';
	}

	const image = await makeBankImage({
		bank,
		title: 'Lifetime Island Upgrades & Maintenance Spent',
		user
	});

	return {
		content:
			"## Lifetime Island Materials Spent\n\nTotal materials spent on facility upgrades and maintenance over your minion's lifetime:",
		files: [image]
	};
}

export async function viewLifetimeCollectedCamps(user: MUser): Promise<SendableMessage> {
	const { lifetimeCollected } = readState(user);
	const bank = new Bank(lifetimeCollected);

	if (bank.length === 0) {
		return 'You have not collected any materials from your island gathering camps yet.';
	}

	const image = await makeBankImage({
		bank,
		title: 'Lifetime Camp Collections',
		user
	});

	return {
		content:
			"## Lifetime Camp Collections\n\nTotal materials collected from all island gathering camps over your minion's lifetime:",
		files: [image]
	};
}

export async function collectAllIslandCamps(user: MUser): Promise<SendableMessage> {
	const now = Date.now();
	const {
		upgrades: currentUpgrades,
		contributions: currentContributions,
		maintenance: currentMaintenance,
		assignment: storedAssignment,
		lastCollected: currentLastCollected,
		lifetimeCollected: currentLifetimeCollected
	} = readState(user);

	const activeAssignment = getActiveAssignment(storedAssignment, currentMaintenance, now);

	const totalCollectBank = new Bank();
	const totalTripCostBank = new Bank();
	const collectedCategories: SkillCategory[] = [];
	const updatedLastCollected: IslandLastCollected = { ...currentLastCollected };

	for (const category of SKILL_CATEGORIES) {
		const tier = getTier(currentUpgrades, category);
		if (tier === 0) continue;
		if (!isCategoryMaintained(currentMaintenance, category, now)) continue;

		const skillLevel = user.skillLevel(category);
		const lastAt = currentLastCollected[category];
		const mult = accumulationMultiplier(category, activeAssignment);
		const yields = calculateAccumulatedYields(category, tier, skillLevel, lastAt, now, mult, user.id);
		if (yields.length === 0) continue;

		const isAssigned = (activeAssignment as string) === category;
		if (isAssigned) {
			const tripCostItem = ASSIGNMENT_TRIP_ITEM[category as AssignableCategory];
			const tripCostQty = ASSIGNMENT_TRIP_COSTS[category as AssignableCategory];
			const thisCost = new Bank().add(tripCostItem, tripCostQty);
			if (!userOwnsBank(user, new Bank().add(totalTripCostBank).add(thisCost))) {
				continue;
			}
			totalTripCostBank.add(thisCost);
		}

		for (const y of yields) {
			totalCollectBank.add(y.item, y.quantity);
		}
		updatedLastCollected[category] = now;
		collectedCategories.push(category);
	}

	if (totalCollectBank.length === 0) {
		return 'You have no materials ready to collect from any of your island camps.';
	}

	if (totalTripCostBank.length > 0) {
		await user.removeItemsFromBank(totalTripCostBank);
	}

	await user.addItemsToBank({ items: totalCollectBank, collectionLog: false });

	const newLifetimeCollected = new Bank(currentLifetimeCollected).add(totalCollectBank);

	await user.update({
		island_upgrades: {
			...currentUpgrades,
			contributions: currentContributions,
			maintenance: currentMaintenance,
			assignment: activeAssignment,
			lastCollected: updatedLastCollected,
			lifetimeCollected: newLifetimeCollected.toJSON()
		} as Prisma.JsonObject
	});

	const image = await makeBankImage({
		bank: totalCollectBank,
		title: 'Collected from All Island Camps',
		user
	});

	const timeLines = collectedCategories
		.map(c => {
			const timeAccumulated = Math.min(now - currentLastCollected[c], PASSIVE_ACCUM_CAP_MS);
			return `• **${upgradeCategoryMeta[c].label}:** ${formatDuration(timeAccumulated)}`;
		})
		.join('\n');

	const costLine = totalTripCostBank.length > 0 ? `\n\n**Worker focus cost:** Used ${totalTripCostBank}.` : '';

	return {
		content: `## Collected from Island Camps\n\nAll materials have been added to your bank.\n\n**Time accumulated:**\n${timeLines}${costLine}`,
		files: [image]
	};
}

export function userOwnsBank(user: MUser, bank: Bank): boolean {
	for (const [item, qty] of bank.items()) {
		const has = item.name === 'Coins' ? Number(user.user.GP) : user.bank.amount(item.id);
		if (has < qty) return false;
	}
	return true;
}

export function accumulationMultiplier(category: SkillCategory, activeAssignment: AssignableCategory | null): number {
	if (!activeAssignment) return 1.0;
	if ((activeAssignment as string) === category) return ASSIGNMENT_BOOST;
	return ASSIGNMENT_PENALTY;
}
