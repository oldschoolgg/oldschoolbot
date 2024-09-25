import type { CommandResponse } from '@oldschoolgg/toolkit/util';
import type { ChatInputCommandInteraction } from 'discord.js';
import { Bank } from 'oldschooljs';

import { mahojiParseNumber } from '../../../mahoji/mahojiSettings';
import { degradeableItems } from '../../degradeableItems';
import { stringMatches } from '../../util';
import { handleMahojiConfirmation } from '../../util/handleMahojiConfirmation';
import { updateBankSetting } from '../../util/updateBankSetting';

export async function degradeableItemsCommand(
	interaction: ChatInputCommandInteraction,
	user: MUser,
	input: string | undefined,
	quantity: number | undefined
): CommandResponse {
	const item = degradeableItems.find(i => [i.item.name, ...i.aliases].some(n => stringMatches(n, input ?? '')));
	const number = mahojiParseNumber({ input: quantity, min: 1, max: 1_000_000 });

	if (!input || !number || !item || number < 1 || number > 100_000) {
		return `Use \`/minion charge item: [${degradeableItems.map(i => i.item.name).join('|')}] amount:[1-100,000]\`
${degradeableItems
	.map(i => {
		const charges = user.user[i.settingsKey];
		return `${i.item.name}: ${charges.toLocaleString()} charges`;
	})
	.join('\n')}`;
	}

	const cost = item.chargeInput.cost.clone().multiply(number);
	const amountOfCharges = item.chargeInput.charges * number;

	if (!user.owns(cost)) {
		return `You don't own ${cost}.`;
	}

	const needConvert = item.convertOnCharge && item.unchargedItem;
	if (needConvert && !user.hasEquippedOrInBank(item.item.id) && !user.owns(item.unchargedItem!.id)) {
		return `You don't own a ${item.item.name} or ${item.unchargedItem?.name}.`;
	}

	await handleMahojiConfirmation(
		interaction,
		`Are you sure you want to use **${cost}** to add ${amountOfCharges.toLocaleString()} charges to your ${
			item.item.name
		}?`
	);

	if (needConvert && !user.hasEquippedOrInBank(item.item.id)) {
		if (!user.owns(item.unchargedItem!.id)) {
			return `Your ${item.unchargedItem?.name} disappeared and cannot be charged`;
		}
		await user.transactItems({
			filterLoot: false,
			collectionLog: true,
			itemsToAdd: new Bank().add(item.item.id),
			itemsToRemove: new Bank().add(item.unchargedItem?.id).add(cost)
		});
	} else {
		await transactItems({ userID: user.id, itemsToRemove: cost });
	}
	const currentCharges = user.user[item.settingsKey];
	const newCharges = currentCharges + amountOfCharges;
	await user.update({
		[item.settingsKey]: newCharges
	});
	await updateBankSetting('degraded_items_cost', cost);

	return `You added **${cost}** to your ${item.item.name}, it now has ${newCharges} charges.`;
}
