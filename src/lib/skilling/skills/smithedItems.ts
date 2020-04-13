import { SkillsEnum, SmithedBar } from '../types';
import itemID from '../../util/itemID';
import { Emoji, Time } from '../../constants';

const smithedBars: SmithedBar[] = [
	{
		name: 'Bronze axe',
		level: 1,
		xp: 6.3,
		id: itemID('Bronze axe'),
		inputBars: { [itemID('Bronze bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Bronze dagger',
		level: 1,
		xp: 12.5,
		id: itemID('Bronze dagger'),
		inputBars: { [itemID('Bronze bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Bronze mace',
		level: 2,
		xp: 12.5,
		id: itemID('Bronze mace'),
		inputBars: { [itemID('Bronze bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Bronze med helm',
		level: 3,
		xp: 12.5,
		id: itemID('Bronze med helm'),
		inputBars: { [itemID('Bronze bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Bronze bolts (unf)',
		level: 3,
		xp: 12.5,
		id: itemID('Bronze bolts (unf)'),
		inputBars: { [itemID('Bronze bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 10
	},
	{
		name: 'Bronze nails',
		level: 4,
		xp: 12.5,
		id: itemID('Bronze nails'),
		inputBars: { [itemID('Bronze bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 15
	},
	{
		name: 'Bronze sword',
		level: 4,
		xp: 12.5,
		id: itemID('Bronze sword'),
		inputBars: { [itemID('Bronze bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Bronze wire',
		level: 4,
		xp: 12.5,
		id: itemID('Bronze wire'),
		inputBars: { [itemID('Bronze bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Bronze dart tip',
		level: 4,
		xp: 12.5,
		id: itemID('Bronze dart tip'),
		inputBars: { [itemID('Bronze bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 10
	},
	{
		name: 'Bronze scimitar',
		level: 5,
		xp: 25,
		id: itemID('Bronze scimitar'),
		inputBars: { [itemID('Bronze bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Bronze hasta',
		level: 5,
		xp: 12.5,
		id: itemID('Bronze hasta'),
		inputBars: { [itemID('Bronze bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Bronze arrowtips',
		level: 5,
		xp: 12.5,
		id: itemID('Bronze arrowtips'),
		inputBars: { [itemID('Bronze bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 15
	},
	{
		name: 'Bronze spear',
		level: 5,
		xp: 12.5,
		id: itemID('Bronze spear'),
		inputBars: { [itemID('Bronze bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Bronze javelin heads',
		level: 6,
		xp: 12.5,
		id: itemID('Bronze javelin heads'),
		inputBars: { [itemID('Bronze bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 5
	},
	{
		name: 'Bronze longsword',
		level: 6,
		xp: 25,
		id: itemID('Bronze longsword'),
		inputBars: { [itemID('Bronze bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Bronze limbs',
		level: 6,
		xp: 12.5,
		id: itemID('Bronze limbs'),
		inputBars: { [itemID('Bronze bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Bronze knife',
		level: 7,
		xp: 12.5,
		id: itemID('Bronze knife'),
		inputBars: { [itemID('Bronze bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 5
	},
	{
		name: 'Bronze full helm',
		level: 7,
		xp: 25,
		id: itemID('Bronze full helm'),
		inputBars: { [itemID('Bronze bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Bronze sq shield',
		level: 8,
		xp: 25.0,
		id: itemID('Bronze sq shield'),
		inputBars: { [itemID('Bronze bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Bronze warhammer',
		level: 9,
		xp: 37.5,
		id: itemID('Bronze warhammer'),
		inputBars: { [itemID('Bronze bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Bronze battleaxe',
		level: 10,
		xp: 37.5,
		id: itemID('Bronze battleaxe'),
		inputBars: { [itemID('Bronze bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Bronze chainbody',
		level: 11,
		xp: 37.5,
		id: itemID('Bronze chainbody'),
		inputBars: { [itemID('Bronze bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Bronze kiteshield',
		level: 12,
		xp: 37.5,
		id: itemID('Bronze kiteshield'),
		inputBars: { [itemID('Bronze bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Bronze claws',
		level: 13,
		xp: 25,
		id: itemID('Bronze claws'),
		inputBars: { [itemID('Bronze bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Bronze 2h sword',
		level: 14,
		xp: 37.5,
		id: itemID('Bronze 2h sword'),
		inputBars: { [itemID('Bronze bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Iron dagger',
		level: 15,
		xp: 12.5,
		id: itemID('Iron dagger'),
		inputBars: { [itemID('Iron bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Iron axe',
		level: 16,
		xp: 12.5,
		id: itemID('Iron axe'),
		inputBars: { [itemID('Iron bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Bronze platelegs',
		level: 16,
		xp: 37.5,
		id: itemID('Bronze platelegs'),
		inputBars: { [itemID('Bronze bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Bronze plateskirt',
		level: 16,
		xp: 37.5,
		id: itemID('Bronze plateskirt'),
		inputBars: { [itemID('Bronze bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Iron spit',
		level: 17,
		xp: 25,
		id: itemID('Iron spit'),
		inputBars: { [itemID('Iron bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Iron mace',
		level: 17,
		xp: 25.0,
		id: itemID('Iron mace'),
		inputBars: { [itemID('Iron bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Iron bolts (unf)',
		level: 18,
		xp: 25.0,
		id: itemID('Iron bolts (unf)'),
		inputBars: { [itemID('Iron bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 10
	},
	{
		name: 'Bronze platebody',
		level: 18,
		xp: 62.5,
		id: itemID('Bronze platebody'),
		inputBars: { [itemID('Bronze bar')]: 5 },
		timeToUse: Time.Second * 4.8,
		outputMultiple: 1
	},
	{
		name: 'Iron med helm',
		level: 18,
		xp: 25,
		id: itemID('Iron med helm'),
		inputBars: { [itemID('Iron bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Iron nails',
		level: 19,
		xp: 25.0,
		id: itemID('Iron nails'),
		inputBars: { [itemID('Iron bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 15
	},
	{
		name: 'Iron dart tip',
		level: 19,
		xp: 25.0,
		id: itemID('Iron dart tip'),
		inputBars: { [itemID('Iron bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 10
	},
	{
		name: 'Iron sword',
		level: 19,
		xp: 25.0,
		id: itemID('Iron sword'),
		inputBars: { [itemID('Iron bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Iron arrowtips',
		level: 20,
		xp: 25,
		id: itemID('Iron arrowtips'),
		inputBars: { [itemID('Iron bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 10
	},
	{
		name: 'Iron scimitar',
		level: 20,
		xp: 25.0,
		id: itemID('Iron scimitar'),
		inputBars: { [itemID('Iron bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Iron hasta',
		level: 20,
		xp: 25.0,
		id: itemID('Iron hasta'),
		inputBars: { [itemID('Iron bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Iron spear',
		level: 20,
		xp: 25.0,
		id: itemID('Iron spear'),
		inputBars: { [itemID('Iron bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Iron longsword',
		level: 21,
		xp: 50.0,
		id: itemID('Iron longsword'),
		inputBars: { [itemID('Iron bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Iron javelin heads',
		level: 21,
		xp: 25.0,
		id: itemID('Iron javelin heads'),
		inputBars: { [itemID('Iron bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 5
	},
	{
		name: 'Iron full helm',
		level: 22,
		xp: 50.0,
		id: itemID('Iron full helm'),
		inputBars: { [itemID('Iron bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Iron knife',
		level: 22,
		xp: 25.0,
		id: itemID('Iron knife'),
		inputBars: { [itemID('Iron bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 5
	},
	{
		name: 'Iron limbs',
		level: 23,
		xp: 25.0,
		id: itemID('Iron limbs'),
		inputBars: { [itemID('Iron bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Iron sq shield',
		level: 23,
		xp: 50.0,
		id: itemID('Iron sq shield'),
		inputBars: { [itemID('Iron bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Iron warhammer',
		level: 24,
		xp: 75.0,
		id: itemID('Iron warhammer'),
		inputBars: { [itemID('Iron bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Iron battleaxe',
		level: 25,
		xp: 75.0,
		id: itemID('Iron battleaxe'),
		inputBars: { [itemID('Iron bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Oil lantern frame',
		level: 26,
		xp: 25.0,
		id: itemID('Oil lantern frame'),
		inputBars: { [itemID('Iron bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Iron chainbody',
		level: 26,
		xp: 75.0,
		id: itemID('Iron chainbody'),
		inputBars: { [itemID('Iron bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Iron kiteshield',
		level: 27,
		xp: 75.0,
		id: itemID('Iron kiteshield'),
		inputBars: { [itemID('Iron bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Iron claws',
		level: 28,
		xp: 50.0,
		id: itemID('Iron claws'),
		inputBars: { [itemID('Iron bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Iron 2h sword',
		level: 29,
		xp: 75.0,
		id: itemID('Iron 2h sword'),
		inputBars: { [itemID('Iron bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Steel dagger',
		level: 30,
		xp: 25.0,
		id: itemID('Steel dagger'),
		inputBars: { [itemID('Steel bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Iron plateskirt',
		level: 31,
		xp: 75,
		id: itemID('Iron plateskirt'),
		inputBars: { [itemID('Iron bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Iron platelegs',
		level: 31,
		xp: 75.0,
		id: itemID('Iron platelegs'),
		inputBars: { [itemID('Iron bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Steel axe',
		level: 31,
		xp: 37.5,
		id: itemID('Steel axe'),
		inputBars: { [itemID('Steel bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Steel mace',
		level: 32,
		xp: 37.5,
		id: itemID('Steel mace'),
		inputBars: { [itemID('Steel bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Iron platebody',
		level: 33,
		xp: 125,
		id: itemID('Iron platebody'),
		inputBars: { [itemID('Iron bar')]: 5 },
		timeToUse: Time.Second * 4.8,
		outputMultiple: 1
	},
	{
		name: 'Steel med helm',
		level: 33,
		xp: 37.5,
		id: itemID('Steel med helm'),
		inputBars: { [itemID('Steel bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Steel bolts (unf)',
		level: 33,
		xp: 37.5,
		id: itemID('Steel bolts (unf)'),
		inputBars: { [itemID('Steel bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 10
	},
	{
		name: 'Steel dart tip',
		level: 34,
		xp: 37.5,
		id: itemID('Steel dart tip'),
		inputBars: { [itemID('Steel bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 10
	},
	{
		name: 'Steel nails',
		level: 34,
		xp: 37.5,
		id: itemID('Steel nails'),
		inputBars: { [itemID('Steel bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 5
	},
	{
		name: 'Steel sword',
		level: 34,
		xp: 37.5,
		id: itemID('Steel sword'),
		inputBars: { [itemID('Steel bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Cannonball',
		level: 35,
		xp: 37.5,
		id: itemID('Cannonball'),
		inputBars: { [itemID('Steel bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 4
	},
	{
		name: 'Steel scimitar',
		level: 35,
		xp: 75,
		id: itemID('Steel scimitar'),
		inputBars: { [itemID('Steel bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Steel arrowtips',
		level: 35,
		xp: 37.5,
		id: itemID('Steel arrowtips'),
		inputBars: { [itemID('Steel bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 15
	},
	{
		name: 'Steel hasta',
		level: 35,
		xp: 37.5,
		id: itemID('Steel hasta'),
		inputBars: { [itemID('Steel bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Steel spear',
		level: 35,
		xp: 37.5,
		id: itemID('Steel spear'),
		inputBars: { [itemID('Steel bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Steel limbs',
		level: 36,
		xp: 37.5,
		id: itemID('Steel limbs'),
		inputBars: { [itemID('Steel bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Steel studs',
		level: 36,
		xp: 37.5,
		id: itemID('Steel studs'),
		inputBars: { [itemID('Steel bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Steel longsword',
		level: 36,
		xp: 75,
		id: itemID('Steel longsword'),
		inputBars: { [itemID('Steel bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Steel javelin heads',
		level: 36,
		xp: 37.5,
		id: itemID('Steel javelin heads'),
		inputBars: { [itemID('Steel bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 5
	},
	{
		name: 'Steel knife',
		level: 37,
		xp: 37.5,
		id: itemID('Steel knife'),
		inputBars: { [itemID('Steel bar')]: 1 },
		timeToUse: Time.Second * 3,
		outputMultiple: 5
	},
	{
		name: 'Steel full helm',
		level: 37,
		xp: 75,
		id: itemID('Steel full helm'),
		inputBars: { [itemID('Steel bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Steel sq shield',
		level: 38,
		xp: 75.0,
		id: itemID('Steel sq shield'),
		inputBars: { [itemID('Steel bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Steel warhammer',
		level: 39,
		xp: 112.5,
		id: itemID('Steel warhammer'),
		inputBars: { [itemID('Steel bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Steel battleaxe',
		level: 40,
		xp: 112.5,
		id: itemID('Steel battleaxe'),
		inputBars: { [itemID('Steel bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Steel chainbody',
		level: 41,
		xp: 112.5,
		id: itemID('Steel chainbody'),
		inputBars: { [itemID('Steel bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Steel kiteshield',
		level: 42,
		xp: 112.5,
		id: itemID('Steel kiteshield'),
		inputBars: { [itemID('Steel bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Steel claws',
		level: 43,
		xp: 75,
		id: itemID('Steel claws'),
		inputBars: { [itemID('Steel bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Steel 2h sword',
		level: 44,
		xp: 112.5,
		id: itemID('Steel 2h sword'),
		inputBars: { [itemID('Steel bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Steel platelegs',
		level: 46,
		xp: 112.5,
		id: itemID('Steel platelegs'),
		inputBars: { [itemID('Steel bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Steel plateskirt',
		level: 46,
		xp: 112.5,
		id: itemID('Steel plateskirt'),
		inputBars: { [itemID('Steel bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Steel platebody',
		level: 48,
		xp: 187.5,
		id: itemID('Steel platebody'),
		inputBars: { [itemID('Steel bar')]: 5 },
		timeToUse: Time.Second * 4.8,
		outputMultiple: 1
	},
	{
		name: 'Bullseye lantern (unf)',
		level: 49,
		xp: 37.5,
		id: itemID('Bullseye lantern (unf)'),
		inputBars: { [itemID('Steel bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Mithril dagger',
		level: 50,
		xp: 50.0,
		id: itemID('Mithril dagger'),
		inputBars: { [itemID('Mithril bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Mithril axe',
		level: 51,
		xp: 50.0,
		id: itemID('Mithril axe'),
		inputBars: { [itemID('Mithril bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Mithril mace',
		level: 52,
		xp: 50.0,
		id: itemID('Mithril mace'),
		inputBars: { [itemID('Mithril bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Mithril med helm',
		level: 53,
		xp: 50.0,
		id: itemID('Mithril med helm'),
		inputBars: { [itemID('Mithril bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Mithril bolts (unf)',
		level: 53,
		xp: 50.0,
		id: itemID('Mithril bolts (unf)'),
		inputBars: { [itemID('Mithril bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 10
	},
	{
		name: 'Mithril sword',
		level: 54,
		xp: 50.0,
		id: itemID('Mithril sword'),
		inputBars: { [itemID('Mithril bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Mithril dart tip',
		level: 54,
		xp: 50.0,
		id: itemID('Mithril dart tip'),
		inputBars: { [itemID('Mithril bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 10
	},
	{
		name: 'Mithril nails',
		level: 54,
		xp: 50.0,
		id: itemID('Mithril nails'),
		inputBars: { [itemID('Mithril bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 15
	},
	{
		name: 'Mithril arrowtips',
		level: 55,
		xp: 50.0,
		id: itemID('Mithril arrowtips'),
		inputBars: { [itemID('Mithril bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 15
	},
	{
		name: 'Mithril scimitar',
		level: 55,
		xp: 100.0,
		id: itemID('Mithril scimitar'),
		inputBars: { [itemID('Mithril bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Mithril hasta',
		level: 55,
		xp: 50.0,
		id: itemID('Mithril hasta'),
		inputBars: { [itemID('Mithril bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Mithril spear',
		level: 55,
		xp: 50.0,
		id: itemID('Mithril spear'),
		inputBars: { [itemID('Mithril bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Mithril longsword',
		level: 56,
		xp: 100.0,
		id: itemID('Mithril longsword'),
		inputBars: { [itemID('Mithril bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Mithril javelin heads',
		level: 56,
		xp: 50.0,
		id: itemID('Mithril javelin heads'),
		inputBars: { [itemID('Mithril bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 5
	},
	{
		name: 'Mithril limbs',
		level: 56,
		xp: 50.0,
		id: itemID('Mithril limbs'),
		inputBars: { [itemID('Mithril bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Mithril full helm',
		level: 57,
		xp: 100.0,
		id: itemID('Mithril full helm'),
		inputBars: { [itemID('Mithril bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Mithril knife',
		level: 57,
		xp: 50.0,
		id: itemID('Mithril knife'),
		inputBars: { [itemID('Mithril bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 5
	},
	{
		name: 'Mithril sq shield',
		level: 58,
		xp: 100.0,
		id: itemID('Mithril sq shield'),
		inputBars: { [itemID('Mithril bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Mith grapple tip',
		level: 59,
		xp: 50.0,
		id: itemID('Mith grapple tip'),
		inputBars: { [itemID('Mithril bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Mithril warhammer',
		level: 59,
		xp: 150.0,
		id: itemID('Mithril warhammer'),
		inputBars: { [itemID('Mithril bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Mithril battleaxe',
		level: 60,
		xp: 150.0,
		id: itemID('Mithril battleaxe'),
		inputBars: { [itemID('Mithril bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Mithril chainbody',
		level: 61,
		xp: 150.0,
		id: itemID('Mithril chainbody'),
		inputBars: { [itemID('Mithril bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Mithril kiteshield',
		level: 62,
		xp: 150.0,
		id: itemID('Mithril kiteshield'),
		inputBars: { [itemID('Mithril bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Mithril claws',
		level: 63,
		xp: 100.0,
		id: itemID('Mithril claws'),
		inputBars: { [itemID('Mithril bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Mithril 2h sword',
		level: 64,
		xp: 150.0,
		id: itemID('Mithril 2h sword'),
		inputBars: { [itemID('Mithril bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Mithril plateskirt',
		level: 66,
		xp: 150.0,
		id: itemID('Mithril plateskirt'),
		inputBars: { [itemID('Mithril bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Mithril platelegs',
		level: 66,
		xp: 150.0,
		id: itemID('Mithril platelegs'),
		inputBars: { [itemID('Mithril bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Mithril platebody',
		level: 68,
		xp: 250.0,
		id: itemID('Mithril platebody'),
		inputBars: { [itemID('Mithril bar')]: 5 },
		timeToUse: Time.Second * 4.8,
		outputMultiple: 1
	},
	{
		name: 'Adamant dagger',
		level: 70,
		xp: 62.5,
		id: itemID('Adamant dagger'),
		inputBars: { [itemID('Adamantite bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Adamant axe',
		level: 71,
		xp: 62.5,
		id: itemID('Adamant axe'),
		inputBars: { [itemID('Adamantite bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Adamant mace',
		level: 72,
		xp: 62.5,
		id: itemID('Adamant mace'),
		inputBars: { [itemID('Adamantite bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Adamant bolts (unf)',
		level: 73,
		xp: 62.5,
		id: itemID('Adamant bolts (unf)'),
		inputBars: { [itemID('Adamantite bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 10
	},
	{
		name: 'Adamant med helm',
		level: 73,
		xp: 62.5,
		id: itemID('Adamant med helm'),
		inputBars: { [itemID('Adamantite bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Adamant dart tip',
		level: 74,
		xp: 62.5,
		id: itemID('Adamant dart tip'),
		inputBars: { [itemID('Adamantite bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 10
	},
	{
		name: 'Adamant sword',
		level: 74,
		xp: 62.5,
		id: itemID('Adamant sword'),
		inputBars: { [itemID('Adamantite bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Adamantite nails',
		level: 74,
		xp: 62.5,
		id: itemID('Adamantite nails'),
		inputBars: { [itemID('Adamantite bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 15
	},
	{
		name: 'Adamant arrowtips',
		level: 75,
		xp: 62.5,
		id: itemID('Adamant arrowtips'),
		inputBars: { [itemID('Adamantite bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 15
	},
	{
		name: 'Adamant scimitar',
		level: 75,
		xp: 125,
		id: itemID('Adamant scimitar'),
		inputBars: { [itemID('Adamantite bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Adamant hasta',
		level: 75,
		xp: 62.5,
		id: itemID('Adamant hasta'),
		inputBars: { [itemID('Adamantite bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Adamant spear',
		level: 75,
		xp: 62.5,
		id: itemID('Adamant spear'),
		inputBars: { [itemID('Adamantite bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Adamantite limbs',
		level: 76,
		xp: 62.5,
		id: itemID('Adamantite limbs'),
		inputBars: { [itemID('Adamantite bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Adamant longsword',
		level: 76,
		xp: 125,
		id: itemID('Adamant longsword'),
		inputBars: { [itemID('Adamantite bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Adamant javelin heads',
		level: 76,
		xp: 62.5,
		id: itemID('Adamant javelin heads'),
		inputBars: { [itemID('Adamantite bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 5
	},
	{
		name: 'Adamant full helm',
		level: 77,
		xp: 125,
		id: itemID('Adamant full helm'),
		inputBars: { [itemID('Adamantite bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Adamant knife',
		level: 77,
		xp: 62.5,
		id: itemID('Adamant knife'),
		inputBars: { [itemID('Adamantite bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 5
	},
	{
		name: 'Adamant sq shield',
		level: 78,
		xp: 125,
		id: itemID('Adamant sq shield'),
		inputBars: { [itemID('Adamantite bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Adamant warhammer',
		level: 79,
		xp: 187.5,
		id: itemID('Adamant warhammer'),
		inputBars: { [itemID('Adamantite bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Adamant battleaxe',
		level: 80,
		xp: 187.5,
		id: itemID('Adamant battleaxe'),
		inputBars: { [itemID('Adamantite bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Adamant chainbody',
		level: 81,
		xp: 187.5,
		id: itemID('Adamant chainbody'),
		inputBars: { [itemID('Adamantite bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Adamant kiteshield',
		level: 82,
		xp: 187.5,
		id: itemID('Adamant kiteshield'),
		inputBars: { [itemID('Adamantite bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Adamant claws',
		level: 83,
		xp: 187.5,
		id: itemID('Adamant claws'),
		inputBars: { [itemID('Adamantite bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Adamant 2h sword',
		level: 84,
		xp: 187.5,
		id: itemID('Adamant 2h sword'),
		inputBars: { [itemID('Adamantite bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Rune dagger',
		level: 85,
		xp: 75.0,
		id: itemID('Rune dagger'),
		inputBars: { [itemID('Runite bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Rune axe',
		level: 86,
		xp: 75.0,
		id: itemID('Rune axe'),
		inputBars: { [itemID('Runite bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Adamant plateskirt',
		level: 86,
		xp: 187.5,
		id: itemID('Adamant plateskirt'),
		inputBars: { [itemID('Adamantite bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Adamant platelegs',
		level: 86,
		xp: 187.5,
		id: itemID('Adamant platelegs'),
		inputBars: { [itemID('Adamantite bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Rune mace',
		level: 87,
		xp: 75,
		id: itemID('Rune mace'),
		inputBars: { [itemID('Runite bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Runite bolts (unf)',
		level: 88,
		xp: 75.0,
		id: itemID('Runite bolts (unf)'),
		inputBars: { [itemID('Runite bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 10
	},
	{
		name: 'Rune med helm',
		level: 88,
		xp: 75.0,
		id: itemID('Rune med helm'),
		inputBars: { [itemID('Runite bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Adamant platebody',
		level: 88,
		xp: 312.5,
		id: itemID('Adamant platebody'),
		inputBars: { [itemID('Adamantite bar')]: 5 },
		timeToUse: Time.Second * 4.8,
		outputMultiple: 1
	},
	{
		name: 'Rune sword',
		level: 89,
		xp: 75,
		id: itemID('Rune sword'),
		inputBars: { [itemID('Runite bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Rune nails',
		level: 89,
		xp: 75.0,
		id: itemID('Rune nails'),
		inputBars: { [itemID('Runite bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 15
	},
	{
		name: 'Rune dart tip',
		level: 89,
		xp: 75.0,
		id: itemID('Rune dart tip'),
		inputBars: { [itemID('Runite bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 10
	},
	{
		name: 'Rune arrowtips',
		level: 90,
		xp: 75.0,
		id: itemID('Rune arrowtips'),
		inputBars: { [itemID('Runite bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 15
	},
	{
		name: 'Rune scimitar',
		level: 90,
		xp: 150.0,
		id: itemID('Rune scimitar'),
		inputBars: { [itemID('Runite bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Rune hasta',
		level: 90,
		xp: 75.0,
		id: itemID('Rune hasta'),
		inputBars: { [itemID('Runite bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Rune spear',
		level: 90,
		xp: 75.0,
		id: itemID('Rune spear'),
		inputBars: { [itemID('Runite bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Rune longsword',
		level: 91,
		xp: 150.0,
		id: itemID('Rune longsword'),
		inputBars: { [itemID('Runite bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Rune javelin heads',
		level: 91,
		xp: 75.0,
		id: itemID('Rune javelin heads'),
		inputBars: { [itemID('Runite bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 5
	},
	{
		name: 'Runite limbs',
		level: 91,
		xp: 75.0,
		id: itemID('Runite limbs'),
		inputBars: { [itemID('Runite bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Rune knife',
		level: 92,
		xp: 75.0,
		id: itemID('Rune knife'),
		inputBars: { [itemID('Runite bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 5
	},
	{
		name: 'Rune full helm',
		level: 92,
		xp: 150.0,
		id: itemID('Rune full helm'),
		inputBars: { [itemID('Runite bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Rune sq shield',
		level: 93,
		xp: 150.0,
		id: itemID('Rune sq shield'),
		inputBars: { [itemID('Runite bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Rune warhammer',
		level: 94,
		xp: 225.0,
		id: itemID('Rune warhammer'),
		inputBars: { [itemID('Runite bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Rune battleaxe',
		level: 95,
		xp: 225.0,
		id: itemID('Rune battleaxe'),
		inputBars: { [itemID('Runite bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Rune chainbody',
		level: 96,
		xp: 225.0,
		id: itemID('Rune chainbody'),
		inputBars: { [itemID('Runite bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Rune kiteshield',
		level: 97,
		xp: 225.0,
		id: itemID('Rune kiteshield'),
		inputBars: { [itemID('Runite bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Rune claws',
		level: 98,
		xp: 150.0,
		id: itemID('Rune claws'),
		inputBars: { [itemID('Runite bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Rune platebody',
		level: 99,
		xp: 375.0,
		id: itemID('Rune platebody'),
		inputBars: { [itemID('Runite bar')]: 5 },
		timeToUse: Time.Second * 4.8,
		outputMultiple: 1
	},
	{
		name: 'Rune plateskirt',
		level: 99,
		xp: 225.0,
		id: itemID('Rune plateskirt'),
		inputBars: { [itemID('Runite bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Rune platelegs',
		level: 99,
		xp: 225.0,
		id: itemID('Rune platelegs'),
		inputBars: { [itemID('Runite bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Rune 2h sword',
		level: 99,
		xp: 225.0,
		id: itemID('Rune 2h sword'),
		inputBars: { [itemID('Runite bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	}
];

const Smithed = {
	SmithedBars: smithedBars,
	id: SkillsEnum.Smithing,
	emoji: Emoji.Smithing
};

export default Smithed;
