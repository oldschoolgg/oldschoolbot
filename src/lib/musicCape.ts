import { Bank } from 'oldschooljs';

import { Requirements } from './structures/Requirements';

const musicCapeRequirements = new Requirements()
	.add({
		clRequirement: new Bank().add('Brittle key')
	})
	.add({
		name: 'Required Stats',
		skillRequirements: {
			slayer: 75,
			hitpoints: 70,
			agility: 70,
			farming: 65,
			thieving: 65,
			mining: 50,
			firemaking: 50,
			fishing: 35,
			magic: 33
		}
	})
	.add({
		clRequirement: new Bank().add("Champion's scroll").add('Dark totem').add('Mossy key').add('Mossy key')
	});
