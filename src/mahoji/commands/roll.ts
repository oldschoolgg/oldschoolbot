import { cryptoRng } from '@oldschoolgg/rng';
import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';

export const rollCommand: OSBMahojiCommand = {
	name: 'roll',
	description: 'Roll a random number from 1, up to a limit.',
	options: [
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'limit',
			description: 'The upper limit of the roll. Defaults to 10.',
			required: false,
			min_value: 1,
			max_value: 1_000_000_000
		}
	],
	run: async ({ options, user, interaction }: CommandRunOptions<{ limit?: number }>) => {
		await interaction.confirmation({
			content: 'Are you sure you want to roll a number?',
			users: ['425134194436341760', user.id]
		});
		const limit = options.limit ?? 10;

		function asdf() {
			return `**${user.username}** rolled a random number from 1 to ${limit}...\n\n**${cryptoRng
				.randInt(1, limit)
				.toString()}**`;
		}
		return interaction.makePaginatedMessage({
			ephemeral: true,
			pages: [
				() => ({ embeds: [new EmbedBuilder().setTitle(asdf()).setDescription(asdf())] }),
				() => ({ embeds: [new EmbedBuilder().setTitle(asdf()).setDescription(asdf())] })
			]
		});
	}
};
