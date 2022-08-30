import { Bank } from 'oldschooljs';

import { MaterialBank } from '../invention/MaterialBank';
import { Createable } from './createables';

export const tameCreatables: Createable[] = [
	{
		name: 'Runite igne claws',
		inputItems: new Bank({
			'Igne gear frame': 1,
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
	},
	// Armor
	{
		name: 'Dragon igne armor',
		inputItems: new Bank({
			'Igne gear frame': 1,
			Leather: 10
		}),
		materialCost: new MaterialBank({
			metallic: 1500,
			strong: 200,
			protective: 1000,
			orikalkum: 80
		}),
		outputItems: new Bank({
			'Dragon igne armor': 1
		}),
		requiredSkills: {
			smithing: 85,
			invention: 85,
			crafting: 85
		}
	},
	{
		name: 'Barrows igne armor',
		inputItems: new Bank({
			'Dragon igne armor': 1,
			Leather: 10
		}),
		materialCost: new MaterialBank({
			metallic: 1500,
			strong: 200,
			protective: 200,
			barrows: 100
		}),
		outputItems: new Bank({
			'Barrows igne armor': 1
		}),
		requiredSkills: {
			smithing: 90,
			invention: 90,
			crafting: 90
		}
	},
	{
		name: 'Volcanic igne armor',
		inputItems: new Bank({
			'Barrows igne armor': 1,
			Leather: 10,
			'Obsidian shards': 250,
			'Volcanic shards': 2
		}),
		materialCost: new MaterialBank({
			metallic: 1500,
			strong: 200,
			protective: 200
		}),
		outputItems: new Bank({
			'Volcanic igne armor': 1
		}),
		requiredSkills: {
			smithing: 95,
			invention: 95,
			crafting: 95
		}
	},
	{
		name: 'Justiciar igne armor',
		inputItems: new Bank({
			Leather: 10,
			'Volcanic igne armor': 1
		}),
		materialCost: new MaterialBank({
			metallic: 1500,
			strong: 200,
			protective: 200,
			justiciar: 3
		}),
		outputItems: new Bank({
			'Justiciar igne armor': 1
		}),
		requiredSkills: {
			smithing: 95,
			invention: 95,
			crafting: 95
		}
	},
	{
		name: 'Drygore igne armor',
		inputItems: new Bank({
			'Justiciar igne armor': 1,
			Leather: 10
		}),
		materialCost: new MaterialBank({
			metallic: 1500,
			strong: 200,
			protective: 200,
			drygore: 2500
		}),
		outputItems: new Bank({
			'Drygore igne armor': 1
		}),
		requiredSkills: {
			smithing: 100,
			invention: 100,
			crafting: 100
		}
	},
	{
		name: 'Dwarven igne armor',
		inputItems: new Bank({
			'Drygore igne armor': 1,
			Leather: 10
		}),
		materialCost: new MaterialBank({
			metallic: 1500,
			strong: 200,
			protective: 200,
			dwarven: 3000
		}),
		outputItems: new Bank({
			'Dwarven igne armor': 1
		}),
		requiredSkills: {
			smithing: 110,
			invention: 110,
			crafting: 110
		}
	},
	{
		name: 'Gorajan igne armor',
		inputItems: new Bank({
			'Dwarven igne armor': 1,
			Leather: 10,
			'Gorajan shards': 2
		}),
		materialCost: new MaterialBank({
			metallic: 2000,
			strong: 200,
			protective: 500
		}),
		outputItems: new Bank({
			'Gorajan igne armor': 1
		}),
		requiredSkills: {
			smithing: 120,
			invention: 120,
			crafting: 120
		}
	}
];
