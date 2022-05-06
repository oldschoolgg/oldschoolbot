import { User } from '@prisma/client';
import { notEmpty } from 'e';
import { KlasaUser } from 'klasa';
import { Bank, LootTable } from 'oldschooljs';

import { client } from '../../..';
import { allOpenables } from '../../../lib/openables';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { ItemBank } from '../../../lib/types';
import { updateGPTrackSetting } from '../../../lib/util';
import { stringMatches } from '../../../lib/util/cleanString';
import { mahojiUserSettingsUpdate } from '../../mahojiSettings';

const regex = /^(.*?)( \([0-9]+x Owned\))?$/;

export async function abstractedOpenCommand(
	user: KlasaUser,
	mahojiUser: User,
	_names: string[],
	_quantity: number | 'auto' = 1
) {
	const bank = user.bank();

	const names = _names.map(i => i.replace(regex, '$1'));
	const openables = names.includes('all')
		? allOpenables.filter(({ openedItem }) => bank.has(openedItem.id))
		: names
				.map(name => allOpenables.find(o => o.aliases.some(alias => stringMatches(alias, name))))
				.filter(notEmpty);
	if (names.includes('all') && !openables.length) return 'You have no openable items.';
	if (!openables.length) return "That's not a valid item.";

	const cost = new Bank();
	const kcBank = new Bank();
	const loot = new Bank();
	const messages: string[] = [];

	for (const { openedItem } of openables) {
		const quantity = typeof _quantity === 'string' ? bank.amount(openedItem.id) : _quantity;
		cost.add(openedItem.id, quantity);
		kcBank.add(openedItem.id, quantity);
	}
	if (!bank.has(cost)) return `You don't have ${cost}.`;

	for (const openable of openables) {
		const quantity = cost.amount(openable.openedItem.id);
		const thisLoot =
			openable.output instanceof LootTable
				? { bank: openable.output.roll(quantity) }
				: await openable.output({ user, self: openable, quantity, mahojiUser });
		loot.add(thisLoot.bank);
		if (thisLoot.message) messages.push(thisLoot.message);
	}

	const { newUser } = await mahojiUserSettingsUpdate(client, user.id, {
		openable_scores: new Bank().add(mahojiUser.openable_scores as ItemBank).add(kcBank).bank
	});
	await user.removeItemsFromBank(cost);
	const { previousCL } = await user.addItemsToBank({
		items: loot.bank,
		collectionLog: true,
		filterLoot: false
	});

	const image = await client.tasks.get('bankImage')!.generateBankImage(
		loot,
		openables.length === 1
			? `Loot from ${cost.amount(openables[0].openedItem.id)}x ${openables[0].name}`
			: 'Loot From Opening',
		true,
		{
			showNewCL: 'showNewCL'
		},
		user,
		previousCL
	);

	if (loot.has('Coins')) {
		await updateGPTrackSetting(client, ClientSettings.EconomyStats.GPSourceOpen, loot.amount('Coins'));
	}

	const newOpenScores = new Bank().add(newUser.openable_scores as ItemBank);
	const openedStr = openables
		.map(({ openedItem }) => `${newOpenScores.amount(openedItem.id)}x ${openedItem.name}`)
		.join(', ');

	return {
		attachments: [
			{
				fileName: `loot.${image.isTransparent ? 'png' : 'jpg'}`,
				buffer: image.image!
			}
		],
		content: `You have now opened a total of ${openedStr}
${messages.join(', ')}`
	};
}
