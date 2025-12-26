import { ItemContracts } from '@/lib/bso/itemContracts.js';
import { repeatTameTrip } from '@/lib/bso/tames/tameTasks.js';

import { type APIMessageComponentInteraction, SpecialResponse } from '@oldschoolgg/discord';
import { formatDuration, PerkTier, removeFromArr, stringMatches, Time, uniqueArr } from '@oldschoolgg/toolkit';
import { Bank, type ItemBank } from 'oldschooljs';

import type { Giveaway } from '@/prisma/main.js';
import { giveawayCache } from '@/lib/cache.js';
import type { ClueTier } from '@/lib/clues/clueTiers.js';
import { BitField } from '@/lib/constants.js';
import { InteractionID } from '@/lib/InteractionID.js';
import { type RunCommandArgs, runCommand } from '@/lib/settings/settings.js';
import { Farming } from '@/lib/skilling/skills/farming/index.js';
import { updateGiveawayMessage } from '@/lib/util/giveaway.js';
import { fetchRepeatTrips, repeatTrip } from '@/lib/util/repeatStoredTrip.js';
import { autoSlayCommand } from '@/mahoji/lib/abstracted_commands/autoSlayCommand.js';
import { cancelGEListingCommand } from '@/mahoji/lib/abstracted_commands/cancelGEListingCommand.js';
import { autoContract } from '@/mahoji/lib/abstracted_commands/farmingContractCommand.js';
import { shootingStarsCommand } from '@/mahoji/lib/abstracted_commands/shootingStarsCommand.js';

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

async function repeatTripHandler(user: MUser, id: string, interaction: MInteraction): CommandResponse {
	if (await user.minionIsBusy()) {
		return { content: 'Your minion is busy.', ephemeral: true };
	}
	const trips = await fetchRepeatTrips(user);
	if (trips.length === 0) {
		return { content: "Couldn't find a trip to repeat.", ephemeral: true };
	}
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
	const trip = await prisma.pinnedTrip.findFirst({
		where: { user_id: user.id, id: pinnedTripID },
		include: { activity: true }
	});
	if (!trip || !trip.activity) {
		return {
			content: "You don't have a pinned trip with this ID, and you cannot repeat trips of other users.",
			ephemeral: true
		};
	}
	return repeatTrip(user, interaction, trip.activity);
}

