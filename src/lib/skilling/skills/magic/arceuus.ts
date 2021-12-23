import { Castable, MagicTypes } from './index';
import { Bank } from 'oldschooljs';

const Arceuus: Castable[] = [
	{
		name: 'Arceuus home teleport',
		levels: { Magic: 1 },
		xp: { Magic: 0 },
		input: new Bank(),
		category: MagicTypes.Teleport,
		ticks: 22
	},
	{
		name: 'Arceuus library teleport',
		levels: { Magic: 6 },
		xp: { Magic: 9 },
		input: new Bank().add('Earth rune', 2).add('Law rune', 1),
		category: MagicTypes.Teleport,
		ticks: 4
	},
	{
		name: 'Reanimate goblin',
		levels: { Magic: 15 },
		xp: { Magic: 32, Prayer: 130 },
		input: new Bank().add('Ensouled goblin head', 1).add('Body rune', 4).add('Nature rune', 2),
		category: MagicTypes.Reanimation,
		ticks: 10
	},
	{
		name: 'Reanimate monkey',
		levels: { Magic: 15 },
		xp: { Magic: 32, Prayer: 182 },
		input: new Bank().add('Ensouled monkey head', 1).add('Body rune', 4).add('Nature rune', 2),
		category: MagicTypes.Reanimation,
		ticks: 10
	},
	{
		name: 'Reanimate imp',
		levels: { Magic: 15 },
		xp: { Magic: 32, Prayer: 286 },
		input: new Bank().add('Ensouled imp head', 1).add('Body rune', 4).add('Nature rune', 2),
		category: MagicTypes.Reanimation,
		ticks: 10
	},
	{
		name: 'Reanimate minotaur',
		levels: { Magic: 15 },
		xp: { Magic: 32, Prayer: 364 },
		input: new Bank().add('Ensouled minotaur head', 1).add('Body rune', 4).add('Nature rune', 2),
		category: MagicTypes.Reanimation,
		ticks: 10
	},
	{
		name: 'Reanimate scorpion',
		levels: { Magic: 15 },
		xp: { Magic: 32, Prayer: 454 },
		input: new Bank().add('Ensouled scorpion head', 1).add('Body rune', 4).add('Nature rune', 2),
		category: MagicTypes.Reanimation,
		ticks: 10
	},
	{
		name: 'Reanimate bear',
		levels: { Magic: 15 },
		xp: { Magic: 32, Prayer: 480 },
		input: new Bank().add('Ensouled bear head', 1).add('Body rune', 4).add('Nature rune', 2),
		category: MagicTypes.Reanimation,
		ticks: 10
	},
	{
		name: 'Reanimate unicorn',
		levels: { Magic: 15 },
		xp: { Magic: 32, Prayer: 494 },
		input: new Bank().add('Ensouled unicorn head', 1).add('Body rune', 4).add('Nature rune', 2),
		category: MagicTypes.Reanimation,
		ticks: 10
	},
	{
		name: 'Draynor manor teleport',
		levels: { Magic: 17 },
		xp: { Magic: 16 },
		input: new Bank().add('Earth rune', 1).add('Water rune', 1).add('Law rune', 1),
		category: MagicTypes.Teleport,
		ticks: 4
	},
	{
		name: 'Battlefront teleport',
		levels: { Magic: 23 },
		xp: { Magic: 19 },
		input: new Bank().add('Earth rune', 1).add('Fire rune', 1).add('Law rune', 1),
		category: MagicTypes.Teleport,
		ticks: 4
	},
	{
		name: 'Mind altar teleport',
		levels: { Magic: 28 },
		xp: { Magic: 22 },
		input: new Bank().add('Law rune', 1).add('Mind rune', 2),
		category: MagicTypes.Teleport,
		ticks: 4
	},
	{
		name: 'Respawn teleport',
		levels: { Magic: 34 },
		xp: { Magic: 27 },
		input: new Bank().add('Law rune', 1).add('Soul rune', 1),
		category: MagicTypes.Teleport,
		ticks: 4
	},
  // No implemented use
	// {
	// 	name: 'Ghostly grasp',
	// 	levels: { Magic: 35 },
	// 	xp: { Magic: 22.5 },
	// 	input: new Bank().add('Air rune', 4).add('Chaos rune', 1),
	// 	category: MagicTypes.Combat,
	// 	ticks: 5
	// },
	// {
	// 	name: 'Resurrect lesser ghost',
	// 	levels: { Magic: 38 },
	// 	xp: { Magic: 55 },
	// 	input: new Bank().add('Air rune', 10).add('Cosmic rune', 1).add('Mind rune', 5),
	// 	category: MagicTypes.Combat,
	// 	ticks: 20
	// },
	// {
	// 	name: 'Resurrect lesser skeleton',
	// 	levels: { Magic: 38 },
	// 	xp: { Magic: 55 },
	// 	input: new Bank().add('Air rune', 10).add('Cosmic rune', 1).add('Mind rune', 5),
	// 	category: MagicTypes.Combat,
	// 	ticks: 20
	// },
	// {
	// 	name: 'Resurrect lesser zombie',
	// 	levels: { Magic: 38 },
	// 	xp: { Magic: 55 },
	// 	input: new Bank().add('Air rune', 10).add('Cosmic rune', 1).add('Mind rune', 5),
	// 	category: MagicTypes.Combat,
	// 	ticks: 20
	// },
	{
		name: 'Salve graveyard teleport',
		levels: { Magic: 40 },
		xp: { Magic: 30 },
		input: new Bank().add('Law rune', 1).add('Soul rune', 2),
		category: MagicTypes.Teleport,
		ticks: 4
	},
	{
		name: 'Reanimate dog',
		levels: { Magic: 41 },
		xp: { Magic: 80, Prayer: 520 },
		input: new Bank().add('Ensouled dog head', 1).add('Body rune', 4).add('Nature rune', 3).add('Soul rune', 1),
		category: MagicTypes.Reanimation,
		ticks: 10
	},
	{
		name: 'Reanimate chaos druid',
		levels: { Magic: 41 },
		xp: { Magic: 80, Prayer: 584 },
		input: new Bank().add('Ensouled chaos druid head', 1).add('Body rune', 4).add('Nature rune', 3).add('Soul rune', 1),
		category: MagicTypes.Reanimation,
		ticks: 10
	},
	{
		name: 'Reanimate giant',
		levels: { Magic: 41 },
		xp: { Magic: 80, Prayer: 650 },
		input: new Bank().add('Ensouled giant head', 1).add('Body rune', 4).add('Nature rune', 3).add('Soul rune', 1),
		category: MagicTypes.Reanimation,
		ticks: 10
	},
	{
		name: 'Reanimate ogre',
		levels: { Magic: 41 },
		xp: { Magic: 80, Prayer: 716 },
		input: new Bank().add('Ensouled ogre head', 1).add('Body rune', 4).add('Nature rune', 3).add('Soul rune', 1),
		category: MagicTypes.Reanimation,
		ticks: 10
	},
	{
		name: 'Reanimate elf',
		levels: { Magic: 41 },
		xp: { Magic: 80, Prayer: 754 },
		input: new Bank().add('Ensouled elf head', 1).add('Body rune', 4).add('Nature rune', 3).add('Soul rune', 1),
		category: MagicTypes.Reanimation,
		ticks: 10
	},
	{
		name: 'Reanimate troll',
		levels: { Magic: 41 },
		xp: { Magic: 80, Prayer: 780 },
		input: new Bank().add('Ensouled troll head', 1).add('Body rune', 4).add('Nature rune', 3).add('Soul rune', 1),
		category: MagicTypes.Reanimation,
		ticks: 10
	},
	{
		name: 'Reanimate horror',
		levels: { Magic: 41 },
		xp: { Magic: 80, Prayer: 832 },
		input: new Bank().add('Ensouled horror head', 1).add('Body rune', 4).add('Nature rune', 3).add('Soul rune', 1),
		category: MagicTypes.Reanimation,
		ticks: 10
	},
	{
		name: 'Inferior demonbane',
		levels: { Magic: 44 },
		xp: { Magic: 27 },
		input: new Bank().add('Fire rune', 4).add('Chaos rune', 1),
		category: MagicTypes.Combat,
		ticks: 5
	},
  // No implemented use
	// {
	// 	name: 'Shadow veil',
	// 	levels: { Magic: 47 },
	// 	xp: { Magic: 58 },
	// 	input: new Bank().add('Earth rune', 5).add('Fire rune', 5).add('Cosmic rune', 5),
	// 	category: MagicTypes.Curse,
	// 	ticks: 50
	// },
	{
		name: "Feneknstrain's castle teleport",
		levels: { Magic: 48 },
		xp: { Magic: 50 },
		input: new Bank().add('Earth rune', 1).add('Law rune', 1).add('Soul rune', 1),
		category: MagicTypes.Teleport,
		ticks: 4
	},
  // No implemented use
	// {
	// 	name: 'Dark lure',
	// 	levels: { Magic: 50 },
	// 	xp: { Magic: 60 },
	// 	input: new Bank().add('Death rune', 1).add('Nature rune', 1),
	// 	category: MagicTypes.Teleport,
	// 	ticks: 16
	// },
	// {
	// 	name: 'Skeletal grasp',
	// 	levels: { Magic: 56 },
	// 	xp: { Magic: 33 },
	// 	input: new Bank().add('Earth rune', 8).add('Death rune', 1),
	// 	category: MagicTypes.Combat,
	// 	ticks: 5
	// },
	// {
	// 	name: 'Resurrect superior ghost',
	// 	levels: { Magic: 57 },
	// 	xp: { Magic: 70 },
	// 	input: new Bank().add('Earth rune', 10).add('Cosmic rune', 1).add('Death rune', 5),
	// 	category: MagicTypes.Combat,
	// 	ticks: 20
	// },
	// {
	// 	name: 'Resurrect superior skeleton',
	// 	levels: { Magic: 57 },
	// 	xp: { Magic: 70 },
	// 	input: new Bank().add('Earth rune', 10).add('Cosmic rune', 1).add('Death rune', 5),
	// 	category: MagicTypes.Combat,
	// 	ticks: 20
	// },
	// {
	// 	name: 'Resurrect superior zombie',
	// 	levels: { Magic: 57 },
	// 	xp: { Magic: 70 },
	// 	input: new Bank().add('Earth rune', 10).add('Cosmic rune', 1).add('Death rune', 5),
	// 	category: MagicTypes.Combat,
	// 	ticks: 20
	// },
	// {
	// 	name: 'Mark of darkness',
	// 	levels: { Magic: 59 },
	// 	xp: { Magic: 70 },
	// 	input: new Bank().add('Cosmic rune', 1).add('Soul rune', 1),
	// 	category: MagicTypes.Curse,
	// 	ticks: 5
	// },
	{
		name: 'West ardougne teleport',
		levels: { Magic: 61 },
		xp: { Magic: 68 },
		input: new Bank().add('Law rune', 2).add('Soul rune', 2),
		category: MagicTypes.Teleport,
		ticks: 4
	},
	{
		name: 'Superior demonbane',
		levels: { Magic: 62 },
		xp: { Magic: 36 },
		input: new Bank().add('Fire rune', 8).add('Soul rune', 1),
		category: MagicTypes.Combat,
		ticks: 5
	},
  // No implemented use
	// {
	// 	name: 'Lesser corruption',
	// 	levels: { Magic: 64 },
	// 	xp: { Magic: 75 },
	// 	input: new Bank().add('Death rune', 1).add('Soul rune', 2),
	// 	category: MagicTypes.Curse,
	// 	ticks: 50
	// },
	{
		name: 'Harmony island teleport',
		levels: { Magic: 65 },
		xp: { Magic: 74 },
		input: new Bank().add('Law rune', 1).add('Nature rune', 1).add('Soul rune', 1),
		category: MagicTypes.Teleport,
		ticks: 4
	},
  // No implemented use
	// {
	// 	name: 'Vile vigour',
	// 	levels: { Magic: 66 },
	// 	xp: { Magic: 76 },
	// 	input: new Bank().add('Air rune', 3).add('Soul rune', 1),
	// 	category: MagicTypes.Skilling,
	// 	ticks: 16
	// },
	{
		name: 'Degrime guam',
		levels: { Magic: 70 },
		xp: { Magic: 83, Herblore: 33.6 },
		input: new Bank().add('Grimy guam leaf', 28).add('Earth rune', 4).add('Nature rune', 2),
		output: new Bank().add('Guam leaf', 28),
		category: MagicTypes.Skilling,
		ticks: 8
	},
	{
		name: 'Degrime marrentil',
		levels: { Magic: 70 },
		xp: { Magic: 83, Herblore: 47.5 },
		input: new Bank().add('Grimy marrentil', 28).add('Earth rune', 4).add('Nature rune', 2),
		output: new Bank().add('Marrentil', 28),
		category: MagicTypes.Skilling,
		ticks: 8
	},
	{
		name: 'Degrime tarromin',
		levels: { Magic: 70 },
		xp: { Magic: 83, Herblore: 62.5 },
		input: new Bank().add('Grimy tarromin', 28).add('Earth rune', 4).add('Nature rune', 2),
		output: new Bank().add('Tarromin', 28),
		category: MagicTypes.Skilling,
		ticks: 8
	},
	{
		name: 'Degrime harrlander',
		levels: { Magic: 70 },
		xp: { Magic: 83, Herblore: 86.8 },
		input: new Bank().add('Grimy harrlander', 28).add('Earth rune', 4).add('Nature rune', 2),
		output: new Bank().add('Harrlander', 28),
		category: MagicTypes.Skilling,
		ticks: 8
	},
	{
		name: 'Degrime ranarr weed',
		levels: { Magic: 70 },
		xp: { Magic: 83, Herblore: 103.6 },
		input: new Bank().add('Grimy ranarr weed', 28).add('Earth rune', 4).add('Nature rune', 2),
		output: new Bank().add('Ranarr weed', 28),
		category: MagicTypes.Skilling,
		ticks: 8
	},
	{
		name: 'Degrime toadflax',
		levels: { Magic: 70 },
		xp: { Magic: 83, Herblore: 112 },
		input: new Bank().add('Grimy toadflax', 28).add('Earth rune', 4).add('Nature rune', 2),
		output: new Bank().add('Toadflax', 28),
		category: MagicTypes.Skilling,
		ticks: 8
	},
	{
		name: 'Degrime irit leaf',
		levels: { Magic: 70 },
		xp: { Magic: 83, Herblore: 123.2 },
		input: new Bank().add('Grimy irit leaf', 28).add('Earth rune', 4).add('Nature rune', 2),
		output: new Bank().add('Irit leaf', 28),
		category: MagicTypes.Skilling,
		ticks: 8
	},
	{
		name: 'Degrime avantoe',
		levels: { Magic: 70 },
		xp: { Magic: 83, Herblore: 140 },
		input: new Bank().add('Grimy avantoe', 28).add('Earth rune', 4).add('Nature rune', 2),
		output: new Bank().add('Avantoe', 28),
		category: MagicTypes.Skilling,
		ticks: 8
	},
	{
		name: 'Degrime kwuarm',
		levels: { Magic: 70 },
		xp: { Magic: 83, Herblore: 156.8 },
		input: new Bank().add('Grimy kwuarm', 28).add('Earth rune', 4).add('Nature rune', 2),
		output: new Bank().add('Kwuarm', 28),
		category: MagicTypes.Skilling,
		ticks: 8
	},
	{
		name: 'Degrime snapdragon',
		levels: { Magic: 70 },
		xp: { Magic: 83, Herblore: 165.2 },
		input: new Bank().add('Grimy snapdragon', 28).add('Earth rune', 4).add('Nature rune', 2),
		output: new Bank().add('Snapdragon', 28),
		category: MagicTypes.Skilling,
		ticks: 8
	},
	{
		name: 'Degrime cadantine',
		levels: { Magic: 70 },
		xp: { Magic: 83, Herblore: 173.6 },
		input: new Bank().add('Grimy cadantine', 28).add('Earth rune', 4).add('Nature rune', 2),
		output: new Bank().add('Cadantine', 28),
		category: MagicTypes.Skilling,
		ticks: 8
	},
	{
		name: 'Degrime lantadyme',
		levels: { Magic: 70 },
		xp: { Magic: 83, Herblore: 182 },
		input: new Bank().add('Grimy lantadyme', 28).add('Earth rune', 4).add('Nature rune', 2),
		output: new Bank().add('Lantadyme', 28),
		category: MagicTypes.Skilling,
		ticks: 8
	},
	{
		name: 'Degrime dwarf weed',
		levels: { Magic: 70 },
		xp: { Magic: 83, Herblore: 193.2 },
		input: new Bank().add('Grimy dwarf weed', 28).add('Earth rune', 4).add('Nature rune', 2),
		output: new Bank().add('Dwarf weed', 28),
		category: MagicTypes.Skilling,
		ticks: 8
	},
	{
		name: 'Degrime torstol',
		levels: { Magic: 70 },
		xp: { Magic: 83, Herblore: 210 },
		input: new Bank().add('Grimy torstol', 28).add('Earth rune', 4).add('Nature rune', 2),
		output: new Bank().add('Torstol', 28),
		category: MagicTypes.Skilling,
		ticks: 8
	},
	{
		name: 'Cemetery teleport',
		levels: { Magic: 71 },
		xp: { Magic: 82 },
		input: new Bank().add('Blood rune', 1).add('Law rune', 1).add('Soul rune', 1),
		category: MagicTypes.Teleport,
		ticks: 4
	},
	{
		name: 'Reanimate kalphite',
		levels: { Magic: 72 },
		xp: { Magic: 138, Prayer: 884 },
		input: new Bank().add('Ensouled kalphite head', 1).add('Nature rune', 3).add('Blood rune', 1).add('Soul rune', 2),
		category: MagicTypes.Reanimation,
		ticks: 10
	},
	{
		name: 'Reanimate dagannoth',
		levels: { Magic: 72 },
		xp: { Magic: 138, Prayer: 936 },
		input: new Bank().add('Ensouled dagannoth head', 1).add('Nature rune', 3).add('Blood rune', 1).add('Soul rune', 2),
		category: MagicTypes.Reanimation,
		ticks: 10
	},
	{
		name: 'Reanimate bloodveld',
		levels: { Magic: 72 },
		xp: { Magic: 138, Prayer: 1040 },
		input: new Bank().add('Ensouled bloodveld head', 1).add('Nature rune', 3).add('Blood rune', 1).add('Soul rune', 2),
		category: MagicTypes.Reanimation,
		ticks: 10
	},
	{
		name: 'Reanimate tzhaar',
		levels: { Magic: 72 },
		xp: { Magic: 138, Prayer: 1104 },
		input: new Bank().add('Ensouled tzhaar head', 1).add('Nature rune', 3).add('Blood rune', 1).add('Soul rune', 2),
		category: MagicTypes.Reanimation,
		ticks: 10
	},
	{
		name: 'Reanimate demon',
		levels: { Magic: 72 },
		xp: { Magic: 138, Prayer: 1170 },
		input: new Bank().add('Ensouled demon head', 1).add('Nature rune', 3).add('Blood rune', 1).add('Soul rune', 2),
		category: MagicTypes.Reanimation,
		ticks: 10
	},
	{
		name: 'Ward of Arceuus',
		levels: { Magic: 73 },
		xp: { Magic: 83 },
		input: new Bank().add('Cosmic rune', 1).add('Nature rune', 2).add('Soul rune', 4),
		category: MagicTypes.Curse,
		ticks: 50
	},
  // No implemented use
	// {
	// 	name: 'Resurrect greater ghost',
	// 	levels: { Magic: 76 },
	// 	xp: { Magic: 88 },
	// 	input: new Bank().add('Fire rune', 10).add('Blood rune', 5).add('Cosmic rune', 1),
	// 	category: MagicTypes.Combat,
	// 	ticks: 20
	// },
	// {
	// 	name: 'Resurrect greater skeleton',
	// 	levels: { Magic: 76 },
	// 	xp: { Magic: 88 },
	// 	input: new Bank().add('Fire rune', 10).add('Blood rune', 5).add('Cosmic rune', 1),
	// 	category: MagicTypes.Combat,
	// 	ticks: 20
	// },
	// {
	// 	name: 'Resurrect greater zombie',
	// 	levels: { Magic: 76 },
	// 	xp: { Magic: 88 },
	// 	input: new Bank().add('Fire rune', 10).add('Blood rune', 5).add('Cosmic rune', 1),
	// 	category: MagicTypes.Combat,
	// 	ticks: 20
	// },
	// TODO: Add to Farming runs?
	// {
	// 	name: 'Resurrect Crops',
	// 	levels: { Magic: 78 },
	// 	xp: { Magic: 90 },
	// 	input: new Bank().add('Earth rune', 25).add('Blood rune', 8).add('Nature rune', 12).add('Soul rune', 8),
	// 	category: MagicTypes.Skilling,
	// 	ticks: 50
	// },
	// {
	// 	name: 'Undead grasp',
	// 	levels: { Magic: 79 },
	// 	xp: { Magic: 46.5 },
	// 	input: new Bank().add('Fire rune', 12).add('Blood rune', 1),
	// 	category: MagicTypes.Combat,
	// 	ticks: 5
	// },
	// {
	// 	name: 'Death charge',
	// 	levels: { Magic: 80 },
	// 	xp: { Magic: 90 },
	// 	input: new Bank().add('Blood rune', 1).add('Death rune', 1).add('Soul rune', 1),
	// 	category: MagicTypes.Combat,
	// 	ticks: 100
	// },
	{
		name: 'Dark demonbane',
		levels: { Magic: 82 },
		xp: { Magic: 43.5 },
		input: new Bank().add('Fire rune', 12).add('Soul rune', 2),
		category: MagicTypes.Combat,
		ticks: 5
	},
	{
		name: 'Barrows teleport',
		levels: { Magic: 83 },
		xp: { Magic: 90 },
		input: new Bank().add('Blood rune', 1).add('Law rune', 2).add('Soul rune', 2),
		category: MagicTypes.Teleport,
		ticks: 4
	},
	{
		name: 'Demonic offering fiendish',
		levels: { Magic: 84 },
		xp: { Magic: 175, Prayer: 270 },
		input: new Bank().add('Fiendish ashes', 3).add('Soul rune', 1).add('Wrath rune', 1),
		category: MagicTypes.Skilling,
		ticks: 8
	},
	{
		name: 'Demonic offering vile',
		levels: { Magic: 84 },
		xp: { Magic: 175, Prayer: 675 },
		input: new Bank().add('Vile ashes', 3).add('Soul rune', 1).add('Wrath rune', 1),
		category: MagicTypes.Skilling,
		ticks: 8
	},
	{
		name: 'Demonic offering malicious',
		levels: { Magic: 84 },
		xp: { Magic: 175, Prayer: 1755 },
		input: new Bank().add('Malicious ashes', 3).add('Soul rune', 1).add('Wrath rune', 1),
		category: MagicTypes.Skilling,
		ticks: 8
	},
	{
		name: 'Demonic offering abyssal',
		levels: { Magic: 84 },
		xp: { Magic: 175, Prayer: 2295 },
		input: new Bank().add('Abyssal ashes', 3).add('Soul rune', 1).add('Wrath rune', 1),
		category: MagicTypes.Skilling,
		ticks: 8
	},
	{
		name: 'Demonic offering infernal',
		levels: { Magic: 84 },
		xp: { Magic: 175, Prayer: 2970 },
		input: new Bank().add('Infernal ashes', 3).add('Soul rune', 1).add('Wrath rune', 1),
		category: MagicTypes.Skilling,
		ticks: 8
	},
  // No implemented use
	// {
	// 	name: 'Greater corruption',
	// 	levels: { Magic: 85 },
	// 	xp: { Magic: 95 },
	// 	input: new Bank().add('Blood rune', 1).add('Soul rune', 3),
	// 	category: MagicTypes.Curse,
	// 	ticks: 50
	// },
	{
		name: 'Reanimate aviansie',
		levels: { Magic: 90 },
		xp: { Magic: 170, Prayer: 1234 },
		input: new Bank().add('Ensouled aviansie head', 1).add('Nature rune', 4).add('Blood rune', 2).add('Soul rune', 4),
		category: MagicTypes.Reanimation,
		ticks: 10
	},
	{
		name: 'Reanimate abyssal',
		levels: { Magic: 90 },
		xp: { Magic: 170, Prayer: 1300 },
		input: new Bank().add('Ensouled abyssal head', 1).add('Nature rune', 4).add('Blood rune', 2).add('Soul rune', 4),
		category: MagicTypes.Reanimation,
		ticks: 10
	},
	{
		name: 'Reanimate dragon',
		levels: { Magic: 90 },
		xp: { Magic: 170, Prayer: 1560 },
		input: new Bank().add('Ensouled dragon head', 1).add('Nature rune', 4).add('Blood rune', 2).add('Soul rune', 4),
		category: MagicTypes.Reanimation,
		ticks: 10
	},
	{
		name: 'Ape atoll teleport',
		levels: { Magic: 90 },
		xp: { Magic: 100 },
		input: new Bank().add('Blood rune', 2).add('Law rune', 2).add('Soul rune', 2),
		category: MagicTypes.Teleport,
		ticks: 4
	},
	{
		name: 'Sinister offering bones',
		levels: { Magic: 92 },
		xp: { Magic: 180, Prayer: 121.5 },
		input: new Bank().add('Bones', 3).add('Blood rune', 1).add('Wrath rune', 1),
		category: MagicTypes.Skilling,
		ticks: 8
	},
	{
		name: 'Sinister offering monkey bones',
		levels: { Magic: 92 },
		xp: { Magic: 180, Prayer: 135 },
		input: new Bank().add('Monkey bones', 3).add('Blood rune', 1).add('Wrath rune', 1),
		category: MagicTypes.Skilling,
		ticks: 8
	},
	{
		name: 'Sinister offering bat bones',
		levels: { Magic: 92 },
		xp: { Magic: 180, Prayer: 143.1 },
		input: new Bank().add('Bat bones', 3).add('Blood rune', 1).add('Wrath rune', 1),
		category: MagicTypes.Skilling,
		ticks: 8
	},
	{
		name: 'Sinister offering big bones',
		levels: { Magic: 92 },
		xp: { Magic: 180, Prayer: 405 },
		input: new Bank().add('Big bones', 3).add('Blood rune', 1).add('Wrath rune', 1),
		category: MagicTypes.Skilling,
		ticks: 8
	},
	{
		name: 'Sinister offering jogre bones',
		levels: { Magic: 92 },
		xp: { Magic: 180, Prayer: 405 },
		input: new Bank().add('Jogre bones', 3).add('Blood rune', 1).add('Wrath rune', 1),
		category: MagicTypes.Skilling,
		ticks: 8
	},
	{
		name: 'Sinister offering zogre bones',
		levels: { Magic: 92 },
		xp: { Magic: 180, Prayer: 607.5 },
		input: new Bank().add('Zogre bones', 3).add('Blood rune', 1).add('Wrath rune', 1),
		category: MagicTypes.Skilling,
		ticks: 8
	},
	{
		name: 'Sinister offering shaikahan bones',
		levels: { Magic: 92 },
		xp: { Magic: 180, Prayer: 675 },
		input: new Bank().add('Shaikahan bones', 3).add('Blood rune', 1).add('Wrath rune', 1),
		category: MagicTypes.Skilling,
		ticks: 8
	},
	{
		name: 'Sinister offering babydragon bones',
		levels: { Magic: 92 },
		xp: { Magic: 180, Prayer: 810 },
		input: new Bank().add('Babydragon bones', 3).add('Blood rune', 1).add('Wrath rune', 1),
		category: MagicTypes.Skilling,
		ticks: 8
	},
	{
		name: 'Sinister offering wyrm bones',
		levels: { Magic: 92 },
		xp: { Magic: 180, Prayer: 1350 },
		input: new Bank().add('Wyrm bones', 3).add('Blood rune', 1).add('Wrath rune', 1),
		category: MagicTypes.Skilling,
		ticks: 8
	},
	{
		name: 'Sinister offering dragon bones',
		levels: { Magic: 92 },
		xp: { Magic: 180, Prayer: 1944 },
		input: new Bank().add('Dragon bones', 3).add('Blood rune', 1).add('Wrath rune', 1),
		category: MagicTypes.Skilling,
		ticks: 8
	},
	{
		name: 'Sinister offering wyvern bones',
		levels: { Magic: 92 },
		xp: { Magic: 180, Prayer: 1944 },
		input: new Bank().add('Wyvern bones', 3).add('Blood rune', 1).add('Wrath rune', 1),
		category: MagicTypes.Skilling,
		ticks: 8
	},
	{
		name: 'Sinister offering drake bones',
		levels: { Magic: 92 },
		xp: { Magic: 180, Prayer: 2160 },
		input: new Bank().add('Drake bones', 3).add('Blood rune', 1).add('Wrath rune', 1),
		category: MagicTypes.Skilling,
		ticks: 8
	},
	{
		name: 'Sinister offering fayrg bones',
		levels: { Magic: 92 },
		xp: { Magic: 180, Prayer: 2268 },
		input: new Bank().add('Fayrg bones', 3).add('Blood rune', 1).add('Wrath rune', 1),
		category: MagicTypes.Skilling,
		ticks: 8
	},
	{
		name: 'Sinister offering lava dragon bones',
		levels: { Magic: 92 },
		xp: { Magic: 180, Prayer: 2295 },
		input: new Bank().add('Lava dragon bones', 3).add('Blood rune', 1).add('Wrath rune', 1),
		category: MagicTypes.Skilling,
		ticks: 8
	},
	{
		name: 'Sinister offering raurg bones',
		levels: { Magic: 92 },
		xp: { Magic: 180, Prayer: 2592 },
		input: new Bank().add('Raurg bones', 3).add('Blood rune', 1).add('Wrath rune', 1),
		category: MagicTypes.Skilling,
		ticks: 8
	},
	{
		name: 'Sinister offering hydra bones',
		levels: { Magic: 92 },
		xp: { Magic: 180, Prayer: 2970 },
		input: new Bank().add('Hydra bones', 3).add('Blood rune', 1).add('Wrath rune', 1),
		category: MagicTypes.Skilling,
		ticks: 8
	},
	{
		name: 'Sinister offering dagannoth bones',
		levels: { Magic: 92 },
		xp: { Magic: 180, Prayer: 3375 },
		input: new Bank().add('Dagannoth bones', 3).add('Blood rune', 1).add('Wrath rune', 1),
		category: MagicTypes.Skilling,
		ticks: 8
	},
	{
		name: 'Sinister offering ourg bones',
		levels: { Magic: 92 },
		xp: { Magic: 180, Prayer: 3780 },
		input: new Bank().add('Ourg bones', 3).add('Blood rune', 1).add('Wrath rune', 1),
		category: MagicTypes.Skilling,
		ticks: 8
	},
	{
		name: 'Sinister offering superior dragon bones',
		levels: { Magic: 92, Prayer: 70 },
		xp: { Magic: 180, Prayer: 4050 },
		input: new Bank().add('Superior dragon bones', 3).add('Blood rune', 1).add('Wrath rune', 1),
		category: MagicTypes.Skilling,
		ticks: 8
	},


];

export default Arceuus;