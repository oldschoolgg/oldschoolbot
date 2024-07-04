import { modifyItem } from '@oldschoolgg/toolkit';

import { allTeamCapes } from './data/misc';

interface CustomItemData {
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
}
