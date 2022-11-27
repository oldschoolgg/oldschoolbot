import { ButtonBuilder, ButtonInteraction, ButtonStyle, Interaction } from 'discord.js';
import { Time, uniqueArr } from 'e';
import { Bank } from 'oldschooljs';

import { buyBingoTicketCommand } from '../../mahoji/commands/bingo';
import { autoContract } from '../../mahoji/lib/abstracted_commands/farmingContractCommand';
import { shootingStarsCommand, starCache } from '../../mahoji/lib/abstracted_commands/shootingStarsCommand';
import { Cooldowns } from '../../mahoji/lib/Cooldowns';
import { ClueTier } from '../clues/clueTiers';
import { PerkTier } from '../constants';
import { prisma } from '../settings/prisma';
import { runCommand } from '../settings/settings';
import { ItemBank } from '../types';
import { formatDuration, removeFromArr } from '../util';
import { updateGiveawayMessage } from './giveaway';
import { interactionReply } from './interactionReply';
import { log } from './log';
import { minionIsBusy } from './minionIsBusy';
import { fetchRepeatTrips, repeatTrip } from './repeatStoredTrip';

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
	'DO_BIRDHOUSE_RUN',
	'CLAIM_DAILY',
	'CHECK_PATCHES',
	'AUTO_SLAY',
	'CANCEL_TRIP',
	'AUTO_FARM',
	'AUTO_FARMING_CONTRACT',
	'OPEN_SEED_PACK',
	'BUY_MINION',
	'BUY_BINGO_TICKET',
	'NEW_SLAYER_TASK',
	'VIEW_BANK',
	'DO_SHOOTING_STAR'
] as const;

export type GlobalInteractionAction = typeof globalInteractionActions[number];
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

export function makeOpenSeedPackButton() {
	return new ButtonBuilder()
		.setCustomId('OPEN_SEED_PACK')
		.setLabel('Open Seed Pack')
		.setStyle(ButtonStyle.Secondary)
		.setEmoji('977410792754413668');
}

