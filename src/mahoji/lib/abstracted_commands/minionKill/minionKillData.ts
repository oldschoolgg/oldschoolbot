import { EItem, ItemGroups, Items, type Monster, MonsterAttribute } from 'oldschooljs';

import type { GearBank } from '@/lib/structures/GearBank.js';

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
	},
	{
		item: Items.getOrThrow('Dragon hunter wand'),
		attackStyle: 'mage',
		boost: 15
	}
] as const;

export function calculateVirtusBoost({
	isInWilderness,
	gearBank,
	isOnTask,
	osjsMon
}: {
	gearBank: GearBank;
	isInWilderness: boolean;
	isOnTask: boolean;
	osjsMon: Monster | undefined;
}) {
	let virtusPiecesEquipped = 0;
	// Undead monsters get salve boost instead of black mask, so can add virtus mask boost as well.
	const isUndead = osjsMon?.data?.attributes?.includes(MonsterAttribute.Undead);
	const hasSalveBoost = isUndead && gearBank.hasEquippedOrInBank(['Salve amulet (i)', 'Salve amulet (ei)']);
	const hasBlackMaskBoost = isOnTask && gearBank.hasEquippedOrInBank('Black mask (i)');
	const virtusMaskAllowed = !hasBlackMaskBoost || hasSalveBoost;

	for (const item of ItemGroups.virtusOutfit) {
		if (isInWilderness && gearBank.gear.wildy.hasEquipped(item)) {
			// If in the wilderness, count all equipped wilderness virtus pieces.
			virtusPiecesEquipped += 1;
		}
		if (!isInWilderness && gearBank.gear.mage.hasEquipped(item)) {
			// If not in the wilderness, only use mask boost if no black mask boost (either not owned, or getting salve boost instead).
			virtusPiecesEquipped += item !== EItem.VIRTUS_MASK || virtusMaskAllowed ? 1 : 0;
		}
	}

	const virtusBoost = virtusPiecesEquipped * 2;
	return {
		virtusBoost
	};
}
