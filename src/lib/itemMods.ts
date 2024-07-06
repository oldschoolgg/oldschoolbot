import { modifyItem } from '@oldschoolgg/toolkit';

import { allTeamCapes } from './data/misc';

export interface CustomItemData {
	cantBeSacrificed?: true;
	isSuperUntradeable?: boolean;
	cantDropFromMysteryBoxes?: boolean;
	cantBeDropped?: true;
	isDiscontinued?: true;
	superTradeableButTradeableOnGE?: true;
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
