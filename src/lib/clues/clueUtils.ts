import { ButtonBuilder, ButtonStyle } from 'discord.js';
import type { Bank } from 'oldschooljs';

import { BitField } from '../constants';
import { ClueTiers } from './clueTiers';

export function getClueScoresFromOpenables(openableScores: Bank) {
	return openableScores.filter(item => Boolean(ClueTiers.find(ct => ct.id === item.id)));
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
