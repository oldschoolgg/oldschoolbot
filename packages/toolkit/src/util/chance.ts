interface RNGProvider {
	roll: (max: number) => boolean;
	randInt(min: number, max: number): number;
	randFloat(min: number, max: number): number;
	rand(): number;
	shuffle<T>(array: T[]): T[];
	pick<T>(array: T[]): T;
	percentChance(percent: number): boolean;
}

export function convertPercentChance(percent: number) {
	return (1 / (percent / 100)).toFixed(1);
}

function gaussianRand(rng: RNGProvider, rolls = 3) {
	let rand = 0;
	for (let i = 0; i < rolls; i += 1) {
		rand += rng.rand();
	}
	return rand / rolls;
}

export function gaussianRandom(rng: RNGProvider, min: number, max: number, rolls?: number) {
	return Math.floor(min + gaussianRand(rng, rolls) * (max - min + 1));
}

export function perTimeUnitChance(
	rng: RNGProvider,
	durationMilliseconds: number,
	oneInXPerTimeUnitChance: number,
	timeUnitInMilliseconds: number,
	successFunction: () => unknown
) {
	const unitsPassed = Math.floor(durationMilliseconds / timeUnitInMilliseconds);
	const perUnitChance = oneInXPerTimeUnitChance / (timeUnitInMilliseconds / 60_000);

	for (let i = 0; i < unitsPassed; i++) {
		if (rng.roll(perUnitChance)) {
			successFunction();
		}
	}
}
