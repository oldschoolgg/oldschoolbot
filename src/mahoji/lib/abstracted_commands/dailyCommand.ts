import { MessageAttachment, TextChannel } from 'discord.js';
import { roll, Time } from 'e';
import { KlasaUser } from 'klasa';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';
import { Bank } from 'oldschooljs';

import { COINS_ID, Emoji, SupportServer } from '../../../lib/constants';
import pets from '../../../lib/data/pets';
import { getRandomTriviaQuestion } from '../../../lib/roboChimp';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import dailyRoll from '../../../lib/simulation/dailyTable';
import { channelIsSendable, formatDuration, isWeekend, stringMatches, updateGPTrackSetting } from '../../../lib/util';
import { makeBankImage } from '../../../lib/util/makeBankImage';

const options = {
	max: 1,
	time: 13_000,
	errors: ['time']
};

export function isUsersDailyReady(user: KlasaUser): { isReady: true } | { isReady: false; durationUntilReady: number } {
	const currentDate = new Date().getTime();
	const lastVoteDate = user.settings.get(UserSettings.LastDailyTimestamp);
	const difference = currentDate - lastVoteDate;

	if (difference < Time.Hour * 12) {
		const duration = Date.now() - (lastVoteDate + Time.Hour * 12);
		return { isReady: false, durationUntilReady: duration };
	}

	return { isReady: true };
}

async function reward(user: KlasaUser, channel: TextChannel, triviaCorrect: boolean): CommandResponse {
	const guild = globalClient.guilds.cache.get(SupportServer);
	const member = await guild?.members.fetch(user).catch(() => null);

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

	if (user.hasMinion) {
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

	let dmStr = `${bonuses.join('')} **${Emoji.Diango} Diango says..** That's ${correct}! ${reward}\n`;

	if (triviaCorrect && roll(13)) {
		const pet = pets[Math.floor(Math.random() * pets.length)];
		const userPets = {
			...user.settings.get(UserSettings.Pets)
		};
		if (!userPets[pet.id]) userPets[pet.id] = 1;
		else userPets[pet.id]++;

		await user.settings.sync(true);
		await user.settings.update(UserSettings.Pets, { ...userPets });

		dmStr += `\n**${pet.name}** pet! ${pet.emoji}`;
	}

	if (loot[COINS_ID] > 0) {
		updateGPTrackSetting('gp_daily', loot[COINS_ID]);
	}

	const { itemsAdded, previousCL } = await user.addItemsToBank({ items: loot, collectionLog: true });
	const image = await makeBankImage({
		bank: itemsAdded,
		title: `${user.username}'s Daily`,
		previousCL,
		showNewCL: true
	});
	await channel.send({ content: dmStr, files: [new MessageAttachment(image.file.buffer)] });
	return { content: `${dmStr}\nYou received ${new Bank(loot)}` };
}

export async function dailyCommand(
	interaction: SlashCommandInteraction | null,
	channelID: bigint,
	user: KlasaUser
): CommandResponse {
	if (interaction) await interaction.deferReply();
	const channel = globalClient.channels.cache.get(channelID.toString());
	if (!channelIsSendable(channel)) return 'Invalid channel.';
	const check = isUsersDailyReady(user);
	if (!check.isReady) {
		return `**${Emoji.Diango} Diango says...** You can claim your next daily in ${formatDuration(
			check.durationUntilReady
		)}.`;
	}

	await user.settings.update(UserSettings.LastDailyTimestamp, new Date().getTime());

	const { question, answers } = await getRandomTriviaQuestion();

	await channel.send(`**${Emoji.Diango} Diango asks ${user.username}...** ${question}`);
	try {
		const collected = await channel.awaitMessages({
			...options,
			filter: answer =>
				answer.author.id === user.id &&
				Boolean(answer.content) &&
				answers.some(_ans => stringMatches(_ans, answer.content))
		});
		const winner = collected.first();
		if (winner) return reward(user, channel, true);
	} catch (err) {
		return reward(user, channel, false);
	}
	return 'Something went wrong!';
}
