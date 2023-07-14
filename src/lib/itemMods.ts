export interface CustomItemData {
	cantBeSacrificed?: true;
	isSuperUntradeable?: boolean;
	cantDropFromMysteryBoxes?: boolean;
	cantBeDropped?: true;
	isDiscontinued?: true;
}

declare module 'oldschooljs/dist/meta/types' {
	interface Item {
		customItemData?: CustomItemData;
	}
}

export {};
