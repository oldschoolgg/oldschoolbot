import { countMagicWordsGuessed } from '@/lib/bso/foolEvent.js';

import { randInt, roll } from '@oldschoolgg/rng';
import type { IMember } from '@oldschoolgg/schemas';
import { increaseNumByPercent, reduceNumByPercent } from '@oldschoolgg/util';
import { Time } from '@sapphire/time-utilities';
import { LRUCache } from 'lru-cache';
import { Bank, LootTable } from 'oldschooljs';

import { BitField, globalConfig, Roles } from '@/lib/constants.js';

const BSO_GENERAL = globalConfig.isProduction ? '792691343284764693' : '851273567416483861';
const WHALE_FOOL_US_RATE = globalConfig.isProduction ? 500 : 15;
const FOOL_RATE = 1;
const WHALE_STARTING_ODDS = globalConfig.isProduction ? 40 : 10;

const NonMemberCache = new LRUCache<string, number>({ max: 1000, ttl: Time.Minute * 60 });

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

	const members: (IMember | null)[] = [null, null];

	let guildPenalty = false;
	if (user.bitfield.includes(BitField.LegitNewPlayer)) {
		if (NonMemberCache.has(user.id)) NonMemberCache.delete(user.id);
	} else {
		if (NonMemberCache.has(user.id)) {
			guildPenalty = true;
		} else {
			try {
				members[0] = await Cache.getMember({ guildId: globalConfig.supportServerID, userId: user.id });
			} catch (_e) {
				NonMemberCache.set(user.id, 1);
				guildPenalty = true;
			}
		}
	}
	if (target.bitfield.includes(BitField.LegitNewPlayer)) {
		if (NonMemberCache.has(target.id)) NonMemberCache.delete(target.id);
	} else {
		if (NonMemberCache.has(target.id)) {
			guildPenalty = true;
		} else {
			try {
				members[1] = await Cache.getMember({ guildId: globalConfig.supportServerID, userId: target.id });
			} catch (_e) {
				NonMemberCache.set(target.id, 1);
				guildPenalty = true;
			}
		}
	}

	let newUserPenalty = false;
	let count = 0;
	for (const testUser of [user, target]) {
		if (testUser.bitfield.includes(BitField.LegitNewPlayer)) continue;
		const accountAge = testUser.accountAgeInDays();
		if (!accountAge || accountAge < 90) {
			const member = members[count++];
			if (!member || !member.roles.includes(Roles.ValidNewUser)) newUserPenalty = true;
		}
	}

	const winner = roll(2) ? user : target;
	let whaleOdds = WHALE_STARTING_ODDS;
	if (newUserPenalty) whaleOdds *= 5;

	let boosted = false;

	if (!newUserPenalty && !winner.cl.has('The whale card')) {
		const wordsGuessed = countMagicWordsGuessed(winner);
		if (wordsGuessed > 3) {
			whaleOdds -= wordsGuessed * 4;
			boosted = true;
			whaleOdds = Math.max(whaleOdds, 3);
		}
	}

	// Total chance is 1 in 200, 10% chance to ping, 10% chance to hit 50% chance for it to be yours.  Only 192 rolls possible at 24/7 gameplay
	const gotWhaled = roll(whaleOdds);
	let ping = false;
	let msg = '';

	if (gotWhaled) {
		if (winner.id === target.id) {
			ping = true;
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

	const penalty: string[] = [];
	if (newUserPenalty && !gotWhaled) {
		penalty.push(` You have a new user penalty!`);
	}
	if (guildPenalty && !gotWhaled) {
		penalty.push(` You have a non-member penalty!`);
	}
	if (penalty.length > 0) {
		msg += `**${penalty.join(' ')} which hurt your chances!**`;
	}
	await winner.addItemsToBank({ items: prize, collectionLog: true });

	if (target.isAdmin()) {
		msg += ` Not sure ${target.username} is going to be very happy about that.`;
		ping = false;
	}
	await globalClient.sendMessageOrWebhook(BSO_GENERAL, {
		content: msg,
		ephemeral: true,
		allowedMentions: ping ? { users: [user.id, target.id] } : { users: [user.id] }
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
			description: 'Probably not a lot of (useful) help today.',
			options: [
				{
					type: 'Boolean',
					name: 'public',
					required: false,
					description: 'Whether to the help/info publicly in  chat - Default is no.'
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'info',
			description: 'Probably not a lot of (useful) info today.',
			options: [
				{
					type: 'Boolean',
					name: 'public',
					required: false,
					description: 'Whether to the help/info publicly in  chat - Default is no.'
				}
			]
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
		const noLimits = (await Cache.getString('adminkeys:fool_us_event:timeout')) === 'on';
		const alwaysSuccess = { success: true, timeRemainingMs: 0 };

		if (options.help || options.info) {
			const ephemeral = Boolean(options.help?.public) || Boolean(options.info?.public) ? undefined : true;
			const count = countMagicWordsGuessed(user);
			const bigString = `You have guessed ${count} magic words so far.
# Instructions:

Use </fool us:1489151141265670195> To guess the "magic words" (hint: \`/fool us guess:magic\`).

Everytime you guess one of the hard-coded magic words, it boosts your drop rate for the (first) The whale card.
Also, every guess has a roll for the card. Even if you don't put anything in.


Use </fool trick_someone:1489151141265670195> to play a trick on or fool another player. You will see the results in #bso-general.
Use </fool fool_someone:1489151141265670195> to play a trick on or fool another player. You will see the results in #bso-general.
*Yes that's intentional ^*

This command, \`/fool info\` or \`/fool help\` no longer count against your cooldowns.

What are the cooldowns?

You can guess a word 5 times every 5 minutes, the 5 minute timer stats as soon as your first guess, not last. So if you only make 3 guesses, it still resets in 5 minutes.

You can play a trick or fool someone 2x every 10 minutes. This has a much more common drop rate for the rare item, and also becomes a basic guarantee if you have at least 12 correctly guessed words/phrases.

Only the first card is a basic guarantee, the others are only slightly improved, and ***no they don't get rarer the more you get!***

# **Public hints:**
*guess hints:*
1. Whale theme - (ie. \`whale\`)
2. Fool Us - TV Show - (ie. \`penn & teller\`)
3. Extroardinary attorney woo.  (ie. \`woo\`)

If you see a New Player message, it means 1 of 2 things:
- Minion < 90 days old
- Minion older than we started tracking start date

New players can ask a mod for the 'New Player' role, which will disable that nerf. This is to stop alts.
Old players can do the same, or just find your oldest bso command in this server and show it to a mod (you need message id, or a link, not a screenshot... We have to put the ID in the command)`;
			return { content: noLimits ? "Don't waste this time asking for help..." : bigString, ephemeral };
		}

		if (options.us) {
			if (user.isAdmin() && options.us.guess && options.us.guess.includes('timeout:')) {
				const timeoutDuration = Number(options.us.guess.split(':')[1]);
				await Cache.setString('adminkeys:fool_us_event:timeout', 'on', timeoutDuration);
				return {
					content: `No limits for ${timeoutDuration} seconds.`,
					ephemeral: true
				};
			}
			const foolUsRatelimit = noLimits ? alwaysSuccess : await Cache.tryRatelimit(user.id, 'foolus_limit');
			if (!foolUsRatelimit.success) {
				return {
					content: `I didn't have time to troll you on this timer, too, so you have ${(foolUsRatelimit.timeRemainingMs / Time.Minute).toFixed(5)} minutes left before you can try to fool me again`,
					ephemeral: true
				};
			}
			if (roll(WHALE_FOOL_US_RATE)) {
				const loot = new Bank();
				loot.add('The whale card');
				await user.addItemsToBank({ items: loot, collectionLog: true });
				return `🐋 Wow you actually did it! You got: ${loot}`;
			}
			if (!options.us.guess) {
				return `Wow you didn't even try to fool us, you fool! Wasted a guess.`;
			}
			const oldCount = countMagicWordsGuessed(user);
			const magicWordsGuessed = [...user.magicWordsGuessed, options.us.guess];
			await user.update({ magic_words_guessed: magicWordsGuessed });

			const newCount = countMagicWordsGuessed(user);
			const foundNew = newCount > oldCount;
			// Tell them the first time
			if (newCount === 1 && foundNew) {
				return `Congratulations! You fooled us for the first time! Good luck figuring out if you do it again XD

Guess was: ${options.us.guess}`;
			} else if (newCount > 0) {
				if (foundNew) {
					return `YOU FOOLED US!

Guess was: ${options.us.guess}`;
				}
				return {
					content:
						'No. You failed. I was going to put you on blast and troll you in front of everyone, but I think this is ok.',
					ephemeral: true
				};
			}

			return { content: 'You have yet to fool us. Good try tho!', ephemeral: true };
		}
		const ratelimit = noLimits ? alwaysSuccess : await Cache.tryRatelimit(user.id, 'event_command_limit');
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
			const content = `Cyr says you can only be an idiot **TWICE** per **20 minutes**. You still to have have to wait ${foolTimeRemaining.toFixed(6)} more minutes... Assuming a minute is ${secondsPerMinute} seconds, of course. Only 50% chance I'm lying :D${hint}`;
			if (roll(10)) {
				return content;
			}
			return {
				content,
				ephemeral: true
			};
		}

		if (options.fool_someone || options.trick_someone) {
			const targetUser = options.fool_someone?.target_user ?? options.trick_someone?.target_user;
			if (!targetUser) {
				return `That's not a valid target, but probably should be? Blame discord.`;
			}
			return fool(user, await mUserFetch(targetUser.user.id));
		}
		return 'Invalid command.';
	}
});
