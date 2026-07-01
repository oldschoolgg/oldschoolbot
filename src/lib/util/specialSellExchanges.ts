import { Bank, EItem } from 'oldschooljs';

import { NestBoxesTable } from '@/lib/simulation/misc.js';
import { Farming } from '@/lib/skilling/skills/farming/index.js';

export interface SpecialSellExchange {
	itemsToRemove: Bank;
	itemsToAdd: Bank;
	collectionLog: boolean;
	extraCollectionLogItems?: Bank;
	autoSellMessage?: string;
	confirmationMessage?: (user: MUser) => string;
	successMessage: string;
}

export const specialSellExchangeItemIDs = new Set([
	EItem.MOLE_CLAW,
	EItem.MOLE_SKIN,
	EItem.ABYSSAL_BLUE_DYE,
	EItem.ABYSSAL_GREEN_DYE,
	EItem.ABYSSAL_RED_DYE,
	EItem.ABYSSAL_LANTERN,
	EItem.SPIRIT_SEED,
	EItem.GOLDEN_PHEASANT_EGG,
	EItem.FOX_WHISTLE,
	EItem.PETAL_GARLAND,
	EItem.PHEASANT_TAIL_FEATHERS,
	EItem.STURDY_BEEHIVE_PARTS,
	EItem.GOLDEN_TENCH
]);

