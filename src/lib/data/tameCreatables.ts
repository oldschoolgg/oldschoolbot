import { Bank } from 'oldschooljs';

import { MaterialBank } from '../invention/MaterialBank';
import { Createable } from './createables';

export const tameCreatables: Createable[] = [
	{
		name: 'Runite igne claws',
		inputItems: new Bank({
			'Claws frame': 1,
			'Runite bar': 30,
			Leather: 10
		}),
		materialCost: new MaterialBank({
			metallic: 1000,
			strong: 500,
			flexible: 500,
			sharp: 500
		}),
		outputItems: new Bank({
			'Runite igne claws': 1
		}),
		requiredSkills: {
			smithing: 80,
			invention: 80,
			crafting: 80
		}
	},
	{
		name: 'Dragon igne claws',
		inputItems: new Bank({
			'Runite igne claws': 1,
			Leather: 10,
			'Dragon claws': 1
		}),
		materialCost: new MaterialBank({
			metallic: 1500,
			strong: 200,
			flexible: 200,
			sharp: 200,
			orikalkum: 50
		}),
		outputItems: new Bank({
			'Dragon igne claws': 1
		}),
		requiredSkills: {
			smithing: 85,
			invention: 85,
			crafting: 85
		}
	},
	{
		name: 'Barrows igne claws',
		inputItems: new Bank({
			'Dragon igne claws': 1,
			Leather: 10
		}),
		materialCost: new MaterialBank({
			metallic: 1500,
			strong: 200,
			flexible: 200,
			sharp: 200,
			barrows: 100
		}),
		outputItems: new Bank({
			'Barrows igne claws': 1
		}),
		requiredSkills: {
			smithing: 90,
			invention: 90,
			crafting: 90
		}
	},
	{
		name: 'Volcanic igne claws',
		inputItems: new Bank({
			'Barrows igne claws': 1,
			Leather: 10,
			'Obsidian shards': 250,
			'Volcanic shards': 2
		}),
		materialCost: new MaterialBank({
			metallic: 1500,
			strong: 200,
			flexible: 200,
			sharp: 200
		}),
		outputItems: new Bank({
			'Volcanic igne claws': 1
		}),
		requiredSkills: {
			smithing: 95,
			invention: 95,
			crafting: 95
		}
	},
	{
		name: 'Drygore igne claws',
		inputItems: new Bank({
			'Volcanic igne claws': 1,
			Leather: 10
		}),
		materialCost: new MaterialBank({
			metallic: 1500,
			strong: 200,
			flexible: 200,
			sharp: 200,
			drygore: 2000
		}),
		outputItems: new Bank({
			'Drygore igne claws': 1
		}),
		requiredSkills: {
			smithing: 100,
			invention: 100,
			crafting: 100
		}
	},
	{
		name: 'Dwarven igne claws',
		inputItems: new Bank({
			'Drygore igne claws': 1,
			Leather: 10
		}),
		materialCost: new MaterialBank({
			metallic: 1500,
			strong: 200,
			flexible: 200,
			sharp: 200,
			dwarven: 2500
		}),
		outputItems: new Bank({
			'Dwarven igne claws': 1
		}),
		requiredSkills: {
			smithing: 110,
			invention: 110,
			crafting: 110
		}
	},
	{
		name: 'Gorajan igne claws',
		inputItems: new Bank({
			'Dwarven igne claws': 1,
			Leather: 10,
			'Gorajan shards': 2
		}),
		materialCost: new MaterialBank({
			metallic: 2000,
			strong: 200,
			flexible: 200,
			sharp: 200
		}),
		outputItems: new Bank({
			'Gorajan igne claws': 1
		}),
		requiredSkills: {
			smithing: 120,
			invention: 120,
			crafting: 120
		}
	}
];
