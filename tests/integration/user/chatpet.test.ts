import { SeedableRNG } from '@oldschoolgg/rng';
import type { ItemBank } from 'oldschooljs';
import { expect, test } from 'vitest';

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
	const x = await user.giveRandomBotMessagesPet(new SeedableRNG(1));
	const petsX = await fetchPets();
	expect(Object.keys(petsX).length).toEqual(1);
	expect(petsX[x.pet.id]).toEqual(1);

	const y = await user.giveRandomBotMessagesPet(new SeedableRNG(1));
	const petsY = await fetchPets();
	expect(Object.keys(petsY).length).toEqual(1);
	expect(petsY[y.pet.id]).toEqual(2);

	await user.giveRandomBotMessagesPet();
	await user.giveRandomBotMessagesPet();
	await user.giveRandomBotMessagesPet();
	const petsFinal = await fetchPets();
	expect(Object.keys(petsFinal).length).toBeGreaterThan(1);
	expect(petsY[y.pet.id]).toEqual(2);
});
