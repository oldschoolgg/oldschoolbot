import type { TriviaQuestion } from '@prisma/robochimp';

function triviaQuestionToStr(q: TriviaQuestion) {
	return `**ID:** ${q.id}
**Question:** ${q.question}
**Answers:** ${q.answers.join(' | ')}`;
}

async function triviaSearch(query: string) {
	const questions = await roboChimpClient.triviaQuestion.findMany({
		where: {
			OR: [
				{
					question: {
						search: query.replace(/[\s\n\t]/g, '_')
					}
				},
				{
					question: {
						contains: query.replace(/[\s\n\t]/g, '_')
					}
				}
			]
		},
		take: 10
	});
	return questions;
}

export const triviaCommand: RoboChimpCommand = {
	name: 'trivia',
	description: 'Manage trivia commands.',
	options: [
		{
			type: 'Subcommand',
			name: 'add',
			description: 'Add a trivia question',
			options: [
				{
					type: 'String',
					name: 'question',
					description: 'The trivia question.',
					required: true
				},
				{
					type: 'String',
					name: 'answers',
					description: 'The answers, separated by comma.',
					required: true
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'remove',
			description: 'Remove a trivia question',
			options: [
				{
					type: 'Integer',
					name: 'id',
					description: 'The id of the question you want to remove.',
					required: true
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'search',
			description: 'Search trivia questions.',
			options: [
				{
					type: 'String',
					name: 'query',
					description: 'Your search query.',
					required: true,
					autocomplete: async (value: string) => {
						const results = await triviaSearch(value);
						return results.map(i => ({ name: i.question.slice(0, 32), value: i.id.toString() }));
					}
				}
			]
		}
	],
	run: async ({
		options,
		user
	}: CommandRunOptions<{
		add?: { question: string; answers: string };
		remove?: { id: number };
		search?: { query: string };
	}>) => {
		if (!user.isTrusted()) return 'Ook.';
		if (options.add) {
			const { question, answers } = options.add;
			if (!question.endsWith('?')) return "That question doesn't end with a question mark.";
			const answersArr = answers.split(',').map(i => i.trim().toLowerCase());
			if (answersArr.length === 0) return 'No answers given.';
			const triviaQuestion = await roboChimpClient.triviaQuestion.create({
				data: {
					question,
					answers: answersArr
				}
			});
			return `Created new trivia question: \n${triviaQuestionToStr(triviaQuestion)}`;
		}
		if (options.remove) {
			const question = await roboChimpClient.triviaQuestion.findFirst({
				where: {
					id: options.remove.id
				}
			});
			if (!question) return "Couldn't find any question with that ID.";
			await roboChimpClient.triviaQuestion.delete({
				where: {
					id: options.remove.id
				}
			});
			return `Deleted this question: \n${triviaQuestionToStr(question)}`;
		}
		if (options.search) {
			const asNumber = Number(options.search.query);
			if (!Number.isNaN(asNumber)) {
				const singular = await roboChimpClient.triviaQuestion.findFirst({
					where: {
						id: asNumber
					}
				});
				if (!singular) return 'No result.';
				return triviaQuestionToStr(singular);
			}
			return `**Search**
${(await triviaSearch(options.search.query)).map(q => `${q.id}. ${q.question}`).join('\n')}`;
		}
		return 'HUH?';
	}
};
