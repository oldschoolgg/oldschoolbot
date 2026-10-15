import type { TinkeringWorkshopOptions } from '@/lib/bso/bsoTypes.js';
import { defaultMaintenanceTimestamps, getGlobalMinigameBonus } from '@/lib/bso/commands/islandUpgrades.js';
import { transactMaterialsFromUser } from '@/lib/bso/skills/invention/inventions.js';
import { isValidMaterialType } from '@/lib/bso/skills/invention/inventionUtil.js';
import { MaterialBank } from '@/lib/bso/skills/invention/MaterialBank.js';

import { formatDuration, Time } from '@oldschoolgg/toolkit';
import { randomVariation } from 'node-rng';
import type { ItemBank } from 'oldschooljs';

export async function tinkeringWorkshopCommand(user: MUser, material: string, channelId: string) {
	if (!isValidMaterialType(material)) {
		return "That's not a valid material.";
	}
	if (await user.minionIsBusy()) return 'Your minion is busy.';

	const hasCelestialPendant = user.hasEquippedOrInBank('Celestial pendant');
	const rawUpgrades = (user.user.island_upgrades ?? {}) as any;
	const islandMaint = rawUpgrades.maintenance ?? defaultMaintenanceTimestamps;
	const islandAssign = rawUpgrades.assignment ?? null;
	const globalMinigameBonus = getGlobalMinigameBonus(rawUpgrades, islandMaint, islandAssign);

	let gameTime = Time.Minute * 12.5 * (hasCelestialPendant ? 0.9 : 1);
	if (globalMinigameBonus > 0) {
		gameTime *= 1 - globalMinigameBonus;
	}

	const quantity = Math.floor((await user.calcMaxTripLength('TinkeringWorkshop')) / gameTime);
	const duration = randomVariation(quantity * gameTime, 5);

	const MATERIAL_QTY_PER_PROJECT = 100;

	const materialCost = new MaterialBank().add(material, quantity * MATERIAL_QTY_PER_PROJECT);
	const ownedBank = user.materialsOwned();
	if (!ownedBank.has(materialCost)) {
		return `You don't have enough materials to workshop with this material, you need: ${materialCost}.`;
	}
	await transactMaterialsFromUser({ user, remove: materialCost });
	const stats = await user.fetchStats();
	await user.statsUpdate({
		tworkshop_material_cost_bank: new MaterialBank(stats.tworkshop_material_cost_bank as ItemBank).add(materialCost)
			.bank
	});

	const boosts = [];
	if (hasCelestialPendant) boosts.push('10% faster from Celestial pendant');
	if (globalMinigameBonus > 0) {
		boosts.push(`${(globalMinigameBonus * 100).toFixed(0)}% faster from Grand Conduit (Settlement Infrastructure)`);
	}
	const boostStr = boosts.length > 0 ? `\n\n**Boosts:** ${boosts.join(', ')}.` : '';
	const str = `${user.minionName} is now off to do ${quantity}x Tinkering Workshop projects! The total trip will take ${formatDuration(duration)}. Removed ${materialCost}.${boostStr}`;

	await ActivityManager.startTrip<TinkeringWorkshopOptions>({
		userID: user.id,
		channelId,
		quantity,
		duration,
		type: 'TinkeringWorkshop',
		minigameID: 'tinkering_workshop',
		material
	});

	return str;
}
