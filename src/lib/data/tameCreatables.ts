import { Bank } from 'oldschooljs';

import { MaterialBank } from '../invention/MaterialBank';
import getOSItem from '../util/getOSItem';
import resolveItems from '../util/resolveItems';
import { Createable } from './createables';

const eagleTameCreatables: Createable[] = [
	{
		name: 'Demonic jibwings',
		materialCost: new MaterialBank().add('strong', 500),
		inputItems: new Bank().add('Dark totem', 10),
		outputItems: new Bank().add('Demonic jibwings'),
		requiredSkills: {
			invention: 90,
			crafting: 90,
			smithing: 90
		}
	},
	{
		name: 'Abyssal jibwings',
		materialCost: new MaterialBank().add('abyssal', 30),
		inputItems: new Bank().add('Ancient shard', 10).add('Magical artifact'),
		outputItems: new Bank().add('Abyssal jibwings'),
		requiredSkills: {
			invention: 90,
			crafting: 90,
			smithing: 90
		}
	},
	{
		name: '3rd age jibwings',
		materialCost: new MaterialBank().add('third-age', 6),
		inputItems: new Bank().add('Gold bar', 1000),
		outputItems: new Bank().add('3rd age jibwings'),
		requiredSkills: {
			invention: 90,
			crafting: 90,
			smithing: 90
		}
	},
	{
		name: '3rd age jibwings (e)',
		inputItems: new Bank().add('3rd age jibwings').add('Ignecarus scales', 1000),
		outputItems: new Bank().add('3rd age jibwings (e)'),
		requiredSkills: {
			invention: 105,
			crafting: 105,
			smithing: 105
		}
	},
	{
		name: 'Demonic jibwings (e)',
		inputItems: new Bank().add('Demonic jibwings').add('Ignecarus scales', 1000),
		outputItems: new Bank().add('Demonic jibwings (e)'),
		requiredSkills: {
			invention: 105,
			crafting: 105,
			smithing: 105
		}
	},
	{
		name: 'Abyssal jibwings (e)',
		inputItems: new Bank().add('Abyssal jibwings').add('Ignecarus scales', 1000),
		outputItems: new Bank().add('Abyssal jibwings (e)'),
		requiredSkills: {
			invention: 105,
			crafting: 105,
			smithing: 105
		}
	},
	{
		name: 'Divine ring',
		inputItems: new Bank().add('Atomic energy', 1_000_000),
		materialCost: new MaterialBank().add('precious', 10_000),
		outputItems: new Bank().add('Divine ring'),
		requiredSkills: {
			invention: 105,
			crafting: 105,
			smithing: 105
		}
	},
	{
		name: 'Impling locator',
		inputItems: new Bank().add('Atomic energy', 200_000).add('Elder rune', 1000),
		materialCost: new MaterialBank().add('orikalkum', 100),
		outputItems: new Bank().add('Impling locator'),
		requiredSkills: {
			invention: 105,
			crafting: 105,
			smithing: 105,
			magic: 120
		}
	}
];

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
			justiciar: 5
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
	},
	...eagleTameCreatables
];

for (const claw of resolveItems([
	'Runite igne claws',
	'Dragon igne claws',
	'Barrows igne claws',
	'Volcanic igne claws',
	'Drygore igne claws',
	'Dwarven igne claws',
	'Gorajan igne claws'
]).map(getOSItem)) {
	tameCreatables.push({
		name: `Revert ${claw.name}`,
		inputItems: new Bank().add(claw.id),
		outputItems: new Bank().add('Igne gear frame')
	});
}

for (const armor of resolveItems([
	'Dragon igne armor',
	'Barrows igne armor',
	'Volcanic igne armor',
	'Justiciar igne armor',
	'Drygore igne armor',
	'Dwarven igne armor',
	'Gorajan igne armor'
]).map(getOSItem)) {
	tameCreatables.push({
		name: `Revert ${armor.name}`,
		inputItems: new Bank().add(armor.id),
		outputItems: new Bank().add('Igne gear frame')
	});
}
