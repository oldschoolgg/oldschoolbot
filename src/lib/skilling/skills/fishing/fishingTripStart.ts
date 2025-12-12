import { Time } from '@oldschoolgg/toolkit';
import { Bank, EItem, Items, itemID } from 'oldschooljs';

import type { Fish } from '@/lib/skilling/types.js';
import type { GearBank } from '@/lib/structures/GearBank.js';

export function calcFishingTripStart({
	gearBank,
	fish,
	maxTripLength,
	quantityInput,
	wantsToUseFlakes
}: {
	gearBank: GearBank;
	fish: Fish;
	maxTripLength: number;
	quantityInput: number | undefined;
	wantsToUseFlakes: boolean;
}) {
	let scaledTimePerFish = Time.Second * fish.timePerFish * (1 + (100 - gearBank.skillsAsLevels.fishing) / 100);

	const boosts = [];
	switch (fish.bait) {
		case itemID('Fishing bait'):
			if (fish.name === 'Infernal eel') {
				scaledTimePerFish *= 1;
			} else if (gearBank.hasEquippedOrInBank('Pearl fishing rod') && fish.name !== 'Infernal eel') {
				scaledTimePerFish *= 0.95;
				boosts.push('5% for Pearl fishing rod');
			}
			break;
		case itemID('Feather'):
			if (fish.name === 'Barbarian fishing' && gearBank.hasEquippedOrInBank('Pearl barbarian rod')) {
				scaledTimePerFish *= 0.95;
				boosts.push('5% for Pearl barbarian rod');
			} else if (gearBank.hasEquippedOrInBank('Pearl fly fishing rod') && fish.name !== 'Barbarian fishing') {
				scaledTimePerFish *= 0.95;
				boosts.push('5% for Pearl fly fishing rod');
			}
			break;
		default:
			if (gearBank.hasEquippedOrInBank('Crystal harpoon')) {
				scaledTimePerFish *= 0.95;
				boosts.push('5% for Crystal harpoon');
			}
			break;
	}

	if (fish.id === EItem.MINNOW) {
		scaledTimePerFish *= Math.max(
			0.83,
			-0.000_541_351 * gearBank.skillsAsLevels.fishing ** 2 +
				0.089_066_3 * gearBank.skillsAsLevels.fishing -
				2.681_53
		);
	}

	if (gearBank.hasEquippedOrInBank('Fish sack barrel') || gearBank.hasEquippedOrInBank('Fish barrel')) {
		boosts.push('+9 trip minutes for Fish barrel');
	}

	let quantity: number = quantityInput ?? Math.floor(maxTripLength / scaledTimePerFish);

	if (fish.bait) {
		const baseCost = new Bank().add(fish.bait);

		const maxCanDo = gearBank.bank.fits(baseCost);
		if (maxCanDo === 0) {
			return `You need ${Items.itemNameFromId(fish.bait)} to fish ${fish.name}!`;
		}
		if (maxCanDo < quantity) {
			quantity = maxCanDo;
		}
	}

	if (quantity === 0) {
		return `You can't fish any ${fish.name}. Try a higher quantity or ensure you have the required supplies.`;
	}

	const duration = quantity * scaledTimePerFish;

	if (duration > maxTripLength) {
		return `${gearBank.minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount of ${fish.name} you can fish is ${Math.floor(
			maxTripLength / scaledTimePerFish
		)}.`;
	}

	let flakesBeingUsed: number | undefined;
	if (wantsToUseFlakes) {
		if (!gearBank.bank.has('Spirit flakes')) {
			return 'You need to have at least one Spirit flake!';
		}

		flakesBeingUsed = Math.min(gearBank.bank.amount('Spirit flakes'), quantity);
		if (flakesBeingUsed > 0) {
			boosts.push(`More fish from using ${flakesBeingUsed}x Spirit flakes`);
		}
	}

	const cost = new Bank();

	if (fish.bait) {
		cost.add(fish.bait, quantity);
	}

	if (flakesBeingUsed) {
		cost.add('Spirit flakes', flakesBeingUsed);
	}

	return { cost, duration, quantity, flakesBeingUsed, boosts, fish };
}
