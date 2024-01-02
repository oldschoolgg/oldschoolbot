import { Bank } from 'oldschooljs';

import { divinationEnergies, portents } from '../../bso/divination';
import { Createable } from '../createables';

export const divinationCreatables: Createable[] = [];

for (let i = 0; i < divinationEnergies.length; i++) {
	const energy = divinationEnergies[i];
	const previousEnergy = divinationEnergies[i - 1];
	if (!energy.boon || !energy.boonEnergyCost) continue;
	if (!previousEnergy) continue;

	divinationCreatables.push({
		name: `${energy.type} energy`,
		inputItems: new Bank().add(previousEnergy.item, energy.boonEnergyCost),
		outputItems: new Bank().add(energy.boon),
		requiredSkills: {
			divination: energy.level
		}
	});
}

for (const portent of portents) {
	divinationCreatables.push({
		name: portent.item.name,
		inputItems: portent.cost,
		outputItems: new Bank().add(portent.item),
		requiredSkills: {
			divination: portent.divinationLevelToCreate
		}
	});
}
