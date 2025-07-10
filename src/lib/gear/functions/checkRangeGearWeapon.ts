import { objectEntries } from 'e';
import { EItem, Items } from 'oldschooljs';

import { formatList } from '@/lib/util/smallUtils';
import { projectiles } from '../../constants';
import { getSimilarItems } from '../../data/similarItems';
import type { Gear } from '../../structures/Gear';

export function checkRangeGearWeapon(gear: Gear) {
	const weapon = gear.equippedWeapon();
	const { ammo } = gear;
	if (!weapon) return 'You have no weapon equipped.';
	const usingBowfa = getSimilarItems(EItem.BOW_OF_FAERDHINEN_C).includes(weapon.id);
	if (usingBowfa) {
		return {
			weapon,
			ammo
		};
	}
	if (!ammo) return 'You have no ammo equipped.';

	const projectileCategory = objectEntries(projectiles).find(i =>
		i[1].weapons.flatMap(w => getSimilarItems(w)).includes(weapon.id)
	);
	if (!projectileCategory) return 'You have an invalid range weapon.';
	if (!projectileCategory[1].items.includes(ammo.item)) {
		return `You have invalid ammo for your equipped weapon. For ${
			projectileCategory[0]
		}-based weapons, you can use: ${formatList(
			projectileCategory[1].items.map(i => Items.itemNameFromId(i)),
			'or'
		)}.`;
	}

	return {
		weapon,
		ammo
	};
}
