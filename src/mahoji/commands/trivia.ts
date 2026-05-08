import { userMention } from '@oldschoolgg/discord';
import { Emoji, uniqueArr } from '@oldschoolgg/toolkit';

import { getRandomTriviaQuestions } from '@/lib/roboChimp.js';

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
	run: async ({ interaction, userId, options, rng }) => {
		await interaction.defer();
		const users: string[] = [userId];
		if (options.duel) users.push(options.duel.user.id);

		const [question, ...fakeQuestions] = await getRandomTriviaQuestions();
		const allAnswers = uniqueArr(rng.shuffle([question, ...fakeQuestions].map(q => q.answers[0])));

		const choice = await globalClient.pickStringWithButtons({
			interaction,
			options: allAnswers.map(answer => ({ label: answer, id: answer })),
			content: `**${Emoji.Diango} Diango asks...** ${question.question}`
		});
		if (!choice) return `You didn't answer in time!`;
		const isCorrect = question.answers.includes(choice.choice.label!);

		if (users.length > 1) {
			return isCorrect
				? `${userMention(choice.userId)} won the trivia duel!`
				: `${userMention(choice.userId)} picked the wrong answer...`;
		}
		return {
			content: `You answered ${isCorrect ? 'correctly' : 'incorrectly'}!`
		};
	}
});
