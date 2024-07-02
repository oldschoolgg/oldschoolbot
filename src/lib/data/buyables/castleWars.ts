import { Bank } from 'oldschooljs';

import type { Buyable } from './buyables';

const items = [
	['Red decorative full helm', 5],
	['Red decorative helm', 4],
	['Red decorative body', 8],
	['Red decorative legs', 6],
	['Red decorative skirt', 6],
	['Red decorative boots', 4],
	['Red decorative shield', 6],
	['Red decorative sword', 5],
	['White decorative full helm', 50],
	['White decorative helm', 40],
	['White decorative body', 80],
	['White decorative legs', 60],
	['White decorative skirt', 60],
	['White decorative boots', 40],
	['White decorative shield', 60],
	['White decorative sword', 50],
	['Gold decorative full helm', 500],
	['Gold decorative helm', 400],
	['Gold decorative body', 800],
	['Gold decorative legs', 600],
	['Gold decorative skirt', 600],
	['Gold decorative boots', 400],
	['Gold decorative shield', 600],
	['Gold decorative sword', 500],
	['Zamorak castlewars hood', 10],
	['Zamorak castlewars cloak', 10],
	['Saradomin castlewars hood', 10],
	['Saradomin castlewars cloak', 10],
	['Saradomin banner', 100],
	['Zamorak banner', 100],
	['Decorative magic hat', 20],
	['Decorative magic top', 40],
	['Decorative magic robe', 30],
	['Decorative ranged top', 40],
	['Decorative ranged legs', 30],
	['Decorative quiver', 40],
	['Saradomin halo', 75],
	['Zamorak halo', 75],
	['Guthix halo', 75]
] as const;

export const castleWarsBuyables: Buyable[] = items.map(i => ({
	name: i[0],
	outputItems: new Bank({
		[i[0]]: 1
	}),
	itemCost: new Bank({
		'Castle wars ticket': i[1]
	})
}));
