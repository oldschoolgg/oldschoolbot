export interface CustomItemData {
	cantBeSacrificed?: true;
}
declare module 'oldschooljs/dist/meta/types' {
	interface Item {
		customItemData?: CustomItemData;
	}
}

export {};
