import type { Bank } from 'oldschooljs';

import type { Skills } from '../types';
import type { ClueTier } from './clueTiers';
import { allStashUnitTiers } from './stashUnits';

interface ClueReq {
	itemCost?: Bank;
	skillReqs?: Partial<Skills>;
	stashUnitID?: number;
	weight?: number;
}

export interface ClueReqs {
	tier: ClueTier['name'];
	reqs: ClueReq[];
}

export const beginnerReqs: ClueReqs = {
	tier: 'Beginner',
	reqs: [
		{
			skillReqs: {
				cooking: 15
			}
		},
		{
			skillReqs: {
				cooking: 20
			}
		},
		{
			skillReqs: {
				fishing: 10
			}
		},
		{
			skillReqs: {
				fishing: 20
			}
		},
		{
			skillReqs: {
				mining: 15
			}
		},
		{
			skillReqs: {
				crafting: 14
			}
		},
		{
			skillReqs: {
				crafting: 18
			}
		},
		...allStashUnitTiers.find(i => i.tier === 'Beginner')!.units.map(i => ({ stashUnitID: i.id }))
	]
};
