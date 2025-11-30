import { create } from 'zustand';

import type { StateUser } from './rawApi.js';

type GlobalState = {
	user: StateUser | null;
};

export const globalState = create<GlobalState>()((_, __) => ({
	user: null
}));

globalState.subscribe(state => {
	console.log({ state });
});
