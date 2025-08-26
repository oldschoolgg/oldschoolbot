import { resolveItems } from 'oldschooljs';

import type { ProjectileType } from '@/lib/constants';
import type { Gear } from '@/lib/structures/Gear';

export function determineProjectileTypeFromGear(gear: Gear): ProjectileType | null {
	if (resolveItems(['Twisted bow', 'Hellfire bow', 'Zaryte bow']).some(i => gear.hasEquipped(i))) {
		return 'arrow';
	} else if (
		resolveItems(['Chaotic crossbow', 'Armadyl crossbow', 'Dragon crossbow']).some(i => gear.hasEquipped(i))
	) {
		return 'bolt';
	}
	return null;
}
