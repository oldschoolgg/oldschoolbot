import { Time } from '@oldschoolgg/toolkit';

export const miscellaniaAreaKeys = [
	'maple',
	'coal',
	'fishing_raw',
	'fishing_cooked',
	'herbs',
	'flax',
	'mahogany',
	'teak',
	'hardwood_both',
	'farm_seeds'
] as const;

export type MiscellaniaAreaKey = (typeof miscellaniaAreaKeys)[number];

export function isMiscellaniaAreaKey(area: unknown): area is MiscellaniaAreaKey {
	return typeof area === 'string' && miscellaniaAreaKeys.includes(area as MiscellaniaAreaKey);
}

export function normalizeMiscellaniaAreaKey(area: unknown, fallback: MiscellaniaAreaKey): MiscellaniaAreaKey {
	return isMiscellaniaAreaKey(area) ? area : fallback;
}

export const miscellaniaAreaLabels: Record<MiscellaniaAreaKey, string> = {
	maple: 'Wood (Maple)',
	coal: 'Mining (Coal)',
	fishing_raw: 'Fishing (Raw)',
	fishing_cooked: 'Fishing (Cooked)',
	herbs: 'Herbs',
	flax: 'Flax',
	mahogany: 'Hardwood (Mahogany)',
	teak: 'Hardwood (Teak)',
	hardwood_both: 'Hardwood (Both)',
	farm_seeds: 'Farm (Seeds)'
};

export interface MiscellaniaState {
	lastClaimedAt: number;
	lastUpdatedAt: number;
	lastTopupAt: number;
	primaryArea: MiscellaniaAreaKey;
	secondaryArea: MiscellaniaAreaKey;
	coffer: number;
	cofferAtLastClaim: number;
	favour: number;
	resourcePoints: number;
	introShown?: boolean;
}

export interface MiscellaniaDetailedSimulationResult {
	days: number;
	startingCoffer: number;
	endingCoffer: number;
	gpSpent: number;
	startingFavour: number;
	endingFavour: number;
	constantFavour: boolean;
	resourcePoints: number;
	resourcePointsGained: number;
}

export const MISCELLANIA_MAX_DAYS = 100;
export const MISCELLANIA_TRIP_SECONDS_PER_DAY = 15;
const MISCELLANIA_FAVOUR_SUBTRACTION = 131;
const MISCELLANIA_COFFER_DAILY_CAP = 75_000;

export function daysElapsedSince(timestamp: number, now = Date.now()): number {
	if (now <= timestamp) return 0;
	return Math.floor((now - timestamp) / Time.Day);
}

export function calculateMiscellaniaDays(state: MiscellaniaState | null, now = Date.now()): number {
	if (!state) return 1;
	return Math.max(1, Math.min(MISCELLANIA_MAX_DAYS, daysElapsedSince(state.lastClaimedAt, now)));
}

export function calculateMiscellaniaTripSeconds(days: number): number {
	return Math.max(1, Math.min(MISCELLANIA_MAX_DAYS, days)) * MISCELLANIA_TRIP_SECONDS_PER_DAY;
}

export function validateAreas(primaryArea: MiscellaniaAreaKey, secondaryArea: MiscellaniaAreaKey): string | null {
	if (primaryArea === secondaryArea) {
		return 'Primary and secondary area must be different.';
	}
	const fishingSet = new Set<MiscellaniaAreaKey>(['fishing_raw', 'fishing_cooked']);
	if (fishingSet.has(primaryArea) && fishingSet.has(secondaryArea)) {
		return 'Choose either Fishing (Raw) or Fishing (Cooked), not both.';
	}
	const hardwoodSet = new Set<MiscellaniaAreaKey>(['mahogany', 'teak', 'hardwood_both']);
	if (hardwoodSet.has(primaryArea) && hardwoodSet.has(secondaryArea)) {
		return 'Choose only one hardwood mode: mahogany, teak, or both.';
	}
	return null;
}

