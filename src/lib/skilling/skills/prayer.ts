import { itemID } from 'oldschooljs/dist/util';

import { Emoji } from '../../constants';
import { Bone, SkillsEnum } from '../types';
import { Prayer } from './../types';

const prayers: Prayer[] = [
	{
		level: 1,
		name: 'Thick Skin',
		drainRate: 12,
		drainEffect: 3,
		unlocked: true,
		defensive: true
	},
	{
		level: 4,
		name: 'Burst of Strength',
		drainRate: 12,
		drainEffect: 3,
		unlocked: true,
		offensive1: true
	},
	{
		level: 7,
		name: 'Clarity of Thought',
		drainRate: 12,
		drainEffect: 3,
		unlocked: true,
		offensive2: true
	},
	{
		level: 8,
		name: 'Sharp Eye',
		drainRate: 12,
		drainEffect: 3,
		unlocked: true,
		offensive1: true,
		offensive2: true
	},
	{
		level: 9,
		name: 'Mystic Will',
		drainRate: 12,
		drainEffect: 3,
		unlocked: true,
		offensive1: true,
		offensive2: true
	},
	{
		level: 10,
		name: 'Rock Skin',
		drainRate: 6,
		drainEffect: 6,
		unlocked: true,
		defensive: true
	},
	{
		level: 13,
		name: 'Superhuman Strength',
		drainRate: 6,
		drainEffect: 6,
		unlocked: true,
		offensive1: true
	},
	{
		level: 16,
		name: 'Improved Reflexes',
		drainRate: 6,
		drainEffect: 6,
		unlocked: true,
		offensive2: true
	},
	{
		level: 19,
		name: 'Rapid Restore',
		drainRate: 36,
		drainEffect: 1,
		unlocked: true
	},
	{
		level: 22,
		name: 'Rapid Heal',
		drainRate: 18,
		drainEffect: 2,
		unlocked: true
	},
	{
		level: 25,
		name: 'Protect Item',
		drainRate: 18,
		drainEffect: 2,
		unlocked: true
	},
	{
		level: 26,
		name: 'Hawk Eye',
		drainRate: 6,
		drainEffect: 6,
		unlocked: true,
		offensive1: true,
		offensive2: true
	},
	{
		level: 27,
		name: 'Mystic Lore',
		drainRate: 6,
		drainEffect: 6,
		unlocked: true,
		offensive1: true,
		offensive2: true
	},
	{
		level: 28,
		name: 'Steel Skin',
		drainRate: 3,
		drainEffect: 12,
		unlocked: true,
		defensive: true
	},
	{
		level: 31,
		name: 'Ultimate Strength',
		drainRate: 3,
		drainEffect: 12,
		unlocked: true,
		offensive1: true
	},
	{
		level: 34,
		name: 'Incredible Reflexes',
		drainRate: 3,
		drainEffect: 12,
		unlocked: true,
		offensive2: true
	},
	{
		level: 37,
		name: 'Protect from Magic',
		drainRate: 3,
		drainEffect: 12,
		unlocked: true,
		overHead: true
	},
	{
		level: 40,
		name: 'Protect from Missiles',
		drainRate: 3,
		drainEffect: 12,
		unlocked: true,
		overHead: true
	},
	{
		level: 43,
		name: 'Protect from Melee',
		drainRate: 3,
		drainEffect: 12,
		unlocked: true,
		overHead: true
	},
	{
		level: 44,
		name: 'Eagle Eye',
		drainRate: 3,
		drainEffect: 12,
		unlocked: true,
		offensive1: true,
		offensive2: true
	},
	{
		level: 45,
		name: 'Mystic Might',
		drainRate: 3,
		drainEffect: 12,
		unlocked: true,
		offensive1: true,
		offensive2: true
	},
	{
		level: 46,
		name: 'Retribution',
		drainRate: 12,
		drainEffect: 3,
		unlocked: true,
		overHead: true
	},
	{
		level: 49,
		name: 'Redemption',
		drainRate: 6,
		drainEffect: 6,
		unlocked: true,
		overHead: true
	},
	{
		level: 52,
		name: 'Smite',
		drainRate: 2,
		drainEffect: 18,
		unlocked: true,
		overHead: true
	},
	{
		level: 55,
		name: 'Preserve',
		drainRate: 18,
		drainEffect: 2,
		unlocked: false,
		inputId: itemID('Torn prayer scroll')
	},
	{
		level: 60,
		defLvl: 65,
		name: 'Chivalry',
		drainRate: 1.5,
		drainEffect: 24,
		unlocked: false,
		qpRequired: 25,
		offensive1: true,
		offensive2: true,
		defensive: true
	},
	{
		level: 70,
		defLvl: 70,
		name: 'Piety',
		drainRate: 1.5,
		drainEffect: 24,
		unlocked: false,
		qpRequired: 25,
		offensive1: true,
		offensive2: true,
		defensive: true
	},
	{
		level: 74,
		defLvl: 70,
		name: 'Rigour',
		drainRate: 1.5,
		drainEffect: 24,
		unlocked: false,
		inputId: itemID('Dexterous prayer scroll'),
		offensive1: true,
		offensive2: true,
		defensive: true
	},
	{
		level: 77,
		defLvl: 70,
		name: 'Augury',
		drainRate: 1.5,
		drainEffect: 24,
		unlocked: false,
		inputId: itemID('Arcane prayer scroll'),
		offensive1: true,
		offensive2: true,
		defensive: true
	}
];

