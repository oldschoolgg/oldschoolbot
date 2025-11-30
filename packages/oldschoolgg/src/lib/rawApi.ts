import { navigate } from 'wouter/use-browser-location';
import wretch from 'wretch';
import { retry } from 'wretch/middlewares';

import { globalState } from '@/lib/state.js';

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
	navigate('/login', { replace: true });
}

async function syncState() {
	// const res = await rawApi.user.me();
	// if (!('error' in res)) {
	// 	globalState.setState({
	// 		user: res
	// 	});
	// } else {
	// 	logOut();
	// }
}

export const rawApi = {
	syncState,
	user: {
		me: async () => rawApiWretch.url('/users/me').get().json()
	}
};

export type StateUser = {
	id: string;
	username: string;
};
