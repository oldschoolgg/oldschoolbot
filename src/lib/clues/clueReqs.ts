import { Bank } from 'oldschooljs';

import { Skills } from '../types';
import { ClueTier } from './clueTiers';

export interface ClueReq {
	itemCost?: Bank;
	skillReqs?: Partial<Skills>;
	hideyHoleID?: number;
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
		{
			hideyHoleID: 1
		},
		{
			hideyHoleID: 2
		},
		{
			hideyHoleID: 3
		}
	]
};
