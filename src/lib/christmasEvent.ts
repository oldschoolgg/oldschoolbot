import { resolveItems } from './util.js';

const wizardOutfit = resolveItems([
	'Snowdream robe legs',
	'Snowdream wizard hat',
	'Snowdream robe top',
	'Snowdream wizard socks'
]);

export const blackSantaOutfit = resolveItems([
	'Black santa top',
	'Black santa legs',
	'Black santa gloves',
	'Black santa boots'
]);

export const allChristmasEventItems = resolveItems([
	...wizardOutfit,
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

const daysOnAverageChance = (days: number) => days * 1440;

interface Drop {
	items: number[];
	chancePerMinute: number;
	clDropRateIncrease?: number;
}

export const christmasDroprates: Drop[] = [
	{
		items: wizardOutfit,
		chancePerMinute: daysOnAverageChance(0.3),
		clDropRateIncrease: 4
	},
	{
		items: resolveItems(['Icey santa hat']),
		chancePerMinute: daysOnAverageChance(10)
	},
	{
		items: blackSantaOutfit,
		chancePerMinute: daysOnAverageChance(0.8),
		clDropRateIncrease: 3
	},
	{
		items: resolveItems(['Snowdream pillow']),
		chancePerMinute: daysOnAverageChance(1.5),
		clDropRateIncrease: 2
	},
	{
		items: resolveItems(['Chef-touched heart (choc)']),
		chancePerMinute: daysOnAverageChance(0.2),
		clDropRateIncrease: 2
	},
	{
		items: resolveItems(['Sungod slippers']),
		chancePerMinute: daysOnAverageChance(1.5),
		clDropRateIncrease: 3
	},
	{
		items: resolveItems(['Shrimpy', 'Grinchling']),
		chancePerMinute: daysOnAverageChance(5),
		clDropRateIncrease: 2
	}
];

export const SNOWDREAM_RUNES_PER_MINUTE = 30;
