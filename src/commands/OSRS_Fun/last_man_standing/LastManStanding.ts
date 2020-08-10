/* eslint-disable @typescript-eslint/unbound-method */
import { chunk, sleep } from '@klasa/utils';
import LastManStandingUsage, { LMS_BLOODBATH, LMS_DAY, LMS_NIGHT } from './LastManStandingUsage';
import { KlasaMessage, Language, CommandStore, Command, KlasaUser } from 'klasa';
import { GuildSettings } from '../../../lib/settings/types/GuildSettings';

export default class extends Command {
	public readonly playing: Set<string> = new Set();
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['lms'],
			requiredPermissions: ['READ_MESSAGE_HISTORY'],
			cooldown: 1,
			description: 'Simulates a game of last man standing',
			usage: '[user:...user]',
			usageDelim: ' ',
			flagSupport: true
		});
	}

	async run(message: KlasaMessage, [contestants = []]: [KlasaUser[]]): Promise<KlasaMessage> {
		const autoFilled = message.flagArgs.autofill;

		if (autoFilled) {
			const messages = await message.channel.messages.fetch({ limit: 100 });

			for (const { author } of messages.values()) {
				if (author && !contestants.includes(author)) contestants.push(author);
			}
		} else if (contestants.length === 0) {
			throw `Please specify some players for Last Man Standing, like so: \`${message.guild!.settings.get(
				GuildSettings.Prefix
			)}lms @Bob @Mark @Jim @Kyra\``;
		}

		const filtered = new Set(contestants);
		if (filtered.size !== contestants.length) throw 'I am sorry, but a user cannot play twice.';
		if (this.playing.has(message.channel.id))
			throw 'I am sorry, but there is a game in progress in this channel, try again when it finishes.';
		if (filtered.size < 2 || filtered.size > 48)
			throw `I am sorry but the amount of players is less than 4 or greater than 48.`;
		this.playing.add(message.channel.id);

		let gameMessage: KlasaMessage | null = null;
		const game: LastManStandingGame = Object.seal({
			bloodbath: true,
			sun: true,
			contestants: this.shuffle([...filtered]),
			turn: 0
		});

		while (game.contestants.size > 1) {
			// If it's not bloodbath and it became the day, increase the turn
			if (!game.bloodbath && game.sun) ++game.turn;
			const events = game.bloodbath ? LMS_BLOODBATH : game.sun ? LMS_DAY : LMS_NIGHT;

			// Main logic of the game
			const { results, deaths } = this.makeResultEvents(game, events);
			const texts = this.buildTexts(message.language, game, results, deaths);

			// Ask for the user to proceed:
			for (const text of texts) {
				// If the channel is not postable, break:
				if (!message.channel.postable) throw 'WTF';

				gameMessage = (await message.channel.send(text)) as KlasaMessage;
				await sleep(Math.max(gameMessage!.content.length / 20, 7) * 1000);

				// Delete the previous message, and if stopped, send stop.
				gameMessage.delete();
			}

			if (game.bloodbath) game.bloodbath = false;
			else game.sun = !game.sun;
		}

		// The match finished with one remaining player
		const winner = game.contestants.values().next().value;
		return message.send(`And the Last Man Standing is... ${winner.username}!`);
	}

	private buildTexts(
		language: Language,
		game: LastManStandingGame,
		results: string[],
		deaths: KlasaUser[]
	) {
		const header = game.bloodbath
			? 'Bloodbath'
			: game.sun
			? `Day ${game.turn}`
			: `Night ${game.turn}`;
		const death = deaths.length
			? `${`**${deaths.length} cannon ${
					deaths.length === 1 ? 'shot' : 'shots'
			  } can be heard in the distance.**`}\n\n${deaths
					.map(d => `- ${d.username}`)
					.join('\n')}`
			: '';
		const panels = chunk(results, 5);

		const texts = panels.map(
			panel => `__**${header}:**__\n\n${panel.map(text => `- ${text}`).join('\n')}`
		);
		if (deaths.length) texts.push(`${death}`);
		return texts;
	}

	private pick(events: readonly LastManStandingUsage[], contestants: number, maxDeaths: number) {
		events = events.filter(
			event => event.contestants <= contestants && event.deaths.size <= maxDeaths
		);
		return events[Math.floor(Math.random() * events.length)];
	}

	private pickcontestants(contestant: KlasaUser, turn: Set<KlasaUser>, amount: number) {
		if (amount === 0) return [];
		if (amount === 1) return [contestant];
		const array = [...turn];
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
		const deaths = [] as KlasaUser[];
		let maxDeaths = this.calculateMaxDeaths(game);

		const turn = new Set([...game.contestants]);
		for (const contestant of game.contestants) {
			// If the player already had its turn, skip
			if (!turn.has(contestant)) continue;

			// Pick a valid event
			const event = this.pick(events, turn.size, maxDeaths);

			// Pick the contestants
			const pickedcontestants = this.pickcontestants(contestant, turn, event.contestants);

			// Delete all the picked contestants from this round
			for (const picked of pickedcontestants) {
				turn.delete(picked);
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

	private shuffle(contestants: KlasaUser[]) {
		let m = contestants.length;
		while (m) {
			const i = Math.floor(Math.random() * m--);
			[contestants[m], contestants[i]] = [contestants[i], contestants[m]];
		}
		return new Set(contestants);
	}

	private calculateMaxDeaths(game: LastManStandingGame) {
		// If there are more than 16 contestants, perform a large blood bath
		return game.contestants.size >= 16
			? // For 16 people, 4 die, 36 -> 6, and so on keeps the game interesting.
			  // If it's in bloodbath, perform 50% more deaths.
			  Math.ceil(Math.sqrt(game.contestants.size) * (game.bloodbath ? 1.5 : 1))
			: // If there are more than 7 contestants, proceed to kill them in 4 or more.
			game.contestants.size > 7
			? // If it's a bloodbath, perform mass death (12 -> 7), else eliminate 4.
			  game.bloodbath
				? Math.ceil(
						Math.min(game.contestants.size - 3, Math.sqrt(game.contestants.size) * 2)
				  )
				: 4
			: // If there are 4 contestants, eliminate 2, else 1 (3 -> 2, 2 -> 1)
			game.contestants.size === 4
			? 2
			: 1;
	}
}

export interface LastManStandingGame {
	bloodbath: boolean;
	sun: boolean;
	contestants: Set<KlasaUser>;
	turn: number;
}
