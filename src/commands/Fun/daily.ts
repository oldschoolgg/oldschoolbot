import { CommandStore, KlasaMessage } from 'klasa';
import { TextChannel } from 'discord.js';

import { triviaQuestions } from '../../../resources/trivia-questions.json';
import { BotCommand } from '../../lib/BotCommand.js';
import { Time, Emoji, SupportServer, Channel } from '../../lib/constants.js';
import * as pets from '../../../data/pets';
import { randomHappyEmoji, isWeekend, formatDuration, rand, roll } from '../../lib/util.js';
import { UserSettings } from '../../lib/UserSettings.js';
import { ClientSettings } from '../../lib/ClientSettings.js';

const easyTrivia = triviaQuestions.slice(0, 40);

const options = {
	max: 1,
	time: 13000,
	errors: ['time']
};

export default class DailyCommand extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 5
		});
	}

	async run(msg: KlasaMessage) {
		await msg.author.settings.sync();
		const currentDate = new Date().getTime();
		const lastVoteDate = msg.author.settings.get(UserSettings.LastDailyTimestamp);
		const difference = currentDate - lastVoteDate;

		if (difference >= Time.Hour * 12) {
			await msg.author.settings.update(UserSettings.LastDailyTimestamp, currentDate);

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
				if (winner) return this.reward(msg, true);
			} catch (err) {
				return this.reward(msg, false);
			}
		} else {
			const duration = formatDuration(Date.now() - (lastVoteDate + Time.Hour * 12));

			return msg.send(`You can claim your next daily in ${duration}.`);
		}
	}

	async reward(msg: KlasaMessage, triviaCorrect: boolean) {
		const user = msg.author;
		if (Date.now() - user.createdTimestamp < Time.Month) {
			user.log(`[NAC-DAILY]`);
		}

		const guild = this.client.guilds.get(SupportServer);
		if (!guild) return;
		const member = await guild.members.fetch(user).catch(() => null);

		let amount = rand(1_000_000, 6_000_000);
		const bonuses = [];

		if (isWeekend()) {
			amount *= 2;
			bonuses.push(Emoji.MoneyBag);
		}

		if (member) {
			amount = Math.floor(amount * 1.5);
			bonuses.push(Emoji.OSBot);
		}

		if (msg.author.hasMinion) {
			amount /= 4;
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

		let chStr = `${bonuses.join('')} ${
			user.username
		} just got their daily and received ${amount.toLocaleString()} GP! ${randomHappyEmoji()}`;

		const correct = triviaCorrect ? 'correctly' : 'incorrectly';

		let dmStr = `${bonuses.join('')} You answered **${correct}** and received...\n`;

		if (triviaCorrect && roll(13)) {
			const pet = pets[Math.floor(Math.random() * pets.length)];
			const userPets = { ...user.settings.get(UserSettings.Pets) };
			if (!userPets[pet.id]) userPets[pet.id] = 1;
			else userPets[pet.id]++;

			await user.settings.update('pets', { ...userPets });

			chStr += `\nThey also received the **${pet.name}** pet! ${pet.emoji}`;
			dmStr += `\n**${pet.name}** pet! ${pet.emoji}`;
		}

		const dailiesAmount = this.client.settings.get(ClientSettings.EconomyStats.DailiesAmount);
		const dividedAmount = amount / 1_000_000;
		this.client.settings.update(
			ClientSettings.EconomyStats.DailiesAmount,
			Math.floor(dailiesAmount + Math.round(dividedAmount * 100) / 100)
		);

		const channel = this.client.channels.get(Channel.Notifications);
		if (channel) (channel as TextChannel).send(chStr);

		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore
		const gpImage = this.client.commands.get('bank').generateImage(amount);

		await user.settings.update(UserSettings.GP, user.settings.get(UserSettings.GP) + amount);
		return msg.send(dmStr, gpImage).catch(() => null);
	}
}
