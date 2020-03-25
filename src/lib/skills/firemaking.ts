import { SkillsEnum, Burn } from '../types';
import itemID from '../util/itemID';
import { Emoji } from '../constants';

const logs: Burn[] = [
	{
		name: 'Logs',
		level: 1,
		xp: 40,
		id: itemID('ashes'),
		inputLogs: { [itemID('Logs')]: 1 }
	},
	{
		name: 'Oak logs',
		level: 15,
		xp: 60,
		id: itemID('ashes'),
		inputLogs: { [itemID('Oak logs')]: 1 }
	},
	{
		name: 'Willow logs',
		level: 30,
		xp: 90,
		id: itemID('ashes'),
		inputLogs: { [itemID('Willow logs')]: 1 }
	},
	{
		name: 'Teak logs',
		level: 35,
		xp: 105,
		id: itemID('ashes'),
		inputLogs: { [itemID('Teak Logs')]: 1 }
	},
	{
		name: 'Arctic pine logs',
		level: 42,
		xp: 125,
		id: itemID('ashes'),
		inputLogs: { [itemID('Arctic pine logs')]: 1 }
	},
	{
		name: 'Maple logs',
		level: 45,
		xp: 135,
		id: itemID('ashes'),
		inputLogs: { [itemID('Maple logs')]: 1 }
	},
	{
		name: 'Mahogany logs',
		level: 50,
		xp: 157.5,
		id: itemID('ashes'),
		inputLogs: { [itemID('Mahogany logs')]: 1 }
	},
	{
		name: 'Yew logs',
		level: 60,
		xp: 202.5,
		id: itemID('ashes'),
		inputLogs: { [itemID('Yew logs')]: 1 }
	},
	{
		name: 'Magic logs',
		level: 75,
		xp: 303.8,
		id: itemID('ashes'),
		inputLogs: { [itemID('Magic logs')]: 1 }
	},
	{
		name: 'Redwood logs',
		level: 60,
		xp: 350,
		id: itemID('ashes'),
		inputLogs: { [itemID('Redwood logs')]: 1 }
	}
];

const Firemaking = {
	Logs: logs,
	id: SkillsEnum.Firemaking,
	emoji: Emoji.Firemaking
};

export default Firemaking;
