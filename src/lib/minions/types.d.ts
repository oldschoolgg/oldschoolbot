import { Image } from 'canvas';

import { Bank } from '../types';
import { PerkTier } from '../constants';

export interface BankBackground {
	image: Image | null;
	id: number;
	name: string;
	collectionLogItemsNeeded?: Bank;
	perkTierNeeded?: PerkTier;
	gpCost?: number;
	itemCost?: Bank;
}
