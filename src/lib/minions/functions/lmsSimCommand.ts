import type { IChannel, IMessage } from '@oldschoolgg/schemas';
import { chunk, sleep } from '@oldschoolgg/toolkit';

import type LastManStandingUsage from '@/lib/structures/LastManStandingUsage.js';
import { LMS_FINAL, LMS_PREP, LMS_ROUND } from '@/lib/structures/LastManStandingUsage.js';

const playing = new Set<string>();

function calculateMaxDeaths(game: LastManStandingGame) {
	return game.prep // have 0 deaths during the preparation phase
		? 0
		: // For 16 people, 5 die, 36 -> 7, and so on keeps the game interesting.
			game.contestants.size >= 16
			? Math.ceil(Math.sqrt(game.contestants.size) + 1)
			: // If there are more than 7 contestants, proceed to kill them in 4s.
				game.contestants.size > 7
				? 4
				: // If there are more than 3 contestants, eliminate 2, else 1 (3 -> 2, 2 -> 1)
					game.contestants.size > 3
					? 2
					: 1;
}

function shuffle(contestants: string[]) {
	let m = contestants.length;
	while (m) {
		const i = Math.floor(Math.random() * m--);
		[contestants[m], contestants[i]] = [contestants[i], contestants[m]];
	}
	return new Set(contestants);
}

function makeResultEvents(game: LastManStandingGame, events: readonly LastManStandingUsage[]) {
	const results = [] as string[];
	const deaths = [] as string[];
	let maxDeaths = calculateMaxDeaths(game);

	const round = new Set([...game.contestants]);
	for (const contestant of game.contestants) {
		// If the player already had its round, skip
		if (!round.has(contestant)) continue;

		// Pick a valid event
		const event = pick(events, round.size, maxDeaths);

		// Pick the contestants
		const pickedcontestants = pickcontestants(contestant, round, event.contestants);

		// Delete all the picked contestants from this round
		for (const picked of pickedcontestants) {
			round.delete(picked);
		}

		// Kill all the unfortunate contestants
		for (const death of event.deaths) {
			game.contestants.delete(pickedcontestants[death]);
			deaths.push(pickedcontestants[death]);
			maxDeaths--;
		}

		// Push the result of this match
		results.push(event.display(...pickedcontestants));
	}

	return { results, deaths };
}

function buildTexts(game: LastManStandingGame, results: string[], deaths: string[]) {
	const header = game.prep ? 'Preparation' : game.final ? `Finals, Round: ${game.round}` : `Round: ${game.round}`;
	const death =
		deaths.length > 0
			? `${`**${deaths.length} new gravestone${
					deaths.length === 1 ? ' litters' : 's litter'
				} the battlefield.**`}\n\n${deaths.map(d => `- ${d}`).join('\n')}`
			: '';
	const panels = chunk(results, 5);

	const texts = panels.map(
		panel => `**Last Man Standing ${header}:**\n\n${panel.map(text => `- ${text}`).join('\n')}`
	);
	if (deaths.length > 0) texts.push(`${death}`);
	return texts;
}

function pick(events: readonly LastManStandingUsage[], contestants: number, maxDeaths: number) {
	events = events.filter(event => event.contestants <= contestants && event.deaths.size <= maxDeaths);
	return events[Math.floor(Math.random() * events.length)];
}

function pickcontestants(contestant: string, round: Set<string>, amount: number) {
	if (amount === 0) return [];
	if (amount === 1) return [contestant];
	const array = [...round];
	array.splice(array.indexOf(contestant), 1);

	let m = array.length;
	while (m) {
		const i = Math.floor(Math.random() * m--);
		[array[m], array[i]] = [array[i], array[m]];
	}
	array.unshift(contestant);
	return array.slice(0, amount);
}

export async function lmsSimCommand(channel: IChannel | undefined, names?: string) {
	if (!channel || !channel.guild_id) return;
	let userIds = new Set<string>();
	const splitContestants = names ? names.split(',') : [];
	// Autofill using authors from the last 100 messages, if none are given to the command
	if (names === 'auto' || !names || splitContestants.length === 0) {
		const messages = await globalClient.fetchChannelMessages(channel.id, { limit: 100 });

		for (const { author_id } of messages) {
			if (!userIds.has(author_id)) userIds.add(author_id);
		}
	} else {
		userIds = new Set(splitContestants);
		if (userIds.size !== splitContestants.length) {
			return globalClient.sendMessage(channel.id, 'I am sorry, but a user cannot play twice.');
		}

		if (userIds.size < 4) {
			return globalClient.sendMessage(
				channel.id,
				'Please specify at least 4 players for Last Man Standing, like so: `+lms Alex, Kyra, Magna, Rick`, or type `+lms auto` to automatically pick people from the chat.'
			);
		}

		if (userIds.size > 48) {
			return globalClient.sendMessage(
				channel.id,
				'I am sorry but the amount of players can be no greater than 48.'
			);
		}
	}

	if (playing.has(channel.guild_id)) {
		return globalClient.sendMessage(
			channel.id,
			'There is a game in progress in this server already, try again when it finishes.'
		);
	}

	playing.add(channel.guild_id);

	let gameMessage: IMessage | null = null;
	const game: LastManStandingGame = Object.seal({
		prep: true,
		final: false,
		contestants: new Set(await Cache.getBadgedUsernames(Array.from(shuffle([...userIds])))),
		round: 0
	});

	while (game.contestants.size > 1) {
		// If it's not prep, increase the round
		if (!game.prep) ++game.round;
		const events = game.prep ? LMS_PREP : game.final ? LMS_FINAL : LMS_ROUND;

		// Main logic of the game
		const { results, deaths } = makeResultEvents(game, events);
		const texts = buildTexts(game, results, deaths);

		// Ask for the user to proceed:
		for (const text of texts) {
			gameMessage = await globalClient.sendMessage(channel.id, { content: text });
			await sleep(Math.max(gameMessage?.content.length / 20, 7) * 700);

			// Delete the previous message, and if stopped, send stop.
			await globalClient.deleteMessage(channel.id, gameMessage.id);
		}

		if (game.prep) game.prep = false;
		else if (game.contestants.size < 4) game.final = true;
	}

	// The match finished with one remaining player
	const winner = game.contestants.values().next().value;
	playing.delete(channel.guild_id);
	return globalClient.sendMessage(channel.id, {
		content: `And the Last Man Standing is... **${winner}**!`,
		allowedMentions: { parse: [], users: [] }
	});
}

interface LastManStandingGame {
	prep: boolean;
	final: boolean;
	contestants: Set<string>;
	round: number;
}
