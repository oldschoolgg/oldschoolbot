import { toTitleCase } from '@oldschoolgg/toolkit';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import {
	BathhouseOres,
	bathHouseTiers,
	BathwaterMixtures,
	baxBathHelpStr,
	baxBathSim,
	baxtorianBathhousesStartCommand
} from '../../lib/baxtorianBathhouses';
import { allGodlyItems, divineDominionCheck, divineDominionSacrificeCommand } from '../../lib/bso/divineDominion';
import { joinGuthixianCache } from '../../lib/bso/guthixianCache';
import { fishingLocations } from '../../lib/fishingContest';
import { MaterialType } from '../../lib/invention';
import { mahojiClientSettingsFetch } from '../../lib/util/clientSettings';
import { bonanzaCommand } from '../lib/abstracted_commands/bonanzaCommand';
import {
	fishingContestStartCommand,
	fishingContestStatsCommand
} from '../lib/abstracted_commands/fishingContestCommand';
import { fistOfGuthixCommand } from '../lib/abstracted_commands/fistOfGuthix';
import { monkeyRumbleCommand, monkeyRumbleStatsCommand } from '../lib/abstracted_commands/monkeyRumbleCommand';
import {
	odsBuyCommand,
	odsStartCommand,
	odsStatsCommand,
	OuraniaBuyables
} from '../lib/abstracted_commands/odsCommand';
import { stealingCreationCommand } from '../lib/abstracted_commands/stealingCreation';
import { tinkeringWorkshopCommand } from '../lib/abstracted_commands/tinkeringWorkshopCommand';
import { itemOption, ownedMaterialOption } from '../lib/mahojiCommandOptions';
import { OSBMahojiCommand } from '../lib/util';

