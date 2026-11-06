import {
	defaultMaintenanceTimestamps,
	getGatheringSpeedBonus,
	type IslandUpgradeTiers
} from '@/lib/bso/commands/islandUpgrades.js';
import { InventionID, inventionItemBoost } from '@/lib/bso/skills/invention/inventions.js';

import { formatDuration, stringMatches, Time } from '@oldschoolgg/toolkit';

import type { AncientMycologyActivityTaskOptions } from '@/lib/types/minions.js';

export interface AncientWood {
	id: number;
	name: string;
	level: number;
	xp: number;
	timeToChop: number;
	petChance: number;
	aliases?: string[];
}

export const ancientMycologyWoods: AncientWood[] = [
	{
		id: 75_025,
		name: 'Verdant logs',
		level: 95,
		xp: 250,
		timeToChop: 2.2,
		petChance: 100_000,
		aliases: ['verdant', 'verdant logs', '1', 't1', 'tier 1']
	},
	{
		id: 75_028,
		name: 'Ancient cap',
		level: 100,
		xp: 350,
		timeToChop: 2.5,
		petChance: 100_000,
		aliases: ['cap', 'ancient cap', '2', 't2', 'tier 2']
	},
	{
		id: 75_029,
		name: 'Colossal stem',
		level: 105,
		xp: 480,
		timeToChop: 2.8,
		petChance: 100_000,
		aliases: ['stem', 'colossal stem', '3', 't3', 'tier 3']
	},
	{
		id: 75_027,
		name: 'Living bark',
		level: 110,
		xp: 650,
		timeToChop: 3.2,
		petChance: 100_000,
		aliases: ['bark', 'living bark', '4', 't4', 'tier 4']
	},
	{
		id: 75_026,
		name: 'Ancient verdant logs',
		level: 115,
		xp: 900,
		timeToChop: 3.8,
		petChance: 100_000,
		aliases: ['ancient verdant', 'ancient verdant logs', '5', 't5', 'tier 5']
	}
];

export function getBestEquippedAxe(
	user: MUser
): { name: string; speedMultiplier: number; bonusPercent: number } | null {
	const woodcuttingLevel = user.skillsAsLevels.woodcutting;

	if (woodcuttingLevel >= 99 && user.hasEquippedOrInBank('Dwarven greataxe')) {
		return { name: 'Dwarven greataxe', speedMultiplier: 0.8, bonusPercent: 20 };
	}
	if (woodcuttingLevel >= 71 && user.hasEquippedOrInBank('Crystal axe')) {
		return { name: 'Crystal axe', speedMultiplier: 0.9, bonusPercent: 10 };
	}
	if (
		woodcuttingLevel >= 61 &&
		(user.hasEquippedOrInBank('Dragon axe') ||
			user.hasEquippedOrInBank('Dragon axe (or)') ||
			user.hasEquippedOrInBank('Infernal axe') ||
			user.hasEquippedOrInBank('Infernal axe (uncharged)') ||
			user.hasEquippedOrInBank('3rd age axe') ||
			user.hasEquippedOrInBank('Gilded axe'))
	) {
		return { name: 'Dragon axe', speedMultiplier: 0.94, bonusPercent: 6 };
	}
	if (woodcuttingLevel >= 41 && (user.hasEquippedOrInBank('Rune axe') || user.hasEquippedOrInBank('Gilded axe'))) {
		return { name: 'Rune axe', speedMultiplier: 1.0, bonusPercent: 0 };
	}
	if (woodcuttingLevel >= 31 && user.hasEquippedOrInBank('Adamant axe')) {
		return { name: 'Adamant axe', speedMultiplier: 1.25, bonusPercent: -25 };
	}
	if (woodcuttingLevel >= 21 && (user.hasEquippedOrInBank('Mithril axe') || user.hasEquippedOrInBank('Black axe'))) {
		return { name: 'Mithril axe', speedMultiplier: 1.5, bonusPercent: -50 };
	}
	if (woodcuttingLevel >= 6 && user.hasEquippedOrInBank('Steel axe')) {
		return { name: 'Steel axe', speedMultiplier: 1.75, bonusPercent: -75 };
	}
	if (woodcuttingLevel >= 1 && (user.hasEquippedOrInBank('Iron axe') || user.hasEquippedOrInBank('Bronze axe'))) {
		return { name: 'Bronze axe', speedMultiplier: 2.0, bonusPercent: -100 };
	}

	return null;
}

