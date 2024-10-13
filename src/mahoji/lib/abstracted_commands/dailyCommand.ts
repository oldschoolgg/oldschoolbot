import type { CommandResponse } from '@oldschoolgg/toolkit/util';
import type { ChatInputCommandInteraction, TextChannel } from 'discord.js';
import { Time, roll, shuffleArr, uniqueArr } from 'e';
import type { ItemBank } from 'oldschooljs/dist/meta/types';

import { SupportServer } from '../../../config';
import { DynamicButtons } from '../../../lib/DynamicButtons';
import { Emoji } from '../../../lib/constants';
import pets from '../../../lib/data/pets';
import { getRandomTriviaQuestions } from '../../../lib/roboChimp';
import dailyRoll from '../../../lib/simulation/dailyTable';
import { channelIsSendable, formatDuration, isWeekend } from '../../../lib/util';
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

	if (difference < Time.Hour * 12) {
		const duration = Date.now() - (lastVoteDate + Time.Hour * 12);
		return { isReady: false, durationUntilReady: duration };
	}

	return { isReady: true };
}

async function reward(user: MUser, triviaCorrect: boolean): CommandResponse {
	const guild = globalClient.guilds.cache.get(SupportServer);
	const member = await guild?.members.fetch(user.id).catch(() => null);

	const loot = dailyRoll(1, triviaCorrect);

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
		coinsToGive = Math.floor(coinsToGive * 0.4);
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

	if (triviaCorrect && roll(13)) {
		const pet = pets[Math.floor(Math.random() * pets.length)];
		const userPets = {
			...(user.user.pets as ItemBank)
		};
		if (!userPets[pet.id]) userPets[pet.id] = 1;
		else userPets[pet.id]++;

		await user.update({
			pets: { ...userPets }
		});

		dmStr += `\n**${pet.name}** pet! ${pet.emoji}`;
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
