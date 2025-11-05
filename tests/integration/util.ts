import { cryptoRng } from '@oldschoolgg/rng';
import type { IMember, IMessage, IUser } from '@oldschoolgg/schemas';
import { sleep } from '@oldschoolgg/toolkit';
import { vi } from 'vitest';

import { mockedId } from '../test-utils/misc.js';
import { mockClient, TestClient } from '../test-utils/mockClient.js';
import { createTestUser, mockUser, TestUser } from '../test-utils/mockUser.js';

export const TEST_CHANNEL_ID = '1111111111111111';

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

class MockInteraction {
	id = '111155555';
	__response__: any = {};
	channelId = TEST_CHANNEL_ID;
	async deferReply() {
		return Promise.resolve();
	}
	async editReply(res: any) {
		this.__response__ = res;
	}
	async followUp(res: any) {
		this.__response__ = res;
	}
	async reply(res: any) {
		this.__response__ = res;
	}

	mUser: MUser;
	user = {
		id: '123456789'
	};
	constructor({ user }: { user: MUser }) {
		this.mUser = user;
		this.user.id = user.id;
	}

	async confirmation() {
		return Promise.resolve();
	}

	async makePaginatedMessage() {
		return Promise.resolve();
	}

	async makeParty(): Promise<MUser[]> {
		return [this.mUser];
	}

	async defer() {
		return Promise.resolve();
	}

	async returnStringOrFile() {
		return Promise.resolve();
	}
}

export function mockInteraction({ user }: { user: MUser }): MInteraction {
	return new MockInteraction({ user }) as any as MInteraction;
}

export function mockMessage({ userId }: { userId: string }): IMessage {
	return {
		id: mockedId(),
		content: 'Test message',
		guild_id: '342983479501389826',
		author_id: userId,
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
