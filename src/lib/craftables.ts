import { Bank } from './types';
import itemID from './util/itemID';

interface Craftable {
	name: string;
	outputItems: Bank;
	inputItems: Bank;
	smithingLevel?: number;
}

const Craftables: Craftable[] = [
	{
		name: 'Godsword blade',
		inputItems: {
			[itemID('Godsword shard 1')]: 1,
			[itemID('Godsword shard 2')]: 1,
			[itemID('Godsword shard 3')]: 1
		},
		outputItems: {
			[itemID('Godsword blade')]: 1
		},
		smithingLevel: 80
	},
	{
		name: 'Armadyl godsword',
		inputItems: {
			[itemID('Godsword blade')]: 1,
			[itemID('Armadyl hilt')]: 1
		},
		outputItems: {
			[itemID('Armadyl godsword')]: 1
		},
		smithingLevel: 80
	},
	{
		name: 'Bandos godsword',
		inputItems: {
			[itemID('Godsword blade')]: 1,
			[itemID('Bandos hilt')]: 1
		},
		outputItems: {
			[itemID('Bandos godsword')]: 1
		},
		smithingLevel: 80
	},
	{
		name: 'Saradomin godsword',
		inputItems: {
			[itemID('Godsword blade')]: 1,
			[itemID('Saradomin hilt')]: 1
		},
		outputItems: {
			[itemID('Saradomin godsword')]: 1
		},
		smithingLevel: 80
	},
	{
		name: 'Zamorak godsword',
		inputItems: {
			[itemID('Godsword blade')]: 1,
			[itemID('Zamorak hilt')]: 1
		},
		outputItems: {
			[itemID('Zamorak godsword')]: 1
		},
		smithingLevel: 80
	},
	{
		name: 'Dragonfire shield',
		inputItems: {
			[itemID('Draconic visage')]: 1
		},
		outputItems: {
			[itemID('Dragonfire shield')]: 1
		},
		smithingLevel: 90
	},
	{
		name: 'Dragonfire ward',
		inputItems: {
			[itemID('Skeletal visage')]: 1
		},
		outputItems: {
			[itemID('Dragonfire ward')]: 1
		},
		smithingLevel: 90
	},
	{
		name: 'Infernal pickaxe',
		inputItems: {
			[itemID('Dragon pickaxe')]: 1,
			[itemID('Smouldering stone')]: 1
		},
		outputItems: {
			[itemID('Infernal pickaxe')]: 1
		},
		smithingLevel: 85
	},
	{
		name: 'Malediction ward',
		inputItems: {
			[itemID('Malediction shard 1')]: 1,
			[itemID('Malediction shard 2')]: 1,
			[itemID('Malediction shard 3')]: 1
		},
		outputItems: {
			[itemID('Malediction ward')]: 1
		},
		smithingLevel: 1
	},
	{
		name: 'Odium ward',
		inputItems: {
			[itemID('Odium shard 1')]: 1,
			[itemID('Odium shard 2')]: 1,
			[itemID('Odium shard 3')]: 1
		},
		outputItems: {
			[itemID('Odium ward')]: 1
		},
		smithingLevel: 1
	},
	{
		name: 'Crystal key',
		inputItems: {
			[itemID('Loop half of key')]: 1,
			[itemID('Tooth half of key')]: 1
		},
		outputItems: {
			[itemID('Crystal key')]: 1
		},
		smithingLevel: 1
	}
];

export default Craftables;
