import { Emoji } from '../../constants';
import { resolveNameBank } from '../../util';
import itemID from '../../util/itemID';
import { Bone, SkillsEnum } from '../types';

const bones: Bone[] = [
	{
		name: 'Bones',
		level: 1,
		xp: 4.5,
		id: itemID('Bones'),
		inputItems: resolveNameBank({ Bones: 1 })
	},
	{
		name: 'Wolf bones',
		level: 1,
		xp: 4.5,
		id: itemID('Wolf bones'),
		inputItems: resolveNameBank({ 'Wolf bones': 1 })
	},
	{
		name: 'Monkey bones',
		level: 1,
		xp: 5,
		id: itemID('Monkey bones'),
		inputItems: resolveNameBank({ 'Monkey bones': 1 })
	},
	{
		name: 'Bat bones',
		level: 1,
		xp: 5.3,
		id: itemID('Bat bones'),
		inputItems: resolveNameBank({ 'Bat bones': 1 })
	},
	{
		name: 'Big bones',
		level: 1,
		xp: 15,
		id: itemID('Big bones'),
		inputItems: resolveNameBank({ 'Big bones': 1 })
	},
	{
		name: 'Jogre bones',
		level: 1,
		xp: 15,
		id: itemID('Jogre bones'),
		inputItems: resolveNameBank({ 'Jogre bones': 1 })
	},
	{
		name: 'Zogre bones',
		level: 1,
		xp: 22.5,
		id: itemID('Zogre bones'),
		inputItems: resolveNameBank({ 'Zogre bones': 1 })
	},
	{
		name: 'Shaikahan bones',
		level: 1,
		xp: 25,
		id: itemID('Shaikahan bones'),
		inputItems: resolveNameBank({ 'Shaikahan bones': 1 })
	},
	{
		name: 'Babydragon bones',
		level: 1,
		xp: 30,
		id: itemID('Babydragon bones'),
		inputItems: resolveNameBank({ 'Babydragon bones': 1 })
	},
	{
		name: 'Wyrm bones',
		level: 1,
		xp: 50,
		id: itemID('Wyrm bones'),
		inputItems: resolveNameBank({ 'Wyrm bones': 1 })
	},
	{
		name: 'Dragon bones',
		level: 1,
		xp: 72,
		id: itemID('Dragon bones'),
		inputItems: resolveNameBank({ 'Dragon bones': 1 })
	},
	{
		name: 'Wyvern bones',
		level: 1,
		xp: 72,
		id: itemID('Wyvern bones'),
		inputItems: resolveNameBank({ 'Wyvern bones': 1 })
	},
	{
		name: 'Drake bones',
		level: 1,
		xp: 80,
		id: itemID('Drake bones'),
		inputItems: resolveNameBank({ 'Drake bones': 1 })
	},
	{
		name: 'Fayrg bones',
		level: 1,
		xp: 84,
		id: itemID('Fayrg bones'),
		inputItems: resolveNameBank({ 'Fayrg bones': 1 })
	},
	{
		name: 'Lava dragon bones',
		level: 1,
		xp: 85,
		id: itemID('Lava dragon bones'),
		inputItems: resolveNameBank({ 'Lava dragon bones': 1 })
	},
	{
		name: 'Raurg bones',
		level: 1,
		xp: 96,
		id: itemID('Raurg bones'),
		inputItems: resolveNameBank({ 'Raurg bones': 1 })
	},
	{
		name: 'Hydra bones',
		level: 1,
		xp: 110,
		id: itemID('Hydra bones'),
		inputItems: resolveNameBank({ 'Hydra bones': 1 })
	},
	{
		name: 'Dagannoth bones',
		level: 1,
		xp: 125,
		id: itemID('Dagannoth bones'),
		inputItems: resolveNameBank({ 'Dagannoth bones': 1 })
	},
	{
		name: 'Ourg bones',
		level: 1,
		xp: 140,
		id: itemID('Ourg bones'),
		inputItems: resolveNameBank({ 'Ourg bones': 1 })
	},
	{
		name: 'Superior dragon bones',
		level: 70,
		xp: 150,
		id: itemID('Superior dragon bones'),
		inputItems: resolveNameBank({ 'Superior dragon bones': 1 })
	}
];

const Prayer = {
	aliases: ['prayer', 'pray'],
	Bones: bones,
	id: SkillsEnum.Prayer,
	emoji: Emoji.Prayer
};

export default Prayer;
