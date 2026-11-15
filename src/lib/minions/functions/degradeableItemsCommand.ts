import { stringMatches } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import { degradeableItems } from '@/lib/degradeableItems.js';
import { mahojiParseNumber } from '@/mahoji/mahojiSettings.js';

export async function degradeableItemsCommand(
	interaction: MInteraction,
	user: MUser,
	input: string | undefined,
	quantity: number | undefined,
	method: string | undefined,
	uncharge = false
): CommandResponse {
	const item = degradeableItems.find(i => [i.item.name, ...i.aliases].some(n => stringMatches(n, input ?? '')));
	if (uncharge) {
		if (!item?.canUncharge) return 'This item cannot be uncharged.';
		if (!user.hasEquippedOrInBank(item.item.id)) return `You don't own a ${item.item.name}.`;
		const charges = user.user[item.settingsKey];
		if (charges === 0) return `Your ${item.item.name} has no charges.`;
		const refundQuantity = Math.floor(charges / item.chargeInput.charges);
		const refund = refundQuantity > 0 ? item.chargeInput.cost.clone().multiply(refundQuantity) : new Bank();
		await interaction.confirmation(`Uncharge your ${item.item.name} and receive ${refund}?`);
		await user.transactItems({
			itemsToAdd: refund,
			collectionLog: false,
			otherUpdates: { [item.settingsKey]: 0 }
		});
		return `You uncharged your ${item.item.name} and received ${refund}.`;
	}
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

	const transfer = item.chargeTransfer;
	if (transfer && method && stringMatches(method, transfer.name)) {
		if (!user.hasEquippedOrInBank(item.item.id)) return `You don't own a ${item.item.name}.`;
		const sourceItem = degradeableItems.find(i => i.settingsKey === transfer.settingsKey)!;
		const sourceCharges = user.user[transfer.settingsKey];
		if (sourceCharges < number) {
			return `Your ${sourceItem.item.name} only has ${sourceCharges.toLocaleString()} charges available to transfer.`;
		}
		const chargesToAdd = number * transfer.chargesPerSourceCharge;
		await interaction.confirmation(
			`Use ${number.toLocaleString()} ${sourceItem.item.name} charges to add ${chargesToAdd.toLocaleString()} charges to your ${item.item.name}?`
		);
		await user.transactItems({
			otherUpdates: {
				[transfer.settingsKey]: { decrement: number },
				[item.settingsKey]: { increment: chargesToAdd }
			}
		});
		return `You transferred ${number.toLocaleString()} ${sourceItem.item.name} charges into ${chargesToAdd.toLocaleString()} ${item.item.name} charges.`;
	}

	const useAlt = item.altChargeInput && method && stringMatches(method, item.altChargeInput.name);
	if (item.altChargeInput && !method) {
		return `This item can be charged two ways - specify a method:\n- \`runes\` (${item.chargeInput.cost} per ${item.chargeInput.charges} charge)\n- \`${item.altChargeInput.name}\` (${item.altChargeInput.cost} per ${item.altChargeInput.charges} charges)`;
	}

	const chargeInput = useAlt ? item.altChargeInput! : item.chargeInput;
	const cost = chargeInput.cost.clone().multiply(number);
	const amountOfCharges = chargeInput.charges * number;

	if (item.requiresItemToCharge) {
		if (!user.hasEquippedOrInBank(item.item.id)) return `You don't own a ${item.item.name}.`;
	}

	if (!user.owns(cost)) {
		return `You don't own ${cost}.`;
	}

	const needConvert = item.convertOnCharge && item.unchargedItem;
	if (needConvert && !user.hasEquippedOrInBank(item.item.id) && !user.owns(item.unchargedItem!.id)) {
		return `You don't own a ${item.item.name} or ${item.unchargedItem?.name}.`;
	}

	await interaction.confirmation(
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
		await user.transactItems({
			itemsToRemove: cost,
			otherUpdates: item.requiresItemToCharge ? { [item.settingsKey]: { increment: amountOfCharges } } : undefined
		});
	}

	const currentCharges = user.user[item.settingsKey];
	const newCharges = item.requiresItemToCharge ? currentCharges : currentCharges + amountOfCharges;
	if (!item.requiresItemToCharge) {
		await user.update({
			[item.settingsKey]: newCharges
		});
	}
	await ClientSettings.updateBankSetting('degraded_items_cost', cost);

	return `You added **${cost}** to your ${item.item.name}, it now has ${newCharges} charges.`;
}
