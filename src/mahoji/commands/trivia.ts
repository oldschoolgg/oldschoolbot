import { userMention } from '@discordjs/builders';
import { TextChannel } from 'discord.js';
import { shuffleArr, uniqueArr } from 'e';
import { ApplicationCommandOptionType } from 'mahoji';
import { CommandRunOptions, MahojiUserOption } from 'mahoji/dist/lib/types';

import { DynamicButtons } from '../../lib/DynamicButtons';
import { getRandomTriviaQuestions } from '../../lib/roboChimp';
import { OSBMahojiCommand } from '../lib/util';

export const triviaCommand: OSBMahojiCommand = {
	name: 'trivia',
	description: 'Try to answer a random trivia question!',
	attributes: {
		examples: ['/trivia', '/trivia duel:@Magnaboy']
	},
	options: [
		{
			type: ApplicationCommandOptionType.User,
			name: 'duel',
			description: 'A user to duel in answering the question fastest.',
			required: false
		}
	],
	run: async ({
		interaction,
		userID,
		channelID,
		options
	}: CommandRunOptions<{
		duel?: MahojiUserOption;
	}>) => {
		await interaction.deferReply();
		const [question, ...fakeQuestions] = await getRandomTriviaQuestions();
		const channel = globalClient.channels.cache.get(channelID.toString());
		const users = [userID.toString()];
		if (options.duel) users.push(options.duel.user.id);

		let correctUser: string | null = null;
		const buttons = new DynamicButtons({
			channel: channel as TextChannel,
			usersWhoCanInteract: users,
			deleteAfterConfirm: true
		});
		for (const q of uniqueArr(shuffleArr([question, ...fakeQuestions].map(i => i.answers[0])))) {
			buttons.add({
				name: q,
				fn: ({ interaction }) => {
					if (question.answers.includes(q) ? true : false) {
						correctUser = interaction.user.id;
					}
				},
				cantBeBusy: false
			});
		}

		const allMention = users.map(userMention).join(' ');

		await buttons.render({
			messageOptions: { content: `${allMention} ${question.question}` },
			isBusy: false
		});

		if (users.length > 1) {
			if (!correctUser) return `${allMention}, neither of you got it - sad!`;
			return `${userMention(correctUser)} won the trivia duel!`;
		}
		return {
			content: `You answered ${correctUser !== null ? 'correctly' : 'incorrectly'}!`
		};
	}
};
