import { Emoji } from '@oldschoolgg/toolkit/constants';
import { itemID } from 'oldschooljs';
import { EItem } from 'oldschooljs/EItem';

import type { Burnable } from '../types';
import { SkillsEnum } from '../types';

const burnables: Burnable[] = [
	{
		name: 'Logs',
		level: 1,
		xp: 40,
		inputLogs: EItem.LOGS
	},
	{
		name: 'Oak logs',
		level: 15,
		xp: 60,
		inputLogs: EItem.OAK_LOGS
	},
	{
		name: 'Willow logs',
		level: 30,
		xp: 90,
		inputLogs: EItem.WILLOW_LOGS
	},
	{
		name: 'Teak logs',
		level: 35,
		xp: 105,
		inputLogs: EItem.TEAK_LOGS
	},
	{
		name: 'Arctic pine logs',
		level: 42,
		xp: 125,
		inputLogs: EItem.ARCTIC_PINE_LOGS
	},
	{
		name: 'Maple logs',
		level: 45,
		xp: 135,
		inputLogs: EItem.MAPLE_LOGS
	},
	{
		name: 'Mahogany logs',
		level: 50,
		xp: 157.5,
		inputLogs: EItem.MAHOGANY_LOGS
	},
	{
		name: 'Yew logs',
		level: 60,
		xp: 202.5,
		inputLogs: EItem.YEW_LOGS
	},
	{
		name: 'Magic logs',
		level: 75,
		xp: 303.8,
		inputLogs: EItem.MAGIC_LOGS
	},
	{
		name: 'Redwood logs',
		level: 90,
		xp: 350,
		inputLogs: EItem.REDWOOD_LOGS
	},
	{
		name: 'Elder logs',
		level: 99,
		xp: 450,
		inputLogs: itemID('Elder logs')
	}
];

const pyromancerItems: { [key: number]: number } = {
	[EItem.PYROMANCER_HOOD]: 0.4,
	[EItem.PYROMANCER_GARB]: 0.8,
	[EItem.PYROMANCER_ROBE]: 0.6,
	[EItem.PYROMANCER_BOOTS]: 0.2
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
