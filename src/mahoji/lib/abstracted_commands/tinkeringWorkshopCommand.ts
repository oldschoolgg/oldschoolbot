import { Time } from 'e';

import { MaterialType, materialTypes } from '../../../lib/invention';
import { transactMaterialsFromUser } from '../../../lib/invention/inventions';
import { MaterialBank } from '../../../lib/invention/MaterialBank';
import { ItemBank } from '../../../lib/types';
import { TinkeringWorkshopOptions } from '../../../lib/types/minions';
import { formatDuration, randomVariation } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import { userStatsUpdate } from '../../mahojiSettings';

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
	await userStatsUpdate(user.id, oldStats => {
		return {
			tworkshop_material_cost_bank: new MaterialBank(oldStats.tworkshop_material_cost_bank as ItemBank).add(
				materialCost
			).bank
		};
	});

	let str = `${
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
