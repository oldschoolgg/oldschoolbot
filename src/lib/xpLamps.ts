import LootTable from 'oldschooljs/dist/structures/LootTable';

interface XPLamp {
	itemID: number;
	amount: number;
	name: string;
}

export const XPLamps: XPLamp[] = [
	{
		itemID: 6796,
		amount: 20_000,
		name: 'Lamp'
	},
	{
		itemID: 21642,
		amount: 50_000,
		name: 'Antique lamp'
	},
	{
		itemID: 23516,
		amount: 100_000,
		name: 'Lamp of knowledge'
	},
	{
		itemID: 22320,
		amount: 1_000_000,
		name: "Champion's lamp"
	},
	{
		itemID: 11157,
		amount: 5_000_000,
		name: 'Dreamy lamp'
	}
];

export const LampTable = new LootTable()
	.add(6796, 1, 40)
	.add(21642, 1, 30)
	.add(23516, 1, 20)
	.add(22320, 1, 5)
	.add(11157, 1, 1);
