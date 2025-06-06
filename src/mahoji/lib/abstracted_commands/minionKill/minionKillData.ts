import type { GearBank } from '../../../../lib/structures/GearBank';
import { type Monster, MonsterAttribute, itemNameFromID, resolveItems } from '../../../../lib/util';
import getOSItem from '../../../../lib/util/getOSItem';

export const dragonHunterWeapons = [
	{
		item: getOSItem('Dragon hunter lance'),
		attackStyle: 'melee',
		boost: 15
	},
	{
		item: getOSItem('Dragon hunter crossbow'),
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

	for (const item of resolveItems(['Virtus mask', 'Virtus robe top', 'Virtus robe bottom'])) {
		if (isInWilderness && gearBank.gear.wildy.hasEquipped(item)) {
			virtusPiecesEquipped += 1;
		}
		if (!isInWilderness && gearBank.gear.mage.hasEquipped(item)) {
			virtusPiecesEquipped += noMaskBoost && itemNameFromID(item) === 'Virtus mask' ? 0 : 1;
		}
	}

	const virtusBoost = virtusPiecesEquipped * 2;
	return {
		virtusBoost
	};
}
