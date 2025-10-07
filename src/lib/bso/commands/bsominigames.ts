import {
	BathhouseOres,
	BathwaterMixtures,
	bathHouseTiers,
	baxBathHelpStr,
	baxBathSim,
	baxtorianBathhousesStartCommand
} from '@/lib/bso/baxtorianBathhouses.js';
import { bonanzaCommand } from '@/lib/bso/commands/bonanzaCommand.js';
import { fishingContestStartCommand, fishingContestStatsCommand } from '@/lib/bso/commands/fishingContestCommand.js';
import { fistOfGuthixCommand } from '@/lib/bso/commands/fistOfGuthix.js';
import { monkeyRumbleCommand, monkeyRumbleStatsCommand } from '@/lib/bso/commands/monkeyRumbleCommand.js';
import { stealingCreationCommand } from '@/lib/bso/commands/stealingCreation.js';
import { tinkeringWorkshopCommand } from '@/lib/bso/commands/tinkeringWorkshopCommand.js';
import {
	allGodlyItems,
	divineDominionCheck,
	divineDominionSacrificeCommand
} from '@/lib/bso/minigames/divineDominion.js';
import { fishingLocations } from '@/lib/bso/minigames/fishingContest.js';
import { joinGuthixianCache } from '@/lib/bso/minigames/guthixianCache.js';
import {
	OuraniaBuyables,
	odsBuyCommand,
	odsStartCommand,
	odsStatsCommand
} from '@/lib/bso/minigames/ods/odsCommand.js';
import {
	type TuraelsTrialsMethod,
	TuraelsTrialsMethods,
	turaelsTrialsStartCommand
} from '@/lib/bso/minigames/turaelsTrials.js';
import type { MaterialType } from '@/lib/bso/skills/invention/index.js';

import { toTitleCase } from '@oldschoolgg/toolkit';
import { Items } from 'oldschooljs';

import { ownedMaterialOption } from '@/lib/discord/index.js';

