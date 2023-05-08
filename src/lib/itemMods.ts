import { modifyItem } from '@oldschoolgg/toolkit';

interface CustomItemData {
	cantBeSacrificed?: true;
}
declare module 'oldschooljs/dist/meta/types' {
	interface Item {
		customItemData?: CustomItemData;
	}
}

modifyItem('Egg', {
	buy_limit: 50
});

modifyItem('Coal', {
	buy_limit: 5
});

export {};
