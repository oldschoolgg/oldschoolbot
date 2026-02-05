import { ownedItemOption } from '@/discord/index.js';
import { Planks } from '@/lib/minions/data/planks.js';
import Potions from '@/lib/minions/data/potions.js';
import { quests } from '@/lib/minions/data/quests.js';
import Agility from '@/lib/skilling/skills/agility.js';
import birdhouses from '@/lib/skilling/skills/hunter/birdHouseTrapping.js';
import { Castables } from '@/lib/skilling/skills/magic/castables.js';
import { Enchantables } from '@/lib/skilling/skills/magic/enchantables.js';
import Prayer from '@/lib/skilling/skills/prayer.js';
import { aerialFishingCommand } from '@/mahoji/lib/abstracted_commands/aerialFishingCommand.js';
import { alchCommand } from '@/mahoji/lib/abstracted_commands/alchCommand.js';
import { birdhouseCheckCommand, birdhouseHarvestCommand } from '@/mahoji/lib/abstracted_commands/birdhousesCommand.js';
import { buryCommand } from '@/mahoji/lib/abstracted_commands/buryCommand.js';
import { butlerCommand } from '@/mahoji/lib/abstracted_commands/butlerCommand.js';
import { camdozaalCommand } from '@/mahoji/lib/abstracted_commands/camdozaalCommand.js';
import { castCommand } from '@/mahoji/lib/abstracted_commands/castCommand.js';
import { chargeGloriesCommand } from '@/mahoji/lib/abstracted_commands/chargeGloriesCommand.js';
import { chargeWealthCommand } from '@/mahoji/lib/abstracted_commands/chargeWealthCommand.js';
import { chompyHuntClaimCommand, chompyHuntCommand } from '@/mahoji/lib/abstracted_commands/chompyHuntCommand.js';
import { collectCommand } from '@/mahoji/lib/abstracted_commands/collectCommand.js';
import { decantCommand } from '@/mahoji/lib/abstracted_commands/decantCommand.js';
import { driftNetCommand } from '@/mahoji/lib/abstracted_commands/driftNetCommand.js';
import { enchantCommand } from '@/mahoji/lib/abstracted_commands/enchantCommand.js';
import { fightCavesCommand } from '@/mahoji/lib/abstracted_commands/fightCavesCommand.js';
import { infernoStartCommand, infernoStatsCommand } from '@/mahoji/lib/abstracted_commands/infernoCommand.js';
import { myNotesCommand } from '@/mahoji/lib/abstracted_commands/myNotesCommand.js';
import { otherActivities, otherActivitiesCommand } from '@/mahoji/lib/abstracted_commands/otherActivitiesCommand.js';
import puroOptions, { puroPuroStartCommand } from '@/mahoji/lib/abstracted_commands/puroPuroCommand.js';
import { questCommand } from '@/mahoji/lib/abstracted_commands/questCommand.js';
import { sawmillCommand } from '@/mahoji/lib/abstracted_commands/sawmillCommand.js';
import { scatterCommand } from '@/mahoji/lib/abstracted_commands/scatterCommand.js';
import { underwaterAgilityThievingCommand } from '@/mahoji/lib/abstracted_commands/underwaterCommand.js';
import { warriorsGuildCommand } from '@/mahoji/lib/abstracted_commands/warriorsGuildCommand.js';
import { collectables } from '@/mahoji/lib/collectables.js';

