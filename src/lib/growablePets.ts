import { Time } from 'e';
import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { UserSettings } from './settings/types/UserSettings';
import { ActivityTaskOptions } from './types/minions';
import { itemNameFromID, randFloat } from './util';
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
}

export const growablePets: GrowablePet[] = [];

for (let i = 0; i < kittens.length; i++) {
	growablePets.push({
		growthRate: (Time.Hour * 3) / Time.Minute,
		stages: [kittens[i], cats[i]]
	});
}

export async function handleGrowablePetGrowth(
	user: KlasaUser,
	data: ActivityTaskOptions,
	message: string
): Promise<string> {
	const equippedPet = user.settings.get(UserSettings.Minion.EquippedPet);
	if (!equippedPet) return message;
	const equippedGrowablePet = growablePets.find(pet => pet.stages.includes(equippedPet));
	if (!equippedGrowablePet) return message;
	if (equippedGrowablePet.stages[equippedGrowablePet.stages.length - 1] === equippedPet) return message;
	const minutesInThisTrip = data.duration / Time.Minute;
	if (randFloat(0, equippedGrowablePet.growthRate) <= minutesInThisTrip) {
		const nextPet = equippedGrowablePet.stages[equippedGrowablePet.stages.indexOf(equippedPet) + 1];
		if (nextPet === -1) {
			throw new Error(`${user.username}'s pet[${equippedPet}] has no index in growable pet stages.`);
		}
		await user.settings.update(UserSettings.Minion.EquippedPet, nextPet);
		await user.addItemsToCollectionLog({ items: new Bank().add(nextPet) });
		return `${message}\n\nYour ${itemNameFromID(equippedPet)} grew into a ${itemNameFromID(nextPet)}!`;
	}
	return message;
}
