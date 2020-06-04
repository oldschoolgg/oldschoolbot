import { Emoji } from '../../constants';
import { resolveNameBank } from '../../util';
import itemID from '../../util/itemID';
import { Burnable, SkillsEnum } from '../types';

const burnables: Burnable[] = [
	{
		name: 'Logs',
		id: itemID('Logs'),
		level: 1,
		xp: 40,
		inputLogs: resolveNameBank({ Logs: 1 })
	},
	{
		name: 'Oak logs',
		id: itemID('Oak logs'),
		level: 15,
		xp: 60,
		inputLogs: resolveNameBank({ 'Oak logs': 1 })
	},
	{
		name: 'Willow logs',
		id: itemID('Willow logs'),
		level: 30,
		xp: 90,
		inputLogs: resolveNameBank({ 'Willow logs': 1 })
	},
	{
		name: 'Teak logs',
		id: itemID('Teak logs'),
		level: 35,
		xp: 105,
		inputLogs: resolveNameBank({ 'Teak logs': 1 })
	},
	{
		name: 'Arctic pine logs',
		id: itemID('Arctic pine logs'),
		level: 42,
		xp: 125,
		inputLogs: resolveNameBank({ 'Arctic pine logs': 1 })
	},
	{
		name: 'Maple logs',
		id: itemID('Maple logs'),
		level: 45,
		xp: 135,
		inputLogs: resolveNameBank({ 'Maple logs': 1 })
	},
	{
		name: 'Mahogany logs',
		id: itemID('Mahogany logs'),
		level: 50,
		xp: 157.5,
		inputLogs: resolveNameBank({ 'Mahogany logs': 1 })
	},
	{
		name: 'Yew logs',
		id: itemID('Yew logs'),
		level: 60,
		xp: 202.5,
		inputLogs: resolveNameBank({ 'Yew logs': 1 })
	},
	{
		name: 'Magic logs',
		id: itemID('Magic logs'),
		level: 75,
		xp: 303.8,
		inputLogs: resolveNameBank({ 'Magic logs': 1 })
	},
	{
		name: 'Redwood logs',
		id: itemID('Redwood logs'),
		level: 90,
		xp: 350,
		inputLogs: resolveNameBank({ 'Redwood logs': 1 })
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
	pyromancerItems
};

export default Firemaking;
