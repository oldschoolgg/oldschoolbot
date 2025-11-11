import { vi } from 'vitest';
import '../../src/lib/safeglobals.js';

vi.mock('../../src/lib/workers/index.js', { spy: true });

// @ts-expect-error
global.ActivityManager = {
	getActivityOfUser: () => null,
	minionIsBusy: () => false
};

const transactMock = {
	default: vi.fn(async () => ({})),
	transactItemsFromBank: vi.fn(async () => ({}))
};

const userQueuesMock = {
	addToUserQueue: vi.fn(async (_userID: string, fn?: () => Promise<unknown>) => {
		if (fn) return fn();
	})
};

if (!(globalThis as any).prisma) {
	(globalThis as any).prisma = {
		$queryRaw: async () => [{ id: '1234567890' }],

		userStats: {
			findFirstOrThrow: async () => ({ user_id: 123n })
		},

		tableBank: {
			findFirstOrThrow: async () => ({ id: 1 })
		},

		tableBankItem: {
			count: async () => 0
		},

		activity: {
			count: async () => 0
		}
	} as any;
}

vi.mock('../../src/lib/util/transactItemsFromBank.js', () => transactMock);
vi.mock('@/lib/util/transactItemsFromBank.js', () => transactMock);

vi.mock('../../src/lib/util/userQueues.js', () => userQueuesMock);
vi.mock('@/lib/util/userQueues.js', () => userQueuesMock);

vi.mock('../../src/lib/MUser.js', async importOriginal => {
	const real = await importOriginal<typeof import('../../src/lib/MUser.js')>();
	const MUserClass = real.MUserClass;

	(MUserClass.prototype as any).fetchUserStat = vi.fn(async () => ({}));
	(MUserClass.prototype as any).statsBankUpdate = vi.fn(async () => {});

	const baseUser = {
		id: '1234567890',
		bitfield: [],
		minion_hasBought: true,
		minion_ironman: false
	};

	return {
		...real,
		MUserClass,
		mUserFetch: vi.fn(async () => baseUser),
		srcMUserFetch: vi.fn(async () => baseUser)
	};
});

vi.mock('@/lib/MUser.js', async importOriginal => {
	const real = await importOriginal<typeof import('../../src/lib/MUser.js')>();
	const MUserClass = real.MUserClass;

	(MUserClass.prototype as any).fetchUserStat = vi.fn(async () => ({}));
	(MUserClass.prototype as any).statsBankUpdate = vi.fn(async () => {});

	const baseUser = {
		id: '1234567890',
		bitfield: [],
		minion_hasBought: true,
		minion_ironman: false
	};

	return {
		...real,
		MUserClass,
		mUserFetch: vi.fn(async () => baseUser),
		srcMUserFetch: vi.fn(async () => baseUser)
	};
});
