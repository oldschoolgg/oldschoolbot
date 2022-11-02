import { BaseMessageOptions, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';

import { ClueTiers } from '../../../lib/clues/clueTiers';
import { BitField, Emoji, minionBuyButton } from '../../../lib/constants';
import { roboChimpUserFetch } from '../../../lib/roboChimp';
import { makeComponents } from '../../../lib/util';
import { minionStatus } from '../../../lib/util/minionStatus';
import { makeRepeatTripButtons } from '../../../lib/util/repeatStoredTrip';
import { calculateBirdhouseDetails } from './birdhousesCommand';
import { isUsersDailyReady } from './dailyCommand';
import { canRunAutoContract } from './farmingContractCommand';

export async function minionStatusCommand(user: MUser): Promise<BaseMessageOptions> {
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

	if (!user.minionIsBusy && birdhouseDetails.isReady && !user.bitfield.includes(BitField.DisableBirdhouseRunButton)) {
		buttons.push(
			new ButtonBuilder()
				.setCustomId('DO_BIRDHOUSE_RUN')
				.setLabel('Birdhouse Run')
				.setEmoji('692946556399124520')
				.setStyle(ButtonStyle.Secondary)
		);
	}

	if (!user.minionIsBusy && (await canRunAutoContract(user))) {
		buttons.push(
			new ButtonBuilder()
				.setCustomId('AUTO_FARMING_CONTRACT')
				.setLabel('Auto Farming Contract')
				.setEmoji('977410792754413668')
				.setStyle(ButtonStyle.Secondary)
		);
	}

	if (!user.minionIsBusy) {
		const repeatButtons = await makeRepeatTripButtons(user);
		buttons.push(...repeatButtons);
	}

	const { bank } = user;

	if (!user.minionIsBusy) {
		for (const tier of ClueTiers.filter(t => bank.has(t.scrollID))
			.reverse()
			.slice(0, 3)) {
			buttons.push(
				new ButtonBuilder()
					.setCustomId(`DO_${tier.name.toUpperCase()}_CLUE`)
					.setLabel(`Do ${tier.name} Clue`)
					.setEmoji('365003979840552960')
					.setStyle(ButtonStyle.Secondary)
			);
		}
	}

	buttons.push(
		new ButtonBuilder()
			.setCustomId('VIEW_BANK')
			.setLabel('View Bank')
			.setEmoji('739459924693614653')
			.setStyle(ButtonStyle.Secondary)
	);

	const roboChimpUser = await roboChimpUserFetch(user.id);
	if (roboChimpUser.leagues_points_total === 0) {
		buttons.push(
			new ButtonBuilder()
				.setLabel('OSB/BSO Leagues')
				.setEmoji('660333438016028723')
				.setStyle(ButtonStyle.Link)
				.setURL('https://bso-wiki.oldschool.gg/leagues')
		);
	}

	return {
		content: status,
		components: makeComponents(buttons)
	};
}
