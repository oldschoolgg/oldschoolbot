import type { ChatInputCommandInteraction } from 'discord.js';
import { Bank } from 'oldschooljs';

import { resolveItems } from 'oldschooljs/dist/util/util';
import { BitField } from '../../../lib/constants';
import { formatSkillRequirements, stringMatches, toKMB } from '../../../lib/util';
import { findGroupOfUser } from '../../../lib/util/findGroupOfUser';
import { handleMahojiConfirmation } from '../../../lib/util/handleMahojiConfirmation';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';

export async function bankBgCommand(interaction: ChatInputCommandInteraction, user: MUser, name: string) {
	const bankImages = bankImageGenerator.backgroundImages;
	const selectedImage = bankImages.find(img => stringMatches(img.name, name));

	if (!selectedImage) {
		return `The following bank images exist: ${bankImages.map(img => img.name).join(', ')}`;
	}

	if (user.user.bankBackground === selectedImage.id) {
		return 'This is already your bank background.';
	}

	const owners = selectedImage.owners ?? [];
	const allAccounts = await findGroupOfUser(user.id);
	if (user.bitfield.includes(BitField.isModerator) || allAccounts.some(a => owners.includes(a))) {
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

	if (selectedImage.sacValueRequired) {
		const sac = Number(user.user.sacrificedValue);
		if (sac < selectedImage.sacValueRequired) {
			return `You have to have sacrificed atleast ${toKMB(
				selectedImage.sacValueRequired
			)} GP worth of items to use this background.`;
		}
	}

	if (selectedImage.skillsNeeded) {
		const meets = user.hasSkillReqs(selectedImage.skillsNeeded);
		if (!meets) {
			return `You don't meet the skill requirements to use this background, you need: ${formatSkillRequirements(
				selectedImage.skillsNeeded
			)}.`;
		}
	}

	if (!selectedImage.available) {
		return 'This image is not currently available.';
	}

	if (selectedImage.bitfield && !user.bitfield.includes(selectedImage.bitfield)) {
		return "You're not elligible to use this bank background.";
	}

	// Check they have required collection log items.
	if (selectedImage.collectionLogItemsNeeded && !user.cl.has(selectedImage.collectionLogItemsNeeded)) {
		return `You're not worthy to use this background. You need these items in your Collection Log: ${new Bank(
			selectedImage.collectionLogItemsNeeded
		)}`;
	}

	// Check they have the required perk tier.
	if (selectedImage.perkTierNeeded && user.perkTier() < selectedImage.perkTierNeeded) {
		return `This background is only available for Tier ${Number(selectedImage.perkTierNeeded) - 1} patrons.`;
	}

	if (selectedImage.name === 'Pets') {
		const { cl } = user;
		const hasPet = resolveItems(['Rocky', 'Bloodhound', 'Giant squirrel', 'Baby chinchompa']).some(id =>
			cl.has(id)
		);
		if (!hasPet) {
			return 'You need to have one of these pets to purchase the Pets background: Rocky, Bloodhound, Giant squirrel, Baby chinchompa.';
		}
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

		await handleMahojiConfirmation(interaction, str);

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

	updateBankSetting('economyStats_bankBgCostBank', economyCost);

	return `Your bank background is now **${selectedImage.name}**!`;
}
