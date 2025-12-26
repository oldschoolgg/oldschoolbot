import { resolveItems } from 'oldschooljs';

const snowDreamOutfit = resolveItems([
	'Snowdream robe legs',
	'Snowdream wizard hat',
	'Snowdream robe top',
	'Snowdream wizard socks'
]);
const blackSantaOutfit = resolveItems([
	'Black santa top',
	'Black santa legs',
	'Black santa gloves',
	'Black santa boots'
]);

export const allChristmasEvent2024Items = resolveItems([
	...snowDreamOutfit,
	...blackSantaOutfit,
	'Snowdream rune',
	'Snowdream pillow',
	'Chef-touched heart (choc)',
	'Sungod slippers',
	'Icey santa hat',
	'Grinchling',
	'Shrimpy',
	'Snowflake amulet',
	'Snowdream staff'
]);

export const allChristmasEvent2025Items = resolveItems([
	'Snowglobe santa hat',
	'Smokey snowglobe',
	'Seer snowglobe',
	'Ember'
]);
