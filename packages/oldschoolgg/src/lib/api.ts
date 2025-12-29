import wretch from 'wretch';
import { retry } from 'wretch/middlewares';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { AuthenticatedUser, FullMinionData } from '../../../robochimp/src/http/servers/api-types.js';
import { EconomyTransactionsQuery, EconomyTransactionsResponse } from '@/components/Staff/economyTransactions.js';

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
	const res = await rawApiWretch.url('/oauth/me').get().json<OResponse<AuthenticatedUser>>();

	if (!('error' in res)) {
		globalState.setState({
			user: res
		});
		return res;
	} else {
		logOut();
		return res.error;
	}
}

type OError = {
	error: string;
};
type OResponse<T> = T | { error: string };

export const api = {
	logOut,
	syncState,
	user: {
		syncState,
		logOut
	},
	minion: {
		me: async (bot: 'osb' | 'bso') => {
			const res = await rawApiWretch
				.url(`/minion/${bot}/me`)
				.get()
				.unauthorized(() => {
					logOut();
				})
				.json<FullMinionData>();

			return res;
		}
	},
	staff: {
		fetchEconomyTransactions: (
			query: EconomyTransactionsQuery
		): Promise<EconomyTransactionsResponse> => {
			const params = new URLSearchParams();

			params.append('bot', query.bot);

			if (query.sender) params.append('sender', query.sender);
			if (query.recipient) params.append('recipient', query.recipient);
			if (query.guild_id) params.append('guild_id', query.guild_id);
			if (query.type) params.append('type', query.type);
			if (query.date_from) params.append('date_from', query.date_from);
			if (query.date_to) params.append('date_to', query.date_to);
			if (query.sort_by) params.append('sort_by', query.sort_by);
			if (query.sort_order) params.append('sort_order', query.sort_order);
			if (query.limit !== undefined) params.append('limit', query.limit.toString());
			if (query.offset !== undefined) params.append('offset', query.offset.toString());

			return rawApiWretch.url(`/economy-transactions?${params.toString()}`).get().json();
		}
	}
};
