import { ChatInputCommandInteraction } from 'discord.js';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { Bank } from 'oldschooljs';

import { mahojiParseNumber } from '../../../mahoji/mahojiSettings';
import { degradeableItems } from '../../degradeableItems';
import { stringMatches } from '../../util';
import getOSItem from '../../util/getOSItem';
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

	// If not input on `/minion charge` show the user what can be charged, the amounts, and their current charges
	if (!input || !number || !item || number < 1 || number > 100_000) {
		return `Use \`/minion charge item: [${degradeableItems.map(i => i.item.name).join('|')}] amount:[1-100,000]\`
    ${degradeableItems
		.map(i => {
			const charges = user.user[i.settingsKey];
			return `${i.item.name}: ${charges.toLocaleString()} charges`;
		})
		.join('\n')}`;
	}

	// Get the cost and amount of charges
	const cost = item.chargeInput.cost.clone().multiply(number);
	const amountOfCharges = item.chargeInput.charges * number;

	// Check if the user has materials to charge the item
	if (!user.owns(cost)) {
		return `You don't own ${cost}.`;
	}

	// Error for Ash sanctifier
	if (item.item === getOSItem('Ash sanctifier') && !user.owns('Ash sanctifier')) {
		return "You don't own a Ash sanctifier.";
	}

	// Check if the item needs converted and has a uncharged version
	const needConvert = item.convertOnCharge && item.unchargedItem;

	// Check for variants in the users bank
	let unchargedItem = item.unchargedItem!;
	let chargedItem = item.item;
	for (const variant of item.itemVariants!) {
		if (user.owns(variant.unchargedVariant.id)) {
			unchargedItem = variant.unchargedVariant;
			chargedItem = variant.chargedVariant;
			break;
		}
	}

	// Show error message if the user doesn't have the charged, uncharged, or variants of the item in the bank
	if (needConvert && !user.hasEquippedOrInBank(chargedItem.id) && !user.hasEquippedOrInBank(unchargedItem.id)) {
		return `You don't own a ${chargedItem.name}, ${unchargedItem!.name}
		}${item.itemVariants.length >= 1 ? ', or any variants.' : '.'}`;
	}

	// Confirmation the user must acknowledge before charging
	await handleMahojiConfirmation(
		interaction,
		`Are you sure you want to use **${cost}** to add ${amountOfCharges.toLocaleString()} charges to your ${
			item.item.name
		}?`
	);

	// Transact items or throw and error
	if (needConvert && !user.hasEquippedOrInBank(item.item.id)) {
		if (!user.owns(unchargedItem.id)) {
			return `Your ${item.unchargedItem!.name} disappeared and cannot be charged`;
		}
		await user.transactItems({
			filterLoot: false,
			collectionLog: true,
			itemsToAdd: new Bank().add(chargedItem.id),
			itemsToRemove: new Bank().add(unchargedItem.id).add(cost)
		});
	} else {
		await transactItems({ userID: user.id, itemsToRemove: cost });
	}

	// Update settingskey with proper chargers
	const currentCharges = user.user[item.settingsKey];
	const newCharges = currentCharges + amountOfCharges;
	await user.update({
		[item.settingsKey]: newCharges
	});

	// Update bank settings
	await updateBankSetting('degraded_items_cost', cost);

	// Show the user their new charges and what it cost
	return `You added **${cost}** to your ${item.item.name}, it now has ${newCharges} charges.`;
}
