import type { GearBank } from '../../../../lib/structures/GearBank';
import { itemNameFromID, resolveItems } from '../../../../lib/util';
import getOSItem from '../../../../lib/util/getOSItem';

export const dragonHunterWeapons = [
	{
		item: getOSItem('Dragon hunter lance'),
		attackStyle: 'melee',
		boost: 15
	},
	{
		item: getOSItem('Dragon hunter crossbow'),
		attackStyle: 'ranged',
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

	for (const item of resolveItems(['Virtus mask', 'Virtus robe top', 'Virtus robe bottom'])) {
		if (isInWilderness) {
			if (gearBank.gear.wildy.hasEquipped(item)) {
				virtusPiecesEquipped += hasBlackMask && itemNameFromID(item) === 'Virtus mask' ? 0 : 1;
			}
		} else if (gearBank.gear.mage.hasEquipped(item)) {
			virtusPiecesEquipped += hasBlackMask && itemNameFromID(item) === 'Virtus mask' ? 0 : 1;
		}
	}

	const virtusBoost = virtusPiecesEquipped * 2;
	return {
		virtusBoost
	};
}
