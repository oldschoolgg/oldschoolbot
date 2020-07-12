export class BonusOpenables {
	public item: string;
	public qty: number | [number, number];
	public weight: number;
	public skill: string;
	public req: number | [number, number];
	public constructor(){
		this.item = "";
		this.qty = 0;
		this.weight = 256;
		this.skill = "";
		this.req = 1;
	}
}

export const BrimstoneChestBonus: BonusOpenables[] = [
	{
		item: 'Raw tuna',
		qty: [100, 350],
		weight: 600,
		skill: "fishing",
		req: [1, 39]
	},
	{
		item: 'Raw lobster',
		qty: [100, 350],
		weight: 600,
		skill: "fishing",
		req: [40, 59]
	},
	{
		item: 'Raw swordfish',
		qty: [100, 300],
		weight: 600,
		skill: "fishing",
		req: [50, 61]
	},
	{
		item: 'Raw monkfish',
		qty: [100, 300],
		weight: 600,
		skill: "fishing",
		req: [62, 75]
	},
	{
		item: 'Raw shark',
		qty: [100, 250],
		weight: 600,
		skill: "fishing",
		req: [76, 78]
	},
	{
		item: 'Raw sea turtle',
		qty: [80, 200],
		weight: 600,
		skill: "fishing",
		req: [79, 80]
	},
	{
		item: 'Raw manta ray',
		qty: [80, 160],
		weight: 600,
		skill: "fishing",
		req: [81, 99]
	}
]

export const LarransSmallChestBonus: BonusOpenables[] = [
	{
		item: 'Raw tuna', 
		qty: 204,
		weight: 3,
		skill: "fishing",
		req: [1, 39]
	},
	{
		item: 'Raw lobster',
		qty: 214,
		weight: 3,
		skill: "fishing",
		req: [40, 49]
	},
	{
		item:'Raw swordfish',
		qty: 224,
		weight: 3,
		skill: 'fishing',
		req: [50, 61]
	},
	{
		item: 'Raw monkfish',
		qty: 234,
		weight: 3,
		skill: 'fishing',
		req: [62, 75]
	},
	{
		item: 'Raw shark',
		qty: 126,
		weight: 3,
		skill: 'fishing',
		req: [76, 78]
	},
	{
		item: 'Raw sea turtle',
		qty: 136,
		weight: 3,
		skill: 'fishing',
		req: [79, 80]
	},
	{
		item: 'Raw manta ray',
		qty: 116, 
		weight: 3,
		skill: 'fishing',
		req: 81
	}
]

export const LarransBigChestBonus: BonusOpenables[] = [
	{
		item: 'Raw tuna', 
		qty: [150, 520],
		weight: 3,
		skill: "fishing",
		req: [1, 39]
	},
	{
		item: 'Raw lobster',
		qty: [150, 525],
		weight: 3,
		skill: "fishing",
		req: [40, 49]
	},
	{
		item:'Raw swordfish',
		qty: [150, 450],
		weight: 3,
		skill: 'fishing',
		req: [50, 61]
	},
	{
		item: 'Raw monkfish',
		qty: [150, 450],
		weight: 3,
		skill: 'fishing',
		req: [62, 75]
	},
	{
		item: 'Raw shark',
		qty: [150, 375],
		weight: 3,
		skill: 'fishing',
		req: [76, 78]
	},
	{
		item: 'Raw sea turtle',
		qty: [120, 300],
		weight: 3,
		skill: 'fishing',
		req: [79, 80]
	},
	{
		item: 'Raw manta ray',
		qty: [125, 235], 
		weight: 3,
		skill: 'fishing',
		req: 81
	}
]

module.exports = {
	BrimstoneChestBonus,
	LarransSmallChestBonus,
	LarransBigChestBonus,
	BonusOpenables
};