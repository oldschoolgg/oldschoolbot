import { clAdjustedDroprate } from '@/lib/bso/bsoUtil.js';
import type { MTame } from '@/lib/bso/structures/MTame.js';

import { randArrItem, roll } from '@oldschoolgg/rng';
import { Time } from '@oldschoolgg/toolkit';
import { Bank, LootTable, resolveItems } from 'oldschooljs';

export const MAGNEGG_STARTING_RATE = 50;
export const MAGNEGG_SCALING_RATE = 1.2;

const easterClues = new LootTable()
	.tertiary(20, 'Clue scroll (medium)')
	.tertiary(30, 'Clue scroll (hard)')
	.tertiary(50, 'Clue scroll (elite)')
	.tertiary(75, 'Clue scroll (master)')
	.tertiary(100, 'Clue scroll (grandmaster)');

const easterPets = resolveItems([
	'Hoppy',
	'Eggy',
	'Tasty',
	'Waddles',
	'Leia',
	'Magnegg',
	'Magnabbit',
	'Radiant Magnabbit'
]);
const passiveEasterLootTable = new LootTable()
	.add('Carrot')
	.add('Egg')
	.add('Easter egg')
	.add('Chocolate bar')
	.tertiary(3, easterClues);

const easterTurnInLootTable = new LootTable()
	.add('Carrot')
	.add('Egg')
	.add('Easter egg')
	.add('Chocolate bar')
	.add('Easter basket')
	.add('Bunny ears')
	.add('Giant easter egg')
	.tertiary(5, easterClues);

const easterTurnInCosmeticTable = new LootTable()
	.add('Easter egg')
	.add('Rubber chicken')
	.add('Bunny ears')
	.add('Easter basket')
	.add('Easter ring')
	.add('Chicken head')
	.add('Chicken wings')
	.add('Chicken legs')
	.add('Chicken feet')
	.add('Eggshell platebody')
	.add('Eggshell platelegs')
	.add('Crate ring')
	.add('Bunny top')
	.add('Bunny legs')
	.add('Bunny paws')
	.add('Flower crown')
	.every(easterClues);

export interface PassiveEasterLootResult {
	loot: Bank;
	magneggs: number;
	wabbitEggs: number;
	petBoost?: boolean;
}

const passiveEasterFlavorText = [
	'🥚 You spot something unusual on your way back...',
	'🥚 A painted egg rests quietly in your pack.',
	'🐇 You nearly step on a Wabbit egg.',
	'🥚 Something soft crunches underfoot... an egg?',
	'👀 You feel like you are being watched. An egg appears.',
	'🐇 A Wabbit darts off, leaving something behind.',
	'🥚 You find an egg nestled among your loot.',
	'🌸 The air smells festive. You find an egg.',
	'✨ A pastel glint catches your eye.',
	'🤔 You do not remember picking this up...'
] as const;

const passiveEasterRareFlavorText = [
	'🐇 A Wabbit stares at you... then drops an egg and vanishes.',
	'🥚 You hear faint giggling. An egg rolls into view.',
	'🥚 The egg is warm to the touch.'
] as const;

const passiveEasterStashFlavorText = [
	'🧺 You tuck the Wabbit egg safely away.',
	'🧺 Another egg joins your growing stash.',
	'🧺 Your basket feels heavier.'
] as const;

const easterTurnInFlavorText = [
	'🐇 You offer the eggs. Something accepts them.',
	'💨 The eggs vanish in a soft pop.',
	'🎐 A quiet hum echoes as you hand them in.',
	'🌸 You feel like this was a good idea.'
] as const;

const easterTurnInMissFlavorText = [
	'Nothing remarkable happens.',
	'The eggs are gone... but that is it.',
	'You swear you saw something move.',
	'Maybe next time.'
] as const;

const magneggFlavorTextSingular = [
	'🥚 One egg glows brighter than the rest...',
	'⚡ Something within this egg feels different.',
	'🥚 The air crackles softly. A Magnegg forms.',
	'🥚 The eggs resonate... one refuses to disappear.'
] as const;

const magneggFlavorTextPlural = [
	'⚡ Something within the eggs feels different.',
	'🥚 The air crackles softly. Magneggs begin to form.',
	'🥚 The eggs resonate... more than one refuses to disappear.'
] as const;

const meaninglessRareFlavorText = ['🥚 This egg feels... important.'] as const;

const magneggHatchFlavorText = [
	'🐣 The Magnegg trembles. A crack forms along its surface. The shell splits open - a Magnabbit hops out!',
	'🐣 Your Magnegg cracks open! A Magnabbit emerges.'
] as const;

