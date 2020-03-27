import { SkillsEnum, Burn } from '../types';
import itemID from '../util/itemID';
import { Emoji } from '../constants';

const burns: Burn[] = [
	{
		name: 'Logs',
		level: 1,
		xp: 40,
		id: itemID('logs'),
		inputLogs: { [itemID('Logs')]: 1 }
	},
	{
		name: 'Oak logs',
		level: 15,
		xp: 60,
		id: itemID('Oak logs'),
		inputLogs: { [itemID('Oak logs')]: 1 }
	},
	{
		name: 'Willow logs',
		level: 30,
		xp: 90,
		id: itemID('Willow logs'),
		inputLogs: { [itemID('Willow logs')]: 1 }
	},
	{
		name: 'Teak logs',
		level: 35,
		xp: 105,
		id: itemID('Teak logs'),
		inputLogs: { [itemID('Teak logs')]: 1 }
	},
	{
		name: 'Arctic pine logs',
		level: 42,
		xp: 125,
		id: itemID('Arctic pine log'),
		inputLogs: { [itemID('Arctic pine logs')]: 1 }
	},
	{
		name: 'Maple logs',
		level: 45,
		xp: 135,
		id: itemID('Maple logs'),
		inputLogs: { [itemID('Maple logs')]: 1 }
	},
	{
		name: 'Mahogany logs',
		level: 50,
		xp: 157.5,
		id: itemID('Mahogany logs'),
		inputLogs: { [itemID('Mahogany logs')]: 1 }
	},
	{
		name: 'Yew logs',
		level: 60,
		xp: 202.5,
		id: itemID('aYew logs'),
		inputLogs: { [itemID('Yew logs')]: 1 }
	},
	{
		name: 'Magic logs',
		level: 75,
		xp: 303.8,
		id: itemID('Magic logs'),
		inputLogs: { [itemID('Magic logs')]: 1 }
	},
	{
		name: 'Redwood logs',
		level: 60,
		xp: 350,
		id: itemID('Redwood logs'),
		inputLogs: { [itemID('Redwood logs')]: 1 }
	}
];

const Firemaking = {
	Burns: burns,
	id: SkillsEnum.Firemaking,
	emoji: Emoji.Firemaking
};

export default Firemaking;
