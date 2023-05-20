export interface CustomItemData {
	cantBeSacrificed?: true;
	isSuperUntradeable?: boolean;
	cantDropFromMysteryBoxes?: boolean;
	cantBeDropped?: true;
}

declare module 'oldschooljs/dist/meta/types' {
	interface Item {
		customItemData?: CustomItemData;
	}
}

export {};
