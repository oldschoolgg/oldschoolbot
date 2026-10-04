import type { Item } from 'oldschooljs';

import {
	DISCO_AESTHETIC_COLORS,
	DISCO_AESTHETIC_SHORT_NAMES,
	DISCO_AESTHETICS,
	DiscoItem
} from '@/lib/bso/discoBloodbath.js';
import { PerkTier } from '@/lib/constants.js';
import { RobochimpBitfieldEnum } from '@/lib/perkTiers.js';
import type { Entitlement } from '@/lib/bso/util/entitlementChecker.js';

// Disco Bloodbath-only /bank subtext. Remove this file and its caller after the event.
export const discoBankPointEntitlements = [
	{ perkTier: PerkTier.Three },
	{ bitfield: RobochimpBitfieldEnum.CyrTier0 }
] satisfies Partial<Entitlement>[];

export function getDiscoBankPointLines(item: Item) {
	if (!item.equipable || !item.equipment?.slot) return [];
	const points = new DiscoItem(item).points;
	return DISCO_AESTHETICS.filter(aesthetic => points[aesthetic] !== 0).map(aesthetic => {
		const value = points[aesthetic];
		return {
			text: `${DISCO_AESTHETIC_SHORT_NAMES[aesthetic]}: ${value}`,
			color: DISCO_AESTHETIC_COLORS[aesthetic][value < 0 ? 'negative' : 'positive']
		};
	});
}
