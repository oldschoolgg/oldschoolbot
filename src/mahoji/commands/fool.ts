import { countMagicWordsGuessed } from '@/lib/bso/foolEvent.js';

import { randInt, roll } from '@oldschoolgg/rng';
import { increaseNumByPercent, reduceNumByPercent } from '@oldschoolgg/util';
import { Time } from '@sapphire/time-utilities';
import { Bank, LootTable } from 'oldschooljs';

import { globalConfig } from '@/lib/constants.js';

const BSO_GENERAL = globalConfig.isProduction ? '792691343284764693' : '851273567416483861';
const WHALE_FOOL_US_RATE = globalConfig.isProduction ? 500 : 3;
const FOOL_RATE = globalConfig.isProduction ? 8 : 3;
const WHALE_STARTING_ODDS = globalConfig.isProduction ? 15 : 2;

const junkTable = new LootTable()
	.add('Cannonball', [1, 9], 10)
	.add('Coins', [1, 1000], 10)
	.add('Bucket', 1, 10)
	.add('Clue scroll (elite)', 1, 3)
	.add('Clue scroll (master)', 1, 1)
	.tertiary(5, 'Clue scroll (grandmaster)')
	.tertiary(10, 'Elder scroll piece');

async function fool(user: MUser, target: MUser) {
	if (!roll(FOOL_RATE)) {
		const failMsgs = [
			'Skill issue',
			'Working as intended',
			'You failed, try again next time',
			'Oooh so close, but nope'
		];
		const content = failMsgs[randInt(0, failMsgs.length - 1)];
		return { content, ephemeral: true };
	}

	if (target.id === user.id) {
		const content = "You can't fool yourself, you fool!";
		return { content };
	}

	const action = roll(2) ? 'fool' : 'trick';
	const prize = new Bank();

	const winner = roll(2) ? user : target;

	let whaleOdds = WHALE_STARTING_ODDS;

	let boosted = false;

	if (!winner.cl.has('The whale card')) {
		const wordsGuessed = countMagicWordsGuessed(winner);
		if (wordsGuessed > 3) {
			whaleOdds -= Math.min(wordsGuessed, 8);
			boosted = true;
			whaleOdds = Math.max(whaleOdds, 3);
		}
	}

	// Total chance is 1 in 200, 10% chance to ping, 10% chance to hit 50% chance for it to be yours.  Only 192 rolls possible at 24/7 gameplay
	const gotWhaled = roll(whaleOdds);
	let msg = '';

	if (gotWhaled) {
		if (winner.id === target.id) {
			if (target.isIronman) {
				msg = `🐋 <@${user.id}> tried to ${action} you, <@${target.id}> but you won the roll... too bad you're an ironman 😭!`;
			} else {
				prize.add('The whale card');
				msg = `🐋 <@${user.id}> tried to ${action} you, <@${target.id}> but jokes on them! You got ${prize}!`;
			}
		} else {
			prize.add('The whale card');
			msg = `🐋 <@${user.id}> successfully ${action}ed you, <@${target.id}> and they won ${prize}!`;
		}
	} else {
		prize.add(junkTable.roll());
		if (winner.id === target.id) {
			msg = `😞 <@${user.id}> successfully ${action}ed you, <@${target.id}>, but jokes on them, because you won... ${prize}!`;
		} else {
			msg = `😞 <@${user.id}> successfully ${action}ed you, <@${target.id}> and they won ${prize}!`;
		}
	}
	if (boosted) {
		msg += ` There was increased luck from ${winner}'s correct guesses!`;
	}

	await winner.addItemsToBank({ items: prize, collectionLog: true });

	let ping = true;
	if (target.isAdmin()) {
		msg += ` Not sure ${target.username} is going to be very happy about that.`;
		ping = false;
	}
	await globalClient.sendMessageOrWebhook(BSO_GENERAL, {
		content: msg,
		ephemeral: true,
		allowedMentions: ping ? undefined : { users: [user.id] }
	});
	return { content: `See what happens?`, ephemeral: true };
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
					name: 'target_user',
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
					name: 'target_user',
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
				return `I didn't have time to troll you on this timer, too, so you have ${(foolUsRatelimit.timeRemainingMs / Time.Minute).toFixed(5)} minutes left before you can try to fool me again`;
			}
			if (roll(WHALE_FOOL_US_RATE)) {
				const loot = new Bank();
				loot.add('The whale card');
				return `🐋 Wow you actually did it! You got: ${loot}`;
			}
			if (!options.us.guess) {
				return "Wow you didn't even try to fool us, you fool! Wasted a guess.";
			}
			const oldCount = countMagicWordsGuessed(user);
			const magicWordsGuessed = [...user.magicWordsGuessed, options.us.guess];
			await user.update({ magic_words_guessed: magicWordsGuessed });

			const newCount = countMagicWordsGuessed(user);
			// Tell them the first time
			if (newCount === 1 && newCount > oldCount) {
				return 'Congratulations! You fooled us for the first time! Good luck figuring out if you do it again XD';
			} else if (newCount > 0) {
				if (newCount > oldCount && roll(3)) {
					return "I won't usually tell you, but this time I'll say it... YOU FOOLED US!";
				}
				return 'You have definitely fooled us once, but fool us twice?';
			}

			return 'You have yet to fool us. Good try tho!';
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
			if (roll(10)) hint = '\n\nOh yea.... there might be a different cooldown for trying to fool us';
			return `Cyr says you can only be an idiot **thrice** per half hour. You still to have have to wait ${foolTimeRemaining.toFixed(6)} more minutes... Assuming a minute is ${secondsPerMinute} seconds, of course. Only 50% chance I'm lying :D${hint}`;
		}

		if (options.fool_someone || options.trick_someone) {
			const targetUser = options.fool_someone?.target_user ?? options.trick_someone?.target_user;
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
