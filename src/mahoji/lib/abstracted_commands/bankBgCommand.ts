import { KlasaUser } from 'klasa';
import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';
import { Bank } from 'oldschooljs';

import { BitField } from '../../../lib/constants';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import {
	formatSkillRequirements,
	skillsMeetRequirements,
	stringMatches,
	toKMB,
	updateBankSetting
} from '../../../lib/util';
import getUsersPerkTier from '../../../lib/util/getUsersPerkTier';
import resolveItems from '../../../lib/util/resolveItems';
import BankImageTask from '../../../tasks/bankImage';
import { handleMahojiConfirmation } from '../../mahojiSettings';

export async function bankBgCommand(interaction: SlashCommandInteraction, user: KlasaUser, name: string) {
	const bankImages = (globalClient.tasks.get('bankImage') as BankImageTask).backgroundImages;
	const selectedImage = bankImages.find(img => stringMatches(img.name, name));

	if (!selectedImage) {
		return `The following bank images exist: ${bankImages.map(img => img.name).join(', ')}`;
	}

	if (user.settings.get(UserSettings.BankBackground) === selectedImage.id) {
		return 'This is already your bank background.';
	}

	if (user.settings.get(UserSettings.BitField).includes(BitField.isModerator)) {
		await user.settings.update(UserSettings.BankBackground, selectedImage.id);
		return `Your bank background is now **${selectedImage.name}**!`;
	}

	if (selectedImage.sacValueRequired) {
		const sac = user.settings.get(UserSettings.SacrificedValue);
		if (sac < selectedImage.sacValueRequired) {
			return `You have to have sacrificed atleast ${toKMB(
				selectedImage.sacValueRequired
			)} GP worth of items to use this background.`;
		}
	}

	if (selectedImage.skillsNeeded) {
		const meets = skillsMeetRequirements(user.skillsAsXP, selectedImage.skillsNeeded);
		if (!meets) {
			return `You don't meet the skill requirements to use this background, you need: ${formatSkillRequirements(
				selectedImage.skillsNeeded
			)}.`;
		}
	}

	if (!selectedImage.available) {
		return 'This image is not currently available.';
	}

	if (selectedImage.bitfield && !user.settings.get(UserSettings.BitField).includes(selectedImage.bitfield)) {
		return "You're not elligible to use this bank background.";
	}

	// Check they have required collection log items.
	if (selectedImage.collectionLogItemsNeeded && !user.cl().has(selectedImage.collectionLogItemsNeeded)) {
		return `You're not worthy to use this background. You need these items in your Collection Log: ${new Bank(
			selectedImage.collectionLogItemsNeeded
		)}`;
	}

	// Check they have the required perk tier.
	if (selectedImage.perkTierNeeded && getUsersPerkTier(user) < selectedImage.perkTierNeeded) {
		return `This background is only available for Tier ${Number(selectedImage.perkTierNeeded) - 1} patrons.`;
	}

	if (selectedImage.name === 'Pets') {
		const cl = user.cl();
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
	let economyCost = new Bank();
	if (selectedImage.gpCost || selectedImage.itemCost) {
		await user.settings.sync(true);
		const userBank = user.bank();

		// Ensure they have the required items.
		if (selectedImage.itemCost && !userBank.has(selectedImage.itemCost)) {
			return `You don't have the required items to purchase this background. You need: ${new Bank(
				selectedImage.itemCost
			)}, you're missing: ${new Bank(selectedImage.itemCost).remove(userBank)}.`;
		}

		// Ensure they have the required GP.
		if (selectedImage.gpCost && user.settings.get(UserSettings.GP) < selectedImage.gpCost) {
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
			await user.removeItemsFromBank(selectedImage.itemCost);
		}

		if (selectedImage.gpCost) {
			economyCost.add(selectedImage.gpCost);
			await user.removeItemsFromBank(new Bank().add('Coins', selectedImage.gpCost));
		}
	}

	await user.settings.update(UserSettings.BankBackground, selectedImage.id);

	updateBankSetting(globalClient, ClientSettings.EconomyStats.BankBgCostBank, economyCost);

	return `Your bank background is now **${selectedImage.name}**!`;
}
