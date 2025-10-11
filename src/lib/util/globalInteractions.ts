import { ItemContracts } from '@/lib/bso/itemContracts.js';
import { repeatTameTrip } from '@/lib/bso/tames/tameTasks.js';

import { cleanUsername, formatDuration, removeFromArr, stringMatches, Time, uniqueArr } from '@oldschoolgg/toolkit';
import type { Giveaway } from '@prisma/client';
import { RateLimitManager } from '@sapphire/ratelimits';
import { type ButtonInteraction, MessageFlags } from 'discord.js';
import { Bank, type ItemBank } from 'oldschooljs';

import { giveawayCache } from '@/lib/cache.js';
import type { ClueTier } from '@/lib/clues/clueTiers.js';
import { BitField, PerkTier } from '@/lib/constants.js';
import { mentionCommand } from '@/lib/discord/utils.js';
import { InteractionID } from '@/lib/InteractionID.js';
import { runCommand } from '@/lib/settings/settings.js';
import { MInteraction } from '@/lib/structures/MInteraction.js';
import { updateGiveawayMessage } from '@/lib/util/giveaway.js';
import { isValidGlobalInteraction } from '@/lib/util/interactions.js';
import { fetchRepeatTrips, repeatTrip } from '@/lib/util/repeatStoredTrip.js';
import { cancelGEListingCommand } from '@/mahoji/lib/abstracted_commands/cancelGEListingCommand.js';
import { autoContract } from '@/mahoji/lib/abstracted_commands/farmingContractCommand.js';
import { shootingStarsCommand, starCache } from '@/mahoji/lib/abstracted_commands/shootingStarsCommand.js';

const buttonRatelimiter = new RateLimitManager(Time.Second * 2, 1);

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

