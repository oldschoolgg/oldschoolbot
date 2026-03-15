import { increaseNumByPercent, reduceNumByPercent } from '@oldschoolgg/util/src/index.js';
import { Time } from '@sapphire/time-utilities';

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
import { randInt, roll } from '../../../packages/rng/src/index.js';
import { formatDuration } from '../../../packages/toolkit/src/index.js';

export const foolCommand = defineCommand({
	name: 'fool',
	description: 'Are you a fool?',
	options: [
		{
			type: 'Subcommand',
			name: 'help',
			description: 'Probably not a lot of (useful) help today.'
		},
		{
			type: 'Subcommand',
			name: 'play_the_fool',
			description: 'Go on, give it a go...'
		},
		{
			type: 'Subcommand',
			name: 'fool_someone',
			description: 'Fool someone else.',
			options: [
				{
					type: 'String',
					name: 'Fooled em?',
					description: 'Well did you?',
					required: false
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'trick_someone',
			description: 'Does what it says on the tin',
			options: [
				{
					type: 'User',
					name: 'Target',
					description: 'Person to try and trick',
					required: false
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'us',
			description: 'Fool us.',
			options: [
				{
					type: 'String',
					name: 'Fooled em?',
					description: 'Well did you?',
					required: false
				}
			]
		}
	],
	run: async ({ options, channelId, user, interaction }) => {
		const ratelimit = await Cache.tryRatelimit(user.id, 'event_command_limit');
		if (!ratelimit.success) {
			let foolTimeRemaining = ratelimit.timeRemainingMs;
			const upOrDown = roll(2);
			const percentToChange = randInt(10, 96);
			if (upOrDown) {
				foolTimeRemaining = reduceNumByPercent(foolTimeRemaining, percentToChange);
			} else {
				foolTimeRemaining = increaseNumByPercent(foolTimeRemaining, percentToChange);
			}

			// Alter the number to make it harder to figure out
			const secondsPerMinute = randInt(5, 50);
			foolTimeRemaining /= Math.round(Time.Second * secondsPerMinute);

			return `Cyr says you can only be an idiot twice per half hour. You still to have have to wait ${foolTimeRemaining} more minutes... Assuming a minute is ${secondsPerMinute} seconds, of course. Only 50% chance I'm lying :D`;
		}

		if (options.help) {
			//
		}

		// ----------------- other commands code -------------------
		// Minion can be busy
		if (options.decant) {
			return decantCommand(user, options.decant.potion_name, options.decant.dose);
		}
		if (options.inferno?.action === 'stats') return infernoStatsCommand(user);
		if (options.birdhouses?.action === 'check') return birdhouseCheckCommand(user);

		// Minion must be free
		const isBusy = await user.minionIsBusy();
		const busyStr = `${user.minionName} is currently busy.`;
		if (isBusy) return busyStr;

		if (options.other) {
			return otherActivitiesCommand(options.other.activity, user, channelId);
		}
		if (options.birdhouses?.action === 'harvest') {
			return birdhouseHarvestCommand(user, channelId, options.birdhouses.birdhouse);
		}
		if (options.inferno?.action === 'start') {
			return infernoStartCommand(user, channelId, Boolean(options.inferno.emerged));
		}
		if (options.plank_make?.action === 'sawmill') {
			return sawmillCommand(
				user,
				options.plank_make.type,
				options.plank_make.quantity,
				channelId,
				options.plank_make.speed
			);
		}
		if (options.plank_make?.action === 'butler') {
			return butlerCommand(user, options.plank_make.type, options.plank_make.quantity, channelId);
		}
		if (options.chompy_hunt?.action === 'start') {
			return chompyHuntCommand(user, channelId);
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
			return camdozaalCommand(user, channelId, options.camdozaal.action, options.camdozaal.quantity);
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
			return fightCavesCommand(user, channelId);
		}
		if (options.aerial_fishing) {
			return aerialFishingCommand(user, channelId);
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
			return alchCommand(
				interaction,
				channelId,
				user,
				options.alch.item,
				options.alch.quantity,
				options.alch.speed
			);
		}
		if (options.puro_puro) {
			return puroPuroStartCommand(user, channelId, options.puro_puro.impling, options.puro_puro.dark_lure);
		}
		if (options.cast) {
			return castCommand(channelId, user, options.cast.spell, options.cast.quantity);
		}
		if (options.underwater) {
			if (options.underwater.agility_thieving) {
				return underwaterAgilityThievingCommand(
					channelId,
					user,
					options.underwater.agility_thieving.training_skill,
					options.underwater.agility_thieving.minutes,
					options.underwater.agility_thieving.no_stams
				);
			}
			if (options.underwater.drift_net_fishing) {
				return driftNetCommand(
					channelId,
					user,
					options.underwater.drift_net_fishing.minutes,
					options.underwater.drift_net_fishing.no_stams
				);
			}
		}

		return 'Invalid command.';
	}
});
