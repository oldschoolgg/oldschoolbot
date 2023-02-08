import { ChatInputCommandInteraction } from 'discord.js';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { Bank } from 'oldschooljs';

import { mahojiParseNumber } from '../../../mahoji/mahojiSettings';
import { degradeableItems } from '../../degradeableItems';
import { stringMatches } from '../../util/cleanString';
import { handleMahojiConfirmation } from '../../util/handleMahojiConfirmation';
import { updateBankSetting } from '../../util/updateBankSetting';

export async function degradeableItemsCommand(
	interaction: ChatInputCommandInteraction,
	user: MUser,
	input: string | undefined,
	quantity: number | undefined,
	uncharge: boolean | undefined
): CommandResponse {
	const item = degradeableItems.find(i => [i.item.name, ...i.aliases].some(n => stringMatches(n, input ?? '')));
	const number = mahojiParseNumber({ input: quantity, min: 1, max: 1_000_000 });

	if (!uncharge) {
		if (!input || !number || !item || number < 1 || number > 100_000) {
			return `Use \`/minion charge item: [${degradeableItems
				.map(i => i.item.name)
				.join('|')}] amount:[1-100,000]\`
${degradeableItems
	.map(i => {
		const charges = user.user[i.settingsKey];
		return `${i.item.name}: ${charges.toLocaleString()} charges`;
	})
	.join('\n')}`;
		}

		const cost = item.chargeInput.cost.clone().multiply(number);
		const amountOfCharges = item.chargeInput.charges * number;
		const currentCharges = user.user[item.settingsKey];
		const newCharges = currentCharges + amountOfCharges;
		let chargeMessage = '';
		let chargeConfirmation = '';

		if (!user.owns(cost)) {
			return `You don't own ${cost}.`;
		}
		if (!item.convertOnCharge && !user.hasEquippedOrInBank(item.item.id)) {
			return `To charge a ${item.item.name} you must own one already.`;
		}

		const needConvert = item.convertOnCharge && item.unchargedItem;
		if (needConvert && !user.hasEquippedOrInBank(item.item.id) && !user.owns(item.unchargedItem!.id)) {
			return `You don't own a ${item.item.name} or ${item.unchargedItem!.name}.`;
		}
		if (needConvert && !user.hasEquippedOrInBank(item.item.id)) {
			chargeConfirmation += `Are you sure you want to use **${
				item.unchargedItem!.name
			} and ${cost}** to create a ${item.item.name}?`;
			chargeMessage += `You created a ${item.item.name} using **${
				item.unchargedItem!.name
			} and ${cost}**, it now has ${newCharges.toLocaleString()} charges.`;
		} else {
			chargeConfirmation += `Are you sure you want to use **${cost}** to add ${amountOfCharges.toLocaleString()} charges to your ${
				item.item.name
			}?`;
			chargeMessage += `You added **${cost}** to your ${
				item.item.name
			}, it now has ${newCharges.toLocaleString()} charges.`;
		}
		await handleMahojiConfirmation(interaction, chargeConfirmation);

		if (needConvert && !user.hasEquippedOrInBank(item.item.id)) {
			if (!user.owns(item.unchargedItem!.id)) {
				return `Your ${item.unchargedItem!.name} disappeared and cannot be charged`;
			}
			await user.removeItemsFromBank(new Bank({ [item.unchargedItem!.id]: 1 }));
			await user.addItemsToBank({ items: { [item.item.id]: 1 }, collectionLog: true, filterLoot: false });
		}
		await transactItems({ userID: user.id, itemsToRemove: cost });
		await user.update({
			[item.settingsKey]: newCharges
		});
		await updateBankSetting('degraded_items_cost', cost);

		return chargeMessage;
	}
	// Uncharging item
	if (!item || (number && (number < 1 || number > 10_000)) || !user.hasEquippedOrInBank(item.item.id)) {
		if (user.minionIsBusy) {
			return "You can't uncharge anything because your minion is busy.";
		} else if (!item) {
			return 'You must specify an item to uncharge.';
		} else if (user.hasEquipped(item.item.id)) {
			return `You have to unequip your ${item.item.name} to uncharge it.`;
		} else if (number && number > 1) {
			return `You can only uncharge one ${item.item.name} at a time.`;
		} else if (!user.hasEquippedOrInBank(item.item.id)) {
			return `You can't uncharge a ${item.item.name} because you don't have one.`;
		}
	}

	const currentCharges = user.user[item.settingsKey];

	const unchargeQuant = Math.max(Math.floor(currentCharges / item.chargeInput.charges), 1);

	const cost = new Bank().add({ [item.item.id]: 1 });
	let returnedCharges = new Bank();
	let unchargedItems = new Bank().add(item.itemsToRefundOnBreak);

	if (item.unchargable) {
		returnedCharges = item.chargeInput.cost.clone().multiply(unchargeQuant);
	}
	returnedCharges.add(unchargedItems);

	await handleMahojiConfirmation(
		interaction,
		`Are you sure you want to uncharge your ${item.item.name}? ${
			!item.unchargable ? `You will only receive some of your items back: ${unchargedItems}` : ''
		}`
	);
	await transactItems({ userID: user.id, itemsToRemove: cost, itemsToAdd: returnedCharges });

	await user.update({
		[item.settingsKey]: 0
	});
	await updateBankSetting('degraded_items_cost', cost);

	return `You uncharged your ${item.item.name} fully, you received **${returnedCharges}**`;
}
