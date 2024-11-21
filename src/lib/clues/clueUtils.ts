import { ButtonBuilder, ButtonStyle } from 'discord.js';
import { Bank } from 'oldschooljs';

import { BitField, MAX_CLUES_DROPPED } from '../constants';
import { ClueTiers } from './clueTiers';

export function getClueScoresFromOpenables(openableScores: Bank) {
	return openableScores.filter(item => Boolean(ClueTiers.find(ct => ct.id === item.id)));
}

export function deduplicateClueScrolls(bank: Bank) {
	const theirClues = new Bank();
	let cluesLeftWeCanGive = MAX_CLUES_DROPPED;
	for (let i = ClueTiers.length; i > 0; i--) {
		if (cluesLeftWeCanGive <= 0) {
			break;
		}
		const tier = ClueTiers[i - 1];
		const qtyToAdd = Math.min(cluesLeftWeCanGive, bank.amount(tier.scrollID));
		theirClues.add(tier.scrollID, qtyToAdd);
		cluesLeftWeCanGive -= qtyToAdd;
		if (
			theirClues
				.items()
				.map(i => i[1])
				.reduce((a, b) => a + b, 0) > MAX_CLUES_DROPPED
		) {
			break;
		}
	}

	for (const tier of ClueTiers) bank.set(tier.scrollID, 0);
	for (const [itemID, qty] of theirClues.items()) bank.set(itemID, qty);
}

export function buildClueButtons(loot: Bank | null, perkTier: number, user: MUser) {
	const components: ButtonBuilder[] = [];
	if (loot && perkTier > 1 && !user.bitfield.includes(BitField.DisableClueButtons)) {
		const clueReceived = ClueTiers.filter(tier => loot.amount(tier.scrollID) > 0);
		components.push(
			...clueReceived.map(clue =>
				new ButtonBuilder()
					.setCustomId(`DO_${clue.name.toUpperCase()}_CLUE`)
					.setLabel(`Do ${clue.name} Clue`)
					.setStyle(ButtonStyle.Secondary)
					.setEmoji('365003979840552960')
			)
		);
	}
	return components;
}
