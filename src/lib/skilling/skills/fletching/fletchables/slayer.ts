import { Bank } from 'oldschooljs';

import { SlayerTaskUnlocksEnum } from '../../../../slayer/slayerUnlocks';
import itemID from '../../../../util/itemID';
import { Fletchable } from '../../../types';

const Slayer: Fletchable[] = [
	{
		name: 'Incomplete heavy ballista',
		id: itemID('Incomplete heavy ballista'),
		level: 72,
		xp: 1,
		inputItems: new Bank({ 'Ballista limbs': 1, 'Heavy frame': 1 }),
		tickRate: 3
	},
	{
		name: 'Incomplete light ballista',
		id: itemID('Incomplete light ballista'),
		level: 72,
		xp: 1,
		inputItems: new Bank({ 'Ballista limbs': 1, 'Light frame': 1 }),
		tickRate: 3
	},
	{
		name: 'Unstrung heavy ballista',
		id: itemID('Unstrung heavy ballista'),
		level: 72,
		xp: 1,
		inputItems: new Bank({
			'Ballista spring': 1,
			'Incomplete heavy ballista': 1
		}),
		tickRate: 3
	},
	{
		name: 'Unstrung light ballista',
		id: itemID('Unstrung light ballista'),
		level: 72,
		xp: 1,
		inputItems: new Bank({
			'Ballista spring': 1,
			'Incomplete light ballista': 1
		}),
		tickRate: 3
	},
	{
		name: 'Heavy ballista',
		id: itemID('Heavy ballista'),
		level: 72,
		xp: 1,
		inputItems: new Bank({
			'Monkey tail': 1,
			'Unstrung heavy ballista': 1
		}),
		tickRate: 3
	},
	{
		name: 'Light ballista',
		id: itemID('Light ballista'),
		level: 72,
		xp: 1,
		inputItems: new Bank({
			'Monkey tail': 1,
			'Unstrung light ballista': 1
		}),
		tickRate: 3
	},
	{
		name: 'Broad arrows',
		id: itemID('Broad arrows'),
		level: 52,
		xp: 10,
		inputItems: new Bank({ 'Broad arrowheads': 1, 'Headless arrow': 1 }),
		tickRate: 0.13,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.BroaderFletching]
	},
	{
		name: 'Broad bolts',
		id: itemID('Broad bolts'),
		level: 55,
		xp: 3,
		inputItems: new Bank({ 'Unfinished broad bolts': 1, Feather: 1 }),
		tickRate: 0.08,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.BroaderFletching]
	},
	{
		name: 'Amethyst broad bolts',
		id: itemID('Amethyst broad bolts'),
		level: 76,
		xp: 10.6,
		inputItems: new Bank({ 'Broad bolts': 1, 'Amethyst bolt tips': 1 }),
		tickRate: 0.13,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.BroaderFletching]
	}
];

export default Slayer;
