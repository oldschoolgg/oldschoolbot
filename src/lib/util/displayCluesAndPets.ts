import { Emoji } from '@oldschoolgg/toolkit/constants';
import { sumArr } from 'e';
import type { Bank } from 'oldschooljs';
import { ClueTiers } from '../clues/clueTiers.js';

import { MAX_CLUES_DROPPED } from '../constants.js';
import { allPetsCL } from '../data/CollectionsExport.js';
import pets from '../data/pets.js';
import { formatList } from './smallUtils.js';

export function petMessage(loot: Bank | null | undefined) {
	const emoji = pets.find(p => loot?.has(p.name))?.emoji;
	return `\n${emoji ? `${emoji} ` : ''}**You have a funny feeling like you're being followed...**`;
}

export async function displayCluesAndPets(user: MUser, loot: Bank | null | undefined) {
	let ret = '';
	const clueReceived = loot ? ClueTiers.filter(tier => loot.amount(tier.scrollID) > 0) : [];
	if (clueReceived.length > 0) {
		const clueStack = sumArr(ClueTiers.map(t => user.bank.amount(t.scrollID)));
		ret += `\n${Emoji.Casket} **You got a ${formatList(clueReceived.map(clue => clue.name))} clue scroll** in your loot.`;

		if (clueStack >= MAX_CLUES_DROPPED) {
			ret += `\n**You have reached the maximum clue stack of ${MAX_CLUES_DROPPED}!** (${formatList(ClueTiers.filter(tier => user.bank.amount(tier.scrollID) > 0).map(tier => `${user.bank.amount(tier.scrollID)} ${tier.name}`))}). If you receive more clues, lower tier clues will be replaced with higher tier clues.`;
		} else {
			ret += ` You are now stacking ${clueStack} total clues.`;
		}
	}
	if (allPetsCL.some(p => loot?.has(p))) {
		ret += petMessage(loot);
	}
	return ret;
}
