import { stringMatches, stringSearch } from '@oldschoolgg/toolkit';
import { MathRNG, type RNGProvider } from 'node-rng';
import { Items } from 'oldschooljs';

import {
	allPetVariations,
	getPetVariation,
	type PetVariation,
	petCostBanks,
	petMetamorphRandom
} from '@/lib/petVariations.js';

function getCostTargets(user: MUser, petId: number, variation: PetVariation) {
	const bank = user.bankWithGP;
	return variation.metamorphs
		.filter(morph => !morph.requirement || morph.requirement(user, petId))
		.flatMap(morph => morph.cost ?? [])
		.filter(target => target.petId !== petId)
		.map(({ petId, costOption }) => {
			const costs = petCostBanks(costOption).map(cost =>
				user.isIronman && cost.amount('Coins') === 5_000_000
					? cost.clone().remove('Coins', 5_000_000).add('Coins', 500_000)
					: cost
			);
			const affordableCosts = costs.filter(cost => bank.has(cost));
			return { petId, name: Items.getOrThrow(petId).name, costs, affordableCosts };
		});
}

export async function petMorphAutocomplete({ value, user }: StringAutoComplete) {
	const petId = user.user.minion_equippedPet;
	if (!petId) return [];
	const variation = getPetVariation(petId);
	if (!variation) return [];
	return getCostTargets(user, petId, variation)
		.filter(
			target =>
				target.affordableCosts.length > 0 &&
				(stringSearch(value, target.name) ||
					target.affordableCosts.some(cost => cost.items().some(([item]) => stringSearch(value, item.name))))
		)
		.map(target => ({ name: target.name, value: String(target.petId) }))
		.slice(0, 25);
}

export async function petChangeCommand(
	user: MUser,
	morph: string | undefined,
	rng: RNGProvider = MathRNG,
	randomRolls = 1
) {
	const petId = user.user.minion_equippedPet;
	if (!petId) return { message: "You don't have a pet equipped." };
	const variation = getPetVariation(petId);
	if (!variation)
		return {
			message: `Your equipped pet cannot change appearance. Supported base pets: ${allPetVariations
				.map(variation => Items.itemNameFromId(variation.base))
				.filter(Boolean)
				.join(', ')}.`
		};
	const availableMorphs = variation.metamorphs.filter(entry => !entry.requirement || entry.requirement(user, petId));
	const random = availableMorphs.flatMap(entry => (Array.isArray(entry.random) ? entry.random : []));
	const supportsRandom = random.length > 0 || availableMorphs.some(entry => typeof entry.random === 'function');
	const targets = getCostTargets(user, petId, variation);
	const costNotice = variation.costNotice ? `\n\n${variation.costNotice}` : '';
	if (!morph && targets.length) {
		const costsText = targets.map(target => `**${target.name}** — ${target.costs.join(' **OR** ')}`).join('\n');
		return {
			message: `Pet morph costs\n${costsText}${costNotice}`,
			choices: targets.filter(target => target.affordableCosts.length > 0),
			supportsRandom
		};
	}
	if (morph && morph !== 'random') {
		const target = targets.find(target => String(target.petId) === morph || stringMatches(target.name, morph));
		if (!target) return { message: 'Your equipped pet cannot change to that form.' };
		const [bankCost] = target.affordableCosts;
		if (!bankCost)
			return {
				message: `You need ${target.costs.join(' **OR** ')} to change your pet to ${target.name}.${costNotice}`
			};
		await user.transactItems({
			itemsToRemove: bankCost,
			otherUpdates: { minion_equippedPet: target.petId },
			collectionLog: true
		});
		return {
			message: `Your pet changed to ${target.name}. You paid ${bankCost}.${costNotice}`,
			petId: target.petId,
			changed: true
		};
	}
	if (!supportsRandom) return { message: 'Your equipped pet cannot change appearance.' };
	const newPetId = await petMetamorphRandom(petId, rng, user, randomRolls);
	if (!newPetId) return { message: 'Your equipped pet cannot change appearance.' };
	await user.update({ minion_equippedPet: newPetId });
	return {
		message: `Your pet changed to ${Items.itemNameFromId(newPetId)}.`,
		petId: newPetId,
		rare: random.some(pet => pet.petId === newPetId && pet.chance > 1)
	};
}
