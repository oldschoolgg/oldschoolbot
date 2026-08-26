import type { RNGProvider } from 'node-rng';
import { cryptoRng } from 'node-rng/crypto';

const discordEpoch = 1_420_070_400_000;

// Apply a variance.
// Example: For 1 day, with a one hour variance (ie. +/- 30 minutes):
// const variedAmount = applyVariance(1000 * 60 * 60 * 24, 1000 * 60 * 60)
function applyVariance(
	base: number,
	variance: number,
	{ rng = cryptoRng, onlyIncrement }: { rng?: RNGProvider; onlyIncrement?: boolean }
) {
	const randomTime = Math.floor(rng.rand() * variance);
	if (onlyIncrement) return base + randomTime;
	return base - Math.floor(variance / 2) + randomTime;
}

export function randomSnowflake(rng: RNGProvider): string {
	const variance = 1000 * 60 * 60 * 24 * 7;

	const timestamp = applyVariance(Date.now() - discordEpoch, variance, { rng });
	const workerId = Math.floor(rng.rand() * 32);
	const processId = Math.floor(rng.rand() * 32);
	const increment = Math.floor(rng.rand() * 4096);

	const timestampPart = BigInt(timestamp) << 22n;
	const workerIdPart = BigInt(applyVariance(workerId, 32, { rng, onlyIncrement: true })) << 17n;
	const processIdPart = BigInt(applyVariance(processId, 16, { rng, onlyIncrement: true })) << 12n;
	const incrementPart = BigInt(increment);

	const snowflakeBigInt = timestampPart | workerIdPart | processIdPart | incrementPart;

	return snowflakeBigInt.toString();
}

export function isValidDiscordSnowflake(snowflake: string): boolean {
	return /^\d{17,20}$/.test(snowflake);
}
