import { EItem, ItemGroups, Items, Monster, MonsterAttribute } from 'oldschooljs';

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
	isOnTask,
	osjsMon
}: { gearBank: GearBank; isInWilderness: boolean; isOnTask: boolean; osjsMon: Monster | undefined }) {
	let virtusPiecesEquipped = 0;
	const isUndead = osjsMon?.data?.attributes?.includes(MonsterAttribute.Undead);
	const hasSalve =
		isUndead &&
		(gearBank.hasEquippedOrInBank('Salve amulet (i)') || gearBank.hasEquippedOrInBank('Salve amulet (ei)'));
	const hasBlackMask = isOnTask && gearBank.hasEquippedOrInBank('Black mask (i)');
	const noMaskBoost = hasBlackMask && !hasSalve;

	for (const item of ItemGroups.virtusOutfit) {
		if (isInWilderness && gearBank.gear.wildy.hasEquipped(item)) {
			virtusPiecesEquipped += 1;
		}
		if (!isInWilderness && gearBank.gear.mage.hasEquipped(item)) {
			virtusPiecesEquipped += noMaskBoost && item === EItem.VIRTUS_MASK ? 0 : 1;
		}
	}

	const virtusBoost = virtusPiecesEquipped * 2;
	return {
		virtusBoost
	};
}
