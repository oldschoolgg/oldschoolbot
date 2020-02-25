import { CommandStore, KlasaMessage } from 'klasa';
import { TextChannel, MessageAttachment } from 'discord.js';
import * as fs from 'fs';

if (!fs.existsSync('./resources/trivia-questions.json')) {
	fs.writeFileSync(
		'./resources/trivia-questions.json',
		JSON.stringify(
			{
				triviaQuestions: []
			},
			null,
			4
		)
	);
	console.log(`Created empty trivia questions file at ./resources/trivia-questions.json`);
}

const { triviaQuestions } = JSON.parse(
	fs.readFileSync('./resources/trivia-questions.json').toString()
);

import { BotCommand } from '../../lib/BotCommand';
import { Time, Emoji, SupportServer, Channel, COINS_ID } from '../../lib/constants';
import * as pets from '../../../data/pets';
import { randomHappyEmoji, isWeekend, formatDuration, roll } from '../../lib/util';
import { UserSettings } from '../../lib/UserSettings';
import { ClientSettings } from '../../lib/ClientSettings';
import dailyRoll from '../../lib/dailyTable';
import { transformArrayOfResolvableItems } from '../../lib/util/transformArrayOfResolvableItems';

const easyTrivia = triviaQuestions!.slice(0, 40);

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

		// If they have already claimed a daily in the past 12h
		if (difference < Time.Hour * 12) {
			const duration = formatDuration(Date.now() - (lastVoteDate + Time.Hour * 12));

			return msg.send(
				`**${Emoji.Diango} Diango says...** You can claim your next daily in ${duration}.`
			);
		}

		await msg.author.settings.update(UserSettings.LastDailyTimestamp, currentDate);

		const trivia = easyTrivia[Math.floor(Math.random() * easyTrivia.length)];

		await msg.channel.send(`**${Emoji.Diango} Diango asks...** ${trivia.q}`);
		try {
			const collected = await msg.channel.awaitMessages(
				answer =>
					answer.author.id === msg.author.id &&
					answer.content &&
					trivia.a.includes(answer.content.toLowerCase()),
				options
			);
			const winner = collected.first();
			if (winner) return this.reward(msg, true);
		} catch (err) {
			return this.reward(msg, false);
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

		const loot = dailyRoll(1, triviaCorrect);

		const bonuses = [];

		if (isWeekend()) {
			loot[COINS_ID] *= 2;
			bonuses.push(Emoji.MoneyBag);
		}

		if (member) {
			loot[COINS_ID] = Math.floor(loot[COINS_ID] * 1.5);
			bonuses.push(Emoji.OSBot);
		}

		if (msg.author.hasMinion) {
			loot[COINS_ID] /= 1.5;
		}

		if (roll(73)) {
			loot[COINS_ID] = Math.floor(loot[COINS_ID] * 1.73);
			bonuses.push(Emoji.Joy);
		}

		if (roll(5000)) {
			if (roll(2)) {
				bonuses.push(Emoji.Bpaptu);
			} else {
				loot[COINS_ID] += 1_000_000_000;
				bonuses.push(Emoji.Diamond);
			}
		}

		if (!triviaCorrect) {
			loot[COINS_ID] = Math.floor(loot[COINS_ID] * 0.4);
		}

		// Ensure amount of GP is an integer
		loot[COINS_ID] = Math.floor(loot[COINS_ID]);

		const correct = triviaCorrect ? 'correct' : 'incorrect';
		const reward = triviaCorrect
			? "I've picked you some random items as a reward..."
			: 'Even though you got it wrong, heres a little reward...';

		let dmStr = `${bonuses.join('')} **${
			Emoji.Diango
		} Diango says..** That's ${correct}! ${reward}\n`;

		const holidayItems = transformArrayOfResolvableItems([
			'Cow mask',
			'Cow top',
			'Cow trousers',
			'Cow gloves',
			'Cow shoes'
		]);

		const bank = user.settings.get(UserSettings.Bank);
		for (const item of holidayItems) {
			if (bank[item]) continue;
			loot[item] = 1;
			dmStr += `${Emoji.BirthdayPresent} **You've received a Holiday Item for the birthday of OSRS!**\n`;
			break;
		}

		let chStr = `${bonuses.join('')} ${user.username} just got their daily and received ${loot[
			COINS_ID
		].toLocaleString()} GP! ${randomHappyEmoji()}`;

		if (triviaCorrect && roll(13)) {
			const pet = pets[Math.floor(Math.random() * pets.length)];
			const userPets = { ...user.settings.get(UserSettings.Pets) };
			if (!userPets[pet.id]) userPets[pet.id] = 1;
			else userPets[pet.id]++;

			await msg.author.settings.sync(true);
			await user.settings.update(UserSettings.Pets, { ...userPets });

			chStr += `\nThey also received the **${pet.name}** pet! ${pet.emoji}`;
			dmStr += `\n**${pet.name}** pet! ${pet.emoji}`;
		}

		const dailiesAmount = this.client.settings.get(ClientSettings.EconomyStats.DailiesAmount);
		const dividedAmount = loot[COINS_ID] / 1_000_000;
		this.client.settings.update(
			ClientSettings.EconomyStats.DailiesAmount,
			Math.floor(dailiesAmount + Math.round(dividedAmount * 100) / 100)
		);

		const channel = this.client.channels.get(Channel.Notifications);
		if (channel) (channel as TextChannel).send(chStr);

		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore
		const image = await this.client.tasks
			.get('bankImage')!
			.generateBankImage(loot, `${msg.author.username}'s Daily`);

		await user.addItemsToBank(loot, true);
		return msg.send(dmStr, new MessageAttachment(image)).catch(() => null);
	}
}