export const bsoMinigamesCommand: OSBMahojiCommand = {
	name: 'bsominigames',
	description: 'Send your minion to do various bso minigames.',
	options: [
		{
			type: 'SubcommandGroup',
			name: 'baxtorian_bathhouses',
			description: 'The Baxtorian Bathhouses minigame.',
			options: [
				{
					type: 'Subcommand',
					name: 'help',
					description: 'Show some helpful information about the minigame.'
				},
				{
					type: 'Subcommand',
					name: 'start',
					description: 'Start a Baxtorian Bathhouses minigame trip.',
					options: [
						{
							type: 'String',
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
							type: 'String',
							name: 'heating',
							description: 'The heating you want to use to heat the boilers.',
							required: true,
							choices: BathhouseOres.map(i => ({
								name: `${i.item.name} + ${i.logs.name} (Usable at ${i.tiers.join(', ')})`,
								value: i.item.name
							}))
						},
						{
							type: 'String',
							name: 'water_mixture',
							description: 'The herbs you want to use for your water mixture.',
							required: true,
							choices: BathwaterMixtures.map(i => ({
								name: `${i.name} (${i.items.map(i => Items.itemNameFromId(i)).join(', ')})`,
								value: i.name
							}))
						}
					]
				}
			]
		},
		{
			type: 'SubcommandGroup',
			name: 'monkey_rumble',
			description: 'The Monkey Rumble minigame.',
			options: [
				{
					type: 'Subcommand',
					name: 'start',
					description: 'Start a Monkey Rumble trip.'
				},
				{
					type: 'Subcommand',
					name: 'stats',
					description: 'Check your Monkey Rumble stats.'
				}
			]
		},
		{
			type: 'SubcommandGroup',
			name: 'ourania_delivery_service',
			description: 'The Ourania Delivery Service (ODS) minigame.',
			options: [
				{
					type: 'Subcommand',
					name: 'start',
					description: 'Start a ODS trip.'
				},
				{
					type: 'Subcommand',
					name: 'stats',
					description: 'Check your ODS stats.'
				},
				{
					type: 'Subcommand',
					name: 'buy',
					description: 'Buy a reward with ODS reward points.',
					options: [
						{
							type: 'String',
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
							type: 'Integer',
							name: 'quantity',
							description: 'The quantity you want to buy (default 1).',
							min_value: 1
						}
					]
				}
			]
		},
		{
			type: 'SubcommandGroup',
			name: 'fishing_contest',
			description: 'The Fishing Contest minigame.',
			options: [
				{
					type: 'Subcommand',
					name: 'fish',
					description: 'Start a Fishing Contest trip.',
					options: [
						{
							type: 'String',
							name: 'location',
							description: 'The location you want to fish at.',
							choices: fishingLocations.map(i => ({ name: i.name, value: i.name }))
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'stats_info',
					description: 'Check your Fishing Contest stats, and current info.'
				}
			]
		},
		{
			type: 'SubcommandGroup',
			name: 'fist_of_guthix',
			description: 'The Fist of Guthix minigame.',
			options: [
				{
					type: 'Subcommand',
					name: 'start',
					description: 'Start a Fist of Guthix trip.'
				}
			]
		},
		{
			type: 'SubcommandGroup',
			name: 'stealing_creation',
			description: 'The Stealing Creation minigame.',
			options: [
				{
					type: 'Subcommand',
					name: 'start',
					description: 'Start a Stealing Creation trip.'
				}
			]
		},
		{
			type: 'SubcommandGroup',
			name: 'tinkering_workshop',
			description: 'The tinkering workshop minigame.',
			options: [
				{
					type: 'Subcommand',
					name: 'start',
					description: 'Start a tinkering workshop trip.',
					options: [
						{
							...ownedMaterialOption,
							type: 'String',
							name: 'material',
							description: 'The material you want to use to tinker with.'
						}
					]
				}
			]
		},
		{
			type: 'SubcommandGroup',
			name: 'balthazars_big_bonanza',
			description: 'The balthazars big bonanza minigame.',
			options: [
				{
					type: 'Subcommand',
					name: 'start',
					description: 'Start a balthazars big bonanza trip.',
					options: []
				}
			]
		},
		{
			type: 'SubcommandGroup',
			name: 'divine_dominion',
			description: 'The Divine Dominion minigame.',
			options: [
				{
					type: 'Subcommand',
					name: 'check',
					description: 'Check your Divine Dominion stats.',
					options: []
				},
				{
					type: 'Subcommand',
					name: 'sacrifice_god_item',
					description: 'Sacrifice godly items.',
					options: [
						{
							name: 'item',
							type: 'String',
							description: 'The godly item to sacrifice.',
							required: true,
							autocomplete: async (value: string, user: MUser) => {
								return user.bank
									.items()
									.filter(i => allGodlyItems.includes(i[0].id))
									.filter(i =>
										!value ? true : i[0].name.toLowerCase().includes(value.toLowerCase())
									)
									.map(i => ({ name: `${i[0].name} (${i[1]}x Owned)`, value: i[0].name }));
							}
						},
						{
							type: 'Integer',
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
			type: 'SubcommandGroup',
			name: 'guthixian_cache',
			description: 'The Guthixian cache divination minigame.',
			options: [
				{
					type: 'Subcommand',
					name: 'join',
					description: 'Join the current guthixian cache, if one is open.',
					options: []
				},
				{
					type: 'Subcommand',
					name: 'stats',
					description: 'View your guthixian cache stats and boosts.',
					options: []
				}
			]
		},
		{
			type: 'SubcommandGroup',
			name: 'turaels_trials',
			description: 'The Turaels Trials minigame.',
			options: [
				{
					type: 'Subcommand',
					name: 'start',
					description: 'Start a trip.',
					options: [
						{
							type: 'String',
							name: 'method',
							description: 'The attack method to use.',
							choices: TuraelsTrialsMethods.map(method => ({ name: method, value: method })),
							required: true
						}
					]
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
			stats?: {};
		};
		turaels_trials?: {
			start?: { method: TuraelsTrialsMethod };
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

		if (options.turaels_trials?.start) {
			return turaelsTrialsStartCommand(klasaUser, channelID, options.turaels_trials.start.method);
		}
		if (options.guthixian_cache?.join) {
			return joinGuthixianCache(klasaUser, channelID);
		}
		if (options.guthixian_cache?.stats) {
			const boost = klasaUser.user.guthixian_cache_boosts_available;
			return `You have ${boost} Guthixian cache boost${boost === 1 ? '' : 's'} available.`;
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
