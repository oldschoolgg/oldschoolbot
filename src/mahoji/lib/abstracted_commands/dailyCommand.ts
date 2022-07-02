import { roll } from 'e';
import { KlasaUser } from 'klasa';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';

import { COINS_ID, dailyResetTime, Emoji, SupportServer } from '../../../lib/constants';
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

	if (difference < dailyResetTime) {
		const duration = Date.now() - (lastVoteDate + dailyResetTime);
		return { isReady: false, durationUntilReady: duration };
	}

	return { isReady: true };
}

async function reward(user: KlasaUser, triviaCorrect: boolean): CommandResponse {
	const guild = globalClient.guilds.cache.get(SupportServer);
	const member = await guild?.members.fetch(user).catch(() => null);

	const loot = dailyRoll(3, triviaCorrect);

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
		loot[COINS_ID] = 0;
	} else if (loot[COINS_ID] <= 1_000_000_000) {
		// Correct daily gives 10% more cash if the jackpot is not won
		loot[COINS_ID] = Math.floor(loot[COINS_ID] * 1.1);
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

	const hasSkipper = user.usingPet('Skipper') || user.bank().amount('Skipper') > 0;
	if (!user.isIronman && triviaCorrect && hasSkipper) {
		loot[COINS_ID] = Math.floor(loot[COINS_ID] * 1.5);
		dmStr +=
			'\n<:skipper:755853421801766912> Skipper has negotiated with Diango and gotten you 50% extra GP from your daily!';
	}

	if (loot[COINS_ID] > 0) {
		updateGPTrackSetting('gp_daily', loot[COINS_ID]);
	} else {
		delete loot[COINS_ID];
	}

	const { itemsAdded, previousCL } = await user.addItemsToBank({ items: loot, collectionLog: true });
	const image = await makeBankImage({
		bank: itemsAdded,
		title: `${user.username}'s Daily`,
		previousCL,
		showNewCL: true
	});
	return { content: dmStr, attachments: [image.file] };
}

export async function dailyCommand(
	interaction: SlashCommandInteraction,
	channelID: bigint,
	user: KlasaUser
): CommandResponse {
	await interaction.deferReply();
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
		if (winner) return reward(user, true);
	} catch (err) {
		return reward(user, false);
	}
	return 'Something went wrong!';
}
