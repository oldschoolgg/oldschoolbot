import { mentionCommand } from '@oldschoolgg/toolkit/util';
import type { ButtonInteraction, Interaction } from 'discord.js';
import { ButtonBuilder, ButtonStyle } from 'discord.js';
import { Time, removeFromArr, uniqueArr } from 'e';
import { Bank } from 'oldschooljs';

import { cancelGEListingCommand } from '../../mahoji/lib/abstracted_commands/cancelGEListingCommand';
import { autoContract } from '../../mahoji/lib/abstracted_commands/farmingContractCommand';
import { shootingStarsCommand, starCache } from '../../mahoji/lib/abstracted_commands/shootingStarsCommand';
import type { ClueTier } from '../clues/clueTiers';
import { BitField, PerkTier } from '../constants';

import { RateLimitManager } from '@sapphire/ratelimits';
import { InteractionID } from '../InteractionID';
import { runCommand } from '../settings/settings';
import { toaHelpCommand } from '../simulation/toa';
import type { ItemBank } from '../types';
import { formatDuration, stringMatches } from '../util';
import { updateGiveawayMessage } from './giveaway';
import { interactionReply } from './interactionReply';
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
	'FARMING_CONTRACT_EASIER',
	'OPEN_SEED_PACK',
	'BUY_MINION',
	'BUY_BINGO_TICKET',
	'NEW_SLAYER_TASK',
	'DO_SHOOTING_STAR',
	'CHECK_TOA'
] as const;

type GlobalInteractionAction = (typeof globalInteractionActions)[number];
function isValidGlobalInteraction(str: string): str is GlobalInteractionAction {
	return globalInteractionActions.includes(str as GlobalInteractionAction);
}

const buttonRatelimiter = new RateLimitManager(Time.Second * 2, 1);

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

