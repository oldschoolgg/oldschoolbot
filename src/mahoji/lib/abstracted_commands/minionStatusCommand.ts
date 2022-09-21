import { ButtonBuilder } from 'discord.js';
import { ButtonStyle } from 'discord-api-types/v10';
import { ComponentType } from 'mahoji';

import { ClueTiers } from '../../../lib/clues/clueTiers';
import { Emoji, lastTripCache, minionBuyButton } from '../../../lib/constants';
import { makeComponents } from '../../../lib/util';
import { minionStatus } from '../../../lib/util/minionStatus';
import { calculateBirdhouseDetails } from './birdhousesCommand';
import { isUsersDailyReady } from './dailyCommand';
import { canRunAutoContract } from './farmingContractCommand';

export async function minionStatusCommand(user: MUser) {
	if (!user.user.minion_hasBought) {
		return {
			content:
				"You haven't bought a minion yet! Click the button below to buy a minion and start playing the bot.",
			components: [
				{
					components: [minionBuyButton],
					type: ComponentType.ActionRow
				}
			]
		};
	}

	const status = minionStatus(user);
	const buttons: ButtonBuilder[] = [];

	const birdhouseDetails = await calculateBirdhouseDetails(user.id);

	const dailyIsReady = isUsersDailyReady(user);

	if (dailyIsReady.isReady) {
		buttons.push(
			new ButtonBuilder()
				.setCustomId('CLAIM_DAILY')
				.setLabel('Claim Daily')
				.setEmoji('493286312854683654')
				.setStyle(ButtonStyle.Secondary)
		);
	}

	if (user.minionIsBusy) {
		buttons.push(
			new ButtonBuilder()
				.setCustomId('CANCEL_TRIP')
				.setLabel('Cancel Trip')
				.setEmoji('778418736180494347')
				.setStyle(ButtonStyle.Secondary)
		);
	}

	if (!user.minionIsBusy) {
		buttons.push(
			new ButtonBuilder()
				.setCustomId('AUTO_SLAY')
				.setLabel('Auto Slay')
				.setEmoji('630911040560824330')
				.setStyle(ButtonStyle.Secondary)
		);
	}

	buttons.push(
		new ButtonBuilder()
			.setCustomId('CHECK_PATCHES')
			.setLabel('Check Patches')
			.setEmoji(Emoji.Stopwatch)
			.setStyle(ButtonStyle.Secondary)
	);

	if (!user.minionIsBusy && birdhouseDetails.isReady) {
		buttons.push(
			new ButtonBuilder()
				.setCustomId('DO_BIRDHOUSE_RUN')
				.setLabel('Birdhouse Run')
				.setEmoji('692946556399124520')
				.setStyle(ButtonStyle.Secondary)
		);
	}

	if (!user.minionIsBusy && (await canRunAutoContract(user.id))) {
		buttons.push(
			new ButtonBuilder()
				.setCustomId('AUTO_FARMING_CONTRACT')
				.setLabel('Auto Farming Contract')
				.setEmoji('977410792754413668')
				.setStyle(ButtonStyle.Secondary)
		);
	}

	const lastTrip = lastTripCache.get(user.id);
	if (lastTrip && !user.minionIsBusy) {
		buttons.push(
			new ButtonBuilder()
				.setCustomId('REPEAT_TRIP')
				.setLabel('Repeat Trip')
				.setEmoji('🔁')
				.setStyle(ButtonStyle.Secondary)
		);
	}

	const { bank } = user;

	if (!user.minionIsBusy) {
		for (const tier of ClueTiers.filter(t => bank.has(t.scrollID))
			.reverse()
			.slice(0, 3)) {
			new ButtonBuilder()
				.setCustomId(`DO_${tier.name.toUpperCase()}_CLUE`)
				.setLabel(`Do ${tier.name} Clue`)
				.setEmoji('365003979840552960')
				.setStyle(ButtonStyle.Secondary);
		}
	}

	new ButtonBuilder()
		.setCustomId('VIEW_BANK')
		.setLabel('View Bank')
		.setEmoji('739459924693614653')
		.setStyle(ButtonStyle.Secondary);

	return {
		content: status,
		components: makeComponents(buttons)
	};
}
