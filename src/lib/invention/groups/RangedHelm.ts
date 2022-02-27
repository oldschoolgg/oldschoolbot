import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const RangedHelm: DisassemblySourceGroup = {
	name: 'RangedHelm',
	items: [
		{ item: i('Leather cowl'), lvl: 1 },
		{ item: i('Snakeskin bandana'), lvl: 30 },
		{
			item: i('Armadyl mitre'),
			lvl: 40,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 6 }] }
		},
		{
			item: i('Guthix mitre'),
			lvl: 40,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 6 }] }
		},
		{
			item: i('Robin hood hat'),
			lvl: 40,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 6 }] }
		},
		{
			item: i('Saradomin mitre'),
			lvl: 40,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 6 }] }
		},
		{
			item: i('Zamorak mitre'),
			lvl: 40,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 6 }] }
		},
		{ item: i('Archer helm'), lvl: 45 },
		{ item: i('Ranger hat'), lvl: 50 },
		{ item: i('Runner hat'), lvl: 50 },
		{ item: i('Spined helm'), lvl: 50 },
		{
			item: i('Armadyl helmet'),
			lvl: 70,
			special: { always: true, parts: [{ type: 'armadyl', chance: 100, amount: 6 }] }
		},
		{
			item: i("Karil's coif"),
			lvl: 70,
			special: { always: false, parts: [{ type: 'undead', chance: 100, amount: 6 }] }
		},
		{ item: i("Morrigan's coif"), lvl: 78 }
	],
	parts: {},
	partQuantity: 6
};

export default RangedHelm;