function getMagneggFlavorText(magneggs: number) {
	return randArrItem(magneggs > 1 ? magneggFlavorTextPlural : magneggFlavorTextSingular);
}

function getMeaninglessRareFlavorText(chance: number) {
	return roll(chance) ? randArrItem(meaninglessRareFlavorText) : null;
}

export function getPassiveEasterTripMessage(result: PassiveEasterLootResult) {
	const finds = [result.loot.toString()];
	if (result.magneggs > 0) {
		finds.push('😱⁉️😱 Wait.... Is that.... a MAGNEGG?!?!?!');
	}

	const parts: string[] = [
		roll(12) ? randArrItem(passiveEasterRareFlavorText) : randArrItem(passiveEasterFlavorText)
	];
	if (result.wabbitEggs > 1 && roll(3)) {
		parts.push(randArrItem(passiveEasterStashFlavorText));
	}
	if (result.magneggs > 0) {
		parts.push(getMagneggFlavorText(result.magneggs));
	}
	const rareLine = getMeaninglessRareFlavorText(1200);
	if (rareLine) {
		parts.push(rareLine);
	}
	parts.push(`You found ${finds.join(', ')}.`);
	return parts.join(' ');
}

export function getEasterTurnInMessage({ cost, loot, magneggs }: { cost: Bank; loot: Bank; magneggs: number }) {
	const parts = [randArrItem(easterTurnInFlavorText), `You turned in ${cost} and received ${loot}.`];
	if (magneggs > 0) {
		parts.push(`\n\n😱⁉️😱 Wait.... Is that.... a MAGNEGG?!?!?!`);
		parts.push(getMagneggFlavorText(magneggs));
	} else {
		parts.push(randArrItem(easterTurnInMissFlavorText));
	}
	const rareLine = getMeaninglessRareFlavorText(magneggs > 0 ? 15 : 1500);
	if (rareLine) {
		parts.push(rareLine);
	}
	return parts.join('\n');
}

export function getMagneggHatchMessage() {
	return randArrItem(magneggHatchFlavorText);
}

function tameHasFedEasterPet(activeTame?: MTame | null) {
	if (!activeTame) return false;
	return easterPets.some(petID => activeTame.hasBeenFed(petID));
}

export function rollPassiveEasterLoot(
	user: boolean | MUser,
	duration: number,
	tame?: boolean | undefined | null,
	activeTame?: MTame | boolean | null
): PassiveEasterLootResult | null {
	let petBoost = false;
	const minutes = Math.floor(duration / Time.Minute);
	if (minutes < 1) return null;

	let wabbitEggChance = 40;
	let magneggChance =
		typeof user === 'boolean'
			? MAGNEGG_STARTING_RATE
			: clAdjustedDroprate(user, 'Magnegg', MAGNEGG_STARTING_RATE, MAGNEGG_SCALING_RATE);
	const isTameTrip = tame === true;

	if (isTameTrip) {
		wabbitEggChance = Math.ceil(wabbitEggChance * 2);
		magneggChance = Math.ceil(magneggChance * 1.5);
	}

	const usingEasterPet =
		typeof user === 'boolean' ? user : user.equippedPet && easterPets.includes(user.equippedPet.id);
	const hasDiscountSource =
		typeof activeTame === 'boolean' ? activeTame : isTameTrip ? tameHasFedEasterPet(activeTame) : usingEasterPet;

	if (hasDiscountSource) {
		petBoost = true;
		wabbitEggChance = Math.ceil(wabbitEggChance * 0.75);
		magneggChance = Math.ceil(magneggChance * 0.75);
	}

	const loot = new Bank();

	for (let i = 0; i < minutes; i++) {
		if (!roll(wabbitEggChance)) continue;
		loot.add('Wabbit eggs');

		loot.add(passiveEasterLootTable.roll());
		if (roll(magneggChance)) {
			loot.add('Magnegg');
		}
	}

	if (loot.amount('Wabbit eggs') === 0) return null;

	return {
		loot,
		magneggs: loot.amount('Magnegg'),
		wabbitEggs: loot.amount('Wabbit eggs'),
		petBoost
	};
}

export function rollEasterTurnInLoot(user: MUser, quantity: number) {
	const loot = new Bank();

	for (let i = 0; i < quantity; i++) {
		loot.add(easterTurnInLootTable.roll());
		if (roll(35)) {
			loot.add(easterTurnInCosmeticTable.roll());
		}
		const magneggRate = clAdjustedDroprate(user, 'Magnegg', MAGNEGG_STARTING_RATE, MAGNEGG_SCALING_RATE);
		if (roll(magneggRate)) {
			loot.add('Magnegg');
		}
	}

	return {
		loot,
		magneggs: loot.amount('Magnegg')
	};
}
