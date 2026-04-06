import { randArrItem, roll } from '@oldschoolgg/rng';
import { Time } from '@oldschoolgg/toolkit';
import { Bank, LootTable } from 'oldschooljs';


const passiveEasterLootTable = new LootTable().add('Carrot').add('Egg').add('Easter egg').add('Chocolate bar');

const easterTurnInLootTable = new LootTable()
	.add('Carrot')
	.add('Egg')
	.add('Easter egg')
	.add('Chocolate bar')
	.add('Easter basket')
	.add('Bunny ears')
	.add('Giant easter egg');

const easterTurnInCosmeticTable = new LootTable();
for (const item of [
	...Array.from({ length: 14 }, (_, i) => `Easter egg (${i + 1})`),
	'Easter cape (1)',
	'Easter cape (2)',
	'Monkey egg (Edible)',
	'Easter Bunny hat',
	'Easter Bunny top',
	'Easter Bunny legs',
	'Easter Bunny gloves',
	'Easter Bunny boots',
	'Easter Bunny tail',
	'Elven bunny ears',
	'Dragon bunny ears',
	'Tzhaar bunny ears',
	'Rune bunny ears',
	'Vyrewatch bunny ears',
	'Arceuus bunny ears',
	'Waddles',
	'Tasty'
]) {
	easterTurnInCosmeticTable.add(item);
}

export interface PassiveEasterLootResult {
	loot: Bank;
	magneggs: number;
	wabbitEggs: number;
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
	const finds = [
		result.loot.toString()
	];
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

export function getEasterTurnInMessage({
	cost,
	loot,
	magneggs
}: {
	cost: Bank;
	loot: Bank;
	magneggs: number;
}) {
	const parts = [randArrItem(easterTurnInFlavorText), `You turned in ${cost} and received ${loot}.`];
	parts.push(magneggs > 0 ? getMagneggFlavorText(magneggs) : randArrItem(easterTurnInMissFlavorText));
	const rareLine = getMeaninglessRareFlavorText(magneggs > 0 ? 15 : 1500);
	if (rareLine) {
		parts.push(rareLine);
	}
	return parts.join('\n');
}

export function getMagneggHatchMessage() {
	return randArrItem(magneggHatchFlavorText);
}

export function rollPassiveEasterLoot(duration: number): PassiveEasterLootResult | null {
	const minutes = Math.floor(duration / Time.Minute);
	if (minutes < 1) return null;

	const loot = new Bank();

	for (let i = 0; i < minutes; i++) {
		if (!roll(40)) continue;
		loot.add('Wabbit egg');

		loot.add(passiveEasterLootTable.roll());
		if (roll(50)) {
			loot.add('Magnegg');
		}
	}

	if (loot.amount('Wabbit egg') === 0) return null;

	return {
		loot,
		magneggs: loot.amount('Magnegg'),
		wabbitEggs: loot.amount('Wabbit egg')
	};
}

export function rollEasterTurnInLoot(quantity: number) {
	const loot = new Bank();

	for (let i = 0; i < quantity; i++) {
		loot.add(easterTurnInLootTable.roll());
		if (roll(35)) {
			loot.add(easterTurnInCosmeticTable.roll());
		}
		if (roll(50)) {
			loot.add('Magnegg');
		}
	}

	return {
		loot,
		magneggs: loot.amount('Magnegg')
	};
}
