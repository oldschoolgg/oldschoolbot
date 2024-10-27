import type { CommandResponse } from '@oldschoolgg/toolkit/util';
import type { ChatInputCommandInteraction, TextChannel } from 'discord.js';
import { shuffleArr, uniqueArr } from 'e';

import { SupportServer } from '../../../config';
import { DynamicButtons } from '../../../lib/DynamicButtons';
import { dailyResetTime } from '../../../lib/MUser';
import { Emoji } from '../../../lib/constants';
import { getRandomTriviaQuestions } from '../../../lib/roboChimp';
import dailyRoll from '../../../lib/simulation/dailyTable';
import { channelIsSendable, formatDuration, isWeekend, roll } from '../../../lib/util';
import { deferInteraction } from '../../../lib/util/interactionReply';
import { makeBankImage } from '../../../lib/util/makeBankImage';
import { updateClientGPTrackSetting, userStatsUpdate } from '../../mahojiSettings';

export async function isUsersDailyReady(
	user: MUser
): Promise<{ isReady: true } | { isReady: false; durationUntilReady: number }> {
	const stats = await user.fetchStats({ last_daily_timestamp: true });
	const currentDate = new Date().getTime();
	const lastVoteDate = Number(stats.last_daily_timestamp);
	const difference = currentDate - lastVoteDate;

	if (difference < dailyResetTime) {
		const duration = Date.now() - (lastVoteDate + dailyResetTime);
		return { isReady: false, durationUntilReady: duration };
	}

	return { isReady: true };
}

async function reward(user: MUser, triviaCorrect: boolean): CommandResponse {
	const guild = globalClient.guilds.cache.get(SupportServer);
	const member = await guild?.members.fetch(user.id).catch(() => null);

	const loot = dailyRoll(3, triviaCorrect);

	const bonuses = [];

	let coinsToGive = loot.amount('Coins');

	if (isWeekend()) {
		coinsToGive *= 2;
		bonuses.push(Emoji.MoneyBag);
	}

	if (member) {
		coinsToGive = Math.floor(coinsToGive * 1.5);
		bonuses.push(Emoji.OSBot);
	}

	if (user.user.minion_hasBought) {
		coinsToGive /= 1.5;
	}

	if (roll(73)) {
		coinsToGive = Math.floor(coinsToGive * 1.73);
		bonuses.push(Emoji.Joy);
	}

	if (roll(5000)) {
		if (roll(2)) {
			bonuses.push(Emoji.Bpaptu);
		} else {
			coinsToGive += 1_000_000_000;
			bonuses.push(Emoji.Diamond);
		}
	}

	if (!triviaCorrect) {
		coinsToGive = 0;
	} else if (coinsToGive <= 1_000_000_000) {
		// Correct daily gives 10% more cash if the jackpot is not won
		coinsToGive = Math.floor(coinsToGive * 1.1);
	}

	if (user.isIronman) {
		coinsToGive = 0;
	}

	loot.set('Coins', Math.floor(coinsToGive));

	const correct = triviaCorrect ? 'correct' : 'incorrect';
	const reward = triviaCorrect
		? "I've picked you some random items as a reward..."
		: "Even though you got it wrong, here's a little reward...";

	let dmStr = `${bonuses.join('')} **${Emoji.Diango} Diango says..** That's ${correct}! ${reward}\n`;

	const hasSkipper = user.usingPet('Skipper') || user.bank.amount('Skipper') > 0;
	if (!user.isIronman && triviaCorrect && hasSkipper) {
		coinsToGive = Math.floor(coinsToGive * 1.5);
		dmStr +=
			'\n<:skipper:755853421801766912> Skipper has negotiated with Diango and gotten you 50% extra GP from your daily!';
	}

	if (coinsToGive) {
		updateClientGPTrackSetting('gp_daily', coinsToGive);
	}

	const { itemsAdded, previousCL } = await transactItems({
		userID: user.id,
		collectionLog: true,
		itemsToAdd: loot
	});
	const image = await makeBankImage({
		bank: itemsAdded,
		title: `${user.rawUsername}'s Daily`,
		previousCL,
		showNewCL: true
	});
	return { content: `${dmStr}\nYou received ${loot}`, files: [image.file] };
}

export async function dailyCommand(
	interaction: ChatInputCommandInteraction | null,
	channelID: string,
	user: MUser
): CommandResponse {
	if (interaction) await deferInteraction(interaction);
	const channel = globalClient.channels.cache.get(channelID.toString());
	if (!channelIsSendable(channel)) return 'Invalid channel.';
	const check = await isUsersDailyReady(user);
	if (!check.isReady) {
		return `**${Emoji.Diango} Diango says...** You can claim your next daily in ${formatDuration(
			check.durationUntilReady
		)}.`;
	}

	await userStatsUpdate(
		user.id,
		{
			last_daily_timestamp: new Date().getTime()
		},
		{}
	);

	const [question, ...fakeQuestions] = await getRandomTriviaQuestions();

	let correctUser: string | null = null;
	const buttons = new DynamicButtons({
		channel: channel as TextChannel,
		usersWhoCanInteract: [user.id],
		deleteAfterConfirm: true
	});
	const allAnswers = uniqueArr(shuffleArr([question, ...fakeQuestions].map(q => q.answers[0])));
	for (const answer of allAnswers) {
		buttons.add({
			name: answer,
			fn: ({ interaction }) => {
				if (question.answers.includes(answer)) {
					correctUser = interaction.user.id;
				}
			},
			cantBeBusy: false
		});
	}

	await buttons.render({
		messageOptions: {
			content: `**${Emoji.Diango} Diango asks ${user.badgedUsername}...** ${question.question}`
		},
		isBusy: false
	});
	return reward(user, correctUser !== null);
}
