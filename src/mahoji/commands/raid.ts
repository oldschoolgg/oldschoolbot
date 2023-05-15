import { randArrItem, roll, sumArr } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';

import { doaMetamorphPets } from '../../lib/data/CollectionsExport';
import { globalDroprates } from '../../lib/data/globalDroprates';
import {
	calcDOAInput,
	chanceOfDOAUnique,
	createDOATeam,
	doaHelpCommand,
	DOARooms,
	doaStartCommand,
	pickUniqueToGiveUser
} from '../../lib/depthsOfAtlantis';
import { prisma } from '../../lib/settings/prisma';
import { mileStoneBaseDeathChances, RaidLevel, toaHelpCommand, toaStartCommand } from '../../lib/simulation/toa';
import { averageBank, formatDuration, itemNameFromID } from '../../lib/util';
import { deferInteraction } from '../../lib/util/interactionReply';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { minionIsBusy } from '../../lib/util/minionIsBusy';
import resolveItems from '../../lib/util/resolveItems';
import { DOANonUniqueTable } from '../../tasks/minions/bso/doaActivity';
import { coxCommand, coxStatsCommand } from '../lib/abstracted_commands/coxCommand';
import { tobCheckCommand, tobStartCommand, tobStatsCommand } from '../lib/abstracted_commands/tobCommand';
import { OSBMahojiCommand } from '../lib/util';
import { userStatsUpdate } from '../mahojiSettings';

