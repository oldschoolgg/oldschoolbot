export const askCommand = defineCommand({
	name: 'ask',
	description: 'Ask a yes/no question to the bot and receive an answer.',
	options: [
		{
			type: 'String',
			name: 'question',
			description: 'The question you want to ask.',
			required: true
		}
	],
	run: async ({ user, options, rng }) => {
		const answer = rng.pick([
			'Yes.',
			'Definitely.',
			'Obviously yes.',
			'Without a doubt.',
			'I think so.',
			'100%.',

			"It's possible.",
			'Maybe.',

			'No.',
			'No chance.',
			'Unlikely.',
			'0 chance.',
			'No way.'
		]);
		return `${user.username} asked: *${options.question}*, and my answer is **${answer}**.`;
	}
});
