import {
	countMagicWordsGuessed,
	countMagicWordsSimple,
	foolListMatchingWords,
	foolMakeHelpMessage,
	MagicPhrases
} from '@/lib/bso/foolEvent.js';

import { EmbedBuilder } from '@oldschoolgg/discord';
import { randInt, roll } from '@oldschoolgg/rng';
import type { IMember } from '@oldschoolgg/schemas';
import { formatDuration } from '@oldschoolgg/toolkit';
import { increaseNumByPercent, reduceNumByPercent } from '@oldschoolgg/util';
import { Time } from '@sapphire/time-utilities';
import { LRUCache } from 'lru-cache';
import { Bank, LootTable } from 'oldschooljs';

import { choicesOf } from '@/discord/index.js';
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
				msg = `🚨🐋🌟 <@${user.id}> is going to cry..., <@${target.id}> won the roll... but they're an ironman 😭! I guess Cyr will just keep it...`;
			} else {
				prize.add('The whale card');
				msg = `🐋😞 <@${user.id}> tried to ${action} you, <@${target.id}> but jokes on them! YOU (not the ${action}er) got ${prize}! 😂`;
			}
		} else {
			prize.add('The whale card');
			msg = `🐋 <@${user.id}> successfully ${action}ed you, <@${target.id}> and they won ${prize}!`;
		}
	} else {
		if (target.isIronman) {
			msg = `🚨🌟  <@${user.id}> is going to cry..., <@${target.id}> won the roll... but they're an ironman 😭! I guess Cyr will just keep it...`;
		} else {
			prize.add(junkTable.roll());
			if (winner.id === target.id) {
				msg = `😞 <@${user.id}> successfully ${action}ed you, <@${target.id}>, but jokes on them, because you won... ${prize}!`;
			} else {
				msg = `😞 <@${user.id}> successfully ${action}ed you, <@${target.id}> and they won ${prize}!`;
			}
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
		allowedMentions: ping ? { users: [user.id, target.id] } : { users: [user.id] }
	});
	return { content: `See what happens?`, ephemeral: true };
}

export const foolInfoArgs: string[] = ['help', 'count', 'all_guesses', 'correct_guesses', 'leaderboard'];
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
					type: 'String',
					name: 'info_type',
					required: false,
					description: 'The type of info you want to see.',
					choices: choicesOf(foolInfoArgs)
				},
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
					type: 'String',
					name: 'info_type',
					required: false,
					description: 'The type of info you want to see.',
					choices: choicesOf(foolInfoArgs)
				},
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
			if (ephemeral !== true) {
				const spamLimit = await Cache.tryRatelimit(user.id, 'help_spam_limit');
				if (!spamLimit.success) {
					return {
						content: `You can only use public visibility once per 30 minutes. Time remaining: ${formatDuration(spamLimit.timeRemainingMs / Time.Second)}. Try again without public:true`,
						ephemeral: true
					};
				}
			}
			const action = options.help?.info_type ?? options.info?.info_type ?? 'help';
			const count = countMagicWordsGuessed(user);
			switch (action) {
				case 'help': {
					const bigString = foolMakeHelpMessage(count);
					return { content: noLimits ? "Don't waste this time asking for help..." : bigString, ephemeral };
				}
				case 'count': {
					return {
						content: `You have guessed ${count} of the ${MagicPhrases.length} words/phrases.`,
						ephemeral
					};
				}
				case 'all_guesses': {
					const guesses = user.magicWordsGuessed;
					if (guesses.length === 0) {
						return { content: 'You have not guessed any words yet.', ephemeral };
					}
					const guessString = guesses.join('\n');
					return {
						content: `You have ${count} correct guesses, and your full guess list is: \`\`\`\n${guessString}\n\`\`\``,
						ephemeral
					};
				}
				case 'correct_guesses': {
					const correctGuesses = foolListMatchingWords(user.magicWordsGuessed);
					return {
						content: `You have ${count} correct guesses, and your correct guesses are: \`\`\`\n${correctGuesses.join('\n')}\n\`\`\``,
						ephemeral
					};
				}
				case 'leaderboard': {
					const users = await prisma.$queryRawUnsafe<
						{ id: string; username: string; magic_words_guessed: string[]; word_count: number }[]
					>(
						`select id, COALESCE(username, 'Unknown') as username , magic_words_guessed,  cardinality (magic_words_guessed) as word_count from users where cardinality (magic_words_guessed) > 30 order by 4 desc limit 100`
					);
					const leaders = users
						.map(u => {
							return {
								id: u.id,
								username: u.username,
								correct_guesses: countMagicWordsSimple(u.magic_words_guessed),
								word_count: u.word_count
							};
						})
						.sort((a, b) => b.correct_guesses - a.correct_guesses)
						.slice(0, 10);

					const leaderString =
						'User - Correct - Total\n' +
						leaders.map(u => `${u.username} - ${u.correct_guesses} - ${u.word_count}`).join('\n');
					return {
						embeds: [new EmbedBuilder().setTitle(`**Fool Guesses:**`).setDescription(leaderString)],
						ephemeral
					};
				}
			}
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
