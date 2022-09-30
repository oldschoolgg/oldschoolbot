import { ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';

import { ClueTiers } from '../../../lib/clues/clueTiers';
import { Emoji, minionBuyButton, PerkTier } from '../../../lib/constants';
import { getUsersFishingContestDetails } from '../../../lib/fishingContest';
import { getUsersTame, shortTameTripDesc, tameLastFinishedActivity } from '../../../lib/tames';
import { makeComponents } from '../../../lib/util';
import getUsersPerkTier from '../../../lib/util/getUsersPerkTier';
import { minionStatus } from '../../../lib/util/minionStatus';
import { makeRepeatTripButtons } from '../../../lib/util/repeatStoredTrip';
import { getItemContractDetails } from '../../commands/ic';
import { spawnLampIsReady } from '../../commands/tools';
import { calculateBirdhouseDetails } from './birdhousesCommand';
import { isUsersDailyReady } from './dailyCommand';
import { canRunAutoContract } from './farmingContractCommand';

export async function minionStatusCommand(user: MUser, channelID: string) {
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

	const result = await getUsersFishingContestDetails(user);
	if (
		user.perkTier >= PerkTier.Four &&
		result.catchesFromToday.length === 0 &&
		!user.minionIsBusy &&
		['Contest rod', "Beginner's tackle box"].every(i => user.hasEquippedOrInBank(i))
	) {
		buttons.push(
			new ButtonBuilder()
				.setCustomId('DO_FISHING_CONTEST')
				.setLabel('Fishing Contest')
				.setEmoji('630911040091193356')
				.setStyle(ButtonStyle.Secondary)
		);
	}

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

	const perkTier = getUsersPerkTier(user);
	if (perkTier >= PerkTier.Two) {
		const { tame, species, activity } = await getUsersTame(user);
		if (tame && !activity) {
			const lastTameAct = await tameLastFinishedActivity(user);
			if (lastTameAct) {
				buttons.push(
					new ButtonBuilder()
						.setCustomId('REPEAT_TAME_TRIP')
						.setLabel(`Repeat ${shortTameTripDesc(lastTameAct)}`)
						.setEmoji(species!.emojiID)
						.setStyle(ButtonStyle.Secondary)
				);
			}
		}
	}

	const [spawnLampReady] = spawnLampIsReady(user, channelID);
	if (spawnLampReady) {
		buttons.push(
			new ButtonBuilder()
				.setCustomId('SPAWN_LAMP')
				.setLabel('Spawn Lamp')
				.setEmoji('988325171498721290')
				.setStyle(ButtonStyle.Secondary)
		);
	}

	const icDetails = getItemContractDetails(user);
	if (perkTier >= PerkTier.Two && icDetails.currentItem && icDetails.owns) {
		buttons.push(
			new ButtonBuilder()
				.setCustomId('ITEM_CONTRACT_SEND')
				.setLabel(`IC: ${icDetails.currentItem.name.slice(0, 20)}`)
				.setEmoji('988422348434718812')
				.setStyle(ButtonStyle.Secondary)
		);
	}

	buttons.push(
		new ButtonBuilder()
			.setCustomId('VIEW_BANK')
			.setLabel('View Bank')
			.setEmoji('739459924693614653')
			.setStyle(ButtonStyle.Secondary)
	);

	return {
		content: status,
		components: makeComponents(buttons)
	};
}
