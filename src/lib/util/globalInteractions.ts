import { ButtonBuilder, ButtonStyle } from 'discord.js';
import { Time, uniqueArr } from 'e';
import { APIInteraction, InteractionType, Routes } from 'mahoji';
import { Bank } from 'oldschooljs';

import { buyBingoTicketCommand } from '../../mahoji/commands/bingo';
import { autoContract } from '../../mahoji/lib/abstracted_commands/farmingContractCommand';
import { Cooldowns } from '../../mahoji/lib/Cooldowns';
import { ClueTier } from '../clues/clueTiers';
import { lastTripCache, PerkTier } from '../constants';
import { prisma } from '../settings/prisma';
import { runCommand } from '../settings/settings';
import { ItemBank } from '../types';
import { channelIsSendable, convertMahojiResponseToDJSResponse, formatDuration, removeFromArr } from '../util';
import getUsersPerkTier from './getUsersPerkTier';
import { updateGiveawayMessage } from './giveaway';
import { minionIsBusy } from './minionIsBusy';
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
	'AUTO_FARMING_CONTRACT',
	'BUY_MINION',
	'BUY_BINGO_TICKET',
	'NEW_SLAYER_TASK',
	'VIEW_BANK'
] as const;
type GlobalInteractionAction = typeof globalInteractionActions[number];
function isValidGlobalInteraction(str: string): str is GlobalInteractionAction {
	return globalInteractionActions.includes(str as GlobalInteractionAction);
}

export function makeDoClueButton(tier: ClueTier) {
	const name: Uppercase<ClueTier['name']> = tier.name.toUpperCase() as Uppercase<ClueTier['name']>;
	const id: GlobalInteractionAction = `DO_${name}_CLUE`;
	return new ButtonBuilder()
		.setCustomId(id)
		.setLabel(`Do ${tier.name} Clue`)
		.setStyle(ButtonStyle.Secondary)
		.setEmoji('365003979840552960');
}

export function makeOpenCasketButton(tier: ClueTier) {
	const name: Uppercase<ClueTier['name']> = tier.name.toUpperCase() as Uppercase<ClueTier['name']>;
	const id: GlobalInteractionAction = `OPEN_${name}_CASKET`;
	return new ButtonBuilder()
		.setCustomId(id)
		.setLabel(`Open ${tier.name} Casket`)
		.setStyle(ButtonStyle.Secondary)
		.setEmoji('365003978678730772');
}

export function makeRepeatTripButton() {
	return new ButtonBuilder()
		.setCustomId('REPEAT_TRIP')
		.setLabel('Repeat Trip')
		.setStyle(ButtonStyle.Secondary)
		.setEmoji('🔁');
}

export function makeBirdHouseTripButton() {
	return new ButtonBuilder()
		.setCustomId('DO_BIRDHOUSE_RUN')
		.setLabel('Birdhouse Run')
		.setStyle(ButtonStyle.Secondary)
		.setEmoji('692946556399124520');
}
const reactionTimeLimits = {
	0: Time.Hour * 12,
	[PerkTier.One]: Time.Hour * 12,
	[PerkTier.Two]: Time.Hour * 24,
	[PerkTier.Three]: Time.Hour * 50,
	[PerkTier.Four]: Time.Hour * 100,
	[PerkTier.Five]: Time.Hour * 200,
	[PerkTier.Six]: Time.Hour * 300,
	[PerkTier.Seven]: Time.Hour * 300
} as const;

const reactionTimeLimit = (perkTier: PerkTier | 0): number => reactionTimeLimits[perkTier] ?? Time.Hour * 12;

export function makeNewSlayerTaskButton() {
	return new ButtonBuilder()
		.setCustomId('NEW_SLAYER_TASK')
		.setLabel('New Slayer Task')
		.setStyle(ButtonStyle.Secondary)
		.setEmoji('630911040560824330');
}

