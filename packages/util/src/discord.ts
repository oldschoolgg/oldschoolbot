import type { RNGProvider } from '@oldschoolgg/rng';

const discordEpoch = 1_420_070_400_000;

export function randomSnowflake(rng: RNGProvider): string {
	const timestamp = Date.now() - discordEpoch;
	const workerId = Math.floor(rng.rand() * 32);
	const processId = Math.floor(rng.rand() * 32);
	const increment = Math.floor(rng.rand() * 4096);

	const timestampPart = BigInt(timestamp) << 22n;
	const workerIdPart = BigInt(workerId) << 17n;
	const processIdPart = BigInt(processId) << 12n;
	const incrementPart = BigInt(increment);

	const snowflakeBigInt = timestampPart | workerIdPart | processIdPart | incrementPart;

	return snowflakeBigInt.toString();
}

export function isValidDiscordSnowflake(snowflake: string): boolean {
	return /^\d{17,19}$/.test(snowflake);
}
