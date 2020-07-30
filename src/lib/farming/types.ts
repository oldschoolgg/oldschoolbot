export enum FarmingPatchTypes {
	Herb = 'herb',
	FruitTree = 'fruit tree',
	Tree = 'tree',
	Allotment = 'allotment',
	Cactus = 'cactus',
	Bush = 'bush',
	Flower = 'flower',
	Spirit = 'spirit',
	Hardwood = 'hardwood',
	Seaweed = 'seaweed',
	Vine = 'vine',
	Calquat = 'calquat',
	Redwood = 'redwood',
	Crystal = 'crystal',
	Celastrus = 'celastrus',
	Hespori = 'hespori'
}

export interface PatchData {
	lastPlanted: string;
	patchStage: boolean; // false -> nothing planted, true -> something planted
	plantTime: number;
	lastQuantity: number;
	lastUpgradeType: 'compost' | 'supercompost' | 'ultracompost' | '';
	lastPayment: boolean;
}
