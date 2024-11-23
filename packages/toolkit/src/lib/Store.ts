export type Product = {
	id: number;
	name: string;
	codePrefix: string;
} & (
	| {
			type: 'bit';
			bit: StoreBitfield;
	  }
	| {
			type: 'active';
	  }
);

export enum ProductID {
	SetOneNaturePermanentBankBackgrounds = 1,
	SetTwoDarkPermanentBankBackgrounds = 2,
	SetThreeTransparentAnimalsPermanentBankBackgrounds = 3,
	SetFourGirlsPermanentBankBackgrounds = 4,
	DynamicFarmingBackgroundPermanentBankBackgrounds = 5,
	DynamicToBBackgroundPermanentBankBackgrounds = 6,
	DynamicCoXBackgroundPermanentBankBackgrounds = 7,
	OneHourDoubleLoot = 8,
	ThreeHourDoubleLoot = 9,
	HalloweenItemIconPack = 10
}

export enum StoreBitfield {
	HasSetOneNaturePermanentBankBackgrounds = 1,
	HasSetTwoDarkPermanentBankBackgrounds = 2,
	HasSetThreeTransparentAnimalsPermanentBankBackgrounds = 3,
	HasSetFourGirlsPermanentBankBackgrounds = 4,
	HasDynamicFarmingBackgroundPermanentBankBackgrounds = 5,
	HasDynamicToBBackgroundPermanentBankBackgrounds = 6,
	HasDynamicCoXBackgroundPermanentBankBackgrounds = 7,
	HalloweenItemIconPack = 10
}

export const products: Product[] = [
	{
		id: ProductID.SetOneNaturePermanentBankBackgrounds,
		name: 'Set 1 (Nature) Permanent Bank Background Unlock',
		type: 'bit',
		codePrefix: 'BG',
		bit: StoreBitfield.HasSetOneNaturePermanentBankBackgrounds
	},
	{
		id: ProductID.SetTwoDarkPermanentBankBackgrounds,
		name: 'Set 2 (Dark) Permanent Bank Background Unlock',
		type: 'bit',
		codePrefix: 'BG',
		bit: StoreBitfield.HasSetTwoDarkPermanentBankBackgrounds
	},
	{
		id: ProductID.SetThreeTransparentAnimalsPermanentBankBackgrounds,
		name: 'Set 3 (Transparent Animals) Permanent Bank Background Unlock',
		type: 'bit',
		codePrefix: 'BG',
		bit: StoreBitfield.HasSetThreeTransparentAnimalsPermanentBankBackgrounds
	},
	{
		id: ProductID.SetFourGirlsPermanentBankBackgrounds,
		name: 'Set 4 (Girls) Permanent Bank Background Unlock',
		type: 'bit',
		codePrefix: 'BG',
		bit: StoreBitfield.HasSetFourGirlsPermanentBankBackgrounds
	},
	{
		id: ProductID.DynamicFarmingBackgroundPermanentBankBackgrounds,
		name: 'Dynamic Farming Background - Permanent Bank Background Unlock',
		type: 'bit',
		codePrefix: 'BG',
		bit: StoreBitfield.HasDynamicFarmingBackgroundPermanentBankBackgrounds
	},
	{
		id: ProductID.DynamicToBBackgroundPermanentBankBackgrounds,
		name: 'Dynamic ToB Background - Permanent Bank Background Unlock',
		type: 'bit',
		codePrefix: 'BG',
		bit: StoreBitfield.HasDynamicToBBackgroundPermanentBankBackgrounds
	},
	{
		id: ProductID.DynamicCoXBackgroundPermanentBankBackgrounds,
		name: 'Dynamic CoX Background - Permanent Bank Background Unlock',
		type: 'bit',
		codePrefix: 'BG',
		bit: StoreBitfield.HasDynamicCoXBackgroundPermanentBankBackgrounds
	},
	{
		id: ProductID.OneHourDoubleLoot,
		name: 'One Hour Double Loot (Single Use)',
		type: 'active',
		codePrefix: 'DOUBLE'
	},
	{
		id: ProductID.ThreeHourDoubleLoot,
		name: 'Three Hour Double Loot (Single Use)',
		type: 'active',
		codePrefix: 'DOUBLE'
	},
	{
		id: ProductID.HalloweenItemIconPack,
		name: 'Halloween Item Icon and Background Pack',
		type: 'bit',
		codePrefix: 'BG',
		bit: StoreBitfield.HalloweenItemIconPack
	}
];
