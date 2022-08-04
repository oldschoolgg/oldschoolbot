import { MessageButton } from 'discord.js';
import { APIInteraction, InteractionType, Routes } from 'mahoji';

import { autoContract } from '../../mahoji/lib/abstracted_commands/farmingContractCommand';
import { mahojiUsersSettingsFetch } from '../../mahoji/mahojiSettings';
import { ClueTier } from '../clues/clueTiers';
import { lastTripCache } from '../constants';
import { runCommand } from '../settings/settings';
import { minionIsBusy } from './minionIsBusy';
import { minionName } from './minionUtils';
import { respondToButton } from './respondToButton';
import { webhookMessageCache } from './webhook';

const globalInteractionActions = [
	'DO_BEGINNER_CLUE',
	'DO_EASY_CLUE',
	'DO_MEDIUM_CLUE',
	'DO_HARD_CLUE',
	'DO_ELITE_CLUE',
	'DO_MASTER_CLUE',
	'OPEN_BEGINNER_CASKET',
	'OPEN_EASY_CASKET',
	'OPEN_MEDIUM_CASKET',
	'OPEN_HARD_CASKET',
	'OPEN_ELITE_CASKET',
	'OPEN_MASTER_CASKET',
	'REPEAT_TRIP',
	'DO_BIRDHOUSE_RUN',
	'CLAIM_DAILY',
	'CHECK_PATCHES',
	'AUTO_SLAY',
	'CANCEL_TRIP',
	'AUTO_FARM',
	'AUTO_FARMING_CONTRACT'
] as const;
type GlobalInteractionAction = typeof globalInteractionActions[number];
function isValidGlobalInteraction(str: string): str is GlobalInteractionAction {
	return globalInteractionActions.includes(str as GlobalInteractionAction);
}

export function makeDoClueButton(tier: ClueTier) {
	const name: Uppercase<ClueTier['name']> = tier.name.toUpperCase() as Uppercase<ClueTier['name']>;
	const id: GlobalInteractionAction = `DO_${name}_CLUE`;
	return new MessageButton()
		.setCustomID(id)
		.setLabel(`Do ${tier.name} Clue`)
		.setStyle('SECONDARY')
		.setEmoji('365003979840552960');
}

export function makeOpenCasketButton(tier: ClueTier) {
	const name: Uppercase<ClueTier['name']> = tier.name.toUpperCase() as Uppercase<ClueTier['name']>;
	const id: GlobalInteractionAction = `OPEN_${name}_CASKET`;
	return new MessageButton()
		.setCustomID(id)
		.setLabel(`Open ${tier.name} Casket`)
		.setStyle('SECONDARY')
		.setEmoji('365003978678730772');
}

export function makeRepeatTripButton() {
	return new MessageButton().setCustomID('REPEAT_TRIP').setLabel('Repeat Trip').setStyle('SECONDARY').setEmoji('🔁');
}

export async function interactionHook(data: APIInteraction) {
	if (data.type !== InteractionType.MessageComponent) return;
	const id = data.data.custom_id;
	if (!isValidGlobalInteraction(id)) return;
	const userID = data.member ? data.member.user?.id : data.user?.id;
	if (!userID) return;
	const user = await mahojiUsersSettingsFetch(userID);
	const options = {
		user,
		member: data.member ?? null,
		userID,
		channelID: data.channel_id,
		guildID: data.guild_id
	};

	async function buttonReply(str?: string) {
		await respondToButton(data.id, data.token, str);
		if (data.message && data.channel_id) {
			const webhook = webhookMessageCache.get(data.message.id);

			if (webhook) {
				globalClient.mahojiClient.restManager.patch(
					Routes.webhookMessage(webhook.id, webhook.token, data.message.id),
					{
						body: { components: [] }
					}
				);
			} else {
				globalClient.mahojiClient.restManager.patch(Routes.channelMessage(data.channel_id, data.message?.id), {
					body: { components: [] }
				});
			}
		}
	}

	async function doClue(tier: ClueTier['name']) {
		await buttonReply();
		runCommand({
			commandName: 'clue',
			args: { tier },
			bypassInhibitors: true,
			...options
		});
	}

	async function openCasket(tier: ClueTier['name']) {
		await buttonReply();
		runCommand({
			commandName: 'open',
			args: {
				name: tier,
				quantity: 1
			},
			...options
		});
	}

	if (id === 'CLAIM_DAILY') {
		await buttonReply();
		return runCommand({
			commandName: 'minion',
			args: { daily: {} },
			bypassInhibitors: true,
			...options
		});
	}

	if (id === 'CHECK_PATCHES') {
		await buttonReply();
		return runCommand({
			commandName: 'farming',
			args: { check_patches: {} },
			bypassInhibitors: true,
			...options
		});
	}

	if (id === 'CANCEL_TRIP') {
		await buttonReply();
		return runCommand({
			commandName: 'minion',
			args: { cancel: {} },
			bypassInhibitors: true,
			...options
		});
	}

	if (minionIsBusy(user.id)) {
		return buttonReply(`${minionName(user)} is busy.`);
	}

	switch (id) {
		case 'REPEAT_TRIP': {
			const entry = lastTripCache.get(userID);
			if (entry) {
				await buttonReply();
				return entry.continue({
					...options
				});
			}
			return buttonReply("Couldn't find a last trip to repeat.");
		}
		case 'DO_BEGINNER_CLUE':
			return doClue('Beginner');
		case 'DO_EASY_CLUE':
			return doClue('Easy');
		case 'DO_MEDIUM_CLUE':
			return doClue('Medium');
		case 'DO_HARD_CLUE':
			return doClue('Hard');
		case 'DO_ELITE_CLUE':
			return doClue('Elite');
		case 'DO_MASTER_CLUE':
			return doClue('Master');

		case 'OPEN_BEGINNER_CASKET':
			return openCasket('Beginner');
		case 'OPEN_EASY_CASKET':
			return openCasket('Easy');
		case 'OPEN_MEDIUM_CASKET':
			return openCasket('Medium');
		case 'OPEN_HARD_CASKET':
			return openCasket('Hard');
		case 'OPEN_ELITE_CASKET':
			return openCasket('Elite');
		case 'OPEN_MASTER_CASKET':
			return openCasket('Master');
		case 'DO_BIRDHOUSE_RUN':
			await buttonReply();
			return runCommand({
				commandName: 'activities',
				args: { birdhouses: { action: 'harvest' } },
				bypassInhibitors: true,
				...options
			});
		case 'AUTO_SLAY': {
			await buttonReply();
			return runCommand({
				commandName: 'slayer',
				args: { autoslay: {} },
				bypassInhibitors: true,
				...options
			});
		}
		case 'AUTO_FARM': {
			await buttonReply();
			return runCommand({
				commandName: 'farming',
				args: {
					auto_farm: {}
				},
				bypassInhibitors: true,
				...options
			});
		}
		case 'AUTO_FARMING_CONTRACT': {
			await buttonReply();
			return autoContract(await globalClient.fetchUser(user.id), BigInt(options.channelID), BigInt(user.id));
		}
		default: {
		}
	}
}
