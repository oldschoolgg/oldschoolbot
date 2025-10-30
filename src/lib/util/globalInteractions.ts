import { type ButtonInteraction, MessageFlags } from '@oldschoolgg/discord';
import { formatDuration, removeFromArr, SpecialResponse, stringMatches, Time, uniqueArr } from '@oldschoolgg/toolkit';
import { RateLimitManager } from '@sapphire/ratelimits';
import { Bank, type ItemBank } from 'oldschooljs';

import type { Giveaway } from '@/prisma/main.js';
import { giveawayCache } from '@/lib/cache.js';
import type { ClueTier } from '@/lib/clues/clueTiers.js';
import { BitField } from '@/lib/constants.js';
import { mentionCommand } from '@/lib/discord/utils.js';
import { InteractionID } from '@/lib/InteractionID.js';
import { type RunCommandArgs, runCommand } from '@/lib/settings/settings.js';
import { MInteraction } from '@/lib/structures/MInteraction.js';
import { updateGiveawayMessage } from '@/lib/util/giveaway.js';
import { fetchRepeatTrips, repeatTrip } from '@/lib/util/repeatStoredTrip.js';
import { autoSlayCommand } from '@/mahoji/lib/abstracted_commands/autoSlayCommand.js';
import { cancelGEListingCommand } from '@/mahoji/lib/abstracted_commands/cancelGEListingCommand.js';
import { autoContract } from '@/mahoji/lib/abstracted_commands/farmingContractCommand.js';
import { shootingStarsCommand, starCache } from '@/mahoji/lib/abstracted_commands/shootingStarsCommand.js';

const buttonRatelimiter = new RateLimitManager(Time.Second * 2, 1);

async function giveawayButtonHandler(user: MUser, customID: string, interaction: MInteraction): CommandResponse {
	const split = customID.split('_');
	if (split[0] !== 'GIVEAWAY') return { content: 'Invalid giveaway.', ephemeral: true };
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
		return { content: 'Invalid giveaway.', ephemeral: true };
	}
	if (split[1] === 'REPEAT') {
		if (user.id !== giveaway.user_id) {
			return {
				content: "You cannot repeat other peoples' giveaways.",
				ephemeral: true
			};
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
			interaction,
			continueDeltaMillis: null
		});
	}

	if (giveaway.finish_date.getTime() < Date.now() || giveaway.completed) {
		return { content: 'This giveaway has finished.', ephemeral: true };
	}

	const action = split[1] === 'ENTER' ? 'ENTER' : 'LEAVE';

	if (user.isIronman) {
		return {
			content: 'You are an ironman, you cannot enter giveaways.',
			ephemeral: true
		};
	}

	if (user.id === giveaway.user_id) {
		return { content: 'You cannot join your own giveaway.', ephemeral: true };
	}

	if (action === 'ENTER') {
		if (giveaway.users_entered.includes(user.id)) {
			return {
				content: 'You are already entered in this giveaway.',
				ephemeral: true
			};
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
		return { content: 'You are now entered in this giveaway.', ephemeral: true };
	}
	if (!giveaway.users_entered.includes(user.id)) {
		return {
			content: "You aren't entered in this giveaway, so you can't leave it.",
			ephemeral: true
		};
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
	return { content: 'You left the giveaway.', ephemeral: true };
}

async function repeatTripHandler(user: MUser, interaction: MInteraction): CommandResponse {
	if (user.minionIsBusy) {
		return { content: 'Your minion is busy.', ephemeral: true };
	}
	const trips = await fetchRepeatTrips(user);
	if (trips.length === 0) {
		return { content: "Couldn't find a trip to repeat.", ephemeral: true };
	}
	const id = interaction.customId!;
	const split = id.split('_');
	const matchingActivity = trips.find(i => i.type === split[2]);
	if (!matchingActivity) {
		return repeatTrip(user, interaction, trips[0]);
	}
	return repeatTrip(user, interaction, matchingActivity);
}

async function handleGearPresetEquip(user: MUser, id: string, interaction: MInteraction): CommandResponse {
	const [, setupName, presetName] = id.split('_');
	if (!setupName || !presetName) return { content: 'Invalid gear preset.', ephemeral: true };
	const presets = await prisma.gearPreset.findMany({ where: { user_id: user.id } });
	const matchingPreset = presets.find(p => stringMatches(p.name, presetName));
	if (!matchingPreset) {
		return { content: "You don't have a preset with this name.", ephemeral: true };
	}
	return runCommand({
		commandName: 'gearpresets',
		args: { equip: { gear_setup: setupName, preset: presetName } },
		user,
		interaction,
		continueDeltaMillis: null
	});
}

async function handlePinnedTripRepeat(user: MUser, id: string, interaction: MInteraction): CommandResponse {
	const [, pinnedTripID] = id.split('_');
	if (!pinnedTripID) return { content: 'Invalid pinned trip.', ephemeral: true };
	const trip = await prisma.pinnedTrip.findFirst({ where: { user_id: user.id, id: pinnedTripID } });
	if (!trip) {
		return {
			content: "You don't have a pinned trip with this ID, and you cannot repeat trips of other users.",
			ephemeral: true
		};
	}
	return repeatTrip(user, interaction, { data: trip.data, type: trip.activity_type });
}

async function handleGEButton(user: MUser, id: string): CommandResponse {
	if (id === 'ge_cancel_dms') {
		const mention = mentionCommand('config', 'user', 'toggle');
		if (user.bitfield.includes(BitField.DisableGrandExchangeDMs)) {
			return {
				content: `You already disabled Grand Exchange DM's, you can re-enable them using ${mention}.`,
				ephemeral: true
			};
		}
		await user.update({
			bitfield: {
				push: BitField.DisableGrandExchangeDMs
			}
		});
		return {
			content: `You have disabled Grand Exchange DM's, and won't receive anymore DM's, you can re-enable them using ${mention}.`,
			ephemeral: true
		};
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
			return {
				content: 'You cannot cancel this listing, it is either already cancelled, fulfilled or not yours.',
				ephemeral: true
			};
		}
		const response = await cancelGEListingCommand(user, listing.userfacing_id);
		return { content: response, ephemeral: true };
	}
	return { content: 'Unknown GE button interaction.', ephemeral: true };
}

