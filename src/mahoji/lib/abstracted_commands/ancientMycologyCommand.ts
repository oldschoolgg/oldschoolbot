import { formatDuration, Time } from '@oldschoolgg/toolkit';
import type { ActivityTaskOptionsWithQuantity } from '@/lib/types/minions.js';
import { getGatheringSpeedBonus, type IslandUpgradeTiers, defaultMaintenanceTimestamps } from '@/lib/bso/commands/islandUpgrades.js';

interface AncientWood {
	id: number;
	name: string;
	level: number;
	xp: number;
	timeToChop: number;
}

const ancientMycologyWoods: AncientWood[] = [
	{ id: 1, name: 'Verdant logs', level: 95, xp: 100, timeToChop: 3 },
	{ id: 2, name: 'Ancient cap', level: 100, xp: 120, timeToChop: 3.5 },
	{ id: 3, name: 'Colossal stem', level: 105, xp: 140, timeToChop: 4 },
	{ id: 4, name: 'Living bark', level: 110, xp: 160, timeToChop: 4.5 },
	{ id: 5, name: 'Ancient verdant logs', level: 115, xp: 180, timeToChop: 5 }
];

export async function ancientMycologyCommand(user: MUser, channelId: string, quantity: number | undefined) {
	const woodcuttingLevel = user.skillsAsLevels.woodcutting;
	if (woodcuttingLevel < 95) {
		return 'You need at least level 95 Woodcutting to harvest Ancient Myconid growths.';
	}

	const inputQuantity = quantity;
	const availableWoods = ancientMycologyWoods.filter((wood: AncientWood) => woodcuttingLevel >= wood.level);
	const bestWood = availableWoods[availableWoods.length - 1];
	const maxTripLength = await user.calcMaxTripLength('AncientMycology');

	const islandMaint    = (user.user.island_upgrades as any)?.maintenance ?? defaultMaintenanceTimestamps;
	const islandAssign   = (user.user.island_upgrades as any)?.assignment  ?? null;
	const gatheringBonus = getGatheringSpeedBonus((user.user.island_upgrades ?? {}) as Partial<IslandUpgradeTiers>, islandMaint, islandAssign);

	const hasDrygoreSaw = user.hasEquippedOrInBank('Drygore saw');
	const drygoreSawBonus = hasDrygoreSaw ? 0.1 : 0;

	const timePerWood = bestWood.timeToChop * Time.Second * (1 - gatheringBonus) * (1 - drygoreSawBonus);

	if (!quantity) {
		quantity = Math.floor(maxTripLength / timePerWood);
	}

	const duration = timePerWood * quantity;
	if (duration > maxTripLength) {
		return `${user.minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount of Ancient Myconid growths you can harvest is ${Math.floor(
			maxTripLength / timePerWood
		)}.`;
	}

	await ActivityManager.startTrip<ActivityTaskOptionsWithQuantity>({
		userID: user.id,
		channelId,
		quantity,
		iQty: inputQuantity,
		duration,
		type: 'AncientMycology'
	});

	const harvestsPerHour = Math.floor(Time.Hour / timePerWood);
	const xpPerHour = harvestsPerHour * bestWood.xp;
	const boosts: string[] = [];
	if (gatheringBonus > 0) boosts.push(`${gatheringBonus * 100}% Expedition Outfitters boost`);
	if (hasDrygoreSaw) boosts.push('10% faster from Drygore saw');
	const boostStr = boosts.length > 0 ? ` (${boosts.join(', ')})` : '';

	return `${user.minionName} is now harvesting Ancient Myconid growths, it will take around ${formatDuration(
		duration
	)} to finish. (${xpPerHour.toLocaleString()} XP/hr)${boostStr}`;
}