import type { DisassemblySourceGroup } from '@/lib/bso/skills/invention/index.js';

import { Items } from 'oldschooljs';

export const Drygores: DisassemblySourceGroup = {
	name: 'Drygores',
	items: [
		{
			item: Items.resolveFullItems([
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
			]),
			lvl: 99
		},
		{
			item: Items.resolveFullItems([
				'Offhand drygore rapier',
				'Offhand drygore rapier (blood)',
				'Offhand drygore rapier (ice)',
				'Offhand drygore rapier (shadow)',
				'Offhand drygore rapier (3a)',
				'Offhand drygore mace',
				'Offhand drygore mace (blood)',
				'Offhand drygore mace (ice)',
				'Offhand drygore mace (shadow)',
				'Offhand drygore mace (3a)',
				'Offhand drygore longsword',
				'Offhand drygore longsword (blood)',
				'Offhand drygore longsword (ice)',
				'Offhand drygore longsword (shadow)',
				'Offhand drygore longsword (3a)'
			]),
			lvl: 99
		}
	],
	parts: { drygore: 100 }
};
