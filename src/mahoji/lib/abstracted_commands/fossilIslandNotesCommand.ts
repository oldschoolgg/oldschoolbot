import { ChatInputCommandInteraction } from 'discord.js';
import { Bank, LootTable } from 'oldschooljs';

import { rand } from '../../../lib/util';
import { deferInteraction } from '../../../lib/util/interactionReply';

const fossilIslandNotesLootTable = new LootTable()
	.add('Scribbled note')
	.add('Partial note')
	.add('Ancient note')
	.add('Ancient writings')
	.add('Experimental note')
	.add('Paragraph of text')
	.add('Musty smelling note')
	.add('Hastily scrawled note')
	.add('Old writing')
	.add('Short note');
const stoneChestLootTable = new LootTable().every(fossilIslandNotesLootTable);

export async function fossilIslandNotesCommand(user: MUser, interaction: ChatInputCommandInteraction) {
	await deferInteraction(interaction);
	const roll = rand(1, 3);
	const inItems = new Bank({ Numulite: 100 });

	let str = 'You insert 100 numulites into a stone chest.';

	if (user.minionIsBusy) {
		return 'Your minion is busy.';
	}

	if (!user.owns(inItems)) {
		return "You don't have 100 numulites";
	}
	if (user.QP < 3) {
		return 'You need 3qp to reach the stone chest';
	}
	await user.removeItemsFromBank(inItems);

	switch (roll) {
		case 1: {
			const outItems = new Bank(stoneChestLootTable.roll());
			const res = await user.addItemsToBank({ items: outItems, collectionLog: true });
			str += ` And you receive ${res.itemsAdded}`;
			break;
		}
		case 2: {
			str += ' It does nothing...';
			break;
		}
		case 3:
		default: {
			str += ' A spike shoots out, destroying the numulites.';
			break;
		}
	}

	return str;
}
