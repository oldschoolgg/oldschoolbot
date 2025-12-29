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

	2978: 'Chompy bird hat (ogre bowman)',
	2979: 'Chompy bird hat (bowman)',
	2980: 'Chompy bird hat (ogre yeoman)',
	2981: 'Chompy bird hat (yeoman)',
	2982: 'Chompy bird hat (ogre marksman)',
	2983: 'Chompy bird hat (marksman)',
	2984: 'Chompy bird hat (ogre woodsman)',
	2985: 'Chompy bird hat (woodsman)',
	2986: 'Chompy bird hat (ogre forester)',
	2987: 'Chompy bird hat (forester)',
	2988: 'Chompy bird hat (ogre bowmaster)',
	2989: 'Chompy bird hat (bowmaster)',
	2990: 'Chompy bird hat (ogre expert)',
	2991: 'Chompy bird hat (expert)',
	2992: 'Chompy bird hat (ogre dragon archer)',
	2993: 'Chompy bird hat (dragon archer)',
	2994: 'Chompy bird hat (expert ogre dragon archer)',
	2995: 'Chompy bird hat (expert dragon archer)',

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
