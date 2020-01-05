import { KlasaClient, CommandStore, KlasaMessage } from 'klasa';
import { TextChannel } from 'discord.js';

import { triviaQuestions } from '../../../resources/trivia-questions.json';
import { BotCommand } from '../../lib/BotCommand.js';
import { Time, Emoji, SupportServer, Channel } from '../../lib/constants.js';
import { roll, rand, formatDuration } from '../../../config/util.js';
import * as pets from '../../../data/pets';
import clueTiers from '../../lib/clueTiers';
import { randomItemFromArray, addArrayOfItemsToBank } from '../../lib/util.js';

const easyTrivia = triviaQuestions.slice(0, 40);

const options = {
	max: 1,
	time: 13000,
	errors: ['time']
};

export default class DailyCommand extends BotCommand {
	private cache: Set<string>;

	public constructor(
		client: KlasaClient,
		store: CommandStore,
		file: string[],
		directory: string
	) {
		super(client, store, file, directory, { altProtection: true, cooldown: 5 });
		this.cache = new Set();
	}

	async run(msg: KlasaMessage) {
		if (this.cache.has(msg.author.id)) return;
		this.cache.add(msg.author.id);

		await msg.author.settings.sync();
		const currentDate = new Date().getTime();
		const lastVoteDate = msg.author.settings.get('lastDailyTimestamp');
		const difference = currentDate - lastVoteDate;

		if (difference >= Time.Hour * 12) {
			await msg.author.settings.update('lastDailyTimestamp', currentDate);

			const trivia = easyTrivia[Math.floor(Math.random() * easyTrivia.length)];

			await msg.channel.send(`**Daily Trivia:** ${trivia.q}`);
			try {
				const collected = await msg.channel.awaitMessages(
					answer =>
						answer.author.id === msg.author.id &&
						trivia.a.includes(answer.content.toLowerCase()),
					options
				);
				const winner = collected.first();
				if (winner) await this.reward(msg, true);
			} catch (err) {
				await this.reward(msg, false);
			}
			this.cache.delete(msg.author.id);
		} else {
			this.cache.delete(msg.author.id);

			const duration = formatDuration(Date.now() - (lastVoteDate + Time.Hour * 12));

			return msg.send(`You can claim your next daily in ${duration}.`);
		}
	}

	async reward(msg: KlasaMessage, triviaCorrect: boolean) {
		const user = msg.author;
		const guild = this.client.guilds.get(SupportServer);
		if (!guild) return;
		const member = await guild.members.fetch(user).catch(() => null);

		let amount = rand(500_000, 5_000_000);
		const bonuses = [];

		const currentDate = new Date();
		if (currentDate.getDay() === 6 || currentDate.getDay() === 0) {
			amount *= 2;
			bonuses.push(Emoji.MoneyBag);
		}

		if (member) {
			amount = Math.floor(amount * 1.5);
			bonuses.push(Emoji.OSBot);
		}

		if (roll(73)) {
			amount = Math.floor(amount * 1.73);
			bonuses.push(Emoji.Joy);
		}

		if (roll(5000)) {
			if (roll(2)) {
				bonuses.push(Emoji.Bpaptu);
			} else {
				amount += 1_000_000_000;
				bonuses.push(Emoji.Diamond);
			}
		}

		if (!triviaCorrect) {
			amount = Math.floor(amount * 0.5);
		}

		await msg.author.settings.sync(true);
		let bank = msg.author.settings.get('bank');
		const [caskets, casketNames] = this.pickRandomCaskets(triviaCorrect);
		bank = addArrayOfItemsToBank(bank, caskets);
		await msg.author.settings.update('bank', bank);

		let chStr = `${bonuses.join('')} ${
			user.username
		} just got their daily and received ${amount.toLocaleString()} GP! <:Smiley:420283725469974529>`;

		const correct = triviaCorrect ? 'correctly' : 'incorrectly';

		let dmStr = `${bonuses.join('')} You answered **${correct}** and received...\n`;
		dmStr += `\nThe following clue caskets: ${casketNames.join(', ')}`;

		if (triviaCorrect && roll(13)) {
			const pet = pets[Math.floor(Math.random() * pets.length)];
			const userPets = user.settings.get('pets');
			if (!userPets[pet.id]) userPets[pet.id] = 1;
			else userPets[pet.id]++;

			user.settings.update('pets', { ...userPets });

			chStr += `\nThey also received the **${pet.name}** pet! ${pet.emoji}`;
			dmStr += `\n**${pet.name}** pet! ${pet.emoji}`;
		}

		const channel = this.client.channels.get(Channel.Notifications);
		if (channel) (channel as TextChannel).send(chStr);

		// @ts-ignore
		const gpImage = this.client.commands.get('bank').generateImage(amount);

		msg.send(dmStr, gpImage).catch(() => null);
		user.settings.update('GP', user.settings.get('GP') + amount);
	}

	pickRandomCaskets(triviaCorrect: boolean): [number[], string[]] {
		const result = [];
		const amountToGet = triviaCorrect ? rand(2, 4) : 1;

		const textResult = [];

		for (let i = 0; i < amountToGet; i++) {
			const tier = randomItemFromArray(clueTiers) as any;
			result.push(tier.id);
			textResult.push(tier.name);
		}

		return [result, textResult];
	}
}
