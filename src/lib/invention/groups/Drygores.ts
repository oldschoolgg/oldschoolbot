import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

export const Drygores: DisassemblySourceGroup = {
	name: 'Drygores',
	items: [
		{
			item: [
				'Drygore rapier',
				'Drygore rapier (blood)',
				'Drygore rapier (ice)',
				'Drygore rapier (shadow)',
				'Drygore rapier (3a)',
				'Drygore mace',
				'Drygore mace (blood)',
				'Drygore mace (ice)',
				'Drygore mace (shadow)',
				'Drygore mace (3a)',
				'Drygore longsword',
				'Drygore longsword (blood)',
				'Drygore longsword (ice)',
				'Drygore longsword (shadow)',
				'Drygore longsword (3a)'
			].map(getOSItem),
			lvl: 120
		}
	],
	parts: { drygore: 100 }
};
