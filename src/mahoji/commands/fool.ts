import { MagicPhrases } from '@/lib/bso/foolEvent.js';

import { type } from 'node:os';
import { increaseNumByPercent, reduceNumByPercent } from '@oldschoolgg/util/src/index.js';
import type { Snowflake } from '@sapphire/snowflake';
import { Time } from '@sapphire/time-utilities';
import { Bank } from 'oldschooljs';
import { t } from 'tsdown/options-DRXBLnH3';
import { required } from 'zod/mini';

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
import { formatDuration, stringMatches } from '../../../packages/toolkit/src/index.js';

const BSO_GENERAL = '792691343284764693';

async function fool(user: MUser, target: MUser) {
	function countMagicWordsGuessed(user: MUser) {
		const eventData = user.getFoolEventData();
		if (!eventData) return 0;

		return eventData.magicWordsGuessed.filter(w => MagicPhrases.includes(w)).length;
	}
	if (!roll(10)) return { content: 'You failed try again next time.', ephemeral: true };

	const action = roll(2) ? 'fool' : 'trick';
	const userPrize = new Bank();
	const targetPrize = new Bank();

	const winner = roll(2) ? user : target;

	let whaleOdds = 10;

	let boosted = false;

	if (!winner.cl.has('The whale card')) {
		const wordsGuessed = countMagicWordsGuessed(winner);
		if (wordsGuessed > 3) whaleOdds -= Math.min(wordsGuessed, 8);
		boosted = true;
		whaleOdds = Math.min(whaleOdds, 2);
	}

	// Total chance is 1 in 200, 10% chance to ping, 10% chance to hit 50% chance for it to be yours.  Only 192 rolls possible at 24/7 gameplay
	const gotWhaled = roll(whaleOdds);
	let msg = '';

	if (gotWhaled) {
		if (roll(2)) {
			if (target.isIronman) {
				msg = `🐋 <@${user.id}> tried to ${action} you, <@${target.id}> but you won the roll... too bad you're an ironman 😭!`;
			} else {
				msg = `🐋 <@${user.id}> tried to ${action} you, <@${target.id}> but jokes on them! You got The whale card!`;
				targetPrize.add('The whale card');
			}
		} else {
			msg = `🐋 <@${user.id}> successfully ${action}ed you, <@${target.id}> and they won The whale card!`;
			userPrize.add('The whale card');
		}
	} else {
		msg = `😞 <@${user.id}> successfully ${action}ed you, <@${target.id}> and they won The whale card!`;
	}
	if (boosted) {
		msg += ' There was increased luck from guessing correctly!';
	}

	await globalClient.sendMessageOrWebhook(BSO_GENERAL, { content: msg, ephemeral: true });
	return { content: `Success! We're trying to trick ${target.usernameOrMention}`, ephemeral: true };
}

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
			name: 'fool_someone',
			description: 'Fool someone else.',
			options: [
				{
					type: 'User',
					name: 'Target',
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
					name: 'guess',
					description: 'Try to fool us',
					required: false
				}
			]
		}
	],
	run: async ({ options, user }) => {
		if (options.us) {
			const foolUsRatelimit = await Cache.tryRatelimit(user.id, 'foolus_limit');
			if (!foolUsRatelimit.success) {
				return `I didn't have time to troll you on this timer, too, so you have ${foolUsRatelimit.timeRemainingMs / Time.Minute} minutes left before you can try to fool me again`;
			}
			if (roll(500)) {
				const loot = new Bank();
				loot.add('The whale card');
				return `🐋 Wow you actually did it! You got: ${loot}`;
			}
			const guess = options.us.guess;
			if (!guess) {
				return "Wow you didn't even try to fool us, you fool! Wasted a guess.";
			}

			const eventData = user.getFoolEventData();
			if (!eventData) {
			}

			return "You didn't fool us. Worth a try tho!";
		}
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

			let hint = '';
			if (roll(3)) hint = '\n\nOh yea.... there might be a different cooldown for trying to fool us';
			return `Cyr says you can only be an idiot twice per half hour. You still to have have to wait ${foolTimeRemaining} more minutes... Assuming a minute is ${secondsPerMinute} seconds, of course. Only 50% chance I'm lying :D${hint}`;
		}

		if (options.fool_someone || options.trick_someone) {
			const targetUser = options.fool_someone?.Target ?? options.trick_someone?.Target;
			if (!targetUser) {
				return `That's not a valid target, but probably should be? Blame discord.`;
			}
			return fool(user, await mUserFetch(targetUser.user.id));
		}
		if (options.help) {
			return 'April fools! You just wasted a chance...';
		}

		return 'Invalid command.';
	}
});
