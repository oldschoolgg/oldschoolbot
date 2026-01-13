import { ButtonBuilder, ButtonStyle } from '@oldschoolgg/discord';
import type { Bank } from 'oldschooljs';

import { ClueTiers } from '@/lib/clues/clueTiers.js';
import { BitField } from '@/lib/constants.js';
import { EmojiId } from '@/lib/data/emojis.js';

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
					.setEmoji({ id: EmojiId.ClueScroll })
			)
		);
	}
	return components;
}
