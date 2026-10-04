import type { Item } from 'oldschooljs';

import {
	DISCO_AESTHETIC_COLORS,
	DISCO_AESTHETIC_SHORT_NAMES,
	DISCO_AESTHETICS,
	DiscoItem
} from '@/lib/bso/discoBloodbath.js';

// Disco Bloodbath-only /bank subtext. Remove this file and its caller after the event.
export function getDiscoBankPointLines(item: Item) {
	const points = new DiscoItem(item).points;
	return DISCO_AESTHETICS.filter(aesthetic => points[aesthetic] !== 0).map(aesthetic => {
		const value = points[aesthetic];
		return {
			text: `${DISCO_AESTHETIC_SHORT_NAMES[aesthetic]}: ${value}`,
			color: DISCO_AESTHETIC_COLORS[aesthetic][value < 0 ? 'negative' : 'positive']
		};
	});
}
