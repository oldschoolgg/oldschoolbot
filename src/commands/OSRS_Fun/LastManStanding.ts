import { chunk, sleep } from '@klasa/utils';
import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/structures/BotCommand';
import LastManStandingUsage, { LMS_FINAL, LMS_PREP, LMS_ROUND } from '../../lib/structures/LastManStandingUsage';
import { cleanMentions } from '../../lib/util';

export default class extends BotCommand {
	public readonly playing: Set<string> = new Set();
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['lms'],
			requiredPermissionsForBot: ['READ_MESSAGE_HISTORY'],
			cooldown: 5,
			oneAtTime: true,
			description: 'Simulates a game of last man standing',
			usage: '[contestants:string]',
			usageDelim: '',
			flagSupport: true,
			categoryFlags: ['fun', 'simulation'],
			examples: ['+lms', '+lms Mod Ash, Mod Mark, Mod Huskyy']
		});
	}

	async run(message: KlasaMessage, [contestants]: [string | undefined]): Promise<KlasaMessage> {
		let filtered = new Set<string>();
		const splitContestants = contestants ? cleanMentions(message.guild, contestants).split(',') : [];
		// Autofill using authors from the last 100 messages, if none are given to the command
		if (contestants === 'auto') {
			const messages = await message.channel.messages.fetch({ limit: 100 });

			for (const { author } of messages.values()) {
				const name = cleanMentions(message.guild, author.username);
				if (!filtered.has(name)) filtered.add(name);
			}
		} else {
			filtered = new Set(splitContestants);
			if (filtered.size !== splitContestants.length) {
				throw 'I am sorry, but a user cannot play twice.';
			}

			if (filtered.size < 4) {
				throw `Please specify atleast 4 players for Last Man Standing, like so: \`${message.cmdPrefix}lms Alex, Kyra, Magna, Rick\`, or type \`${message.cmdPrefix}lms auto\` to automatically pick people from the chat.`;
			}

			if (filtered.size > 48) {
				throw 'I am sorry but the amount of players can be no greater than 48.';
			}
		}

		if (this.playing.has(message.channel.id)) {
			throw 'There is a game in progress in this channel already, try again when it finishes.';
		}

		this.playing.add(message.channel.id);

		let gameMessage: KlasaMessage | null = null;
		const game: LastManStandingGame = Object.seal({
			prep: true,
			final: false,
			contestants: this.shuffle([...filtered]),
			round: 0
		});

		while (game.contestants.size > 1) {
			// If it's not prep, increase the round
			if (!game.prep) ++game.round;
			const events = game.prep ? LMS_PREP : game.final ? LMS_FINAL : LMS_ROUND;

			// Main logic of the game
			const { results, deaths } = this.makeResultEvents(game, events);
			const texts = this.buildTexts(game, results, deaths);

			// Ask for the user to proceed:
			for (const text of texts) {
				// If the channel is not postable, break:
				if (!message.channel.postable) throw 'WTF';

				gameMessage = (await message.channel.send(text)) as KlasaMessage;
				await sleep(Math.max(gameMessage!.content.length / 20, 7) * 1000);

				// Delete the previous message, and if stopped, send stop.
				gameMessage.delete();
			}

			if (game.prep) game.prep = false;
			else if (game.contestants.size < 4) game.final = true;
		}

		// The match finished with one remaining player
		const winner = game.contestants.values().next().value;
		this.playing.delete(message.channel.id);
		return message.channel.send(`And the Last Man Standing is... **${winner}**!`);
	}

	private buildTexts(game: LastManStandingGame, results: string[], deaths: string[]) {
		const header = game.prep ? 'Preparation' : game.final ? `Finals, Round: ${game.round}` : `Round: ${game.round}`;
		const death = deaths.length
			? `${`**${deaths.length} new gravestone${
					deaths.length === 1 ? ' litters' : 's litter'
			  } the battlefield.**`}\n\n${deaths.map(d => `- ${d}`).join('\n')}`
			: '';
		const panels = chunk(results, 5);

		const texts = panels.map(
			panel => `**Last Man Standing ${header}:**\n\n${panel.map(text => `- ${text}`).join('\n')}`
		);
		if (deaths.length) texts.push(`${death}`);
		return texts;
	}

	private pick(events: readonly LastManStandingUsage[], contestants: number, maxDeaths: number) {
		events = events.filter(event => event.contestants <= contestants && event.deaths.size <= maxDeaths);
		return events[Math.floor(Math.random() * events.length)];
	}

	private pickcontestants(contestant: string, round: Set<string>, amount: number) {
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

	private makeResultEvents(game: LastManStandingGame, events: readonly LastManStandingUsage[]) {
		const results = [] as string[];
		const deaths = [] as string[];
		let maxDeaths = this.calculateMaxDeaths(game);

		const round = new Set([...game.contestants]);
		for (const contestant of game.contestants) {
			// If the player already had its round, skip
			if (!round.has(contestant)) continue;

			// Pick a valid event
			const event = this.pick(events, round.size, maxDeaths);

			// Pick the contestants
			const pickedcontestants = this.pickcontestants(contestant, round, event.contestants);

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

	private shuffle(contestants: string[]) {
		let m = contestants.length;
		while (m) {
			const i = Math.floor(Math.random() * m--);
			[contestants[m], contestants[i]] = [contestants[i], contestants[m]];
		}
		return new Set(contestants);
	}

	private calculateMaxDeaths(game: LastManStandingGame) {
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
}

export interface LastManStandingGame {
	prep: boolean;
	final: boolean;
	contestants: Set<string>;
	round: number;
}
