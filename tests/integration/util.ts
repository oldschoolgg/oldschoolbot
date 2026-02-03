import { cryptoRng } from '@oldschoolgg/rng/crypto';
import type { IMember, IMessage, IUser } from '@oldschoolgg/schemas';
import { sleep } from '@oldschoolgg/toolkit';
import { vi } from 'vitest';

import { mockedId } from '../test-utils/misc.js';
import { mockClient, TestClient } from '../test-utils/mockClient.js';
import { createTestUser, mockUser, TestUser } from '../test-utils/mockUser.js';
import { TEST_CHANNEL_ID } from './constants.js';

export function mockIUser({ userId }: { userId: string }): IUser {
	const mocked = {
		id: userId,
		username: 'TestUser',
		bot: false
	};
	return mocked;
}

export function mockIMember({ userId }: { userId: string }): IMember {
	return {
		guild_id: mockedId(),
		user_id: userId,
		roles: [],
		permissions: []
	};
}

export function mockUserOption(userId?: string): MahojiUserOption {
	userId ??= mockedId();
	return {
		user: mockIUser({ userId }),
		member: mockIMember({ userId })
	};
}

export function mockMessage({ userId }: { userId?: string } = {}): IMessage {
	return {
		id: mockedId(),
		content: 'Test message',
		guild_id: '342983479501389826',
		author_id: userId ?? mockedId(),
		channel_id: TEST_CHANNEL_ID
	};
}

const originalMathRandom = Math.random;
export function mockMathRandom(value: number) {
	vi.spyOn(Math, 'random').mockImplementation(() => value);
	return () => (Math.random = originalMathRandom);
}

export async function promiseAllRandom<T>(tasks: (() => Promise<T>)[], maxJitterMs = 5): Promise<T[]> {
	const results: T[] = [];
	const shuffled = cryptoRng.shuffle(tasks);
	for (const fn of shuffled) {
		await sleep(Math.random() * maxJitterMs);
		results.push(await fn());
	}
	return results;
}

export { mockClient, mockedId, createTestUser, mockUser, TestUser, TestClient };
