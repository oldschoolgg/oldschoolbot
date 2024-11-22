import { roll } from 'e';

export function convertPercentChance(percent: number) {
	return (1 / (percent / 100)).toFixed(1);
}

function gaussianRand(rolls = 3) {
	let rand = 0;
	for (let i = 0; i < rolls; i += 1) {
		rand += Math.random();
	}
	return rand / rolls;
}

export function gaussianRandom(min: number, max: number, rolls?: number) {
	return Math.floor(min + gaussianRand(rolls) * (max - min + 1));
}

export function perTimeUnitChance(
	durationMilliseconds: number,
	oneInXPerTimeUnitChance: number,
	timeUnitInMilliseconds: number,
	successFunction: () => unknown
) {
	const unitsPassed = Math.floor(durationMilliseconds / timeUnitInMilliseconds);
	const perUnitChance = oneInXPerTimeUnitChance / (timeUnitInMilliseconds / 60_000);

	for (let i = 0; i < unitsPassed; i++) {
		if (roll(perUnitChance)) {
			successFunction();
		}
	}
}
