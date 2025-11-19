import { stringMatches } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import { bankImageTask } from '@/lib/canvas/bankImage.js';
import { getBankBackgroundEligibility } from '@/mahoji/lib/abstracted_commands/bankBgHelpers.js';

export async function bankBgCommand(interaction: MInteraction, user: MUser, name: string) {
	const bankImages = bankImageTask.backgroundImages;
	const selectedImage = bankImages.find(img => stringMatches(img.name, name));

	if (!selectedImage) {
		return `The following bank images exist: ${bankImages.map(img => img.name).join(', ')}`;
	}

	if (user.user.bankBackground === selectedImage.id) {
		return 'This is already your bank background.';
	}

	if (user.isModOrAdmin()) {
		await user.update({
			bankBackground: selectedImage.id
		});
		return `Your bank background is now **${selectedImage.name}**!`;
	}

	if (selectedImage.storeBitField && user.user.store_bitfield.includes(selectedImage.storeBitField)) {
		await user.update({
			bankBackground: selectedImage.id
		});
		return `Your bank background is now **${selectedImage.name}**!`;
	}

	const eligibility = await getBankBackgroundEligibility({ user, background: selectedImage });
	if (!eligibility.canUse && eligibility.failure) {
		return eligibility.failure.response;
	}

	/**
	 * If this bank image has a gp or item cost, confirm and charge.
	 */
	const economyCost = new Bank();
	if (selectedImage.gpCost || selectedImage.itemCost) {
		const userBank = user.bank;

		// Ensure they have the required items.
		if (selectedImage.itemCost && !userBank.has(selectedImage.itemCost)) {
			return `You don't have the required items to purchase this background. You need: ${new Bank(
				selectedImage.itemCost
			)}, you're missing: ${new Bank(selectedImage.itemCost).remove(userBank)}.`;
		}

		// Ensure they have the required GP.
		if (selectedImage.gpCost && user.GP < selectedImage.gpCost) {
			return `You need ${selectedImage.gpCost.toLocaleString()} GP to purchase this background.`;
		}

		// Start building a string to show to the user.
		let str = `${user}, please confirm that you want to buy the **${selectedImage.name}** bank background for: `;

		// If theres an item cost or GP cost, add it to the string to show users the cost.
		if (selectedImage.itemCost) {
			str += new Bank(selectedImage.itemCost).toString();
			if (selectedImage.gpCost) {
				str += `, ${selectedImage.gpCost.toLocaleString()} GP.`;
			}
		} else if (selectedImage.gpCost) {
			str += `${selectedImage.gpCost.toLocaleString()} GP.`;
		}

		str +=
			" **Note:** You'll have to pay this cost again if you switch to another background and want this one again.";

		await interaction.confirmation(str);

		if (selectedImage.itemCost) {
			economyCost.add(selectedImage.itemCost);
			await user.removeItemsFromBank(new Bank(selectedImage.itemCost));
		}

		if (selectedImage.gpCost) {
			economyCost.add(selectedImage.gpCost);
			await user.removeItemsFromBank(new Bank().add('Coins', selectedImage.gpCost));
		}
	}

	await user.update({
		bankBackground: selectedImage.id
	});

	await ClientSettings.updateBankSetting('economyStats_bankBgCostBank', economyCost);

	return `Your bank background is now **${selectedImage.name}**!`;
}
