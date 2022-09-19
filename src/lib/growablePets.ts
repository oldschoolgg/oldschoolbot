import { roll, Time } from 'e';
import { Bank } from 'oldschooljs';

import { ActivityTaskOptions } from './types/minions';
import { itemNameFromID, randFloat } from './util';
import getOSItem from './util/getOSItem';
import resolveItems from './util/resolveItems';

export const kittens = resolveItems([
	'Grey and black kitten',
	'White kitten',
	'Brown kitten',
	'Black kitten',
	'Grey and brown kitten',
	'Grey and blue kitten'
]);

export const cats = resolveItems([
	'Grey and black cat',
	'White cat',
	'Brown cat',
	'Black cat',
	'Grey and brown cat',
	'Grey and blue cat'
]);

interface GrowablePet {
	growthRate: number;
	stages: number[];
	shinyVersion?: number;
	shinyChance?: number;
}

export const growablePets: GrowablePet[] = [
	{
		growthRate: (Time.Hour * 8) / Time.Minute,
		stages: resolveItems(['Baby raven', 'Raven'])
	},
	{
		growthRate: (Time.Hour * 5) / Time.Minute,
		stages: resolveItems(['Magic kitten', 'Magic cat'])
	}
];

for (let i = 0; i < kittens.length; i++) {
	growablePets.push({
		growthRate: (Time.Hour * 3) / Time.Minute,
		stages: [kittens[i], cats[i]],
		shinyChance: 500,
		shinyVersion: getOSItem('Shiny cat').id
	});
}

export async function handleGrowablePetGrowth(user: MUser, data: ActivityTaskOptions, messages: string[]) {
	const equippedPet = user.user.minion_equippedPet;
	if (!equippedPet) return;
	const equippedGrowablePet = growablePets.find(pet => pet.stages.includes(equippedPet));
	if (!equippedGrowablePet) return;
	if (equippedGrowablePet.stages[equippedGrowablePet.stages.length - 1] === equippedPet) return;
	const minutesInThisTrip = data.duration / Time.Minute;
	if (randFloat(0, equippedGrowablePet.growthRate) <= minutesInThisTrip) {
		let nextPet = equippedGrowablePet.stages[equippedGrowablePet.stages.indexOf(equippedPet) + 1];
		const isLastPet = nextPet === equippedGrowablePet.stages[equippedGrowablePet.stages.length - 1];
		if (nextPet === -1) {
			throw new Error(`${user.usernameOrMention}'s pet[${equippedPet}] has no index in growable pet stages.`);
		}
		if (
			isLastPet &&
			equippedGrowablePet.shinyChance &&
			equippedGrowablePet.shinyVersion &&
			roll(equippedGrowablePet.shinyChance)
		) {
			nextPet = equippedGrowablePet.shinyVersion;
		}

		await user.update({
			minion_equippedPet: nextPet,
			collectionLogBank: new Bank().add(user.cl).add(nextPet).bank
		});
		messages.push(`Your ${itemNameFromID(equippedPet)} grew into a ${itemNameFromID(nextPet)}!`);
	}
}
