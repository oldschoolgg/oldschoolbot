import { Bank } from 'oldschooljs';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import { Creature, HunterTechniqueEnum } from '../../../types';

const customBSOCreatures: Creature[] = [
	{
		name: 'Sand Gecko',
		id: 3251,
		aliases: ['sand gecko'],
		level: 120,
		hunterXP: 2100,
		table: new LootTable()
			.tertiary(26_000, 'Sandy')
			.tertiary(
				22,
				new LootTable()
					.oneIn(90, 'Pet Mystery Box')
					.oneIn(30, 'Equippable mystery box')
					.add('Tradeable Mystery Box')
					.add('Untradeable Mystery Box')
			)
			.tertiary(400, 'Clue scroll (grandmaster)')
			.tertiary(5, 'Sand')
			.tertiary(10, 'Sandworms', [2, 20]),
		qpRequired: 3,
		huntTechnique: HunterTechniqueEnum.Tracking,
		catchTime: 91,
		slope: 0,
		intercept: 99,
		bait: qty => {
			let req = new Bank();
			const kibbleRequired = Math.ceil(qty / 8);
			req.add('Simple kibble', kibbleRequired);
			return req;
		}
	}
];

export default customBSOCreatures;
