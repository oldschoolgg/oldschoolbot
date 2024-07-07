import { modifyItem } from '@oldschoolgg/toolkit';

import { allTeamCapes } from 'oldschooljs/dist/data/itemConstants';
import getOSItem from './util/getOSItem';

export interface CustomItemData {
	cantBeSacrificed?: true;
}
declare module 'oldschooljs/dist/meta/types' {
	interface Item {
		customItemData?: CustomItemData;
	}
}

for (const item of allTeamCapes) {
	modifyItem(item.id, {
		price: 100
	});
	if (getOSItem(item.id).price !== 100) {
		throw new Error(`Failed to modify price of item ${item.id}`);
	}
}
