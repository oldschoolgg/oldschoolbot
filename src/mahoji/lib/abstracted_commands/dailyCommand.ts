import { TextChannel } from 'discord.js';
import { roll, shuffleArr, uniqueArr } from 'e';
import { KlasaUser } from 'klasa';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';
import { Bank } from 'oldschooljs';

import { COINS_ID, Emoji, SupportServer } from '../../../lib/constants';
import { DynamicButtons } from '../../../lib/DynamicButtons';
import { getRandomTriviaQuestions } from '../../../lib/roboChimp';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import dailyRoll from '../../../lib/simulation/dailyTable';
import { channelIsSendable, formatDuration, isWeekend } from '../../../lib/util';
import { dailyResetTime } from '../../../lib/util/getUsersPerkTier';
import { makeBankImage } from '../../../lib/util/makeBankImage';
import { updateGPTrackSetting } from '../../mahojiSettings';

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
		: "Even though you got it wrong, here's a little reward...";

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

	const { itemsAdded, previousCL } = await transactItems({
		userID: user.id,
		collectionLog: true,
		itemsToAdd: new Bank(loot)
	});
	const image = await makeBankImage({
		bank: itemsAdded,
		title: `${user.username}'s Daily`,
		previousCL,
		showNewCL: true
	});
	return { content: `${dmStr}\nYou received ${new Bank(loot)}`, attachments: [image.file] };
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
				if (question.answers.includes(answer) ? true : false) {
					correctUser = interaction.user.id;
				}
			},
			cantBeBusy: false
		});
	}

	await buttons.render({
		messageOptions: { content: `**${Emoji.Diango} Diango asks ${user.username}...** ${question.question}` },
		isBusy: false
	});
	return reward(user, correctUser !== null);
}