export const raidCommand: OSBMahojiCommand = {
	name: 'raid',
	description: 'Send your minion to do raids - CoX or ToB.',
	attributes: {
		requiresMinion: true
	},
	options: [
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'cox',
			description: 'The Chambers of Xeric.',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a Chambers of Xeric trip',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'type',
							description: 'Choose whether you want to solo or mass.',
							choices: ['solo', 'mass'].map(i => ({ name: i, value: i })),
							required: true
						},
						{
							type: ApplicationCommandOptionType.Boolean,
							name: 'challenge_mode',
							description: 'Choose whether you want to do Challenge Mode.',
							required: false
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: 'quantity',
							description: 'The amount of raids you want to attempt.',
							required: false,
							min_value: 1,
							max_value: 100
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'stats',
					description: 'Check your CoX stats.'
				}
			]
		},
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'tob',
			description: 'The Theatre of Blood.',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a Theatre of Blood trip',
					options: [
						{
							type: ApplicationCommandOptionType.Boolean,
							name: 'solo',
							description: 'Attempt the Theatre by yourself.',
							required: false
						},
						{
							type: ApplicationCommandOptionType.Boolean,
							name: 'hard_mode',
							description: 'Choose whether you want to do Hard Mode.',
							required: false
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: 'max_team_size',
							description: 'Choose a max size for your team.',
							required: false
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'stats',
					description: 'Check your ToB stats.'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'check',
					description: "Check if you're ready for ToB.",
					options: [
						{
							type: ApplicationCommandOptionType.Boolean,
							name: 'hard_mode',
							description: 'Choose whether you want to check Hard Mode.',
							required: false
						}
					]
				}
			]
		},
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'toa',
			description: 'The Tombs of Amascut.',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a Tombs of Amascut trip',
					options: [
						{
							type: ApplicationCommandOptionType.Number,
							name: 'raid_level',
							description: 'Choose the raid level you want to do (1-600).',
							required: true,
							choices: mileStoneBaseDeathChances.map(i => ({ name: i.level.toString(), value: i.level }))
						},
						{
							type: ApplicationCommandOptionType.Boolean,
							name: 'solo',
							description: 'Do you want to solo?',
							required: false
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: 'max_team_size',
							description: 'Choose a max size for your team.',
							required: false,
							min_value: 1,
							max_value: 8
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: 'quantity',
							description: 'The quantity to do.',
							required: false,
							min_value: 1,
							max_value: 5
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'help',
					description: 'Shows helpful information and stats about TOA.'
				}
			]
		},
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'doa',
			description: 'The Depths of Atlantis.',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a Depths of Atlantis trip',
					options: [
						{
							type: ApplicationCommandOptionType.Boolean,
							name: 'challenge_mode',
							description: 'Try if you dare.',
							required: false
						},
						{
							type: ApplicationCommandOptionType.Boolean,
							name: 'solo',
							description: 'Do you want to solo?',
							required: false
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: 'max_team_size',
							description: 'Choose a max size for your team.',
							required: false,
							min_value: 1,
							max_value: 8
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: 'quantity',
							description: 'The quantity to do.',
							required: false,
							min_value: 1,
							max_value: 5
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'help',
					description: 'Shows helpful information and stats about DOA.'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'simulate',
					description: 'Shows helpful information and stats about DOA.',
					options: [
						{
							type: ApplicationCommandOptionType.Boolean,
							name: 'challenge_mode',
							description: 'Try if you dare.',
							required: false
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: 'team_size',
							description: 'Team size (1-5).',
							required: false,
							min_value: 1,
							max_value: 5
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'reset',
					description: 'Reset all your DOA stuff.'
				}
			]
		}
	],
	run: async ({
		interaction,
		options,
		userID,
		channelID
	}: CommandRunOptions<{
		cox?: { start?: { type: 'solo' | 'mass'; challenge_mode?: boolean; quantity?: number }; stats?: {} };
		tob?: {
			start?: { solo?: boolean; hard_mode?: boolean; max_team_size?: number };
			stats?: {};
			check?: { hard_mode?: boolean };
		};
		toa?: {
			start?: { raid_level: RaidLevel; max_team_size?: number; solo?: boolean; quantity?: number };
			help?: {};
		};
		doa?: {
			start?: { challenge_mode?: boolean; max_team_size?: number; solo?: boolean; quantity?: number };
			help?: {};
			simulate?: {
				challenge_mode?: boolean;
				team_size?: number;
			};
			reset?: {};
		};
	}>) => {
		if (interaction) await deferInteraction(interaction);
		const user = await mUserFetch(userID);
		const { cox, tob } = options;
		if (cox?.stats) return coxStatsCommand(user);
		if (tob?.stats) return tobStatsCommand(user);
		if (tob?.check) return tobCheckCommand(user, Boolean(tob.check.hard_mode));
		if (options.toa?.help) return toaHelpCommand(user, channelID);

		if (minionIsBusy(user.id)) return "Your minion is busy, you can't do this.";

		if (cox && cox.start) {
			return coxCommand(channelID, user, cox.start.type, Boolean(cox.start.challenge_mode), cox.start.quantity);
		}
		if (tob) {
			if (tob.start) {
				return tobStartCommand(
					user,
					channelID,
					Boolean(tob.start.hard_mode),
					tob.start.max_team_size,
					Boolean(tob.start.solo)
				);
			}
		}

		if (options.toa?.start) {
			return toaStartCommand(
				user,
				Boolean(options.toa.start.solo),
				channelID,
				options.toa.start.raid_level,
				options.toa.start.max_team_size,
				options.toa.start.quantity
			);
		}

		if (options.doa?.start) {
			return doaStartCommand(
				user,
				Boolean(options.doa.start.challenge_mode),
				Boolean(options.doa.start.solo),
				channelID,
				options.doa.start.max_team_size,
				options.doa.start.quantity
			);
		}

		if (options.doa?.help) {
			return doaHelpCommand(user);
		}

		if (options.doa?.reset) {
			await userStatsUpdate(userID, {
				doa_attempts: 0,
				doa_cost: {},
				doa_loot: {},
				doa_room_attempts_bank: {},
				doa_total_minutes_raided: 0
			});

			await user.update({ collectionLogBank: {} });

			await prisma.minigame.update({
				where: {
					user_id: userID
				},
				data: {
					depths_of_atlantis: 0,
					depths_of_atlantis_cm: 0
				}
			});
			return 'Reset your CL, doa attempts, cost, loot, kc and total time raided.';
		}
		if (options.doa?.simulate) {
			const samples = 500;
			const results: {
				loot: Bank;
				time: number;
				cost: Bank;
				kcFinishedAt: number;
			}[] = [];

			const cm = Boolean(options.doa.simulate.challenge_mode);
			const teamSize = options.doa.simulate.team_size ?? 1;

			for (let t = 0; t < samples; t++) {
				let i = 0;
				const totalLoot = new Bank();
				let items = resolveItems([
					'Shark jaw',
					'Shark tooth',
					'Oceanic relic',
					'Aquifer aegis',
					'Oceanic dye',
					'Crush'
				]);

				if (cm) {
					items.push(...doaMetamorphPets);
				}

				let time = 0;
				let kcGotAt = [];
				const totalCost = new Bank();

				while (items.some(item => !totalLoot.has(item))) {
					i++;

					let loot = new Bank();
					if (roll(chanceOfDOAUnique(teamSize, cm))) {
						loot.add(pickUniqueToGiveUser(totalLoot));
					} else {
						loot.add(DOANonUniqueTable.roll());
					}

					if (cm && roll(globalDroprates.doaMetamorphPet.baseRate)) {
						const unownedCMPets = randArrItem(doaMetamorphPets.filter(b => !user.cl.has(b)));
						if (unownedCMPets) {
							loot.add(unownedCMPets);
						}
					}

					for (const item of items) {
						if (!totalLoot.has(item) && loot.has(item)) {
							kcGotAt.push(`${itemNameFromID(item)}: ${i}`);
						}
					}

					totalLoot.add(loot);

					const kcBank = new Bank();
					for (const room of DOARooms) {
						kcBank.add(room.id, i);
					}

					let team = [];
					for (let a = 0; a < teamSize; a++) {
						team.push({ user, kc: a, attempts: a, roomKCs: kcBank.bank as any });
					}

					const result = createDOATeam({
						team,
						challengeMode: cm,
						quantity: 1
					});

					const cost = await calcDOAInput({
						user,
						kcOverride: i,
						challengeMode: cm,
						quantity: 1,
						duration: result.fakeDuration
					});
					totalCost.add(cost.cost);
					totalCost.add(cost.blowpipeCost);

					time += result.fakeDuration;
				}

				results.push({ time, cost: totalCost, loot: totalLoot, kcFinishedAt: i });
			}

			const luckiest = results.sort((a, b) => a.kcFinishedAt - b.kcFinishedAt)[0];
			const unluckiest = results.sort((a, b) => b.kcFinishedAt - a.kcFinishedAt)[0];
			const fastest = results.sort((a, b) => a.time - b.time)[0];
			const slowest = results.sort((a, b) => b.time - a.time)[0];
			const totalLoot = new Bank();
			const totalCost = new Bank();
			let totalTime = 0;

			for (const result of results) {
				totalLoot.add(result.loot);
				totalCost.add(result.cost);
				totalTime += result.time;
			}

			const averageLoot = averageBank(totalLoot, samples);
			const averageCost = averageBank(totalCost, samples);
			const averageTime = totalTime / samples;
			const averageKC = sumArr(results.map(r => r.kcFinishedAt)) / samples;

			return {
				content: `
Average time to finish: ${formatDuration(averageTime)}
Average KC finished at: ${averageKC}

Team Size: ${teamSize}
${cm ? 'Challenge Mode' : 'NOT Challenge Mode'}
Total cost does not include charges (e.g. blood runes from sang staff)

Luckiest finish: ${luckiest.kcFinishedAt} KC
Unluckiest finish: ${unluckiest.kcFinishedAt} KC
Fastest finish: ${formatDuration(fastest.time)}
Slowest finish: ${formatDuration(slowest.time)}
`,
				files: [
					(await makeBankImage({ bank: averageLoot, title: 'Average Loot' })).file,
					(await makeBankImage({ bank: averageCost, title: 'Average Cost' })).file
				]
			};
		}

		return 'Invalid command.';
	}
};