export function makeAutoContractButton() {
	return new ButtonBuilder()
		.setCustomId('AUTO_FARMING_CONTRACT')
		.setLabel('Auto Farming Contract')
		.setStyle(ButtonStyle.Secondary)
		.setEmoji('977410792754413668');
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

async function giveawayButtonHandler(user: MUser, customID: string, interaction: ButtonInteraction) {
	const split = customID.split('_');
	if (split[0] !== 'GIVEAWAY') return;
	const giveawayID = Number(split[2]);
	const giveaway = await prisma.giveaway.findFirst({
		where: {
			id: giveawayID
		}
	});
	if (!giveaway) {
		return interactionReply(interaction, { content: 'Invalid giveaway.', ephemeral: true });
	}
	if (split[1] === 'REPEAT') {
		if (user.id !== giveaway.user_id) {
			return interactionReply(interaction, {
				content: "You cannot repeat other peoples' giveaways.",
				ephemeral: true
			});
		}

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
			member: interaction.member,
			channelID: interaction.channelId,
			guildID: interaction.guildId,
			interaction
		});
	}

	if (giveaway.finish_date.getTime() < Date.now() || giveaway.completed) {
		return interactionReply(interaction, { content: 'This giveaway has finished.', ephemeral: true });
	}

	const action = split[1] === 'ENTER' ? 'ENTER' : 'LEAVE';

	if (user.isIronman) {
		return interactionReply(interaction, {
			content: 'You are an ironman, you cannot enter giveaways.',
			ephemeral: true
		});
	}

	if (user.id === giveaway.user_id) {
		return interactionReply(interaction, { content: 'You cannot join your own giveaway.', ephemeral: true });
	}

	if (action === 'ENTER') {
		if (giveaway.users_entered.includes(user.id)) {
			return interactionReply(interaction, {
				content: 'You are already entered in this giveaway.',
				ephemeral: true
			});
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
		return interactionReply(interaction, { content: 'You are now entered in this giveaway.', ephemeral: true });
	}
	if (!giveaway.users_entered.includes(user.id)) {
		return interactionReply(interaction, {
			content: "You aren't entered in this giveaway, so you can't leave it.",
			ephemeral: true
		});
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
	return interactionReply(interaction, { content: 'You left the giveaway.', ephemeral: true });
}

async function repeatTripHandler(user: MUser, interaction: ButtonInteraction) {
	if (user.minionIsBusy) return 'Your minion is busy.';
	const trips = await fetchRepeatTrips(interaction.user.id);
	if (trips.length === 0)
		return interactionReply(interaction, { content: "Couldn't find a trip to repeat.", ephemeral: true });
	const id = interaction.customId;
	const split = id.split('_');
	const matchingActivity = trips.find(i => i.type === split[2]);
	if (!matchingActivity) return repeatTrip(interaction, trips[0]);
	return repeatTrip(interaction, matchingActivity);
}

export async function interactionHook(interaction: Interaction) {
	if (!interaction.isButton()) return;
	const id = interaction.customId;
	const userID = interaction.user.id;

	const user = await mUserFetch(userID);
	if (id.includes('GIVEAWAY_')) return giveawayButtonHandler(user, id, interaction);
	if (id.includes('REPEAT_TRIP')) return repeatTripHandler(user, interaction);

	if (!isValidGlobalInteraction(id)) return;
	if (user.isBusy || globalClient.isShuttingDown) {
		return interactionReply(interaction, { content: 'You cannot use a command right now.', ephemeral: true });
	}

	const options = {
		user,
		member: interaction.member ?? null,
		channelID: interaction.channelId,
		guildID: interaction.guildId,
		interaction
	};

	const cd = Cooldowns.get(userID, 'button', Time.Second * 3);
	if (cd !== null) {
		return interactionReply(interaction, {
			content: `You're on cooldown from clicking buttons, please wait: ${formatDuration(cd, true)}.`,
			ephemeral: true
		});
	}

	const timeSinceMessage = Date.now() - new Date(interaction.message.createdTimestamp).getTime();
	const timeLimit = reactionTimeLimit(user.perkTier());
	if (timeSinceMessage > Time.Day) {
		log(
			`${user.id} clicked Diff[${formatDuration(timeSinceMessage)}] Button[${id}] Message[${
				interaction.message.id
			}]`
		);
	}
	if (1 > 2 && timeSinceMessage > timeLimit) {
		return interactionReply(interaction, {
			content: `<@${userID}>, this button is too old, you can no longer use it. You can only only use buttons that are up to ${formatDuration(
				timeLimit
			)} old, up to 300 hours for patrons.`,
			ephemeral: true
		});
	}

	async function doClue(tier: ClueTier['name']) {
		runCommand({
			commandName: 'clue',
			args: { tier },
			bypassInhibitors: true,
			...options
		});
	}

	async function openCasket(tier: ClueTier['name']) {
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
		return runCommand({
			commandName: 'minion',
			args: { daily: {} },
			bypassInhibitors: true,
			...options
		});
	}

	if (id === 'CHECK_PATCHES') {
		return runCommand({
			commandName: 'farming',
			args: { check_patches: {} },
			bypassInhibitors: true,
			...options
		});
	}

	if (id === 'CANCEL_TRIP') {
		return runCommand({
			commandName: 'minion',
			args: { cancel: {} },
			bypassInhibitors: true,
			...options
		});
	}

	if (id === 'BUY_MINION') {
		return runCommand({
			commandName: 'minion',
			args: { buy: {} },
			bypassInhibitors: true,
			...options
		});
	}

	if (id === 'BUY_BINGO_TICKET') {
		return interactionReply(interaction, await buyBingoTicketCommand(null, userID, 1));
	}

	if (id === 'VIEW_BANK') {
		return runCommand({
			commandName: 'bank',
			bypassInhibitors: true,
			args: {},
			...options
		});
	}

	if (id === 'OPEN_BEGINNER_CASKET') {
		return openCasket('Beginner');
	}

	if (id === 'OPEN_EASY_CASKET') {
		return openCasket('Easy');
	}

	if (id === 'OPEN_MEDIUM_CASKET') {
		return openCasket('Medium');
	}

	if (id === 'OPEN_HARD_CASKET') {
		return openCasket('Hard');
	}

	if (id === 'OPEN_ELITE_CASKET') {
		return openCasket('Elite');
	}

	if (id === 'OPEN_MASTER_CASKET') {
		return openCasket('Master');
	}

	if (minionIsBusy(user.id)) {
		return interactionReply(interaction, { content: `${user.minionName} is busy.`, ephemeral: true });
	}

	switch (id) {
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

		case 'DO_BIRDHOUSE_RUN':
			return runCommand({
				commandName: 'activities',
				args: { birdhouses: { action: 'harvest' } },
				bypassInhibitors: true,
				...options
			});
		case 'AUTO_SLAY': {
			return runCommand({
				commandName: 'slayer',
				args: { autoslay: {} },
				bypassInhibitors: true,
				...options
			});
		}
		case 'AUTO_FARM': {
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
			const response = await autoContract(await mUserFetch(user.id), options.channelID, user.id);
			if (response) interactionReply(interaction, response);
			return;
		}
		case 'OPEN_SEED_PACK': {
			return runCommand({
				commandName: 'open',
				args: {
					name: 'Seed pack',
					quantity: 1
				},
				...options
			});
		}
		case 'NEW_SLAYER_TASK': {
			return runCommand({
				commandName: 'slayer',
				args: { new_task: {} },
				bypassInhibitors: true,
				...options
			});
		}
		case 'DO_SHOOTING_STAR': {
			const star = starCache.get(user.id);
			starCache.delete(user.id);
			if (star && star.expiry > Date.now()) {
				const str = await shootingStarsCommand(interaction.channelId, user, star);
				return interactionReply(interaction, str);
			}
			return interactionReply(interaction, {
				content: `${
					star && star.expiry < Date.now()
						? 'The Crashed Star has expired!'
						: `That Crashed Star was not discovered by ${user.minionName}.`
				}`,
				ephemeral: true
			});
		}
		default: {
		}
	}
}
