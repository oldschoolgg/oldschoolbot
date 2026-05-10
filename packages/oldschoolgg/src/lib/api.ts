import type { IEconomyTransactionsQuery } from '@oldschoolgg/schemas';
import wretch from 'wretch';
import { retry } from 'wretch/middlewares';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { EconomyTransactionsResponse } from '@/components/pages/Account/Staff/types.js';
import type { AuthenticatedUser, FullMinionData, SUserIdentity } from '../../../robochimp/src/http/api-types.js';
import type { ServiceStatus } from '../../../robochimp/src/structures/ServiceManager.js';

export type SimpleMinionInfo = {
	is_ironman: boolean;
	has_minion: boolean;
	bot: 'osb' | 'bso';
	total_level: number;
};

export type Account = {
	user_id: string;
	minions: SimpleMinionInfo[];
};

export type UsersMinionsResponse = {
	users: Account[];
};

const rawApiWretch = wretch(__API_URL__)
	.options({ credentials: 'include' })
	.middlewares([
		retry({
			maxAttempts: 10,
			delayTimer: 5000,
			retryOnNetworkError: true,
			delayRamp: (delay, nAttempts) => delay * nAttempts * nAttempts
		})
	]);

async function logOut() {
	localStorage.clear();
	globalState.setState({
		user: null
	});
	window.location.href = `${__API_URL__}/oauth/logout`;
}

export type GlobalState = {
	user: AuthenticatedUser | null;
};

export const globalState = create<GlobalState>(
	persist((): GlobalState => ({ user: null }) as GlobalState, {
		name: 'state'
	}) as any
);

async function syncState() {
	await rawApiWretch
		.url('/oauth/me')
		.get()
		.unauthorized(() => {
			logOut();
		})
		.json<OResponse<AuthenticatedUser>>(res => {
			if (!('error' in res)) {
				globalState.setState({
					user: res
				});
				return res;
			} else {
				logOut();
				return res.error;
			}
		});
}

type OResponse<T> = T | { error: string };

export const api = {
	logOut,
	syncState,
	user: {
		syncState,
		logOut
	},
	users: {
		fetchUserIdentity: (userId: string): Promise<SUserIdentity> => {
			return rawApiWretch.url(`/user/identity/${userId}`).get().json();
		}
	},
	minion: {
		listForUser: async (userId: string): Promise<UsersMinionsResponse> => {
			const res = await rawApiWretch
				.url(`/user/${userId}/minions`)
				.get()
				.unauthorized(() => {
					logOut();
				})
				.json<UsersMinionsResponse>();

			return res;
		},
		me: async (bot: 'osb' | 'bso') => {
			const res = await rawApiWretch
				.url(`/minion/${bot}/me`)
				.get()
				.unauthorized(() => {
					logOut();
				})
				.json<FullMinionData>();

			return res;
		},
		get: async (userId: string, bot: 'osb' | 'bso'): Promise<FullMinionData> => {
			const res = await rawApiWretch
				.url(`/user/${userId}/${bot}/minion`)
				.get()
				.unauthorized(() => {
					logOut();
				})
				.json<FullMinionData>();

			return res;
		}
	},
	staff: {
		fetchEconomyTransactions: (query: IEconomyTransactionsQuery): Promise<EconomyTransactionsResponse> => {
			return rawApiWretch.url(`/staff/economy-transactions`).json(query).post().json();
		},
		getBots: (): Promise<ServiceStatus[]> => {
			return rawApiWretch.url(`/staff/bots`).get().json();
		}
	}
};
