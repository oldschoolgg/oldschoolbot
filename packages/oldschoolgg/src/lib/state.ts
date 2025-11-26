import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { UserWithManageables } from './rawApi.js';

type GlobalState = {
	user: UserWithManageables | null;
};

export const globalState = create<GlobalState>()(
	persist(
		(_, __) => ({
			user: null
		}),
		{
			name: 'worp-storage'
		}
	)
);

globalState.subscribe(state => {
	console.log({ state });
});
