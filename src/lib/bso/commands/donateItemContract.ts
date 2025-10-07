import { itemContractResetTime } from '@/lib/bso/bsoConstants.js';

import { dateFm, Emoji } from '@oldschoolgg/toolkit';
import type { ButtonInteraction } from 'discord.js';
import { Bank } from 'oldschooljs';

import { modifyBusyCounter } from '@/lib/busyCounterCache.js';
import { BitField } from '@/lib/constants.js';
import { MInteraction } from '@/lib/structures/MInteraction.js';
import { tradePlayerItems } from '@/lib/util/tradePlayerItems.js';
import { getItemContractDetails, handInContract } from '@/mahoji/commands/ic.js';

function icDonateValidation(user: MUser, donator: MUser) {
	if (user.isIronman) {
		return 'Ironmen stand alone!';
	}
	if (user.id === donator.id) {
		return 'You cannot donate to yourself.';
	}
	if (user.bitfield.includes(BitField.NoItemContractDonations)) {
		return "That user doesn't want donations.";
	}
	const details = getItemContractDetails(user);
	if (!details.nextContractIsReady || !details.currentItem) {
		return "That user's Item Contract isn't ready.";
	}

	if (user.isBusy || donator.isBusy) {
		return 'One of you is busy, and cannot do this trade right now.';
	}

	const cost = new Bank().add(details.currentItem.id);
	if (!donator.bank.has(cost)) {
		return `You don't own ${cost}.`;
	}

	return {
		cost,
		details
	};
}

export async function donateICHandler(interaction: ButtonInteraction) {
	const userID = interaction.customId.split('_')[2];
	if (!userID) {
		return interaction.reply({ content: 'Invalid user.', ephemeral: true });
	}

	const user = await mUserFetch(userID);
	const donator = await mUserFetch(interaction.user.id);

	const errorStr = icDonateValidation(user, donator);
	if (typeof errorStr === 'string') return interaction.reply({ content: errorStr, ephemeral: true });

	const mConfirmation = new MInteraction({ interaction });
	await mConfirmation.confirmation({
		content: `${donator}, are you sure you want to give ${errorStr.cost} to ${
			user.badgedUsername
		}? You own ${donator.bank.amount(errorStr.details.currentItem!.id)} of this item.`,
		users: [donator.id]
	});

	await user.sync();
	await donator.sync();

	const secondaryErrorStr = icDonateValidation(user, donator);
	if (typeof secondaryErrorStr === 'string') return interaction.reply({ content: secondaryErrorStr });
	const { cost } = secondaryErrorStr;

	try {
		modifyBusyCounter(donator.id, 1);
		await tradePlayerItems(donator, user, cost);
		await donator.statsBankUpdate('ic_donations_given_bank', cost);
		await user.statsBankUpdate('ic_donations_received_bank', cost);
		const handInResult = await handInContract(new MInteraction({ interaction }), user);
		const nextIcDetails = getItemContractDetails(user);
		return interaction.reply({
			content: `${donator} donated ${cost} for ${user}'s Item Contract!

${user.mention} ${handInResult}

${Emoji.ItemContract} Your next contract is: ${nextIcDetails.currentItem?.name} ${dateFm(new Date(Date.now() + itemContractResetTime))}.`,
			allowedMentions: {
				users: [user.id]
			}
		});
	} catch (err) {
		Logging.logError({ err: err as Error, interaction: new MInteraction({ interaction }) });
	} finally {
		modifyBusyCounter(donator.id, -1);
	}
}