async function giveawayButtonHandler(user: MUser, customID: string, data: APIInteraction) {
	const split = customID.split('_');
	if (split[0] !== 'GIVEAWAY') return;
	const giveawayID = Number(split[2]);
	const giveaway = await prisma.giveaway.findFirst({
		where: {
			id: giveawayID
		}
	});
	if (!giveaway) {
		return respondToButton(data, 'Invalid giveaway.');
	}
	if (split[1] === 'REPEAT') {
		if (user.id !== giveaway.user_id) {
			return respondToButton(data, "You cannot repeat other peoples' giveaways.");
		}
		await respondToButton(data);
		return runCommand({
			commandName: 'giveaway',
			args: {
				start: {
					duration: `${giveaway.duration}ms`,
					items: new Bank(giveaway.loot as ItemBank)
						.items()
						.map(t => `${t[1]} ${t[0].name}`)
						.join(', ')
				}
			},
			user,
			member: data.member ?? null,
			channelID: data.channel_id!,
			guildID: data.guild_id
		});
	}

	if (giveaway.finish_date.getTime() < Date.now() || giveaway.completed) {
		return respondToButton(data, 'This giveaway has finished.');
	}

	const action = split[1] === 'ENTER' ? 'ENTER' : 'LEAVE';

	if (user.isIronman) {
		return respondToButton(data, 'You are an ironman, you cannot enter giveaways.');
	}

	if (user.id === giveaway.user_id) {
		return respondToButton(data, 'You cannot join your own giveaway.');
	}

	if (action === 'ENTER') {
		if (giveaway.users_entered.includes(user.id)) {
			return respondToButton(data, 'You are already entered in this giveaway.');
		}
		await prisma.giveaway.update({
			where: {
				id: giveaway.id
			},
			data: {
				users_entered: {
					push: user.id
				}
			}
		});
		updateGiveawayMessage(giveaway);
		return respondToButton(data, 'You are now entered in this giveaway.');
	}
	if (!giveaway.users_entered.includes(user.id)) {
		return respondToButton(data, "You aren't entered in this giveaway, so you can't leave it.");
	}
	await prisma.giveaway.update({
		where: {
			id: giveaway.id
		},
		data: {
			users_entered: uniqueArr(removeFromArr(giveaway.users_entered, user.id))
		}
	});
	updateGiveawayMessage(giveaway);
	return respondToButton(data, 'You left the giveaway.');
}

export async function interactionHook(data: APIInteraction) {
	if (data.type !== InteractionType.MessageComponent) return;
	const id = data.data.custom_id;
	const userID = data.member ? data.member.user?.id : data.user?.id;
	if (!userID) return;
	if (globalClient.oneCommandAtATimeCache.has(userID)) {
		return buttonReply('You cannot use a command right now.');
	}

	const user = await mUserFetch(userID);
	if (id.includes('GIVEAWAY_')) return giveawayButtonHandler(user, id, data);

	if (!isValidGlobalInteraction(id)) return;
	const options = {
		user,
		member: data.member ?? null,
		channelID: data.channel_id,
		guildID: data.guild_id
	};

	async function buttonReply(str?: string, ephemeral = true) {
		await respondToButton(data, str, ephemeral);

		// Remove buttons, disabled for now
		if (1 > 2 && data.message && data.channel_id) {
			const webhook = webhookMessageCache.get(data.message.id);

			if (webhook) {
				globalClient.mahojiClient.restManager.patch(
					Routes.webhookMessage(webhook.id, webhook.token, data.message.id),
					{
						body: { components: [] }
					}
				);
			} else if (!data.message.webhook_id) {
				globalClient.mahojiClient.restManager.patch(Routes.channelMessage(data.channel_id, data.message?.id), {
					body: { components: [] }
				});
			}
		}
	}

	const cd = Cooldowns.get(userID, 'button', Time.Second * 3);
	if (cd !== null) {
		return buttonReply();
	}

	const timeSinceMessage = Date.now() - new Date(data.message.timestamp).getTime();
	const timeLimit = reactionTimeLimit(getUsersPerkTier(user));
	if (timeSinceMessage > Time.Day) {
		console.log(
			`${user.id} clicked Diff[${formatDuration(timeSinceMessage)}] Button[${id}] Message[${data.message.id}]`
		);
	}
	if (1 > 2 && timeSinceMessage > timeLimit) {
		return buttonReply(
			`<@${userID}>, this button is too old, you can no longer use it. You can only only use buttons that are up to ${formatDuration(
				timeLimit
			)} old, up to 300 hours for patrons.`,
			false
		);
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

	if (id === 'BUY_MINION') {
		await buttonReply();
		return runCommand({
			commandName: 'minion',
			args: { buy: {} },
			bypassInhibitors: true,
			...options
		});
	}

	if (id === 'BUY_BINGO_TICKET') {
		return buttonReply(await buyBingoTicketCommand(null, userID, 1));
	}

	if (id === 'VIEW_BANK') {
		await buttonReply();
		return runCommand({
			commandName: 'bank',
			bypassInhibitors: true,
			args: {},
			...options
		});
	}

	if (minionIsBusy(user.id)) {
		return buttonReply(`${user.minionName} is busy.`);
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
			const response = await autoContract(await mUserFetch(user.id), BigInt(options.channelID), BigInt(user.id));
			const channel = globalClient.channels.cache.get(options.channelID);
			if (channelIsSendable(channel)) channel.send(convertMahojiResponseToDJSResponse(response));
			break;
		}
		case 'NEW_SLAYER_TASK': {
			await buttonReply();
			return runCommand({
				commandName: 'slayer',
				args: { new_task: {} },
				bypassInhibitors: true,
				...options
			});
		}
		default: {
		}
	}
}