export function simulateDetailedMiscellania({
	days,
	startingCoffer,
	startingFavour,
	constantFavour,
	startingResourcePoints = 0
}: {
	days: number;
	startingCoffer: number;
	startingFavour: number;
	constantFavour: boolean;
	startingResourcePoints?: number;
}): MiscellaniaDetailedSimulationResult {
	const simDays = Math.max(1, Math.floor(days));
	const initialResourcePoints = Math.max(0, Math.floor(startingResourcePoints));
	let resourcePoints = initialResourcePoints;
	let currentFavour = Math.max(25, Math.min(100, startingFavour));
	let currentCoffer = Math.max(0, Math.floor(startingCoffer));

	for (let day = 1; day <= simDays; day++) {
		const cofferReduction = Math.min(
			5 + Math.floor(currentCoffer / 10),
			MISCELLANIA_COFFER_DAILY_CAP,
			currentCoffer
		);
		currentCoffer -= cofferReduction;
		const workerEffectiveness = Math.floor((cofferReduction * 100) / 8333);
		resourcePoints += Math.floor((workerEffectiveness * currentFavour) / 100);
		if (currentFavour > 32 && !constantFavour) {
			currentFavour = Math.max(
				32,
				currentFavour - Math.ceil((MISCELLANIA_FAVOUR_SUBTRACTION - currentFavour) / 15)
			);
		}
	}

	resourcePoints = Math.min(262_143, resourcePoints);

	return {
		days: simDays,
		startingCoffer: Math.max(0, Math.floor(startingCoffer)),
		endingCoffer: currentCoffer,
		gpSpent: Math.max(0, Math.floor(startingCoffer) - currentCoffer),
		startingFavour: Math.max(25, Math.min(100, startingFavour)),
		endingFavour: currentFavour,
		constantFavour,
		resourcePoints,
		resourcePointsGained: resourcePoints - initialResourcePoints
	};
}

export function normalizeMiscellaniaState(
	state: Partial<MiscellaniaState> | null | undefined,
	{
		now = Date.now(),
		primaryArea = 'maple',
		secondaryArea = 'herbs'
	}: {
		now?: number;
		primaryArea?: MiscellaniaAreaKey;
		secondaryArea?: MiscellaniaAreaKey;
	} = {}
): MiscellaniaState {
	const safePrimaryArea = normalizeMiscellaniaAreaKey(primaryArea, 'maple');
	const safeSecondaryArea = normalizeMiscellaniaAreaKey(secondaryArea, 'herbs');
	return {
		lastClaimedAt: typeof state?.lastClaimedAt === 'number' ? state.lastClaimedAt : now - Time.Day,
		lastUpdatedAt: typeof state?.lastUpdatedAt === 'number' ? state.lastUpdatedAt : now - Time.Day,
		lastTopupAt: typeof state?.lastTopupAt === 'number' ? state.lastTopupAt : now - Time.Day,
		primaryArea: normalizeMiscellaniaAreaKey(state?.primaryArea, safePrimaryArea),
		secondaryArea: normalizeMiscellaniaAreaKey(state?.secondaryArea, safeSecondaryArea),
		coffer: typeof state?.coffer === 'number' ? Math.max(0, Math.floor(state.coffer)) : 7_500_000,
		cofferAtLastClaim:
			typeof state?.cofferAtLastClaim === 'number'
				? Math.max(0, Math.floor(state.cofferAtLastClaim))
				: typeof state?.coffer === 'number'
					? Math.max(0, Math.floor(state.coffer))
					: 7_500_000,
		favour: typeof state?.favour === 'number' ? Math.max(25, Math.min(100, state.favour)) : 100,
		resourcePoints: typeof state?.resourcePoints === 'number' ? Math.max(0, Math.floor(state.resourcePoints)) : 0,
		introShown: typeof state?.introShown === 'boolean' ? state.introShown : false
	};
}

export function advanceMiscellaniaState(state: MiscellaniaState, now = Date.now()): MiscellaniaState {
	const elapsedSinceUpdate = daysElapsedSince(state.lastUpdatedAt, now);
	if (elapsedSinceUpdate <= 0) return state;
	const progressedSinceClaim = Math.max(0, daysElapsedSince(state.lastClaimedAt, state.lastUpdatedAt));
	const daysRemainingUntilCap = Math.max(0, MISCELLANIA_MAX_DAYS - progressedSinceClaim);
	const elapsed = Math.min(elapsedSinceUpdate, daysRemainingUntilCap);
	if (elapsed <= 0) return state;
	const sim = simulateDetailedMiscellania({
		days: elapsed,
		startingCoffer: state.coffer,
		startingFavour: state.favour,
		constantFavour: false,
		startingResourcePoints: state.resourcePoints
	});
	return {
		...state,
		coffer: sim.endingCoffer,
		favour: sim.endingFavour,
		resourcePoints: sim.resourcePoints,
		lastUpdatedAt: state.lastUpdatedAt + elapsed * Time.Day
	};
}

export function calculateTopupTripSeconds(state: MiscellaniaState, now = Date.now()): number {
	const elapsed = daysElapsedSince(state.lastTopupAt, now);
	return Math.max(1, Math.min(MISCELLANIA_MAX_DAYS, elapsed)) * MISCELLANIA_TRIP_SECONDS_PER_DAY;
}
