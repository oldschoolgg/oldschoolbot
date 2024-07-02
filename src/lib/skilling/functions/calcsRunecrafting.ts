import { percentChance } from 'e';

import { checkDegradeableItemCharges, degradeItem } from '../../degradeableItems';
import getOSItem from '../../util/getOSItem';
import Runecraft from '../skills/runecraft';

export async function bloodEssence(user: MUser, quantity: number): Promise<number> {
	let bonusQuantity = 0;
	const bloodEssenceCharges = await checkDegradeableItemCharges({ item: getOSItem('Blood essence (active)'), user });
	if (bloodEssenceCharges > 0) {
		for (let i = 0; i < quantity; i++) {
			if (bonusQuantity === bloodEssenceCharges - 1) {
				break;
			} else if (percentChance(50)) {
				bonusQuantity++;
			}
		}
		if (bonusQuantity > 0) {
			await degradeItem({
				item: getOSItem('Blood essence (active)'),
				chargesToDegrade: bonusQuantity,
				user
			});
		}
	}
	return bonusQuantity;
}

export function raimentBonus(user: MUser, quantity: number): number {
	let bonusQuantity = 0;
	if (
		user.gear.skilling.hasEquipped(
			Object.keys(Runecraft.raimentsOfTheEyeItems).map(i => Number.parseInt(i)),
			true
		)
	) {
		const amountToAdd = Math.floor(quantity * (60 / 100));
		bonusQuantity = amountToAdd;
	} else {
		// For each Raiments of the Eye item, check if they have it, give its' quantity boost if so (NO bonus XP).
		for (const [itemID, bonus] of Object.entries(Runecraft.raimentsOfTheEyeItems)) {
			if (user.gear.skilling.hasEquipped([Number.parseInt(itemID)], false)) {
				const amountToAdd = Math.floor(quantity * (bonus / 100));
				bonusQuantity += amountToAdd;
			}
		}
	}
	return bonusQuantity;
}