export const minigamesCommand: OSBMahojiCommand = {
	name: 'bsominigames',
	description: 'Send your minion to do various bso minigames.',
	options: [
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'baxtorian_bathhouses',
			description: 'The Baxtorian Bathhouses minigame.',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'help',
					description: 'Show some helpful information about the minigame.'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a Baxtorian Bathhouses minigame trip.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'tier',
							description: 'The tier of bath you want to run.',
							required: true,
							choices: bathHouseTiers.map(i => ({
								name: `${i.name} (${Object.entries(i.skillRequirements)
									.map(i => `${i[1]} ${toTitleCase(i[0])}`)
									.join(', ')})`,
								value: i.name
							}))
						},
						{
							type: ApplicationCommandOptionType.String,
							name: 'heating',
							description: 'The heating you want to use to heat the boilers.',
							required: true,
							choices: BathhouseOres.map(i => ({
								name: `${i.item.name} + ${i.logs.name} (Usable at ${i.tiers.join(', ')})`,
								value: i.item.name
							}))
						},
						{
							type: ApplicationCommandOptionType.String,
							name: 'water_mixture',
							description: 'The herbs you want to use for your water mixture.',
							required: true,
							choices: BathwaterMixtures.map(i => ({
								name: `${i.name} (${i.items.map(i => i.name).join(', ')})`,
								value: i.name
							}))
						}
					]
				}
			]
		},
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'monkey_rumble',
			description: 'The Monkey Rumble minigame.',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a Monkey Rumble trip.'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'stats',
					description: 'Check your Monkey Rumble stats.'
				}
			]
		},
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'ourania_delivery_service',
			description: 'The Ourania Delivery Service (ODS) minigame.',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a ODS trip.'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'stats',
					description: 'Check your ODS stats.'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'buy',
					description: 'Buy a reward with ODS reward points.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'name',
							description: 'The thing you want to buy.',
							required: true,
							autocomplete: async (value: string) => {
								return OuraniaBuyables.filter(i =>
									!value ? true : i.item.name.toLowerCase().includes(value.toLowerCase())
								).map(i => ({ name: i.item.name, value: i.item.name }));
							}
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: 'quantity',
							description: 'The quantity you want to buy (default 1).',
							min_value: 1
						}
					]
				}
			]
		},
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'fishing_contest',
			description: 'The Fishing Contest minigame.',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'fish',
					description: 'Start a Fishing Contest trip.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'location',
							description: 'The location you want to fish at.',
							choices: fishingLocations.map(i => ({ name: i.name, value: i.name }))
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'stats_info',
					description: 'Check your Fishing Contest stats, and current info.'
				}
			]
		},
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'fist_of_guthix',
			description: 'The Fist of Guthix minigame.',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a Fist of Guthix trip.'
				}
			]
		},
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'stealing_creation',
			description: 'The Stealing Creation minigame.',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a Stealing Creation trip.'
				}
			]
		},
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'tinkering_workshop',
			description: 'The tinkering workshop minigame.',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a tinkering workshop trip.',
					options: [
						{
							...ownedMaterialOption,
							type: ApplicationCommandOptionType.String,
							name: 'material',
							description: 'The material you want to use to tinker with.'
						}
					]
				}
			]
		},
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'balthazars_big_bonanza',
			description: 'The balthazars big bonanza minigame.',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a balthazars big bonanza trip.',
					options: []
				}
			]
		},
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'divine_dominion',
			description: 'The Divine Dominion minigame.',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'check',
					description: 'Check your Divine Dominion stats.',
					options: []
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'sacrifice_god_item',
					description: 'Sacrifice godly items.',
					options: [
						itemOption(item => allGodlyItems.includes(item.id)),
						{
							type: ApplicationCommandOptionType.Integer,
							name: 'quantity',
							description: 'The quantity you want to sacrifice (default 1).',
							min_value: 1,
							required: false
						}
					]
				}
			]
		},
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'guthixian_cache',
			description: 'The Guthixian cache divination minigame.',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'join',
					description: 'Join the current guthixian cache, if one is open.',
					options: []
				}
			]
		}
	],
	run: async ({
		options,
		userID,
		channelID
	}: CommandRunOptions<{
		baxtorian_bathhouses?: {
			help?: {};
			start?: { tier: string; heating?: string; water_mixture?: string };
		};
		monkey_rumble?: {
			stats?: {};
			start?: {};
		};
		ourania_delivery_service?: {
			stats?: {};
			start?: {};
			buy?: { name: string; quantity?: number };
		};
		fishing_contest?: {
			stats_info?: {};
			fish?: { location?: string };
		};
		fist_of_guthix?: {
			start?: {};
		};
		stealing_creation?: {
			start?: {};
		};
		tinkering_workshop?: {
			start?: {
				material: MaterialType;
			};
		};
		balthazars_big_bonanza?: {
			start?: {};
		};
		divine_dominion?: {
			check?: {};
			sacrifice_god_item?: {
				item: string;
				quantity?: number;
			};
		};
		guthixian_cache?: {
			join?: {};
		};
	}>) => {
		const klasaUser = await mUserFetch(userID);
		const {
			baxtorian_bathhouses,
			monkey_rumble,
			ourania_delivery_service,
			fishing_contest,
			fist_of_guthix,
			stealing_creation,
			divine_dominion
		} = options;

		if (options.guthixian_cache?.join) {
			const { divination_is_released } = await mahojiClientSettingsFetch({ divination_is_released: true });
			if (!divination_is_released) {
				return 'Divination is not released yet!';
			}
			return joinGuthixianCache(klasaUser, channelID);
		}
		if (divine_dominion?.check) {
			return divineDominionCheck(klasaUser);
		}

		if (divine_dominion?.sacrifice_god_item) {
			return divineDominionSacrificeCommand(
				klasaUser,
				divine_dominion.sacrifice_god_item.item,
				divine_dominion.sacrifice_god_item.quantity
			);
		}

		if (baxtorian_bathhouses?.help) {
			const sim = baxBathSim();
			return {
				content: baxBathHelpStr,
				files: [{ name: 'sim.txt', attachment: Buffer.from(sim) }]
			};
		}

		if (baxtorian_bathhouses?.start) {
			return baxtorianBathhousesStartCommand({
				channelID,
				user: klasaUser,
				tier: baxtorian_bathhouses.start.tier,
				ore: baxtorian_bathhouses.start.heating,
				mixture: baxtorian_bathhouses.start.water_mixture
			});
		}

		if (monkey_rumble?.start) return monkeyRumbleCommand(klasaUser, channelID);
		if (monkey_rumble?.stats) return monkeyRumbleStatsCommand(klasaUser);

		if (ourania_delivery_service?.buy) {
			return odsBuyCommand(
				klasaUser,
				ourania_delivery_service.buy.name,
				ourania_delivery_service.buy.quantity ?? 1
			);
		}
		if (ourania_delivery_service?.stats) return odsStatsCommand(klasaUser);
		if (ourania_delivery_service?.start) return odsStartCommand(klasaUser, channelID);

		if (fishing_contest?.stats_info) return fishingContestStatsCommand(klasaUser);
		if (fishing_contest?.fish) {
			return fishingContestStartCommand(klasaUser, channelID, fishing_contest.fish.location);
		}

		if (fist_of_guthix?.start) {
			return fistOfGuthixCommand(klasaUser, channelID);
		}
		if (stealing_creation?.start) {
			return stealingCreationCommand(klasaUser, channelID);
		}
		if (options.tinkering_workshop?.start) {
			return tinkeringWorkshopCommand(klasaUser, options.tinkering_workshop.start.material, channelID);
		}

		if (options.balthazars_big_bonanza?.start) {
			return bonanzaCommand(klasaUser, channelID);
		}

		return 'Invalid command.';
	}
};
