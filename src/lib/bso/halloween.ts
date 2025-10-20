import { BSOEmoji } from '@/lib/bso/bsoEmoji.js';

import { type Item, Items } from 'oldschooljs';

const constants = {
	MINUTES_PER_VISIT: 10,
	CARD_TARGET_DAYS: 1.5,
	PET_TARGET_DAYS: 4,
	HALLOWEEN_PETS: Items.resolveItems([
		'Mumpkin',
		'Polterpup',
		'Mini mortimer',
		'Casper',
		'Kuro',
		'Mini Pumpkinhead',
		'Gregoyle'
	])
};

const minutesInDays = (d: number) => d * 24 * 60;
const denomForTarget = (days: number) => Math.round(minutesInDays(days) / constants.MINUTES_PER_VISIT);

const CARD_CHANCE = denomForTarget(constants.CARD_TARGET_DAYS);
const PET_CHANCE = denomForTarget(constants.PET_TARGET_DAYS);

function expectedDays(denom: number) {
	const minutes = denom * constants.MINUTES_PER_VISIT;
	return minutes / (24 * 60);
}

console.log(`Card odds: 1 in ${CARD_CHANCE}, expected ≈ ${expectedDays(CARD_CHANCE).toFixed(2)} days`);
console.log(`Pet odds:  1 in ${PET_CHANCE}, expected ≈ ${expectedDays(PET_CHANCE).toFixed(2)} days`);

const trickOrTreaters: {
	id: HalloweenCardID;
	card: Item;
	emoji: string;
	perk: {
		description: string;
	};
}[] = [
	{
		id: 'witch',
		card: Items.getOrThrow('Witch card'),
		emoji: BSOEmoji.WitchCard,
		perk: {
			description:
				'An extra 1/5 chance at loot doubling, and custom pets give double their normal loot (peky/obis/brock/wilvus/smokey/doug/harry)'
		}
	},
	{
		id: 'death',
		card: Items.getOrThrow('Death card'),
		emoji: BSOEmoji.DeathCard,
		perk: {
			description: 'All PvM is 30% faster, and all slayer tasks have 50% more kills assigned.'
		}
	},
	{
		id: 'pumpkinman',
		card: Items.getOrThrow('Pumpkinman card'),
		emoji: BSOEmoji.PumpkinmanCard,
		perk: {
			description: 'Farming patches grow 50% faster, and give twice the yield.'
		}
	},
	{
		id: 'vampire',
		card: Items.getOrThrow('Vampire card'),
		emoji: BSOEmoji.VampireCard,
		perk: {
			description: '+10 minutes longer max trip length all trips'
		}
	},
	{
		id: 'ghost',
		card: Items.getOrThrow('Ghost card'),
		emoji: BSOEmoji.GhostCard,
		perk: {
			description: 'Increased chance of trick-or-treating'
		}
	}
] as const;

export type HalloweenCardID = 'witch' | 'death' | 'pumpkinman' | 'vampire' | 'ghost';

const CANDY_PER_MINUTE = 1;
const CANDY_MIN_PER_VISIT = 1;
const CANDY_MAX_PER_VISIT = 3;
const EXPECTED_CANDY_PER_VISIT = (CANDY_MIN_PER_VISIT + CANDY_MAX_PER_VISIT) / 2;

type Totals = { visits: number; waitMin: number; candyMin: number; totalMin: number };
const breakdown = (denom: number): Totals => {
	const visits = denom;
	const waitMin = visits * constants.MINUTES_PER_VISIT;
	const candyNeeded = visits * EXPECTED_CANDY_PER_VISIT;
	const candyMin = candyNeeded / CANDY_PER_MINUTE;
	return { visits, waitMin, candyMin, totalMin: waitMin + candyMin };
};
const h = (m: number) => (m / 60).toFixed(2);

const cardTotals = breakdown(CARD_CHANCE);
const petTotals = breakdown(PET_CHANCE);

console.log(
	`[Card] visits=${cardTotals.visits} wait=${h(cardTotals.waitMin)}h candy=${h(cardTotals.candyMin)}h total=${h(
		cardTotals.totalMin
	)}h`
);
console.log(
	`[Pet ] visits=${petTotals.visits} wait=${h(petTotals.waitMin)}h candy=${h(petTotals.candyMin)}h total=${h(
		petTotals.totalMin
	)}h`
);

export const HalloweenEvent2025 = {
	constants: {
		...constants,
		CANDY_PER_MINUTE,
		CARD_CHANCE,
		PET_CHANCE
	},
	trickOrTreaters,
	DEATH_SPEED_BOOST: 30
};
