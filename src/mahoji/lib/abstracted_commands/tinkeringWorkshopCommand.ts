import { Time } from '@oldschoolgg/toolkit';
import { formatDuration } from '@oldschoolgg/toolkit/util';
import { type ItemBank, randomVariation } from 'oldschooljs';

import { type MaterialType, materialTypes } from '@/lib/invention/index.js';
import { transactMaterialsFromUser } from '@/lib/invention/inventions.js';
import { MaterialBank } from '@/lib/invention/MaterialBank.js';
import type { TinkeringWorkshopOptions } from '@/lib/types/minions.js';
import addSubTaskToActivityTask from '@/lib/util/addSubTaskToActivityTask.js';
import { calcMaxTripLength } from '@/lib/util/calcMaxTripLength.js';
import { userStatsUpdate } from '@/mahoji/mahojiSettings.js';

export async function tinkeringWorkshopCommand(user: MUser, material: MaterialType, channelID: string) {
	if (!materialTypes.includes(material)) {
		return "That's not a valid material.";
	}
	if (user.minionIsBusy) return 'Your minion is busy.';

	const gameTime = Time.Minute * 12.5;
	const quantity = Math.floor(calcMaxTripLength(user, 'TinkeringWorkshop') / gameTime);
	const duration = randomVariation(quantity * gameTime, 5);

	const MATERIAL_QTY_PER_PROJECT = 100;

	const materialCost = new MaterialBank().add(material, quantity * MATERIAL_QTY_PER_PROJECT);
	const ownedBank = user.materialsOwned();
	if (!ownedBank.has(materialCost)) {
		return `You don't have enough materials to workshop with this material, you need: ${materialCost}.`;
	}
	await transactMaterialsFromUser({ user, remove: materialCost });
	const stats = await user.fetchStats({ tworkshop_material_cost_bank: true });
	await userStatsUpdate(user.id, {
		tworkshop_material_cost_bank: new MaterialBank(stats.tworkshop_material_cost_bank as ItemBank).add(materialCost)
			.bank
	});

	const str = `${
		user.minionName
	} is now off to do ${quantity}x Tinkering Workshop projects! The total trip will take ${formatDuration(
		duration
	)}. Removed ${materialCost}.`;

	await addSubTaskToActivityTask<TinkeringWorkshopOptions>({
		userID: user.id,
		channelID,
		quantity,
		duration,
		type: 'TinkeringWorkshop',
		minigameID: 'tinkering_workshop',
		material
	});

	return str;
}
