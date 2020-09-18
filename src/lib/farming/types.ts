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
	patchPlanted: boolean; // false -> nothing planted, true -> something planted
	plantTime: number;
	lastQuantity: number;
	lastUpgradeType: 'compost' | 'supercompost' | 'ultracompost' | '';
	lastPayment: boolean;
}

export interface TitheFarmStats {
	titheFarmsCompleted: number;
	titheFarmPoints: number;
}

export interface FarmingContracts {
	contractStatus: boolean;
	contractType: 'easy' | 'medium' | 'hard' | '';
	plantToGrow: string | null;
	seedPatchTier: 0 | 1 | 2 | 3 | 4 | 5;
	plantTier: 0 | 1 | 2 | 3 | 4 | 5;
	contractsCompleted: number;
}
