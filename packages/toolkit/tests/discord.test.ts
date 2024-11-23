import { expect, test } from 'vitest';
import { randomSnowflake } from '../src/util';

test('generateSnowflake generates a valid snowflake', () => {
	const snowflake = randomSnowflake();
	const snowflakeBigInt = BigInt(snowflake);

	const timestamp = Number(snowflakeBigInt >> 22n) + 1_420_070_400_000;
	const date = new Date(timestamp);
	const now = new Date();

	expect(date.getTime()).toBeLessThanOrEqual(now.getTime());
	expect(date.getFullYear()).toBeGreaterThanOrEqual(2015);

	const workerId = Number((snowflakeBigInt & (0x1fn << 17n)) >> 17n);
	expect(workerId).toBeGreaterThanOrEqual(0);
	expect(workerId).toBeLessThanOrEqual(31);

	const processId = Number((snowflakeBigInt & (0x1fn << 12n)) >> 12n);
	expect(processId).toBeGreaterThanOrEqual(0);
	expect(processId).toBeLessThanOrEqual(31);

	const increment = Number(snowflakeBigInt & 0xf_ffn);
	expect(increment).toBeGreaterThanOrEqual(0);
	expect(increment).toBeLessThanOrEqual(4095);
});