export function findAncientWood(search: string | undefined): AncientWood | undefined {
	if (!search) return undefined;
	const clean = search.trim().toLowerCase();
	return ancientMycologyWoods.find(
		w => stringMatches(w.name, clean) || w.aliases?.some(a => stringMatches(a, clean))
	);
}

export async function ancientMycologyCommand(
	user: MUser,
	channelId: string,
	quantity: number | undefined,
	growth?: string
) {
	const woodcuttingLevel = user.skillsAsLevels.woodcutting;
	if (woodcuttingLevel < 95) {
		return 'You need at least level 95 Woodcutting to harvest Ancient Myconid growths.';
	}

	const axe = getBestEquippedAxe(user);
	const hasDrygoreAxe = user.hasEquippedOrInBank('Drygore axe');
	if (!axe && !hasDrygoreAxe) {
		return 'You need an axe equipped or in your bank to harvest Ancient Myconid growths.';
	}

	const availableWoods = ancientMycologyWoods.filter((wood: AncientWood) => woodcuttingLevel >= wood.level);

	let targetWood: AncientWood;
	if (growth) {
		const matchedWood = findAncientWood(growth);
		if (!matchedWood) {
			return `That is not a valid growth. Valid choices are: ${ancientMycologyWoods.map(w => `${w.name} (lvl ${w.level})`).join(', ')}.`;
		}
		if (woodcuttingLevel < matchedWood.level) {
			return `You need at least level ${matchedWood.level} Woodcutting to harvest ${matchedWood.name}.`;
		}
		targetWood = matchedWood;
	} else {
		targetWood = availableWoods[availableWoods.length - 1];
	}

	const inputQuantity = quantity;
	const maxTripLength = await user.calcMaxTripLength('AncientMycology');

	let axeSpeedMultiplier = axe ? axe.speedMultiplier : 1.0;
	let usedDrygoreAxe = false;
	if (hasDrygoreAxe) {
		const boostRes = await inventionItemBoost({
			user,
			inventionID: InventionID.DrygoreAxe,
			duration: maxTripLength
		});
		if (boostRes.success) {
			axeSpeedMultiplier = 0.7;
			usedDrygoreAxe = true;
		}
	}

	const islandMaint = (user.user.island_upgrades as any)?.maintenance ?? defaultMaintenanceTimestamps;
	const islandAssign = (user.user.island_upgrades as any)?.assignment ?? null;
	const gatheringBonus = getGatheringSpeedBonus(
		(user.user.island_upgrades ?? {}) as Partial<IslandUpgradeTiers>,
		islandMaint,
		islandAssign
	);

	const timePerWood = targetWood.timeToChop * Time.Second * (1 - gatheringBonus) * axeSpeedMultiplier;

	if (!quantity) {
		quantity = Math.floor(maxTripLength / timePerWood);
	}

	const duration = timePerWood * quantity;
	if (duration > maxTripLength) {
		return `${user.minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount of Ancient Myconid growths${growth ? ` (${targetWood.name})` : ''} you can harvest is ${Math.floor(
			maxTripLength / timePerWood
		)}.`;
	}

	await ActivityManager.startTrip<AncientMycologyActivityTaskOptions>({
		userID: user.id,
		channelId,
		quantity,
		iQty: inputQuantity,
		duration,
		type: 'AncientMycology',
		woodName: growth ? targetWood.name : undefined
	});

	const harvestsPerHour = Math.floor(Time.Hour / timePerWood);
	const xpPerHour = harvestsPerHour * targetWood.xp;
	const boosts: string[] = [];
	if (usedDrygoreAxe) {
		boosts.push('30% faster from Drygore axe');
	} else if (axe && axe.bonusPercent !== 0) {
		boosts.push(
			axe.bonusPercent > 0
				? `${axe.bonusPercent}% faster from ${axe.name}`
				: `${Math.abs(axe.bonusPercent)}% slower from ${axe.name}`
		);
	}
	if (gatheringBonus > 0) boosts.push(`${(gatheringBonus * 100).toFixed(0)}% Expedition Outfitters boost`);
	const boostStr = boosts.length > 0 ? ` (${boosts.join(', ')})` : '';

	return `${user.minionName} is now harvesting Ancient Myconid growths${growth ? ` (${targetWood.name})` : ''}, it will take around ${formatDuration(
		duration
	)} to finish. (${xpPerHour.toLocaleString()} XP/hr)${boostStr}`;
}