export const activitiesCommand = defineCommand({
	name: 'activities',
	description: 'Miscellaneous activities you can do.',
	options: [
		{
			type: 'Subcommand',
			name: 'plank_make',
			description: 'Turn logs into planks.',
			options: [
				{
					type: 'String',
					name: 'action',
					description: 'The method you wish to make planks.',
					required: true,
					choices: [
						{ name: 'Demon Butler', value: 'butler' },
						{ name: 'Sawmill', value: 'sawmill' }
					]
				},
				{
					type: 'String',
					name: 'type',
					description: 'The type of planks to make.',
					required: true,
					choices: Planks.map(i => ({ name: i.name, value: i.name }))
				},
				{
					type: 'Integer',
					name: 'quantity',
					description: 'The quantity of planks to make.',
					required: false,
					min_value: 1
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'chompy_hunt',
			description: 'Send your minion to hunt Chompys.',
			options: [
				{
					type: 'String',
					name: 'action',
					description: 'Start a Chompy hunting trip, or claim hats.',
					choices: ['start', 'claim'].map(i => ({ name: i, value: i })),
					required: true
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'my_notes',
			description: 'Send your minion to rummage skeletons for Ancient pages.'
		},
		{
			type: 'Subcommand',
			name: 'warriors_guild',
			description: 'Send your minion to the Warriors Guild.',
			options: [
				{
					type: 'String',
					name: 'action',
					description: 'Get tokens, or kill Cyclops.',
					choices: ['tokens', 'cyclops'].map(i => ({ name: i, value: i })),
					required: true
				},
				{
					type: 'Integer',
					name: 'quantity',
					description: 'The quantity (optional).',
					required: false,
					min_value: 1
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'camdozaal',
			description: 'Camdozaal activities',
			options: [
				{
					type: 'String',
					name: 'action',
					description: 'Mining, smithing, or fishing inside the Ruins of Camdozaal',
					choices: ['mining', 'smithing', 'fishing'].map(i => ({ name: i, value: i })),
					required: true
				},
				{
					type: 'Integer',
					name: 'quantity',
					description: 'The quantity to do (optional).',
					required: false,
					min_value: 1
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'collect',
			description: 'Sends your minion to collect items.',
			options: [
				{
					type: 'String',
					name: 'item',
					description: 'The item to collect.',
					autocomplete: async ({ value }: StringAutoComplete) => {
						return collectables
							.filter(p => (!value ? true : p.item.name.toLowerCase().includes(value.toLowerCase())))
							.map(p => ({ name: p.item.name, value: p.item.name }));
					},
					required: true
				},
				{
					type: 'Integer',
					name: 'quantity',
					description: 'The quantity of collecting trips.',
					required: false,
					min_value: 1
				},
				{
					type: 'Boolean',
					name: 'no_stams',
					description: "Don't use stamina potions when collecting.",
					required: false
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'quest',
			description: 'Send your minion to do quests.',
			options: [
				{
					type: 'String',
					name: 'name',
					description: 'The name of the quest (optional).',
					autocomplete: async ({ userId }: StringAutoComplete) => {
						const user = await mUserFetch(userId);
						let list = quests
							.filter(i => !user.user.finished_quest_ids.includes(i.id))
							.map(i => ({ name: i.name, value: i.name }));
						if (list.length === 0) {
							list = quests.map(i => ({ name: `${i.name} (completed)`, value: i.name }));
						}
						return list;
					},
					required: false
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'decant',
			description: 'Decant potions into different dosages.',
			options: [
				{
					type: 'String',
					name: 'potion_name',
					description: 'The name of the potion.',
					autocomplete: async ({ value }: StringAutoComplete) => {
						return Potions.filter(p =>
							!value ? true : p.name.toLowerCase().includes(value.toLowerCase())
						).map(p => ({ name: p.name, value: p.name }));
					},
					required: true
				},
				{
					type: 'Integer',
					name: 'dose',
					description: 'The dosage to decant them too. (default 4)',
					required: false,
					min_value: 1,
					max_value: 4
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'charge',
			description: 'Charge glories, or rings of wealth.',
			options: [
				{
					type: 'String',
					name: 'item',
					description: 'The item you want to charge',
					required: true,
					choices: [
						{
							name: 'Amulet of glory',
							value: 'glory'
						},
						{
							name: 'Ring of wealth',
							value: 'wealth'
						}
					]
				},
				{
					type: 'Integer',
					name: 'quantity',
					description: 'The amount of inventories you want to charge.  (optional)',
					required: false,
					min_value: 1
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'fight_caves',
			description: 'Fight TzTok-Jad and do the Fight Caves.'
		},
		{
			type: 'Subcommand',
			name: 'inferno',
			description: 'Fight TzKal-Zuk and do the Inferno.',
			options: [
				{
					type: 'String',
					name: 'action',
					description: 'The action you want to perform',
					required: true,
					choices: [
						{ name: 'Start Inferno Trip', value: 'start' },
						{ name: 'Check Inferno Stats', value: 'stats' }
					]
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'birdhouses',
			description: 'Plant Birdhouse traps.',
			options: [
				{
					type: 'String',
					name: 'action',
					description: 'The action to perform.',
					required: true,
					choices: [
						{ name: 'Check Birdhouses', value: 'check' },
						{ name: 'Collect and Plant Birdhouses', value: 'harvest' }
					]
				},
				{
					type: 'String',
					name: 'birdhouse',
					description: 'The birdhouse to plant.',
					required: false,
					choices: birdhouses.map(i => ({ name: i.name, value: i.name }))
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'aerial_fishing',
			description: 'The Aerial Fishing activity.'
		},
		{
			type: 'Subcommand',
			name: 'enchant',
			description: 'Enchant items, like jewellry and bolts.',
			options: [
				{
					type: 'String',
					name: 'name',
					description: 'The item to enchant.',
					required: true,
					autocomplete: async ({ value }: StringAutoComplete) => {
						return Enchantables.filter(i =>
							!value ? true : i.name.toLowerCase().includes(value.toLowerCase())
						).map(i => ({ name: i.name, value: i.name }));
					}
				},
				{
					type: 'Integer',
					name: 'quantity',
					description: 'The quantity to enchant.',
					required: false,
					min_value: 1
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'bury',
			description: 'Bury bones!',
			options: [
				{
					type: 'String',
					name: 'name',
					description: 'The bone to bury.',
					required: true,
					autocomplete: async ({ value }: StringAutoComplete) => {
						return Prayer.Bones.filter(i =>
							!value ? true : i.name.toLowerCase().includes(value.toLowerCase())
						).map(i => ({ name: i.name, value: i.name }));
					}
				},
				{
					type: 'Integer',
					name: 'quantity',
					description: 'The quantity to bury.',
					required: false,
					min_value: 1
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'scatter',
			description: 'Scatter ashes!',
			options: [
				{
					type: 'String',
					name: 'name',
					description: 'The ash to scatter.',
					required: true,
					autocomplete: async ({ value }: StringAutoComplete) => {
						return Prayer.Ashes.filter(i =>
							!value ? true : i.name.toLowerCase().includes(value.toLowerCase())
						).map(i => ({ name: i.name, value: i.name }));
					}
				},
				{
					type: 'Integer',
					name: 'quantity',
					description: 'The quantity to scatter.',
					required: false,
					min_value: 1
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'puro_puro',
			description: 'Hunt implings in Puro-Puro.',
			options: [
				{
					type: 'String',
					name: 'impling',
					description: 'The impling to hunt',
					required: true,
					choices: puroOptions.map(i => ({ name: i.name, value: i.name }))
				},
				{
					type: 'Boolean',
					name: 'dark_lure',
					description: 'Use Dark Lure spell?',
					required: false
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'alch',
			description: 'Alch items for GP.',
			options: [
				{
					...ownedItemOption(i => Boolean(i.highalch)),
					required: true
				},
				{
					type: 'Integer',
					name: 'quantity',
					description: 'The quantity to alch.',
					required: false,
					min_value: 1
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'cast',
			description: 'Cast spells to train Magic.',
			options: [
				{
					type: 'String',
					name: 'spell',
					description: 'The spell to cast.',
					required: true,
					autocomplete: async ({ value }: StringAutoComplete) => {
						return Castables.filter(i =>
							!value ? true : i.name.toLowerCase().includes(value.toLowerCase())
						).map(i => ({ name: i.name, value: i.name }));
					}
				},
				{
					type: 'Integer',
					name: 'quantity',
					description: 'The quantity to cast (Optional).',
					required: false,
					min_value: 1
				}
			]
		},
		{
			type: 'SubcommandGroup',
			name: 'underwater',
			description: 'The Underwater.',
			options: [
				{
					type: 'Subcommand',
					name: 'agility_thieving',
					description: 'Underwater Agility and Thieving.',
					options: [
						{
							type: 'String',
							name: 'training_skill',
							description: 'The skill/skills to train.',
							required: true,
							choices: Agility.underwaterAgilityThievingTrainingSkill.map(i => ({ name: i, value: i }))
						},
						{
							type: 'Integer',
							name: 'minutes',
							description: 'How many minutes to do (optional).',
							required: false,
							min_value: 1
						},
						{
							type: 'Boolean',
							name: 'no_stams',
							description: "Don't use stams?",
							required: false
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'drift_net_fishing',
					description: 'The Drift Net fishing activity.',
					options: [
						{
							type: 'Integer',
							name: 'minutes',
							description: 'How many minutes to do (optional).',
							required: false,
							min_value: 1
						},
						{
							type: 'Boolean',
							name: 'no_stams',
							description: "Don't use stams?",
							required: false
						}
					]
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'other',
			description: 'Other, smaller activities.',
			options: [
				{
					type: 'String',
					name: 'activity',
					description: 'The activity to do.',
					required: true,
					choices: otherActivities.map(i => ({ name: i.name, value: i.type }))
				}
			]
		}
	],
	run: async ({ options, channelId, user, interaction, rng }) => {
		// Minion can be busy
		if (options.decant) {
			return decantCommand(user, options.decant.potion_name, options.decant.dose);
		}
		if (options.inferno?.action === 'stats') return infernoStatsCommand({ rng, user });
		if (options.birdhouses?.action === 'check') return birdhouseCheckCommand(user);

		// Minion must be free
		const isBusy = await user.minionIsBusy();
		const busyStr = `${user.minionName} is currently busy.`;
		if (isBusy) return busyStr;

		if (options.other) {
			return otherActivitiesCommand(interaction, options.other.activity);
		}
		if (options.birdhouses?.action === 'harvest') {
			return birdhouseHarvestCommand(user, channelId, options.birdhouses.birdhouse);
		}
		if (options.inferno?.action === 'start') return infernoStartCommand({ rng, user, channelId });
		if (options.plank_make?.action === 'sawmill') {
			return sawmillCommand(user, options.plank_make.type, options.plank_make.quantity, channelId);
		}
		if (options.plank_make?.action === 'butler') {
			return butlerCommand(user, options.plank_make.type, options.plank_make.quantity, channelId);
		}
		if (options.chompy_hunt?.action === 'start') {
			return chompyHuntCommand(interaction);
		}
		if (options.chompy_hunt?.action === 'claim') {
			return chompyHuntClaimCommand(user);
		}
		if (options.my_notes) {
			return myNotesCommand(user, channelId);
		}
		if (options.warriors_guild) {
			return warriorsGuildCommand(
				user,
				channelId,
				options.warriors_guild.action,
				options.warriors_guild.quantity
			);
		}
		if (options.camdozaal) {
			return camdozaalCommand(rng, user, channelId, options.camdozaal.action, options.camdozaal.quantity);
		}
		if (options.collect) {
			return collectCommand(
				user,
				channelId,
				options.collect.item,
				options.collect.quantity,
				options.collect.no_stams
			);
		}
		if (options.quest) {
			return questCommand(user, channelId, options.quest.name);
		}
		if (options.charge?.item === 'glory') {
			return chargeGloriesCommand(user, channelId, options.charge.quantity);
		}
		if (options.charge?.item === 'wealth') {
			return chargeWealthCommand(user, channelId, options.charge.quantity);
		}
		if (options.fight_caves) {
			return fightCavesCommand({ rng, user, channelId });
		}
		if (options.aerial_fishing) {
			return aerialFishingCommand({ rng, user, channelId });
		}
		if (options.enchant) {
			return enchantCommand(user, channelId, options.enchant.name, options.enchant.quantity);
		}
		if (options.bury) {
			return buryCommand(user, channelId, options.bury.name, options.bury.quantity);
		}
		if (options.scatter) {
			return scatterCommand(user, channelId, options.scatter.name, options.scatter.quantity);
		}
		if (options.alch) {
			return alchCommand(interaction, channelId, user, options.alch.item, options.alch.quantity);
		}
		if (options.puro_puro) {
			return puroPuroStartCommand(user, channelId, options.puro_puro.impling, options.puro_puro.dark_lure);
		}
		if (options.cast) {
			return castCommand(channelId, user, options.cast.spell, options.cast.quantity);
		}
		if (options.underwater) {
			if (options.underwater.agility_thieving) {
				return underwaterAgilityThievingCommand({
					rng,
					channelId,
					user,
					trainingSkill: options.underwater.agility_thieving.training_skill,
					minutes: options.underwater.agility_thieving.minutes,
					noStams: options.underwater.agility_thieving.no_stams
				});
			}
			if (options.underwater.drift_net_fishing) {
				return driftNetCommand(
					interaction,
					options.underwater.drift_net_fishing.minutes,
					options.underwater.drift_net_fishing.no_stams
				);
			}
		}

		return 'Invalid command.';
	}
});
