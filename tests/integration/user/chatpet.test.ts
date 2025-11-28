import { SeedableRNG } from '@oldschoolgg/rng';
import type { ItemBank } from 'oldschooljs';
import { expect, test } from 'vitest';

import pets from '@/lib/data/pets.js';
import { createTestUser } from '../util.js';

test('Chat pets', async () => {
	const user = await createTestUser();
	async function fetchPets() {
		const { pets } = await prisma.user.findUniqueOrThrow({
			where: { id: user.id },
			select: { pets: true }
		});
		return pets as ItemBank;
	}

	expect(await fetchPets()).toEqual({});
	const pet = new SeedableRNG(1).pick(pets);
	await user.giveBotMessagePet(pet);
	const petsX = await fetchPets();
	expect(Object.keys(petsX).length).toEqual(1);
	expect(petsX[pet.id]).toEqual(1);

	await user.giveBotMessagePet(pet);
	const petsY = await fetchPets();
	expect(Object.keys(petsY).length).toEqual(1);
	expect(petsY[pet.id]).toEqual(2);
});