const bones: Bone[] = [
	{
		name: 'Bones',
		level: 1,
		xp: 4.5,
		inputId: itemID('Bones')
	},
	{
		name: 'Wolf bones',
		level: 1,
		xp: 4.5,
		inputId: itemID('Wolf bones')
	},
	{
		name: 'Monkey bones',
		level: 1,
		xp: 5,
		inputId: itemID('Monkey bones')
	},
	{
		name: 'Bat bones',
		level: 1,
		xp: 5.3,
		inputId: itemID('Bat bones')
	},
	{
		name: 'Big bones',
		level: 1,
		xp: 15,
		inputId: itemID('Big bones')
	},
	{
		name: 'Jogre bones',
		level: 1,
		xp: 15,
		inputId: itemID('Jogre bones')
	},
	{
		name: 'Zogre bones',
		level: 1,
		xp: 22.5,
		inputId: itemID('Zogre bones')
	},
	{
		name: 'Shaikahan bones',
		level: 1,
		xp: 25,
		inputId: itemID('Shaikahan bones')
	},
	{
		name: 'Babydragon bones',
		level: 1,
		xp: 30,
		inputId: itemID('Babydragon bones')
	},
	{
		name: 'Wyrm bones',
		level: 1,
		xp: 50,
		inputId: itemID('Wyrm bones')
	},
	{
		name: 'Dragon bones',
		level: 1,
		xp: 72,
		inputId: itemID('Dragon bones')
	},
	{
		name: 'Wyvern bones',
		level: 1,
		xp: 72,
		inputId: itemID('Wyvern bones')
	},
	{
		name: 'Drake bones',
		level: 1,
		xp: 80,
		inputId: itemID('Drake bones')
	},
	{
		name: 'Fayrg bones',
		level: 1,
		xp: 84,
		inputId: itemID('Fayrg bones')
	},
	{
		name: 'Lava dragon bones',
		level: 1,
		xp: 85,
		inputId: itemID('Lava dragon bones')
	},
	{
		name: 'Raurg bones',
		level: 1,
		xp: 96,
		inputId: itemID('Raurg bones')
	},
	{
		name: 'Hydra bones',
		level: 1,
		xp: 110,
		inputId: itemID('Hydra bones')
	},
	{
		name: 'Dagannoth bones',
		level: 1,
		xp: 125,
		inputId: itemID('Dagannoth bones')
	},
	{
		name: 'Ourg bones',
		level: 1,
		xp: 140,
		inputId: itemID('Ourg bones')
	},
	{
		name: 'Superior dragon bones',
		level: 70,
		xp: 150,
		inputId: itemID('Superior dragon bones')
	}
];

const Prayer = {
	aliases: ['prayer', 'pray'],
	Bones: bones,
	Prayers: prayers,
	id: SkillsEnum.Prayer,
	emoji: Emoji.Prayer,
	name: 'Prayer'
};

export default Prayer;
