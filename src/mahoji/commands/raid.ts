import {
	calcDOAInput,
	chanceOfDOAUnique,
	createDOATeam,
	DOARooms,
	doaHelpCommand,
	pickUniqueToGiveUser
} from '@/lib/bso/depthsOfAtlantis.js';
import { DOANonUniqueTable } from '@/lib/bso/doa/doaLootTable.js';
import { doaStartCommand } from '@/lib/bso/doa/doaStartCommand.js';
import { globalDroprates } from '@/lib/bso/globalDroprates.js';

import { randArrItem, roll } from '@oldschoolgg/rng';
import { formatDuration, reduceNumByPercent, sumArr } from '@oldschoolgg/toolkit';
import { averageBank, Bank, resolveItems } from 'oldschooljs';

import { globalConfig } from '@/lib/constants.js';
import { doaMetamorphPets } from '@/lib/data/CollectionsExport.js';
import { degradeableItems } from '@/lib/degradeableItems.js';
import { toaHelpCommand, toaStartCommand } from '@/lib/simulation/toa.js';
import { mileStoneBaseDeathChances } from '@/lib/simulation/toaUtils.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';
import { coxCommand, coxStatsCommand } from '@/mahoji/lib/abstracted_commands/coxCommand.js';
import { tobCheckCommand, tobStartCommand, tobStatsCommand } from '@/mahoji/lib/abstracted_commands/tobCommand.js';

