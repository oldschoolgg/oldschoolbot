import { Bank } from 'oldschooljs';

import itemID from './util/itemID';
import resolveItems from './util/resolveItems';

export function filterLootReplace(myBank: Bank, myLoot: Bank) {
	// Order: Fang, eye, heart.
	const numBlackMask = myLoot.amount('Black mask (10)');
	let numHydraEyes = myLoot.amount("Hydra's eye");
	numHydraEyes += myLoot.amount("Hydra's fang");
	numHydraEyes += myLoot.amount("Hydra's heart");
	const numDarkTotemBases = myLoot.amount('Dark totem base');
	const numBludgeonPieces = myLoot.amount('Bludgeon claw');
	const ringPieces = resolveItems(["Hydra's eye", "Hydra's fang", "Hydra's heart"]) as number[];
	const totemPieces = resolveItems(['Dark totem base', 'Dark totem middle', 'Dark totem top']) as number[];
	const bludgeonPieces = resolveItems(['Bludgeon claw', 'Bludgeon spine', 'Bludgeon axon']) as number[];

	myLoot.filter(l => {
		return (
			l.id !== itemID('Black mask (10)') &&
			l.id !== itemID("Hydra's eye") &&
			l.id !== itemID("Hydra's fang") &&
			l.id !== itemID("Hydra's heart") &&
			l.id !== itemID('Dark totem base') &&
			l.id !== itemID('Dark totem middle') &&
			l.id !== itemID('Dark totem top') &&
			l.id !== itemID('Bludgeon claw')
		);
	}, true);

	const myClLoot = new Bank(myLoot.bank);

	if (numBlackMask) {
		for (let x = 0; x < numBlackMask; x++) {
			myLoot.add('Black mask');
			myClLoot.add('Black mask (10)');
		}
	}

	const combinedBank = new Bank().add(myBank).add(myLoot);
	if (numBludgeonPieces) {
		for (let x = 0; x < numBludgeonPieces; x++) {
			const bank: number[] = [];

			for (const piece of bludgeonPieces) {
				bank.push(combinedBank.amount(piece));
			}
			const minBank = Math.min(...bank);

			for (let i = 0; i < bank.length; i++) {
				if (bank[i] === minBank) {
					myLoot.add(bludgeonPieces[i]);
					combinedBank.add(bludgeonPieces[i]);
					myClLoot.add(bludgeonPieces[i]);
					break;
				}
			}
		}
	}
	if (numDarkTotemBases) {
		for (let x = 0; x < numDarkTotemBases; x++) {
			const bank: number[] = [];
			for (const piece of totemPieces) {
				bank.push(combinedBank.amount(piece));
			}
			const minBank = Math.min(...bank);
			for (let i = 0; i < bank.length; i++) {
				if (bank[i] === minBank) {
					myLoot.add(totemPieces[i]);
					combinedBank.add(totemPieces[i]);
					myClLoot.add(totemPieces[i]);
					break;
				}
			}
		}
	}
	if (numHydraEyes) {
		for (let x = 0; x < numHydraEyes; x++) {
			const bank: number[] = [];
			for (const piece of ringPieces) {
				bank.push(combinedBank.amount(piece));
			}
			const minBank = Math.min(...bank);
			for (let i = 0; i < bank.length; i++) {
				if (bank[i] === minBank) {
					myLoot.add(ringPieces[i]);
					combinedBank.add(ringPieces[i]);
					myClLoot.add(ringPieces[i]);
					break;
				}
			}
		}
	}
	return {
		bankLoot: myLoot,
		clLoot: myClLoot
	};
}
