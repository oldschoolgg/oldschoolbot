import { Items } from 'oldschooljs';

import type { DisassemblySourceGroup } from '@/lib/bso/skills/invention/index.js';

const i = Items.getOrThrow.bind(Items);

export const Barrows: DisassemblySourceGroup = {
	name: 'Barrows',
	description: 'Barrows weaponry and armor.',
	items: [
		{
			item: [
				"Karil's coif",
				"Karil's leathertop",
				"Karil's leatherskirt",
				"Karil's crossbow",
				"Ahrim's hood",
				"Ahrim's robetop",
				"Ahrim's robeskirt",
				"Ahrim's staff",
				"Dharok's helm",
				"Dharok's platebody",
				"Dharok's platelegs",
				"Dharok's greataxe",
				"Guthan's helm",
				"Guthan's platebody",
				"Guthan's chainskirt",
				"Guthan's warspear",
				"Torag's helm",
				"Torag's platebody",
				"Torag's platelegs",
				"Torag's hammers",
				"Verac's helm",
				"Verac's brassard",
				"Verac's plateskirt",
				"Verac's flail"
			].map(i),
			lvl: 80
		}
	],
	parts: { barrows: 80, strong: 10, protective: 10 }
};
