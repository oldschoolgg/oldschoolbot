import { bool, integer, nativeMath, nodeCrypto, real } from 'random-js';

const randEngine = process.env.TEST ? nativeMath : nodeCrypto;

export function cryptoRand(min: number, max: number) {
	return integer(min, max)(randEngine);
}

export function randFloat(min: number, max: number) {
	return real(min, max)(randEngine);
}

export function percentChance(percent: number) {
	return bool(percent / 100)(randEngine);
}

export function roll(max: number) {
	return cryptoRand(1, max) === 1;
}

export function perHourChance(
	durationMilliseconds: number,
	oneInXPerHourChance: number,
	successFunction: () => unknown
) {
	const minutesPassed = Math.floor(durationMilliseconds / 60_000);
	const perMinuteChance = oneInXPerHourChance * 60;

	for (let i = 0; i < minutesPassed; i++) {
		if (roll(perMinuteChance)) {
			successFunction();
		}
	}
}