async function globalButtonInteractionHandler({
	interaction,
	id
}: {
	id: string;
	interaction: MInteraction;
}): CommandResponse {
	Logging.logDebug(`${interaction.user.username} clicked button: ${id}`, {
		...interaction.getDebugInfo()
	});

	if (globalClient.isShuttingDown) {
		return {
			content: 'The bot is currently rebooting, please try again in a couple minutes.',
			ephemeral: true
		};
	}

	const userID = interaction.user.id;

	const ratelimit = buttonRatelimiter.acquire(userID);
	if (ratelimit.limited) {
		return {
			content: `You're on cooldown from clicking buttons, please wait: ${formatDuration(ratelimit.remainingTime, true)}.`,
			ephemeral: true
		};
	}

	const user = await mUserFetch(userID);
	if (id.includes('REPEAT_TRIP')) return repeatTripHandler(user, interaction);

	if (id.includes('GIVEAWAY_')) return giveawayButtonHandler(user, id, interaction);
	if (id.startsWith('GPE_')) return handleGearPresetEquip(user, id, interaction);
	if (id.startsWith('PTR_')) return handlePinnedTripRepeat(user, id, interaction);

	if (id.startsWith('ge_')) return handleGEButton(user, id);

	// if (!isValidGlobalInteraction(id)) return;
	if (user.isBusy) {
		return { content: 'You cannot use a command right now.', ephemeral: true };
	}

	const options: Pick<RunCommandArgs, 'user' | 'interaction' | 'continueDeltaMillis' | 'ignoreUserIsBusy'> = {
		user,
		interaction: interaction,
		continueDeltaMillis: null,
		ignoreUserIsBusy: true
	};

	const timeSinceMessage = Date.now() - new Date(interaction.message!.createdTimestamp).getTime();
	if (timeSinceMessage > Time.Day) {
		Logging.logDebug(
			`${user.id} clicked Diff[${formatDuration(timeSinceMessage)}] Button[${id}] Message[${
				interaction.message?.id
			}]`
		);
	}

	async function doClue(tier: ClueTier['name']) {
		return runCommand({
			commandName: 'clue',
			args: { tier },
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

	async function doSlayerCmd({ args }: Pick<RunCommandArgs, 'args'>) {
		return runCommand({
			commandName: 'slayer',
			args,
			...options
		});
	}

	if (id === 'CLAIM_DAILY') {
		return runCommand({
			commandName: 'minion',
			args: { daily: {} },
			...options
		});
	}

	if (id === 'CHECK_PATCHES') {
		return runCommand({
			commandName: 'farming',
			args: { check_patches: {} },
			...options
		});
	}

	if (id === 'CANCEL_TRIP') {
		return runCommand({
			commandName: 'minion',
			args: { cancel: {} },
			...options
		});
	}

	if (id === 'BUY_MINION') {
		return runCommand({
			commandName: 'minion',
			args: { buy: {} },
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

	if (user.minionIsBusy) {
		return { content: `${user.minionName} is busy.`, flags: MessageFlags.Ephemeral };
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
				...options
			});
		case 'AUTO_SLAY': {
			return runCommand({
				commandName: 'slayer',
				args: { autoslay: {} },
				...options
			});
		}

		case InteractionID.Slayer.AutoSlaySaved:
		case InteractionID.Slayer.AutoSlayDefault:
		case InteractionID.Slayer.AutoSlayEHP:
		case InteractionID.Slayer.AutoSlayBoss: {
			const modeOverride = id.split('_')[3];
			return autoSlayCommand({ user, interaction, modeOverride });
		}

		case InteractionID.Slayer.SkipTask: {
			return doSlayerCmd({ args: { manage: { command: 'skip', new: true } } });
		}
		case InteractionID.Slayer.BlockTask: {
			return doSlayerCmd({ args: { manage: { command: 'block', new: true } } });
		}
		case 'AUTO_FARM': {
			return runCommand({
				commandName: 'farming',
				args: {
					auto_farm: {}
				},
				...options
			});
		}
		case 'AUTO_FARMING_CONTRACT': {
			return autoContract(interaction, user);
		}
		case 'FARMING_CONTRACT_EASIER': {
			return runCommand({
				commandName: 'farming',
				args: {
					contract: {
						input: 'easier'
					}
				},
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
				...options
			});
		}
		case 'DO_SHOOTING_STAR': {
			const star = starCache.get(user.id);
			starCache.delete(user.id);
			if (star && star.expiry > Date.now()) {
				const str = await shootingStarsCommand(interaction.channelId, user, star);
				return str;
			}
			return {
				content: `${
					star && star.expiry < Date.now()
						? 'The Crashed Star has expired!'
						: `That Crashed Star was not discovered by ${user.minionName}.`
				}`,
				ephemeral: true
			};
		}
		case 'START_TOG': {
			return runCommand({
				commandName: 'minigames',
				args: { tears_of_guthix: { start: {} } },
				...options
			});
		}
		default: {
		}
	}

	return { content: 'Unknown button? Report this as a bug.', ephemeral: true };
}

const ignoredInteractionIDs = [
	...Object.values(InteractionID.Confirmation),
	...Object.values(InteractionID.PaginatedMessage),
	...Object.values(InteractionID.Party)
];

export async function globalButtonInteractionHandlerWrapper(_interaction: ButtonInteraction) {
	const interaction = new MInteraction({ interaction: _interaction });
	const id = interaction.customId;
	if (!id) return;
	if ((ignoredInteractionIDs as string[]).includes(id)) return;
	if (['DYN_', 'LP_'].some(s => id.startsWith(s))) return;
	const response: Awaited<CommandResponse> = await globalButtonInteractionHandler({ interaction, id });
	if (response === SpecialResponse.PaginatedMessageResponse) return;
	if (response === SpecialResponse.SilentErrorResponse) return;
	if (response === SpecialResponse.RespondedManually) return;
	await interaction.reply(response);
}
