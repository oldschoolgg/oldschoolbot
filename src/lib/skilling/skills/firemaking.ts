import { Emoji } from '../../constants';
import itemID from '../../util/itemID';
import type { Burnable } from '../types';
import { SkillsEnum } from '../types';

const burnables: Burnable[] = [
	{
		name: 'Logs',
		level: 1,
		xp: 40,
		inputLogs: itemID('Logs')
	},
	{
		name: 'Oak logs',
		level: 15,
		xp: 60,
		inputLogs: itemID('Oak logs')
	},
	{
		name: 'Willow logs',
		level: 30,
		xp: 90,
		inputLogs: itemID('Willow logs')
	},
	{
		name: 'Teak logs',
		level: 35,
		xp: 105,
		inputLogs: itemID('Teak logs')
	},
	{
		name: 'Arctic pine logs',
		level: 42,
		xp: 125,
		inputLogs: itemID('Arctic pine logs')
	},
	{
		name: 'Maple logs',
		level: 45,
		xp: 135,
		inputLogs: itemID('Maple logs')
	},
	{
		name: 'Mahogany logs',
		level: 50,
		xp: 157.5,
		inputLogs: itemID('Mahogany logs')
	},
	{
		name: 'Yew logs',
		level: 60,
		xp: 202.5,
		inputLogs: itemID('Yew logs')
	},
	{
		name: 'Magic logs',
		level: 75,
		xp: 303.8,
		inputLogs: itemID('Magic logs')
	},
	{
		name: 'Redwood logs',
		level: 90,
		xp: 350,
		inputLogs: itemID('Redwood logs')
	}
];

const pyromancerItems: { [key: number]: number } = {
	[itemID('Pyromancer hood')]: 0.4,
	[itemID('Pyromancer garb')]: 0.8,
	[itemID('Pyromancer robe')]: 0.6,
	[itemID('Pyromancer boots')]: 0.2
};

const Firemaking = {
	aliases: ['fm', 'firemaking'],
	Burnables: burnables,
	id: SkillsEnum.Firemaking,
	emoji: Emoji.Firemaking,
	pyromancerItems,
	name: 'Firemaking'
};

export default Firemaking;
