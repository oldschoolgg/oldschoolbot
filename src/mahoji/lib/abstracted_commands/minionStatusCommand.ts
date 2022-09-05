import { ButtonStyle } from 'discord-api-types/v10';
import { APIButtonComponentWithCustomId, ComponentType } from 'mahoji';
import { InteractionResponseDataWithBufferAttachments } from 'mahoji/dist/lib/structures/ICommand';

import { ClueTiers } from '../../../lib/clues/clueTiers';
import { Emoji, lastTripCache, minionBuyButton } from '../../../lib/constants';
import { makeComponents } from '../../../lib/util';
import { minionStatus } from '../../../lib/util/minionStatus';
import { mahojiUsersSettingsFetch } from '../../mahojiSettings';
import { calculateBirdhouseDetails } from './birdhousesCommand';
import { isUsersDailyReady } from './dailyCommand';
import { canRunAutoContract } from './farmingContractCommand';

export async function minionStatusCommand(
	userID: bigint | string
): Promise<InteractionResponseDataWithBufferAttachments> {
	const user = await mUserFetch(userID);
	const mahojiUser = await mahojiUsersSettingsFetch(userID, { minion_hasBought: true });

	if (!mahojiUser.minion_hasBought) {
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
	const buttons: APIButtonComponentWithCustomId[] = [];

	const birdhouseDetails = await calculateBirdhouseDetails(user.id);

	const dailyIsReady = isUsersDailyReady(user);

	if (dailyIsReady.isReady) {
		buttons.push({
			type: ComponentType.Button,
			custom_id: 'CLAIM_DAILY',
			label: 'Claim Daily',
			emoji: { id: '493286312854683654' },
			style: ButtonStyle.Secondary
		});
	}

	if (user.minionIsBusy) {
		buttons.push({
			type: ComponentType.Button,
			custom_id: 'CANCEL_TRIP',
			label: 'Cancel Trip',
			emoji: { id: '778418736180494347' },
			style: ButtonStyle.Secondary
		});
	}

	if (!user.minionIsBusy) {
		buttons.push({
			type: ComponentType.Button,
			custom_id: 'AUTO_SLAY',
			label: 'Auto Slay',
			emoji: { id: '630911040560824330' },
			style: ButtonStyle.Secondary
		});
	}
	buttons.push({
		type: ComponentType.Button,
		custom_id: 'CHECK_PATCHES',
		label: 'Check Patches',
		emoji: { name: Emoji.Stopwatch },
		style: ButtonStyle.Secondary
	});

	if (!user.minionIsBusy && birdhouseDetails.isReady) {
		buttons.push({
			type: ComponentType.Button,
			custom_id: 'DO_BIRDHOUSE_RUN',
			label: 'Birdhouse Run',
			emoji: { id: '692946556399124520' },
			style: ButtonStyle.Secondary
		});
	}

	if (!user.minionIsBusy && (await canRunAutoContract(user.id))) {
		buttons.push({
			type: ComponentType.Button,
			custom_id: 'AUTO_FARMING_CONTRACT',
			label: 'Auto Farming Contract',
			emoji: { id: '977410792754413668' },
			style: ButtonStyle.Secondary
		});
	}

	const lastTrip = lastTripCache.get(user.id);
	if (lastTrip && !user.minionIsBusy) {
		buttons.push({
			type: ComponentType.Button,
			custom_id: 'REPEAT_TRIP',
			label: 'Repeat Trip',
			emoji: { name: '🔁' },
			style: ButtonStyle.Secondary
		});
	}

	const { bank } = user;

	if (!user.minionIsBusy) {
		for (const tier of ClueTiers.filter(t => bank.has(t.scrollID))
			.reverse()
			.slice(0, 3)) {
			buttons.push({
				type: ComponentType.Button,
				custom_id: `DO_${tier.name.toUpperCase()}_CLUE`,
				label: `Do ${tier.name} Clue`,
				emoji: { id: '365003979840552960' },
				style: ButtonStyle.Secondary
			});
		}
	}

	return {
		content: status,
		components: makeComponents(buttons)
	};
}