async function giveawayButtonHandler(user: MUser, customID: string, interaction: ButtonInteraction) {
	const split = customID.split('_');
	if (split[0] !== 'GIVEAWAY') return;
	const giveawayID = Number(split[2]);
	let giveaway: Giveaway | null = giveawayCache.get(giveawayID) ?? null;
	if (!giveaway) {
		giveaway = await prisma.giveaway.findFirst({
			where: {
				id: giveawayID
			}
		});
		if (giveaway) giveawayCache.set(giveawayID, giveaway);
	}
	if (!giveaway) {
		return interaction.reply({ content: 'Invalid giveaway.', ephemeral: true });
	}
	if (split[1] === 'REPEAT') {
		if (user.id !== giveaway.user_id) {
			return interaction.reply({
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
		return interaction.reply({ content: 'This giveaway has finished.', ephemeral: true });
	}

	const action = split[1] === 'ENTER' ? 'ENTER' : 'LEAVE';

	if (user.isIronman) {
		return interaction.reply({
			content: 'You are an ironman, you cannot enter giveaways.',
			ephemeral: true
		});
	}

	if (user.id === giveaway.user_id) {
		return interaction.reply({ content: 'You cannot join your own giveaway.', ephemeral: true });
	}

	if (action === 'ENTER') {
		if (giveaway.users_entered.includes(user.id)) {
			return interaction.reply({
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
		return interaction.reply({ content: 'You are now entered in this giveaway.', ephemeral: true });
	}
	if (!giveaway.users_entered.includes(user.id)) {
		return interaction.reply({
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
	return interaction.reply({ content: 'You left the giveaway.', ephemeral: true });
}

async function repeatTripHandler(user: MUser, interaction: ButtonInteraction) {
	if (user.minionIsBusy) {
		return interaction.reply({ content: 'Your minion is busy.', ephemeral: true });
	}
	const trips = await fetchRepeatTrips(interaction.user.id);
	if (trips.length === 0) {
		return interaction.reply({ content: "Couldn't find a trip to repeat.", ephemeral: true });
	}
	const id = interaction.customId;
	const split = id.split('_');
	const matchingActivity = trips.find(i => i.type === split[2]);
	if (!matchingActivity) {
		return repeatTrip(user, interaction, trips[0]);
	}
	return repeatTrip(user, interaction, matchingActivity);
}

async function handleGearPresetEquip(user: MUser, id: string, interaction: ButtonInteraction) {
	const [, setupName, presetName] = id.split('_');
	if (!setupName || !presetName) return;
	const presets = await prisma.gearPreset.findMany({ where: { user_id: user.id } });
	const matchingPreset = presets.find(p => stringMatches(p.name, presetName));
	if (!matchingPreset) {
		return interaction.reply({ content: "You don't have a preset with this name.", ephemeral: true });
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
		return interaction.reply({
			content: "You don't have a pinned trip with this ID, and you cannot repeat trips of other users.",
			ephemeral: true
		});
	}
	await repeatTrip(user, interaction, { data: trip.data, type: trip.activity_type });
}

async function handleGEButton(user: MUser, id: string, interaction: ButtonInteraction) {
	if (id === 'ge_cancel_dms') {
		const mention = mentionCommand('config', 'user', 'toggle');
		if (user.bitfield.includes(BitField.DisableGrandExchangeDMs)) {
			return interaction.reply({
				content: `You already disabled Grand Exchange DM's, you can re-enable them using ${mention}.`,
				ephemeral: true
			});
		}
		await user.update({
			bitfield: {
				push: BitField.DisableGrandExchangeDMs
			}
		});
		return interaction.reply({
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
			return interaction.reply({
				content: 'You cannot cancel this listing, it is either already cancelled, fulfilled or not yours.',
				ephemeral: true
			});
		}
		const response = await cancelGEListingCommand(user, listing.userfacing_id);
		return interaction.reply({ content: response, ephemeral: true });
	}
}

export async function globalButtonInteractionHandler(interaction: ButtonInteraction) {
	const mInteraction = new MInteraction({ interaction });
	const ignoredInteractionIDs = ['CONFIRM', 'CANCEL', 'PARTY_JOIN', ...Object.values(InteractionID.PaginatedMessage)];
	if (ignoredInteractionIDs.includes(interaction.customId)) return;
	Logging.logDebug(`${interaction.user.username} clicked button: ${interaction.customId}`, {
		...mInteraction.getDebugInfo()
	});
	if (['DYN_', 'LP_'].some(s => interaction.customId.startsWith(s))) return;

	if (globalClient.isShuttingDown) {
		return interaction.reply({
			content: 'The bot is currently rebooting, please try again in a couple minutes.',
			ephemeral: true
		});
	}

	const id = interaction.customId;
	const userID = interaction.user.id;

	const ratelimit = buttonRatelimiter.acquire(userID);
	if (ratelimit.limited) {
		return interaction.reply({
			content: `You're on cooldown from clicking buttons, please wait: ${formatDuration(ratelimit.remainingTime, true)}.`,
			ephemeral: true
		});
	}

	const userNameToInsert = cleanUsername(interaction.user.username);
	const user = await mUserFetch(userID, { username: userNameToInsert });
	if (id.includes('REPEAT_TRIP')) return repeatTripHandler(user, interaction);

	if (id.includes('GIVEAWAY_')) return giveawayButtonHandler(user, id, interaction);
	if (id.includes('DONATE_IC')) return ItemContracts.donateICHandler(interaction);
	if (id.startsWith('GPE_')) return handleGearPresetEquip(user, id, interaction);
	if (id.startsWith('PTR_')) return handlePinnedTripRepeat(user, id, interaction);

	if (id.startsWith('ge_')) return handleGEButton(user, id, interaction);

	if (!isValidGlobalInteraction(id)) return;
	if (user.isBusy) {
		return interaction.reply({ content: 'You cannot use a command right now.', ephemeral: true });
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
		Logging.logDebug(
			`${user.id} clicked Diff[${formatDuration(timeSinceMessage)}] Button[${id}] Message[${
				interaction.message.id
			}]`
		);
	}
	if (1 > 2 && timeSinceMessage > timeLimit) {
		return interaction.reply({
			content: `<@${userID}>, this button is too old, you can no longer use it. You can only use buttons that are up to ${formatDuration(
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

	if (id === 'SPAWN_LAMP') {
		return runCommand({
			commandName: 'tools',
			args: { patron: { spawnlamp: {} } },
			bypassInhibitors: true,
			...options
		});
	}
	if (id === 'REPEAT_TAME_TRIP') {
		return repeatTameTrip({ ...options });
	}
	if (id === 'ITEM_CONTRACT_SEND') {
		return runCommand({
			commandName: 'ic',
			args: { send: {} },
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

	if (id === 'DO_FISHING_CONTEST') {
		if (user.perkTier() < PerkTier.Four) {
			return interaction.reply({
				content: 'You need to be a Tier 3 patron to use this button.',
				ephemeral: true
			});
		}
		return runCommand({
			commandName: 'bsominigames',
			args: { fishing_contest: { fish: {} } },
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
	if (id === 'OPEN_GRANDMASTER_CASKET') {
		return openCasket('Grandmaster');
	}
	if (id === 'OPEN_ELDER_CASKET') {
		return openCasket('Elder');
	}

	if (user.minionIsBusy) {
		return interaction.reply({ content: `${user.minionName} is busy.`, flags: MessageFlags.Ephemeral });
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
		case 'DO_GRANDMASTER_CLUE':
			return doClue('Grandmaster');
		case 'DO_ELDER_CLUE':
			return doClue('Elder');

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
		case InteractionID.Slayer.AutoSlaySaved: {
			await runCommand({
				commandName: 'slayer',
				args: { autoslay: {} },
				bypassInhibitors: true,
				...options
			});
			return;
		}
		case InteractionID.Slayer.AutoSlayDefault: {
			await runCommand({
				commandName: 'slayer',
				args: { autoslay: { mode: 'default' } },
				bypassInhibitors: true,
				...options
			});
			return;
		}
		case InteractionID.Slayer.AutoSlayEHP: {
			await runCommand({
				commandName: 'slayer',
				args: { autoslay: { mode: 'ehp' } },
				bypassInhibitors: true,
				...options
			});
			return;
		}
		case InteractionID.Slayer.AutoSlayBoss: {
			await runCommand({
				commandName: 'slayer',
				args: { autoslay: { mode: 'boss' } },
				bypassInhibitors: true,
				...options
			});
			return;
		}
		case InteractionID.Slayer.SkipTask: {
			await runCommand({
				commandName: 'slayer',
				args: { manage: { command: 'skip', new: true } },
				bypassInhibitors: true,
				...options
			});
			return;
		}
		case InteractionID.Slayer.BlockTask: {
			await runCommand({
				commandName: 'slayer',
				args: { manage: { command: 'block', new: true } },
				bypassInhibitors: true,
				...options
			});
			return;
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
			const response = await autoContract(user, options.channelID);
			if (response) {
				return mInteraction.reply(response);
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
					quantity: user.bank.amount('Seed pack')
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
				return interaction.reply(str);
			}
			return interaction.reply({
				content: `${
					star && star.expiry < Date.now()
						? 'The Crashed Star has expired!'
						: `That Crashed Star was not discovered by ${user.minionName}.`
				}`,
				ephemeral: true
			});
		}
		case 'START_TOG': {
			return runCommand({
				commandName: 'minigames',
				args: { tears_of_guthix: { start: {} } },
				bypassInhibitors: true,
				...options
			});
		}
		default: {
		}
	}
}