export function getSpecialSellExchange(bankToSell: Bank): SpecialSellExchange | null {
	if (bankToSell.has(EItem.MOLE_CLAW) || bankToSell.has(EItem.MOLE_SKIN)) {
		const moleBank = new Bank();
		if (bankToSell.has(EItem.MOLE_CLAW)) moleBank.add(EItem.MOLE_CLAW, bankToSell.amount(EItem.MOLE_CLAW));
		if (bankToSell.has(EItem.MOLE_SKIN)) moleBank.add(EItem.MOLE_SKIN, bankToSell.amount(EItem.MOLE_SKIN));

		const loot = new Bank();
		for (let i = 0; i < moleBank.amount(EItem.MOLE_CLAW) + moleBank.amount(EItem.MOLE_SKIN); i++) {
			loot.add(NestBoxesTable.roll());
		}

		return {
			itemsToRemove: moleBank,
			itemsToAdd: loot,
			collectionLog: true,
			successMessage: `You exchanged ${moleBank} and received: ${loot}.`
		};
	}

	if (
		bankToSell.has(EItem.ABYSSAL_BLUE_DYE) ||
		bankToSell.has(EItem.ABYSSAL_GREEN_DYE) ||
		bankToSell.has(EItem.ABYSSAL_RED_DYE) ||
		bankToSell.has(EItem.ABYSSAL_LANTERN)
	) {
		const abbyBank = new Bank();
		const loot = new Bank();
		if (bankToSell.has(EItem.ABYSSAL_LANTERN)) {
			abbyBank.add(EItem.ABYSSAL_LANTERN, bankToSell.amount(EItem.ABYSSAL_LANTERN));
			loot.add('Abyssal pearls', bankToSell.amount(EItem.ABYSSAL_LANTERN) * 100);
		}
		if (bankToSell.has(EItem.ABYSSAL_RED_DYE)) {
			abbyBank.add(EItem.ABYSSAL_RED_DYE, bankToSell.amount(EItem.ABYSSAL_RED_DYE));
			loot.add('Abyssal pearls', bankToSell.amount(EItem.ABYSSAL_RED_DYE) * 50);
		}
		if (bankToSell.has(EItem.ABYSSAL_BLUE_DYE)) {
			abbyBank.add(EItem.ABYSSAL_BLUE_DYE, bankToSell.amount(EItem.ABYSSAL_BLUE_DYE));
			loot.add('Abyssal pearls', bankToSell.amount(EItem.ABYSSAL_BLUE_DYE) * 50);
		}
		if (bankToSell.has(EItem.ABYSSAL_GREEN_DYE)) {
			abbyBank.add(EItem.ABYSSAL_GREEN_DYE, bankToSell.amount(EItem.ABYSSAL_GREEN_DYE));
			loot.add('Abyssal pearls', bankToSell.amount(EItem.ABYSSAL_GREEN_DYE) * 50);
		}

		return {
			itemsToRemove: abbyBank,
			itemsToAdd: loot,
			collectionLog: false,
			confirmationMessage: user => `${user}, please confirm you want to sell ${abbyBank} for **${loot}**.`,
			successMessage: `You exchanged ${abbyBank} and received: ${loot}.`
		};
	}

	if (bankToSell.has(EItem.SPIRIT_SEED)) {
		const quantity = bankToSell.amount(EItem.SPIRIT_SEED);
		const seedsBank = new Bank().add(EItem.SPIRIT_SEED, quantity);
		const loot = new Bank();
		for (let i = 0; i < quantity; i++) {
			loot.add(Farming.openSeedPack(5));
		}

		return {
			itemsToRemove: seedsBank,
			itemsToAdd: loot,
			collectionLog: true,
			extraCollectionLogItems: new Bank().add(EItem.SEED_PACK, quantity),
			autoSellMessage: `${quantity.toLocaleString()}x Tier 5 seed pack loot`,
			confirmationMessage: user =>
				`${user}, please confirm you want to trade ${seedsBank} for Tier 5 seed pack loot.`,
			successMessage: `You exchanged ${seedsBank} and received: ${loot}.`
		};
	}

	if (
		bankToSell.has(EItem.GOLDEN_PHEASANT_EGG) ||
		bankToSell.has(EItem.FOX_WHISTLE) ||
		bankToSell.has(EItem.PETAL_GARLAND) ||
		bankToSell.has(EItem.PHEASANT_TAIL_FEATHERS) ||
		bankToSell.has(EItem.STURDY_BEEHIVE_PARTS)
	) {
		const forestryBank = new Bank();
		const loot = new Bank();
		if (bankToSell.has(EItem.GOLDEN_PHEASANT_EGG)) {
			forestryBank.add(EItem.GOLDEN_PHEASANT_EGG, bankToSell.amount(EItem.GOLDEN_PHEASANT_EGG));
			loot.add('Anima-infused bark', bankToSell.amount(EItem.GOLDEN_PHEASANT_EGG) * 250);
		}
		if (bankToSell.has(EItem.FOX_WHISTLE)) {
			forestryBank.add(EItem.FOX_WHISTLE, bankToSell.amount(EItem.FOX_WHISTLE));
			loot.add('Anima-infused bark', bankToSell.amount(EItem.FOX_WHISTLE) * 250);
		}
		if (bankToSell.has(EItem.PETAL_GARLAND)) {
			forestryBank.add(EItem.PETAL_GARLAND, bankToSell.amount(EItem.PETAL_GARLAND));
			loot.add('Anima-infused bark', bankToSell.amount(EItem.PETAL_GARLAND) * 150);
		}
		if (bankToSell.has(EItem.PHEASANT_TAIL_FEATHERS)) {
			forestryBank.add(EItem.PHEASANT_TAIL_FEATHERS, bankToSell.amount(EItem.PHEASANT_TAIL_FEATHERS));
			loot.add('Anima-infused bark', bankToSell.amount(EItem.PHEASANT_TAIL_FEATHERS) * 5);
		}
		if (bankToSell.has(EItem.STURDY_BEEHIVE_PARTS)) {
			forestryBank.add(EItem.STURDY_BEEHIVE_PARTS, bankToSell.amount(EItem.STURDY_BEEHIVE_PARTS));
			loot.add('Anima-infused bark', bankToSell.amount(EItem.STURDY_BEEHIVE_PARTS) * 25);
		}

		return {
			itemsToRemove: forestryBank,
			itemsToAdd: loot,
			collectionLog: false,
			confirmationMessage: user => `${user}, please confirm you want to sell ${forestryBank} for **${loot}**.`,
			successMessage: `You exchanged ${forestryBank} and received: ${loot}.`
		};
	}

	if (bankToSell.has(EItem.GOLDEN_TENCH)) {
		const tenchBank = new Bank().add(EItem.GOLDEN_TENCH, bankToSell.amount(EItem.GOLDEN_TENCH));
		const loot = new Bank().add(EItem.MOLCH_PEARL, tenchBank.amount(EItem.GOLDEN_TENCH) * 100);

		return {
			itemsToRemove: tenchBank,
			itemsToAdd: loot,
			collectionLog: false,
			confirmationMessage: user => `${user}, please confirm you want to sell ${tenchBank} for **${loot}**.`,
			successMessage: `You exchanged ${tenchBank} and received: ${loot}.`
		};
	}

	return null;
}
