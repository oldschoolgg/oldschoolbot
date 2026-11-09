import {
	defaultMaintenanceTimestamps,
	getGatheringSpeedBonus,
	type IslandUpgradeTiers
} from '@/lib/bso/commands/islandUpgrades.js';

import { formatDuration, Time } from '@oldschoolgg/toolkit';

import type { ArchaicMiningActivityTaskOptions } from '@/lib/types/minions.js';
import { type ArchaicOre, archaicOres, type MiningType } from '@/tasks/minions/archaicMiningActivity.js';

export function getBestEquippedPickaxe(
	user: MUser
): { name: string; speedMultiplier: number; bonusPercent: number } | null {
	const miningLevel = user.skillsAsLevels.mining;

	if (miningLevel >= 105 && user.hasEquippedOrInBank('Volcanic pickaxe')) {
		return { name: 'Volcanic pickaxe', speedMultiplier: 0.75, bonusPercent: 25 };
	}
	if (
		miningLevel >= 99 &&
		(user.hasEquippedOrInBank('Dwarven pickaxe') || user.hasEquippedOrInBank('Dwarven pickaxe (xmas)'))
	) {
		return { name: 'Dwarven pickaxe', speedMultiplier: 0.8, bonusPercent: 20 };
	}
	if (miningLevel >= 71 && user.hasEquippedOrInBank('Crystal pickaxe')) {
		return { name: 'Crystal pickaxe', speedMultiplier: 0.9, bonusPercent: 10 };
	}
	if (
		miningLevel >= 61 &&
		(user.hasEquippedOrInBank('Dragon pickaxe') ||
			user.hasEquippedOrInBank('Dragon pickaxe (or)') ||
			user.hasEquippedOrInBank('Infernal pickaxe') ||
			user.hasEquippedOrInBank('Infernal pickaxe (uncharged)') ||
			user.hasEquippedOrInBank('3rd age pickaxe'))
	) {
		return { name: 'Dragon pickaxe', speedMultiplier: 0.94, bonusPercent: 6 };
	}
	if (miningLevel >= 41 && (user.hasEquippedOrInBank('Rune pickaxe') || user.hasEquippedOrInBank('Gilded pickaxe'))) {
		return { name: 'Rune pickaxe', speedMultiplier: 1.0, bonusPercent: 0 };
	}
	if (miningLevel >= 31 && user.hasEquippedOrInBank('Adamant pickaxe')) {
		return { name: 'Adamant pickaxe', speedMultiplier: 1.25, bonusPercent: -25 };
	}
	if (
		miningLevel >= 21 &&
		(user.hasEquippedOrInBank('Mithril pickaxe') || user.hasEquippedOrInBank('Black pickaxe'))
	) {
		return { name: 'Mithril pickaxe', speedMultiplier: 1.5, bonusPercent: -50 };
	}
	if (miningLevel >= 6 && user.hasEquippedOrInBank('Steel pickaxe')) {
		return { name: 'Steel pickaxe', speedMultiplier: 1.75, bonusPercent: -75 };
	}
	if (miningLevel >= 1 && (user.hasEquippedOrInBank('Iron pickaxe') || user.hasEquippedOrInBank('Bronze pickaxe'))) {
		return { name: 'Bronze pickaxe', speedMultiplier: 2.0, bonusPercent: -100 };
	}

	return null;
}

export async function archaicMiningCommand(
	user: MUser,
	channelId: string,
	miningType: MiningType,
	quantity: number | undefined
) {
	const miningLevel = user.skillsAsLevels.mining;

	if (miningLevel < 90) {
		return 'You need at least level 90 Mining to do Archaic mining.';
	}

	const equippedPickaxe = getBestEquippedPickaxe(user);
	if (!equippedPickaxe) {
		return 'You need to have a pickaxe equipped or in your bank to do Archaic mining.';
	}

	const strengthLevel = user.skillsAsLevels.strength;
	const hasOffhandVolcanic =
		user.hasEquippedOrInBank('Offhand volcanic pickaxe') && strengthLevel >= 100 && miningLevel >= 105;
	const offhandMultiplier = hasOffhandVolcanic ? 0.85 : 1.0;

	const inputQuantity = quantity;

	const relevantOres = archaicOres.filter((ore: ArchaicOre) => ore.type === miningType);
	const availableOres = relevantOres.filter((ore: ArchaicOre) => miningLevel >= ore.level);
	const bestOre = availableOres[availableOres.length - 1];

	const maxTripLength = await user.calcMaxTripLength('ArchaicMining');

	const islandMaint = (user.user.island_upgrades as any)?.maintenance ?? defaultMaintenanceTimestamps;
	const islandAssign = (user.user.island_upgrades as any)?.assignment ?? null;
	const gatheringBonus = getGatheringSpeedBonus(
		(user.user.island_upgrades ?? {}) as Partial<IslandUpgradeTiers>,
		islandMaint,
		islandAssign
	);

	const timePerOre =
		bestOre.timeToMine * Time.Second * (1 - gatheringBonus) * equippedPickaxe.speedMultiplier * offhandMultiplier;

	if (!quantity) {
		quantity = Math.floor(maxTripLength / timePerOre);
	}
	const duration = timePerOre * quantity;

	if (duration > maxTripLength) {
		return `${user.minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount you can mine is ${Math.floor(maxTripLength / timePerOre)}.`;
	}

	await ActivityManager.startTrip<ArchaicMiningActivityTaskOptions>({
		userID: user.id,
		channelId,
		quantity,
		iQty: inputQuantity,
		duration,
		type: 'ArchaicMining',
		miningType
	});

	const oresPerHour = Math.floor(Time.Hour / timePerOre);
	const xpPerHour = oresPerHour * bestOre.xp;

	const boosts: string[] = [];
	if (equippedPickaxe.bonusPercent > 0) {
		boosts.push(`${equippedPickaxe.bonusPercent}% faster from ${equippedPickaxe.name}`);
	} else if (equippedPickaxe.bonusPercent === 0) {
		boosts.push(equippedPickaxe.name);
	}
	if (hasOffhandVolcanic) {
		boosts.push('15% faster from Offhand volcanic pickaxe');
	}
	if (gatheringBonus > 0) {
		boosts.push(`${(gatheringBonus * 100).toFixed(0)}% Expedition Outfitters boost`);
	}
	const boostStr = boosts.length > 0 ? ` (${boosts.join(', ')})` : '';

	const activityName = miningType === 'dragonbone' ? 'dragonbone mining' : 'crystalline mining';

	return `${user.minionName} is now doing ${activityName}, it will take around ${formatDuration(
		duration
	)} to finish. (${xpPerHour.toLocaleString()} XP/hr)${boostStr}`;
}
