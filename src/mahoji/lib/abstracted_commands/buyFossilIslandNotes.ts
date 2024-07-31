import type { ChatInputCommandInteraction } from 'discord.js';
import { randArrItem } from 'e';
import { Bank } from 'oldschooljs';

import { fossilIslandNotesCL } from '../../../lib/data/CollectionsExport';
import getOSItem from '../../../lib/util/getOSItem';
import { handleMahojiConfirmation } from '../../../lib/util/handleMahojiConfirmation';

export async function buyFossilIslandNotes(user: MUser, interaction: ChatInputCommandInteraction, quantity: number) {
	const cost = new Bank().add('Numulite', 300).multiply(quantity);
	if (user.minionIsBusy) {
		return 'Your minion is busy.';
	}
	if (user.QP < 3) {
		return 'You need 3 QP to reach the stone chest';
	}
	if (!user.owns(cost)) {
		return "You don't have enough Numulite.";
	}

	await handleMahojiConfirmation(
		interaction,
		`${user}, please confirm that you want to buy ${quantity}x Fossil Island note for: ${cost}.`
	);

	const tempClWithNewUniques = user.cl ? user.cl.clone() : new Bank();
	const loot = new Bank();
	for (let i = 0; i < quantity; i++) {
		const filteredPages = fossilIslandNotesCL.filter(page => !tempClWithNewUniques.has(page));
		const outPage =
			filteredPages.length === 0
				? getOSItem(randArrItem(fossilIslandNotesCL))
				: getOSItem(randArrItem(filteredPages));
		tempClWithNewUniques.add(outPage);
		loot.add(outPage);
	}

	await transactItems({ userID: user.id, itemsToRemove: cost, itemsToAdd: loot, collectionLog: true });

	return `You purchased ${loot}.`;
}
