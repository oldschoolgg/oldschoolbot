const itemNameMapping: Record<number, string> = {
	1555: 'Pet kitten',
	1556: 'Pet kitten (light)',
	1557: 'Pet kitten (brown)',
	1558: 'Pet kitten (black)',
	1559: 'Pet kitten (brown-grey)',
	1560: 'Pet kitten (blue-grey)',

	1561: 'Pet cat',
	1562: 'Pet cat (light)',
	1563: 'Pet cat (brown)',
	1564: 'Pet cat (black)',
	1565: 'Pet cat (brown-grey)',
	1566: 'Pet cat (blue-grey)',

	1567: 'Pet cat (overgrown)',
	1568: 'Pet cat (overgrown, light)',
	1569: 'Pet cat (overgrown, brown)',
	1570: 'Pet cat (overgrown, black)',
	1571: 'Pet cat (overgrown, brown-grey)',
	1572: 'Pet cat (overgrown, blue-grey)',

	3152: 'Raw karambwan paste',
	3153: 'Poisonous karambwan paste',
	3154: 'Cooked karambwan paste'
};

export function resolveItemName(item: { id: number; name: string }): string | null {
	if (itemNameMapping[item.id]) {
		return itemNameMapping[item.id];
	}
	return null;
}