export function makeAutoSlayButton() {
	return new ButtonBuilder()
		.setCustomId('AUTO_SLAY')
		.setLabel('Auto Slay')
		.setEmoji('630911040560824330')
		.setStyle(ButtonStyle.Secondary);
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
			interaction,
			continueDeltaMillis: null
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

async function repeatTripHandler(interaction: ButtonInteraction) {
	if (minionIsBusy(interaction.user.id))
		return interactionReply(interaction, { content: 'Your minion is busy.', ephemeral: true });
	const trips = await fetchRepeatTrips(interaction.user.id);
	if (trips.length === 0) {
		return interactionReply(interaction, { content: "Couldn't find a trip to repeat.", ephemeral: true });
	}
	const id = interaction.customId;
	const split = id.split('_');
	const matchingActivity = trips.find(i => i.type === split[2]);
	if (!matchingActivity) {
		return repeatTrip(interaction, trips[0]);
	}
	return repeatTrip(interaction, matchingActivity);
}

async function handleGearPresetEquip(user: MUser, id: string, interaction: ButtonInteraction) {
	const [, setupName, presetName] = id.split('_');
	if (!setupName || !presetName) return;
	const presets = await prisma.gearPreset.findMany({ where: { user_id: user.id } });
	const matchingPreset = presets.find(p => stringMatches(p.name, presetName));
	if (!matchingPreset) {
		return interactionReply(interaction, { content: "You don't have a preset with this name.", ephemeral: true });
	}
	await runCommand({
		commandName: 'gearpresets',
		args: { equip: { gear_setup: setupName, preset: presetName } },
		user,
		member: interaction.member,
		channelID: interaction.channelId,
		guildID: interaction.guildId,
		interaction,
		continueDeltaMillis: null
	});
}

async function handlePinnedTripRepeat(user: MUser, id: string, interaction: ButtonInteraction) {
	const [, pinnedTripID] = id.split('_');
	if (!pinnedTripID) return;
	const trip = await prisma.pinnedTrip.findFirst({ where: { user_id: user.id, id: pinnedTripID } });
	if (!trip) {
		return interactionReply(interaction, {
			content: "You don't have a pinned trip with this ID, and you cannot repeat trips of other users.",
			ephemeral: true
		});
	}
	await repeatTrip(interaction, { data: trip.data, type: trip.activity_type });
}

async function handleGEButton(user: MUser, id: string, interaction: ButtonInteraction) {
	if (id === 'ge_cancel_dms') {
		const mention = mentionCommand(globalClient, 'config', 'user', 'toggle');
		if (user.bitfield.includes(BitField.DisableGrandExchangeDMs)) {
			return interactionReply(interaction, {
				content: `You already disabled Grand Exchange DM's, you can re-enable them using ${mention}.`,
				ephemeral: true
			});
		}
		await user.update({
			bitfield: {
				push: BitField.DisableGrandExchangeDMs
			}
		});
		return interactionReply(interaction, {
			content: `You have disabled Grand Exchange DM's, and won't receive anymore DM's, you can re-enable them using ${mention}.`,
			ephemeral: true
		});
	}
	if (id.startsWith('ge_cancel_')) {
		const cancelUserFacingID = id.split('_')[2];
		const listing = await prisma.gEListing.findFirst({
			where: {
				userfacing_id: cancelUserFacingID,
				user_id: user.id,
				cancelled_at: null,
				fulfilled_at: null,
				quantity_remaining: {
					gt: 0
				}
			}
		});
		if (!listing) {
			return interactionReply(interaction, {
				content: 'You cannot cancel this listing, it is either already cancelled, fulfilled or not yours.',
				ephemeral: true
			});
		}
		const response = await cancelGEListingCommand(user, listing.userfacing_id);
		return interactionReply(interaction, { content: response, ephemeral: true });
	}
}

export async function interactionHook(interaction: Interaction) {
	if (!interaction.isButton()) return;
	const ignoredInteractionIDs = [
		'CONFIRM',
		'CANCEL',
		'PARTY_JOIN',
		...Object.values(InteractionID.PaginatedMessage),
		...Object.values(InteractionID.Slayer)
	];
	if (ignoredInteractionIDs.includes(interaction.customId)) return;
	if (['DYN_', 'LP_'].some(s => interaction.customId.startsWith(s))) return;

	if (globalClient.isShuttingDown) {
		return interactionReply(interaction, {
			content: 'The bot is currently rebooting, please try again in a couple minutes.',
			ephemeral: true
		});
	}

	const id = interaction.customId;
	const userID = interaction.user.id;

	const ratelimit = buttonRatelimiter.acquire(userID);
	if (ratelimit.limited) {
		return interactionReply(interaction, {
			content: `You're on cooldown from clicking buttons, please wait: ${formatDuration(ratelimit.remainingTime, true)}.`,
			ephemeral: true
		});
	}

	if (id.includes('REPEAT_TRIP')) return repeatTripHandler(interaction);

	const user = await mUserFetch(userID);

	if (id.includes('GIVEAWAY_')) return giveawayButtonHandler(user, id, interaction);
	if (id.startsWith('GPE_')) return handleGearPresetEquip(user, id, interaction);
	if (id.startsWith('PTR_')) return handlePinnedTripRepeat(user, id, interaction);
	if (id === 'TOA_CHECK') {
		const response = await toaHelpCommand(user, interaction.channelId);
		return interactionReply(interaction, {
			content: typeof response === 'string' ? response : response.content,
			ephemeral: true
		});
	}
	if (id.startsWith('ge_')) return handleGEButton(user, id, interaction);

	if (!isValidGlobalInteraction(id)) return;
	if (user.isBusy) {
		return interactionReply(interaction, { content: 'You cannot use a command right now.', ephemeral: true });
	}

	const options = {
		user,
		member: interaction.member ?? null,
		channelID: interaction.channelId,
		guildID: interaction.guildId,
		interaction,
		continueDeltaMillis: null
	};

	const timeSinceMessage = Date.now() - new Date(interaction.message.createdTimestamp).getTime();
	const timeLimit = reactionTimeLimit(user.perkTier());
	if (timeSinceMessage > Time.Day) {
		debugLog(
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
		return runCommand({
			commandName: 'clue',
			args: { tier },
			bypassInhibitors: true,
			...options
		});
	}

	async function openCasket(tier: ClueTier['name']) {
		return runCommand({
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
			if (response) {
				return interactionReply(interaction, response);
			}
			return;
		}
		case 'FARMING_CONTRACT_EASIER': {
			return runCommand({
				commandName: 'farming',
				args: {
					contract: {
						input: 'easier'
					}
				},
				bypassInhibitors: true,
				...options
			});
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
