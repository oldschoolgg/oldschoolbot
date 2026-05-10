export interface MoidSourceItem {
	id: number;
	name: string;
	examine?: string;
	exchange: boolean;
	members: boolean;
	stackable: number;
	value: number;
	notedId: number;
	placeholderId: number;
	inventoryModel: number;
	weight: number;
	category: number;
	actInv: string[];
	actWorld: string[];
	configName: string;
	colorFind?: number[];
	colorReplace?: number[];
	params?: any;
	countCo?: number[];
	countObj?: number[];
	textureFind?: number[];
	textureReplace?: number[];
}

export interface GESourceItem {
	examine: string;
	id: number;
	members: boolean;
	lowalch?: number;
	limit?: number;
	value: number;
	highalch?: number;
	icon: string;
	name: string;
}
