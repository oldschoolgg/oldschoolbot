import { Emoji } from '../../constants';
import itemID from '../../util/itemID';
import { Bone, SkillsEnum } from '../types';

export const bones: Bone[] = [
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
	},
	{
		name: 'Abyssal dragon bones',
		level: 99,
		xp: 250,
		inputId: itemID('Abyssal dragon bones')
	},
	{
		name: 'Frost dragon bones',
		level: 80,
		xp: 165,
		inputId: itemID('Frost dragon bones')
	},
	{
		name: 'Royal dragon bones',
		level: 99,
		xp: 250,
		inputId: itemID('Royal dragon bones')
	}
];

const Prayer = {
	aliases: ['prayer', 'pray'],
	Bones: bones,
	id: SkillsEnum.Prayer,
	emoji: Emoji.Prayer,
	name: 'Prayer'
};

export default Prayer;
