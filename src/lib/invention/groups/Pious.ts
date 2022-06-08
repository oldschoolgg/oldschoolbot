import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

export const Pious: DisassemblySourceGroup = {
	name: 'Pious',
	items: [
		{
			item: ['Holy blessing'].map(getOSItem),
			lvl: 50
		},
		{
			item: [
				'Zamorak page 1',
				'Zamorak page 2',
				'Zamorak page 3',
				'Zamorak page 4',
				'Guthix page 1',
				'Guthix page 2',
				'Guthix page 3',
				'Guthix page 4',
				'Armadyl page 1',
				'Armadyl page 2',
				'Armadyl page 3',
				'Armadyl page 4',
				'Bandos page 1',
				'Bandos page 2',
				'Bandos page 3',
				'Bandos page 4',
				'Saradomin page 1',
				'Saradomin page 2',
				'Saradomin page 3',
				'Saradomin page 4'
			].map(getOSItem),
			lvl: 50
		},
		{
			item: ['Zamorak hilt', 'Saradomin hilt', 'Bandos hilt', 'Armadyl hilt'].map(getOSItem),
			lvl: 1
		}
	],
	parts: { pious: 50, simple: 50 }
};
