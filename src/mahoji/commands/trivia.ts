import { userMention } from '@oldschoolgg/discord';
import { shuffleArr } from '@oldschoolgg/rng';
import { uniqueArr } from '@oldschoolgg/toolkit';

import { getRandomTriviaQuestions } from '@/lib/roboChimp.js';
import { DynamicButtons } from '@/lib/discord/DynamicButtons.js';

export const triviaCommand = defineCommand({
	name: 'trivia',
	description: 'Try to answer a random trivia question!',
	attributes: {
		examples: ['/trivia', '/trivia duel:@Magnaboy']
	},
	options: [
		{
			type: 'User',
			name: 'duel',
			description: 'A user to duel in answering the question fastest.',
			required: false
		}
	],
	run: async ({ interaction, userID, options }) => {
		await interaction.defer();
		const [question, ...fakeQuestions] = await getRandomTriviaQuestions();
		const users = [userID.toString()];
		if (options.duel) users.push(options.duel.user.id);

		let correctUser: string | null = null;
		const buttons = new DynamicButtons({
			interaction,
			usersWhoCanInteract: users
		});
		for (const q of uniqueArr(shuffleArr([question, ...fakeQuestions].map(i => i.answers[0])))) {
			buttons.add({
				name: q,
				fn: ({ interaction }) => {
					if (question.answers.includes(q)) {
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
});
