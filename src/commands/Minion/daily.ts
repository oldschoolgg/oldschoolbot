import * as fs from 'fs';
import { CommandStore, KlasaMessage } from 'klasa';

if (!fs.existsSync('./src/lib/resources/trivia-questions.json')) {
	fs.writeFileSync(
		'./src/lib/resources/trivia-questions.json',
		JSON.stringify(
			{
				triviaQuestions: []
			},
			null,
			4
		)
	);
	console.log(`Created empty trivia questions file at ./src/lib/resources/trivia-questions.json`);
}

const { triviaQuestions } = JSON.parse(
	fs.readFileSync('./src/lib/resources/trivia-questions.json').toString()
);

import { COINS_ID, Emoji, SupportServer, Time } from '../../lib/constants';
import pets from '../../lib/data/pets';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import dailyRoll from '../../lib/simulation/dailyTable';
import { BotCommand } from '../../lib/structures/BotCommand';
import { formatDuration, isWeekend, roll, stringMatches } from '../../lib/util';

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
			cooldown: 5,
			categoryFlags: ['minion'],
			examples: ['+daily'],
			description:
				'Allows you to answer a trivia question twice daily for some small amount of GP and random items from Diangos store.'
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

		const trivia = triviaQuestions[Math.floor(Math.random() * triviaQuestions.length)];

		await msg.channel.send(
			`**${Emoji.Diango} Diango asks ${msg.author.username}...** ${trivia.q}`
		);
		try {
			const collected = await msg.channel.awaitMessages(
				answer =>
					answer.author.id === msg.author.id &&
					answer.content &&
					trivia.a.some((_ans: string) => stringMatches(_ans, answer.content)),
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

		const guild = this.client.guilds.cache.get(SupportServer);
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

		// Check to see if user is iron and remove GP if true.
		if (user.isIronman) {
			delete loot[COINS_ID];
		}

		const correct = triviaCorrect ? 'correct' : 'incorrect';
		const reward = triviaCorrect
			? "I've picked you some random items as a reward..."
			: 'Even though you got it wrong, heres a little reward...';

		let dmStr = `${bonuses.join('')} **${
			Emoji.Diango
		} Diango says..** That's ${correct}! ${reward}\n`;

		if (triviaCorrect && roll(13)) {
			const pet = pets[Math.floor(Math.random() * pets.length)];
			const userPets = {
				...user.settings.get(UserSettings.Pets)
			};
			if (!userPets[pet.id]) userPets[pet.id] = 1;
			else userPets[pet.id]++;

			await msg.author.settings.sync(true);
			await user.settings.update(UserSettings.Pets, { ...userPets });

			dmStr += `\n**${pet.name}** pet! ${pet.emoji}`;
		}

		if (loot[COINS_ID] > 0) {
			const dailiesAmount = this.client.settings.get(
				ClientSettings.EconomyStats.DailiesAmount
			);
			const dividedAmount = loot[COINS_ID] / 1_000_000;
			this.client.settings.update(
				ClientSettings.EconomyStats.DailiesAmount,
				Math.floor(dailiesAmount + Math.round(dividedAmount * 100) / 100)
			);
		}

		await user.addItemsToBank(loot, true);

		return msg.channel.sendBankImage({
			bank: loot,
			title: `${msg.author.username}'s Daily`,
			content: dmStr,
			background: msg.author.settings.get(UserSettings.BankBackground)
		});
	}
}
