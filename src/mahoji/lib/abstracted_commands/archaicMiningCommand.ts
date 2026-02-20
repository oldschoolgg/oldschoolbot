import { formatDuration, Time } from '@oldschoolgg/toolkit';
import { getGatheringSpeedBonus, type IslandUpgradeTiers } from '@/lib/bso/commands/islandUpgrades.js';
import { archaicOres, type ArchaicOre, type MiningType } from '@/tasks/minions/archaicMiningActivity.js';
import type { ArchaicMiningActivityTaskOptions } from '@/lib/types/minions.js';

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

	const inputQuantity = quantity;

	const relevantOres = archaicOres.filter((ore: ArchaicOre) => ore.type === miningType);
	const availableOres = relevantOres.filter((ore: ArchaicOre) => miningLevel >= ore.level);
	const bestOre = availableOres[availableOres.length - 1];

	const maxTripLength = await user.calcMaxTripLength('ArchaicMining');

	const gatheringBonus = getGatheringSpeedBonus((user.user.island_upgrades ?? {}) as Partial<IslandUpgradeTiers>);
	const timePerOre = bestOre.timeToMine * Time.Second * (1 - gatheringBonus);

	if (!quantity) {
		quantity = Math.floor(maxTripLength / timePerOre);
	}
	const duration = timePerOre * quantity;

	if (duration > maxTripLength) {
		return `${user.minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount of Archaic minerals you can mine is ${Math.floor(
			maxTripLength / timePerOre
		)}.`;
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
	const boostStr = gatheringBonus > 0 ? ` (${gatheringBonus * 100}% gathering speed boost applied)` : '';

	return `${user.minionName} is now mining Archaic minerals, it will take around ${formatDuration(
		duration
	)} to finish. (${xpPerHour.toLocaleString()} XP/hr)${boostStr}`;
}