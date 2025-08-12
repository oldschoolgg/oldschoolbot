import { EItem, ItemGroups, Items } from 'oldschooljs';

import type { GearBank } from '@/lib/structures/GearBank';

export const dragonHunterWeapons = [
	{
		item: Items.getOrThrow('Dragon hunter lance'),
		attackStyle: 'melee',
		boost: 15
	},
	{
		item: Items.getOrThrow('Dragon hunter crossbow'),
		attackStyle: 'range',
		boost: 15
	}
] as const;

export function calculateVirtusBoost({
	isInWilderness,
	gearBank,
	isOnTask
}: { gearBank: GearBank; isInWilderness: boolean; isOnTask: boolean }) {
	let virtusPiecesEquipped = 0;
	const hasBlackMask =
		(isOnTask && gearBank.gear.mage.hasEquipped('Black mask (i)')) ||
		gearBank.gear.wildy.hasEquipped('Black mask (i)');

	for (const item of ItemGroups.virtusOutfit) {
		if (isInWilderness) {
			if (gearBank.gear.wildy.hasEquipped(item)) {
				virtusPiecesEquipped += hasBlackMask && item === EItem.VIRTUS_MASK ? 0 : 1;
			}
		} else if (gearBank.gear.mage.hasEquipped(item)) {
			virtusPiecesEquipped += hasBlackMask && item === EItem.VIRTUS_MASK ? 0 : 1;
		}
	}

	const virtusBoost = virtusPiecesEquipped * 2;
	return {
		virtusBoost
	};
}