async function handleGEButton(user: MUser, id: string): CommandResponse {
	if (id === 'ge_cancel_dms') {
		const mention = globalClient.mentionCommand('config', 'user', 'toggle');
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
}): Promise<CommandResponse | null> {
	Logging.logDebug(`${interaction.userId} clicked button: ${id}`);

	if (globalClient.isShuttingDown) {
		return {
			content: 'The bot is currently rebooting, please try again in a couple minutes.',
			ephemeral: true
		};
	}

	const userID = interaction.userId;

	const ratelimit = await Cache.tryRatelimit(userID, 'global_buttons');
	if (!ratelimit.success) {
		return {
			content: `You're on cooldown from clicking buttons, please wait: ${formatDuration(ratelimit.timeRemainingMs, true)}.`,
			ephemeral: true
		};
	}

	const user = await mUserFetch(userID);
	if (id.includes('REPEAT_TRIP')) return repeatTripHandler(user, id, interaction);

	if (id.includes('GIVEAWAY_')) return giveawayButtonHandler(user, id, interaction);
	if (id.includes('DONATE_IC')) return ItemContracts.donateICHandler(interaction);
	if (id.startsWith('GPE_')) return handleGearPresetEquip(user, id, interaction);
	if (id.startsWith('PTR_')) return handlePinnedTripRepeat(user, id, interaction);

	if (id.startsWith('ge_')) return handleGEButton(user, id);

	if (await user.getIsLocked()) {
		return { content: 'You cannot use a command right now.', ephemeral: true };
	}

	const options: Pick<RunCommandArgs, 'user' | 'interaction' | 'continueDeltaMillis' | 'ignoreUserIsBusy'> = {
		user,
		interaction: interaction,
		continueDeltaMillis: null,
		ignoreUserIsBusy: true
	};

	const timeSinceMessage = Date.now() - interaction.createdTimestamp;
	if (timeSinceMessage > Time.Day) {
		Logging.logDebug(`${user.id} clicked Diff[${formatDuration(timeSinceMessage)}] Button[${id}]`);
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

	if (id === InteractionID.Commands.ClaimDaily) {
		return runCommand({
			commandName: 'minion',
			args: { daily: {} },
			...options
		});
	}

	if (id === InteractionID.Commands.CheckPatches) {
		return runCommand({
			commandName: 'farming',
			args: { check_patches: {} },
			...options
		});
	}

	if (id === InteractionID.Commands.CancelTrip) {
		return runCommand({
			commandName: 'minion',
			args: { cancel: {} },
			...options
		});
	}

	if (id === 'SPAWN_LAMP') {
		return runCommand({
			commandName: 'tools',
			args: { patron: { spawnlamp: {} } },
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
			...options
		});
	}

	if (id === InteractionID.Commands.BuyMinion) {
		return runCommand({
			commandName: 'minion',
			args: { buy: {} },
			...options
		});
	}

	if (id === 'DO_FISHING_CONTEST') {
		if ((await user.fetchPerkTier()) < PerkTier.Four) {
			return {
				content: 'You need to be a Tier 3 patron to use this button.',
				ephemeral: true
			};
		}
		return runCommand({
			commandName: 'bsominigames',
			args: { fishing_contest: { fish: {} } },
			...options
		});
	}

	if (id === InteractionID.Open.BeginnerCasket) return openCasket('Beginner');
	if (id === InteractionID.Open.EasyCasket) return openCasket('Easy');
	if (id === InteractionID.Open.MediumCasket) return openCasket('Medium');
	if (id === InteractionID.Open.HardCasket) return openCasket('Hard');
	if (id === InteractionID.Open.EliteCasket) return openCasket('Elite');
	if (id === InteractionID.Open.MasterCasket) return openCasket('Master');
	if (id === InteractionID.Open.GrandMasterCasket) return openCasket('Grandmaster');
	if (id === InteractionID.Open.EliteCasket) return openCasket('Master');

	if (await user.minionIsBusy()) {
		return { content: `${user.minionName} is busy.`, ephemeral: true };
	}

	if (id.startsWith('FARMING_PATRON_HARVEST_')) {
		const patchType = id.split('_')[3];
		if (!Farming.isPatchName(patchType)) {
			return { content: 'Invalid patch type.', ephemeral: true };
		}
		const perkTier = await user.fetchPerkTier();
		if (perkTier < 4) {
			return { content: 'You cannot use this button.', ephemeral: true };
		}
		return runCommand({
			commandName: 'farming',
			args: {
				patron: {
					harvest: {
						patch: patchType
					}
				}
			},
			...options
		});
	}

	switch (id) {
		case InteractionID.Commands.DoBeginnerClue:
			return doClue('Beginner');
		case InteractionID.Commands.DoEasyClue:
			return doClue('Easy');
		case InteractionID.Commands.DoMediumClue:
			return doClue('Medium');
		case InteractionID.Commands.DoHardClue:
			return doClue('Hard');
		case InteractionID.Commands.DoEliteClue:
			return doClue('Elite');
		case InteractionID.Commands.DoMasterClue:
			return doClue('Master');
		case 'DO_GRANDMASTER_CLUE':
			return doClue('Grandmaster');
		case 'DO_ELDER_CLUE':
			return doClue('Elder');

		case InteractionID.Commands.DoBirdHouseRun:
			return runCommand({
				commandName: 'activities',
				args: { birdhouses: { action: 'harvest' } },
				...options
			});
		case InteractionID.Slayer.AutoSlay: {
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
		case InteractionID.Commands.AutoFarm: {
			return runCommand({
				commandName: 'farming',
				args: {
					auto_farm: {}
				},
				...options
			});
		}
		case InteractionID.Commands.AutoFarmingContract: {
			return autoContract(interaction, user);
		}
		case InteractionID.Commands.FarmingContractEasier: {
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
		case InteractionID.Open.SeedPack: {
			return runCommand({
				commandName: 'open',
				args: {
					name: 'Seed pack',
					quantity: user.bank.amount('Seed pack')
				},
				...options
			});
		}
		case InteractionID.Commands.NewSlayerTask: {
			return runCommand({
				commandName: 'slayer',
				args: { new_task: {} },
				...options
			});
		}
		case InteractionID.Commands.DoShootingStar: {
			const validStar = await prisma.shootingStars.findFirst({
				where: {
					user_id: user.id,
					has_been_mined: false,
					expires_at: {
						gt: new Date()
					}
				},
				orderBy: {
					expires_at: 'desc'
				}
			});
			let errorMessage: string | null = null;
			if (!validStar) {
				errorMessage = 'You do not have any shooting stars to mine.';
			} else if (validStar.expires_at.getTime() < Date.now()) {
				errorMessage = 'This shooting star has expired.';
			} else if (validStar.has_been_mined) {
				errorMessage = 'You have already mined this shooting star.';
			}
			if (errorMessage || !validStar) {
				return {
					content: errorMessage!,
					ephemeral: true
				};
			}
			await prisma.shootingStars.update({
				where: {
					id: validStar.id
				},
				data: {
					has_been_mined: true
				}
			});
			return shootingStarsCommand(interaction.channelId, user, validStar);
		}
		case InteractionID.Commands.StartTearsOfGuthix: {
			return runCommand({
				commandName: 'minigames',
				args: { tears_of_guthix: { start: {} } },
				...options
			});
		}
	}
	return null;
}

const ignoredInteractionIDs = [
	...Object.values(InteractionID.Confirmation),
	...Object.values(InteractionID.PaginatedMessage),
	...Object.values(InteractionID.Party)
];

export async function globalButtonInteractionHandlerWrapper(
	rawInteraction: APIMessageComponentInteraction,
	interaction: MInteraction
) {
	const id = rawInteraction.data.custom_id;
	if (!id) return;
	if ((ignoredInteractionIDs as string[]).includes(id)) return;
	if (['DYN_', 'LP_'].some(s => id.startsWith(s))) return;
	const response = await globalButtonInteractionHandler({ interaction, id });
	if (
		response === null ||
		response === SpecialResponse.PaginatedMessageResponse ||
		response === SpecialResponse.SilentErrorResponse ||
		response === SpecialResponse.RespondedManually
	)
		return;
	await interaction.reply(response);
}
