import { ChatInputCommandInteraction } from 'discord.js';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { Bank } from 'oldschooljs';

import { handleMahojiConfirmation, mahojiParseNumber } from '../../../mahoji/mahojiSettings';
import { degradeableItems } from '../../degradeableItems';
import { stringMatches } from '../../util/cleanString';
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
		if (!input || !number || !item || number < 1 || number > 10_000) {
			return `Use \`/minion charge item: [${degradeableItems.map(i => i.item.name).join('|')}] amount:[1-10,000]\`
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
			return `You don't own a ${item.item.name} or ${item.unchargedItem!.name}.`;
		}

		await handleMahojiConfirmation(
			interaction,
			`Are you sure you want to use **${cost}** to add ${amountOfCharges.toLocaleString()} charges to your ${
				item.item.name
			}?`
		);

		if (needConvert && !user.hasEquippedOrInBank(item.item.id)) {
			if (!user.owns(item.unchargedItem!.id)) {
				return `Your ${item.unchargedItem!.name} disappeared and cannot be charged`;
			}
			await user.removeItemsFromBank(new Bank({ [item.unchargedItem!.id]: 1 }));
			await user.addItemsToBank({ items: { [item.item.id]: 1 }, collectionLog: true, filterLoot: false });
		}
		await transactItems({ userID: user.id, itemsToRemove: cost });
		const currentCharges = user.user[item.settingsKey];
		const newCharges = currentCharges + amountOfCharges;
		await user.update({
			[item.settingsKey]: newCharges
		});
		await updateBankSetting('degraded_items_cost', cost);

		return `You added **${cost}** to your ${item.item.name}, it now has ${newCharges} charges.`;
	}
	// Uncharging item
	if (!item || (number && (number < 1 || number > 10_000)) || !user.hasEquippedOrInBank(item.item.id)) {
		if (user.minionIsBusy) {
			return "You can't uncharge anything because your minion is busy.";
		} else if (!item) {
			return 'You must specify an item to uncharge.';
		} else if (!item.canUncharge) {
			return `You can't uncharge a ${item.item.name}.`;
		} else if (user.hasEquipped(item.item.id)) {
			return `You have to unequip your ${item.item.name} to uncharge it.`;
		} else if (number && number > 1) {
			return `You can only uncharge one ${item.item.name} at a time.`;
		} else if (!user.hasEquippedOrInBank(item.item.id)) {
			return `You can't uncharge a ${item.item.name} because you don't have one.`;
		}
	}

	const currentCharges = user.user[item.settingsKey];
	const unchargeQuant = Math.floor(currentCharges / item.chargeInput.charges);
	const cost = new Bank().add({ [item.item.id]: 1 });
	const unchargedItems = new Bank()
		.add(item.itemsToRefundOnBreak)
		.add(item.chargeInput.cost.clone().multiply(unchargeQuant));

	await handleMahojiConfirmation(interaction, `Are you sure you want to uncharge your ${item.item.name}?`);
	await user.removeItemsFromBank(cost);
	await user.addItemsToBank({ items: unchargedItems, collectionLog: false, filterLoot: false });
	await transactItems({ userID: user.id, itemsToRemove: cost });

	const newCharges = 0;
	await user.update({
		[item.settingsKey]: newCharges
	});
	await updateBankSetting('degraded_items_cost', cost);

	return `You uncharged your ${item.item.name} fully, you received **${cost}**`;
}
