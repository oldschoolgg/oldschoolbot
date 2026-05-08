import { ItemGroups } from 'oldschooljs';

export function rogueOutfitPercentBonus(user: MUser): number {
	const skillingSetup = user.gear.skilling;
	let amountEquipped = 0;
	for (const id of ItemGroups.rogueOutfit) {
		if (skillingSetup.hasEquipped([id])) {
			amountEquipped++;
		}
	}
	return amountEquipped * 20;
}
