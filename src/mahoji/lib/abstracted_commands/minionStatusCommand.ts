import type { BaseMessageOptions } from 'discord.js';
import { ButtonBuilder, ButtonStyle } from 'discord.js';

import { ClueTiers } from '../../../lib/clues/clueTiers';
import { BitField, Emoji, PerkTier } from '../../../lib/constants';
import { getUsersFishingContestDetails } from '../../../lib/fishingContest';
import { roboChimpSyncData } from '../../../lib/roboChimp';

import { makeComponents } from '../../../lib/util';
import {
	makeAutoContractButton,
	makeAutoSlayButton,
	makeBirdHouseTripButton
} from '../../../lib/util/globalInteractions';
import { minionStatus } from '../../../lib/util/minionStatus';
import { makeRepeatTripButtons } from '../../../lib/util/repeatStoredTrip';
import { getUsersTame, shortTameTripDesc, tameLastFinishedActivity } from '../../../lib/util/tameUtil';
import { calculateBirdhouseDetails } from './birdhousesCommand';
import { isUsersDailyReady } from './dailyCommand';
import { canRunAutoContract } from './farmingContractCommand';

export async function minionStatusCommand(user: MUser): Promise<BaseMessageOptions> {
	const { minionIsBusy } = user;
	const [birdhouseDetails, fishingResult, dailyIsReady] = await Promise.all([
		minionIsBusy ? { isReady: false } : calculateBirdhouseDetails(user),
		getUsersFishingContestDetails(user),
		isUsersDailyReady(user)
	]);

	await roboChimpSyncData(user);

	if (!user.user.minion_hasBought) {
		return {
			content: `You haven't bought a minion yet! Use /minion buy.`
		};
	}

	const status = minionStatus(user);
	const buttons: ButtonBuilder[] = [];

	if (
		user.perkTier() >= PerkTier.Four &&
		fishingResult.catchesFromToday.length === 0 &&
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

	if (dailyIsReady.isReady) {
		buttons.push(
			new ButtonBuilder()
				.setCustomId('CLAIM_DAILY')
				.setLabel('Claim Daily')
				.setEmoji('493286312854683654')
				.setStyle(ButtonStyle.Secondary)
		);
	}

	if (minionIsBusy) {
		buttons.push(
			new ButtonBuilder()
				.setCustomId('CANCEL_TRIP')
				.setLabel('Cancel Trip')
				.setEmoji('778418736180494347')
				.setStyle(ButtonStyle.Secondary)
		);
	}

	if (!minionIsBusy && !user.bitfield.includes(BitField.DisableAutoSlayButton)) {
		buttons.push(makeAutoSlayButton());
	}

	buttons.push(
		new ButtonBuilder()
			.setCustomId('CHECK_PATCHES')
			.setLabel('Check Patches')
			.setEmoji(Emoji.Stopwatch)
			.setStyle(ButtonStyle.Secondary)
	);

	if (!minionIsBusy && birdhouseDetails.isReady && !user.bitfield.includes(BitField.DisableBirdhouseRunButton)) {
		buttons.push(makeBirdHouseTripButton());
	}

	if (
		!minionIsBusy &&
		(await canRunAutoContract(user)) &&
		!user.bitfield.includes(BitField.DisableAutoFarmContractButton)
	) {
		buttons.push(makeAutoContractButton());
	}

	if (!minionIsBusy) {
		const repeatButtons = await makeRepeatTripButtons(user);
		buttons.push(...repeatButtons);
	}

	const { bank } = user;

	if (!minionIsBusy && !user.bitfield.includes(BitField.DisableClueButtons)) {
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

	const perkTier = user.perkTier();
	if (perkTier >= 2) {
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

	return {
		content: status,
		components: makeComponents(buttons)
	};
}
