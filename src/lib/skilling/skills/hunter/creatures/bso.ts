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
			.tertiary(
				22,
				new LootTable()
					.oneIn(90, 'Pet Mystery Box')
					.oneIn(30, 'Equippable mystery box')
					.add('Tradeable Mystery Box')
					.add('Untradeable Mystery Box')
			)
			.tertiary(500, 'Clue scroll (hard)')
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
	},
	{
		name: 'Eastern ferret',
		id: 91_938,
		aliases: ['eastern ferret'],
		level: 96,
		hunterXP: 2100,
		table: new LootTable().every('Eastern ferret'),
		qpRequired: 600,
		huntTechnique: HunterTechniqueEnum.Tracking,
		catchTime: 350,
		slope: 0,
		intercept: 99,
		bait: qty => {
			let req = new Bank();
			const kibbleRequired = Math.ceil(qty / 2);
			req.add('Delicious kibble', kibbleRequired);
			return req;
		}
	},
	{
		name: 'Chimpchompa',
		id: 63_204,
		aliases: ['chimpchompa'],
		level: 99,
		hunterXP: 300,
		table: new LootTable().every('Chimpchompa'),
		huntTechnique: HunterTechniqueEnum.BoxTrapping,
		multiTraps: true,
		wildy: false,
		prayerLvl: 43,
		catchTime: 200,
		qpRequired: 2,
		slope: 1.22,
		intercept: -31.33,
		bait: qty => {
			return new Bank().add('Banana', qty);
		}
	}
];

export default customBSOCreatures;
