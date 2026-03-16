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
			return 'April fools! You just wasted one of your trips. I might give out hints later.'
		}



		return 'Invalid command.';
	}
});
