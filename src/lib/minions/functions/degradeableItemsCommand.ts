import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';
import { Bank } from 'oldschooljs';

import {
	handleMahojiConfirmation,
	mahojiParseNumber,
	mahojiUserSettingsUpdate,
	updateBankSetting
} from '../../../mahoji/mahojiSettings';
import { degradeableItems } from '../../degradeableItems';
import { MUser } from '../../MUser';
import { stringMatches } from '../../util';

export async function degradeableItemsCommand(
	interaction: SlashCommandInteraction,
	user: MUser,
	input: string | undefined,
	quantity: number | undefined
): CommandResponse {
	const item = degradeableItems.find(i => [i.item.name, ...i.aliases].some(n => stringMatches(n, input ?? '')));
	const number = mahojiParseNumber({ input: quantity, min: 1, max: 1_000_000 });

	if (!input || !number || !item || number < 1 || number > 10_000) {
		return `Use \`/minion charge [${degradeableItems.map(i => i.item.name).join('|')}], [1-10,000]\`
${degradeableItems
	.map(i => {
		const charges = user.user[i.settingsKey];
		return `${i.item.name}: ${charges.toLocaleString()} charges`;
	})
	.join('\n')}`;
	}

	const cost = item.chargeInput.cost.clone().multiply(number);
	const amountOfCharges = item.chargeInput.charges * number;

	if (!user.bank.has(cost)) {
		return `You don't own ${cost}.`;
	}

	const needConvert = item.convertOnCharge && item.unchargedItem;
	if (needConvert && !user.hasEquippedOrInBank(item.item.id) && !user.bank.has(item.unchargedItem!.id)) {
		return `You don't own a ${item.item.name} or ${item.unchargedItem!.name}.`;
	}

	await handleMahojiConfirmation(
		interaction,
		`Are you sure you want to use **${cost}** to add ${amountOfCharges.toLocaleString()} charges to your ${
			item.item.name
		}?`
	);

	if (needConvert && !user.hasEquippedOrInBank(item.item.id)) {
		if (!user.bank.has(item.unchargedItem!.id)) {
			return `Your ${item.unchargedItem!.name} disappeared and cannot be charged`;
		}
		await user.removeItemsFromBank(new Bank({ [item.unchargedItem!.id]: 1 }));
		await user.addItemsToBank({ items: { [item.item.id]: 1 }, collectionLog: true, filterLoot: false });
	}
	await transactItems({ userID: user.id, itemsToRemove: cost });
	const currentCharges = user.user[item.settingsKey];
	const newCharges = currentCharges + amountOfCharges;
	await mahojiUserSettingsUpdate(user.id, {
		[item.settingsKey]: newCharges
	});
	await updateBankSetting('degraded_items_cost', cost);

	return `You added **${cost}** to your ${item.item.name}, it now has ${newCharges} charges.`;
}
