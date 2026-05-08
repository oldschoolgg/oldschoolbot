import { Time } from '@oldschoolgg/toolkit';
import { Bank, type Item, Items, resolveItems } from 'oldschooljs';

import type { TripFinishEffect } from '@/lib/util/handleTripFinish.js';

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

type GrowablePetMessage = (item: Item, shiny: boolean, user: MUser) => string | null;

interface GrowablePet {
	growthRate: number;
	stages: number[];
	shinyVersion?: number;
	shinyChance?: number;
	message?: GrowablePetMessage | string;
}

export const growablePets: GrowablePet[] = [
	{
		growthRate: (Time.Hour * 8) / Time.Minute,
		stages: resolveItems(['Baby raven', 'Raven'])
	},
	{
		growthRate: (Time.Hour * 5) / Time.Minute,
		stages: resolveItems(['Magic kitten', 'Magic cat'])
	},
	{
		growthRate: (Time.Hour * 2) / Time.Minute,
		stages: resolveItems(['Zamorak egg', 'Baby zamorak hawk', 'Juvenile zamorak hawk', 'Zamorak hawk'])
	},
	{
		growthRate: (Time.Hour * 2) / Time.Minute,
		stages: resolveItems(['Guthix egg', 'Baby guthix raptor', 'Juvenile guthix raptor', 'Guthix raptor'])
	},
	{
		growthRate: (Time.Hour * 2) / Time.Minute,
		stages: resolveItems(['Saradomin egg', 'Baby saradomin owl', 'Juvenile saradomin owl', 'Saradomin owl'])
	},
	{
		growthRate: (Time.Hour * 2) / Time.Minute,
		stages: resolveItems(['Penguin egg', 'Skip'])
	},
	{
		growthRate: (Time.Hour * 12) / Time.Minute,
		stages: resolveItems(['Magnegg', 'Magnabbit']),
		shinyChance: 50,
		shinyVersion: Items.getOrThrow('Radiant Magnabbit').id,
		message: (item, shiny, _user) => {
			return shiny
				? `\n\n🐇.... You might want to pinch yourself because **YOU JUST GOT A SHINY MAGNA!!**`
				: `\n\n🐣 Your ${item.name} has hatched!`;
		}
	}
];

for (let i = 0; i < kittens.length; i++) {
	growablePets.push({
		growthRate: (Time.Hour * 3) / Time.Minute,
		stages: [kittens[i], cats[i]],
		shinyChance: 500,
		shinyVersion: Items.getOrThrow('Shiny cat').id
	});
}

export const handleGrowablePetGrowth: TripFinishEffect['fn'] = async ({ user, data, messages, rng }) => {
	const equippedPet = user.user.minion_equippedPet;
	if (!equippedPet) return;
	const equippedGrowablePet = growablePets.find(pet => pet.stages.includes(equippedPet));
	if (!equippedGrowablePet) return;
	if (equippedGrowablePet.stages[equippedGrowablePet.stages.length - 1] === equippedPet) return;
	const minutesInThisTrip = data.duration / Time.Minute;
	if (rng.randFloat(0, equippedGrowablePet.growthRate) <= minutesInThisTrip) {
		let nextPet = Items.getOrThrow(equippedGrowablePet.stages[equippedGrowablePet.stages.indexOf(equippedPet) + 1]);
		const isLastPet = nextPet.id === equippedGrowablePet.stages[equippedGrowablePet.stages.length - 1];
		let shiny = false;
		if (
			isLastPet &&
			equippedGrowablePet.shinyChance &&
			equippedGrowablePet.shinyVersion &&
			rng.roll(equippedGrowablePet.shinyChance)
		) {
			shiny = true;
			nextPet = Items.getOrThrow(equippedGrowablePet.shinyVersion);
		}
		if (equippedGrowablePet.message) {
			const growthMsg =
				typeof equippedGrowablePet.message === 'string'
					? equippedGrowablePet.message
					: equippedGrowablePet.message(nextPet, shiny, user);
			if (growthMsg) messages.push(growthMsg);
		}

		// Sync to avoid out of date CL
		await user.sync();
		await user.addItemsToCollectionLog({
			itemsToAdd: new Bank().add(nextPet),
			otherUpdates: {
				minion_equippedPet: nextPet.id
			}
		});
	}
};

export const growablePetsCL = growablePets
	.flatMap(i => i.stages)
	.filter(i => !resolveItems(['Magnabbit', 'Magnegg', 'Skip', 'Penguin egg']).includes(i));
