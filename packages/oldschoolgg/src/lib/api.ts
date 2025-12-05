
import { persist } from 'zustand/middleware';
import { create } from 'zustand';
import wretch from 'wretch';
import { retry } from 'wretch/middlewares';

import type { AuthenticatedUser } from '../../../robochimp/src/http/servers/api-types.js';

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
	// await rawApi.user.logOut();
	// localStorage.clear();
	// globalState.setState({
	// 	user: null
	// });
	// navigate('/login', { replace: true });
}

export type GlobalState = {
	user: AuthenticatedUser | null;
}

export const globalState = create<GlobalState>(
	persist((): GlobalState => ({ user: null } as GlobalState), {
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
	syncState,
	user: {
		syncState,
		logOut,
	},
};
