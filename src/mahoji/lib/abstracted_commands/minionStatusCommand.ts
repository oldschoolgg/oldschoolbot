import { ButtonStyle } from 'discord-api-types/v10';
import { APIButtonComponentWithCustomId, ComponentType } from 'mahoji';
import { InteractionResponseDataWithBufferAttachments } from 'mahoji/dist/lib/structures/ICommand';

import { ClueTiers } from '../../../lib/clues/clueTiers';
import { Emoji, lastTripCache, minionBuyButton, PerkTier } from '../../../lib/constants';
import { getUsersFishingContestDetails } from '../../../lib/fishingContest';
import { getUsersTame, shortTameTripDesc, tameLastFinishedActivity } from '../../../lib/tames';
import { makeComponents } from '../../../lib/util';
import getUsersPerkTier from '../../../lib/util/getUsersPerkTier';
import { minionStatus } from '../../../lib/util/minionStatus';
import { getItemContractDetails } from '../../commands/ic';
import { spawnLampIsReady } from '../../commands/tools';
import { mahojiUsersSettingsFetch } from '../../mahojiSettings';
import { calculateBirdhouseDetails } from './birdhousesCommand';
import { isUsersDailyReady } from './dailyCommand';
import { canRunAutoContract } from './farmingContractCommand';

export async function minionStatusCommand(
	userID: bigint | string,
	channelID: string
): Promise<InteractionResponseDataWithBufferAttachments> {
	const user = await globalClient.fetchUser(userID);
	const mahojiUser = await mahojiUsersSettingsFetch(userID);

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

	const result = await getUsersFishingContestDetails(user);
	if (
		user.perkTier >= PerkTier.Four &&
		result.catchesFromToday.length === 0 &&
		!user.minionIsBusy &&
		['Contest rod', "Beginner's tackle box"].every(i => user.hasItemEquippedOrInBank(i))
	) {
		buttons.push({
			type: ComponentType.Button,
			custom_id: 'DO_FISHING_CONTEST',
			label: 'Fishing Contest',
			emoji: { id: '630911040091193356' },
			style: ButtonStyle.Secondary
		});
	}

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

	const bank = user.bank();

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

	const perkTier = getUsersPerkTier(user);
	if (perkTier >= PerkTier.Two) {
		const { tame, species, activity } = await getUsersTame(user);
		if (tame && !activity) {
			const lastTameAct = await tameLastFinishedActivity(mahojiUser);
			if (lastTameAct) {
				buttons.push({
					custom_id: 'REPEAT_TAME_TRIP',
					emoji: { id: species!.emojiID },
					style: ButtonStyle.Secondary,
					label: `Repeat ${shortTameTripDesc(lastTameAct)}`,
					type: ComponentType.Button
				});
			}
		}
	}

	const [spawnLampReady] = spawnLampIsReady(mahojiUser, channelID);
	if (spawnLampReady) {
		buttons.push({
			custom_id: 'SPAWN_LAMP',
			emoji: { id: '988325171498721290' },
			style: ButtonStyle.Secondary,
			label: 'Spawn Lamp',
			type: ComponentType.Button
		});
	}

	const icDetails = getItemContractDetails(mahojiUser);
	if (perkTier >= PerkTier.Two && icDetails.currentItem && icDetails.owns) {
		buttons.push({
			custom_id: 'ITEM_CONTRACT_SEND',
			emoji: { id: '988422348434718812' },
			style: ButtonStyle.Secondary,
			label: `IC: ${icDetails.currentItem.name.slice(0, 20)}`,
			type: ComponentType.Button
		});
	}

	return {
		content: status,
		components: makeComponents(buttons)
	};
}
