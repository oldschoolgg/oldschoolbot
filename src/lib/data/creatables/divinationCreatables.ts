import { Bank } from 'oldschooljs';

import { basePortentCost, calcAtomicEnergy, divinationEnergies, portents } from '../../bso/divination';
import { Createable } from '../createables';

export const divinationCreatables: Createable[] = [];

for (let i = 0; i < divinationEnergies.length; i++) {
	const energy = divinationEnergies[i];

	divinationCreatables.push({
		name: `Revert ${energy.item.name}`,
		inputItems: new Bank().add(energy.item, 1),
		outputItems: new Bank().add('Atomic energy', calcAtomicEnergy(energy)),
		requiredSkills: {
			divination: energy.level
		},
		forceAddToCl: true
	});

	const previousEnergy = divinationEnergies[i - 1];
	if (!energy.boon || !energy.boonEnergyCost) continue;
	if (!previousEnergy) continue;

	divinationCreatables.push({
		name: energy.boon.name,
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
		inputItems: portent.cost.clone().add(basePortentCost),
		outputItems: new Bank().add(portent.item),
		requiredSkills: {
			divination: portent.divinationLevelToCreate
		}
	});
}