export const raidCommand: OSBMahojiCommand = {
	name: 'raid',
	description: 'Send your minion to do raids - CoX or ToB.',
	attributes: {
		requiresMinion: true
	},
	options: [
		{
			type: 'SubcommandGroup',
			name: 'cox',
			description: 'The Chambers of Xeric.',
			options: [
				{
					type: 'Subcommand',
					name: 'start',
					description: 'Start a Chambers of Xeric trip',
					options: [
						{
							type: 'String',
							name: 'type',
							description: 'Choose whether you want to solo, mass, or fake mass.',
							choices: ['solo', 'mass'].map(i => ({ name: i, value: i })),
							required: true
						},
						{
							type: 'Boolean',
							name: 'challenge_mode',
							description: 'Choose whether you want to do Challenge Mode.',
							required: false
						},
						{
							type: 'Integer',
							name: 'max_team_size',
							description: 'Choose a max size for your team.',
							required: false
						},
						{
							type: 'Integer',
							name: 'quantity',
							description: 'The quantity to do.',
							required: false,
							min_value: 1,
							max_value: 10
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'stats',
					description: 'Check your CoX stats.'
				}
			]
		},
		{
			type: 'SubcommandGroup',
			name: 'tob',
			description: 'The Theatre of Blood.',
			options: [
				{
					type: 'Subcommand',
					name: 'start',
					description: 'Start a Theatre of Blood trip',
					options: [
						{
							type: 'String',
							name: 'solo',
							description: 'Attempt the Theatre by yourself.',
							choices: ['solo', 'trio'].map(i => ({ name: i, value: i }))
						},
						{
							type: 'Boolean',
							name: 'hard_mode',
							description: 'Choose whether you want to do Hard Mode.',
							required: false
						},
						{
							type: 'Integer',
							name: 'max_team_size',
							description: 'Choose a max size for your team.',
							required: false
						},
						{
							type: 'Integer',
							name: 'quantity',
							description: 'The quantity to do.',
							required: false,
							min_value: 1,
							max_value: 30
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'stats',
					description: 'Check your ToB stats.'
				},
				{
					type: 'Subcommand',
					name: 'check',
					description: "Check if you're ready for ToB.",
					options: [
						{
							type: 'Boolean',
							name: 'hard_mode',
							description: 'Choose whether you want to check Hard Mode.',
							required: false
						}
					]
				}
			]
		},
		{
			type: 'SubcommandGroup',
			name: 'toa',
			description: 'The Tombs of Amascut.',
			options: [
				{
					type: 'Subcommand',
					name: 'start',
					description: 'Start a Tombs of Amascut trip',
					options: [
						{
							type: 'Integer',
							name: 'raid_level',
							description: 'Choose the raid level you want to do (1-600).',
							required: true,
							choices: mileStoneBaseDeathChances.map(i => ({
								name: i.level.toString(),
								value: i.level
							}))
						},
						{
							type: 'Boolean',
							name: 'solo',
							description: 'Do you want to solo?',
							required: false
						},
						{
							type: 'Integer',
							name: 'max_team_size',
							description: 'Choose a max size for your team.',
							required: false,
							min_value: 1,
							max_value: 8
						},
						{
							type: 'Integer',
							name: 'quantity',
							description: 'The quantity to do.',
							required: false,
							min_value: 1,
							max_value: 5
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'help',
					description: 'Shows helpful information and stats about TOA.'
				}
			]
		},
		{
			type: 'SubcommandGroup',
			name: 'doa',
			description: 'The Depths of Atlantis.',
			options: [
				{
					type: 'Subcommand',
					name: 'start',
					description: 'Start a Depths of Atlantis trip',
					options: [
						{
							type: 'Boolean',
							name: 'challenge_mode',
							description: 'Try if you dare.',
							required: false
						},
						{
							type: 'Boolean',
							name: 'solo',
							description: 'Do you want to solo?',
							required: false
						},
						{
							type: 'Integer',
							name: 'max_team_size',
							description: 'Choose a max size for your team.',
							required: false,
							min_value: 1,
							max_value: 8
						},
						{
							type: 'Integer',
							name: 'quantity',
							description: 'The quantity to do.',
							required: false,
							min_value: 1,
							max_value: 5
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'help',
					description: 'Shows helpful information and stats about DOA.'
				},
				...(globalConfig.isProduction
					? []
					: [
							{
								type: 'Subcommand',
								name: 'simulate',
								description: 'Shows helpful information and stats about DOA.',
								options: [
									{
										type: 'Boolean',
										name: 'challenge_mode',
										description: 'Try if you dare.',
										required: false
									},
									{
										type: 'Integer',
										name: 'team_size',
										description: 'Team size (1-5).',
										required: false,
										min_value: 1,
										max_value: 5
									}
								]
							} as any
						])
			]
		}
	],
	run: async ({
		interaction,
		options,
		user,
		channelID
	}: CommandRunOptions<{
		cox?: {
			start?: {
				type: 'solo' | 'mass';
				challenge_mode?: boolean;
				max_team_size?: number;
				quantity?: number;
			};
			stats?: {};
		};
		tob?: {
			start?: {
				solo?: 'solo' | 'trio' | undefined;
				hard_mode?: boolean;
				max_team_size?: number;
				quantity?: number;
			};
			stats?: {};
			check?: { hard_mode?: boolean };
		};
		toa?: {
			start?: { raid_level: number; max_team_size?: number; solo?: boolean; quantity?: number };
			help?: {};
		};
		doa?: {
			start?: { challenge_mode?: boolean; max_team_size?: number; solo?: boolean; quantity?: number };
			help?: {};
			simulate?: {
				challenge_mode?: boolean;
				team_size?: number;
			};
		};
	}>) => {
		if (interaction) await interaction.defer();

		const { cox, tob } = options;
		if (cox?.stats) return coxStatsCommand(user);
		if (tob?.stats) return tobStatsCommand(user);
		if (tob?.check) return tobCheckCommand(user, Boolean(tob.check.hard_mode));
		if (options.toa?.help) return toaHelpCommand(user, channelID);
		if (options.doa?.help) {
			return doaHelpCommand(user);
		}

		if (options.doa?.simulate) {
			const samples = 1000;
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
				const items = resolveItems([
					'Shark jaw',
					'Shark tooth',
					'Oceanic relic',
					'Aquifer aegis',
					'Oceanic dye',
					'Crush'
				]);

				// if (cm) {
				// 	items.push(...doaMetamorphPets);
				// }

				let time = 0;
				const totalCost = new Bank();

				const uniqueChance = chanceOfDOAUnique(teamSize, cm);
				let petDroprate = globalDroprates.doaCrush.baseRate;
				if (cm) petDroprate = reduceNumByPercent(petDroprate, globalDroprates.doaCrush.cmReduction);

				while (items.some(item => !totalLoot.has(item))) {
					i++;

					const loot = new Bank();
					if (roll(uniqueChance)) {
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

					if (roll(petDroprate)) {
						loot.add('Crush');
					}

					totalLoot.add(loot);

					const kcBank = new Bank();
					for (const room of DOARooms) {
						kcBank.add(room.id, i);
					}

					const team = [];
					for (let a = 0; a < teamSize; a++) {
						team.push({ user, kc: a, attempts: a, roomKCs: kcBank.toJSON() as any });
					}

					const result = createDOATeam({
						team,
						challengeMode: cm,
						quantity: 1
					});

					let cost: any = null;
					try {
						cost = await calcDOAInput({
							user,
							kcOverride: i,
							challengeMode: cm,
							quantity: 1,
							duration: result.fakeDuration
						});
					} catch (err: any) {
						return err.message;
					}
					totalCost.add(cost.cost);
					totalCost.add('Blood rune', cost.sangCharges * 3);

					const vStaff = degradeableItems.find(t => t.item.name === 'Void staff')!;
					if (cost.voidStaffCharges) {
						totalCost.add(vStaff.chargeInput.cost.clone().multiply(cost.voidStaffCharges));
					}

					const tShadow = degradeableItems.find(t => t.item.name === "Tumeken's shadow")!;
					if (cost.tumShadowCharges) {
						totalCost.add(tShadow.chargeInput.cost.clone().multiply(cost.tumShadowCharges));
					}

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

		if (user.minionIsBusy) return "Your minion is busy, you can't do this.";

		if (cox?.start) {
			return coxCommand(
				interaction,
				channelID,
				user,
				cox.start.type,
				cox.start.max_team_size,
				Boolean(cox.start.challenge_mode),
				cox.start.quantity
			);
		}
		if (tob?.start) {
			return tobStartCommand(
				interaction,
				user,
				channelID,
				Boolean(tob.start.hard_mode),
				tob.start.max_team_size,
				tob.start.solo,
				tob.start.quantity
			);
		}

		if (options.toa?.start) {
			return toaStartCommand(
				interaction,
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
				interaction,
				user,
				Boolean(options.doa.start.challenge_mode),
				Boolean(options.doa.start.solo),
				channelID,
				options.doa.start.max_team_size,
				options.doa.start.quantity
			);
		}

		return 'Invalid command.';
	}
};
