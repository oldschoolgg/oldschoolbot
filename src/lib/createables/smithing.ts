import { Createable } from '.';
import itemID from '../util/itemID';

const Smithing: Createable[] = [
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
		smithingLevel: 1
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
		smithingLevel: 1
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
		smithingLevel: 1
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
		smithingLevel: 1
	},
	{
		name: 'Armadyl hilt',
		inputItems: {
			[itemID('Armadyl godsword')]: 1
		},
		outputItems: {
			[itemID('Godsword blade')]: 1,
			[itemID('Armadyl hilt')]: 1
		},
		smithingLevel: 1
	},
	{
		name: 'Bandos hilt',
		inputItems: {
			[itemID('Bandos godsword')]: 1
		},
		outputItems: {
			[itemID('Godsword blade')]: 1,
			[itemID('Bandos hilt')]: 1
		},
		smithingLevel: 1
	},
	{
		name: 'Saradomin hilt',
		inputItems: {
			[itemID('Saradomin godsword')]: 1
		},
		outputItems: {
			[itemID('Godsword blade')]: 1,
			[itemID('Saradomin hilt')]: 1
		},
		smithingLevel: 1
	},
	{
		name: 'Zamorak hilt',
		inputItems: {
			[itemID('Zamorak godsword')]: 1
		},
		outputItems: {
			[itemID('Godsword blade')]: 1,
			[itemID('Zamorak hilt')]: 1
		},
		smithingLevel: 1
	},
	{
		name: 'Dragonfire shield',
		inputItems: {
			[itemID('Draconic visage')]: 1,
			[itemID('Anti-dragon shield')]: 1
		},
		outputItems: {
			// Uncharged dragonfire shield
			11284: 1
		},
		smithingLevel: 90
	},
	{
		name: 'Dragonfire ward',
		inputItems: {
			[itemID('Skeletal visage')]: 1,
			[itemID('Anti-dragon shield')]: 1
		},
		outputItems: {
			// Uncharged Dragonfire ward
			22003: 1
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
	}
];

export default Smithing;
