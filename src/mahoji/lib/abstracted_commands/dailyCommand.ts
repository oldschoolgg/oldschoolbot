import { roll, shuffleArr } from '@oldschoolgg/rng';
import { Emoji, formatDuration, isWeekend, Time, uniqueArr } from '@oldschoolgg/toolkit';

import { globalConfig } from '@/lib/constants.js';
import { getRandomTriviaQuestions } from '@/lib/roboChimp.js';
import dailyRoll from '@/lib/simulation/dailyTable.js';
import { DynamicButtons } from '@/lib/structures/DynamicButtons.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';

export async function isUsersDailyReady(
	user: MUser
): Promise<{ isReady: true } | { isReady: false; durationUntilReady: number }> {
	const stats = await user.fetchStats();
	const currentDate = Date.now();
	const lastVoteDate = Number(stats.last_daily_timestamp);
	const difference = currentDate - lastVoteDate;

	if (difference < Time.Hour * 4) {
		const duration = Date.now() - (lastVoteDate + Time.Hour * 4);
		return { isReady: false, durationUntilReady: duration };
	}

	return { isReady: true };
}

async function reward(user: MUser, triviaCorrect: boolean): CommandResponse {
	const guild = globalClient.guilds.cache.get(globalConfig.supportServerID);
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

	if (user.hasMinion) {
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

	const dmStr = `${bonuses.join('')} **${Emoji.Diango} Diango says..** That's ${correct}! ${reward}\n`;

	if (coinsToGive) {
		ClientSettings.updateClientGPTrackSetting('gp_daily', coinsToGive);
	}

	const { itemsAdded, previousCL } = await user.transactItems({
		collectionLog: true,
		itemsToAdd: loot
	});
	const image = await makeBankImage({
		bank: itemsAdded,
		title: `${user.rawUsername}'s Daily`,
		previousCL,
		showNewCL: true,
		user
	});
	return { content: `${dmStr}\nYou received ${loot}`, files: [image.file] };
}

export async function dailyCommand(interaction: MInteraction, user: MUser): CommandResponse {
	if (interaction) await interaction.defer();
	const check = await isUsersDailyReady(user);
	if (!check.isReady) {
		return `**${Emoji.Diango} Diango says...** You can claim your next daily in ${formatDuration(
			check.durationUntilReady
		)}.`;
	}

	await user.statsUpdate({
		last_daily_timestamp: Date.now()
	});

	const [question, ...fakeQuestions] = await getRandomTriviaQuestions();

	let correctUser: string | null = null;
	const buttons = new DynamicButtons({
		interaction,
		usersWhoCanInteract: [user.id]
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
