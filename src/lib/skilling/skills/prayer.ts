import { Bone, SkillsEnum } from '../types';
import itemID from '../../util/itemID';
import { Emoji } from '../../constants';

const bones: Bone[] = [
	{
		name: 'bones',
		level: 1,
		xp: 4.5,
		inputBones: itemID('Bones')
	},
	{
		name: 'monkey bones',
		level: 1,
		xp: 5,
		inputBones: itemID('Monkey bones')
	},
	{
		name: 'bat bones',
		level: 1,
		xp: 5.3,
		inputBones: itemID('Bat bones')
	},
	{
		name: 'big bones',
		level: 1,
		xp: 15,
		inputBones: itemID('Big bones')
	},
	{
		name: 'jogre bones',
		level: 1,
		xp: 15,
		inputBones: itemID('Jogre bones')
	},
	{
		name: 'zogre bones',
		level: 1,
		xp: 22.5,
		inputBones: itemID('Zogre bones')
	},
	{
		name: 'shaikahan bones',
		level: 1,
		xp: 25,
		inputBones: itemID('Shaikahan bones')
	},
	{
		name: 'babydragon bones',
		level: 1,
		xp: 30,
		inputBones: itemID('Babydragon bones')
	},
	{
		name: 'wyrm bones',
		level: 1,
		xp: 50,
		inputBones: itemID('Wyrm bones')
	},
	{
		name: 'dragon bones',
		level: 1,
		xp: 72,
		inputBones: itemID('Dragon bones')
	},
	{
		name: 'wyvern bones',
		level: 1,
		xp: 72,
		inputBones: itemID('Wyvern bones')
	},
	{
		name: 'drake bones',
		level: 1,
		xp: 80,
		inputBones: itemID('Drake bones')
	},
	{
		name: 'Fayrg bones',
		level: 1,
		xp: 84,
		inputBones: itemID('Fayrg bones')
	},
	{
		name: 'lava dragon bones',
		level: 1,
		xp: 85,
		inputBones: itemID('Lava dragon bones')
	},
	{
		name: 'raurg bones',
		level: 1,
		xp: 96,
		inputBones: itemID('Raurg bones')
	},
	{
		name: 'hydra bones',
		level: 1,
		xp: 110,
		inputBones: itemID('Hydra bones')
	},
	{
		name: 'dagannoth bones',
		level: 1,
		xp: 125,
		inputBones: itemID('Dagannoth bones')
	},
	{
		name: 'ourg bones',
		level: 1,
		xp: 140,
		inputBones: itemID('Ourg bones')
	},
	{
		name: 'superior dragon bones',
		level: 70,
		xp: 150,
		inputBones: itemID('superior dragon bones')
	}
];

const Prayer = {
	aliases: ['prayer', 'pray'],
	Bones: bones,
	id: SkillsEnum.Prayer,
	emoji: Emoji.Prayer
};

export default Prayer;
