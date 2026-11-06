import { defaultMaintenanceTimestamps, getGlobalMinigameBonus } from '@/lib/bso/commands/islandUpgrades.js';

import { formatDuration, Time } from '@oldschoolgg/toolkit';
import { randomVariation } from 'node-rng';

import type { MinigameActivityTaskOptionsWithNoChanges } from '@/lib/types/minions.js';

export async function fistOfGuthixCommand(user: MUser, channelId: string) {
	if (await user.minionIsBusy()) return 'Your minion is busy.';

	const hasCelestialPendant = user.hasEquippedOrInBank('Celestial pendant');
	const rawUpgrades = (user.user.island_upgrades ?? {}) as any;
	const islandMaint = rawUpgrades.maintenance ?? defaultMaintenanceTimestamps;
	const islandAssign = rawUpgrades.assignment ?? null;
	const globalMinigameBonus = getGlobalMinigameBonus(rawUpgrades, islandMaint, islandAssign);

	let gameTime = Time.Minute * 7.5 * (hasCelestialPendant ? 0.9 : 1);
	if (globalMinigameBonus > 0) {
		gameTime *= 1 - globalMinigameBonus;
	}

	const quantity = Math.floor((await user.calcMaxTripLength('FistOfGuthix')) / gameTime);
	const duration = randomVariation(quantity * gameTime, 5);

	const boosts = [];
	if (hasCelestialPendant) boosts.push('10% faster from Celestial pendant');
	if (globalMinigameBonus > 0) {
		boosts.push(`${(globalMinigameBonus * 100).toFixed(0)}% faster from Grand Conduit (Settlement Infrastructure)`);
	}
	const boostStr = boosts.length > 0 ? `\n\n**Boosts:** ${boosts.join(', ')}.` : '';
	const str = `${user.minionName} is now off to do ${quantity} Fist of Guthix games. The total trip will take ${formatDuration(duration)}.${boostStr}`;

	await ActivityManager.startTrip<MinigameActivityTaskOptionsWithNoChanges>({
		userID: user.id,
		channelId,
		quantity,
		duration,
		type: 'FistOfGuthix',
		minigameID: 'fist_of_guthix'
	});

	return str;
}
