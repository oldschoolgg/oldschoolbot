import { randInt } from '@oldschoolgg/rng';
import type { MahojiUserOption } from '@oldschoolgg/toolkit';
import { ApplicationCommandOptionType } from 'discord.js';

export const monkeyCommand: OSBMahojiCommand = {
	name: 'monkey',
	description: 'monkey',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'confirm',
			description: 'A confirmation dialog',
			options: [
				{
					type: ApplicationCommandOptionType.Boolean,
					name: 'ephemeral',
					description: 'Only you can see the response (default false)',
					required: false
				},
				{
					type: ApplicationCommandOptionType.User,
					name: 'other_person',
					description: 'Other person who must confirm too (optional',
					required: false
				},
				{
					type: ApplicationCommandOptionType.User,
					name: 'another_person',
					description: 'Another person who must confirm too (optional',
					required: false
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'party',
			description: 'Create a party',
			options: [
				{
					type: ApplicationCommandOptionType.Boolean,
					name: 'ephemeral',
					description: 'Only you can see the response (default false)',
					required: false
				},
				{
					type: ApplicationCommandOptionType.User,
					name: 'other_person',
					description: 'Other person who must confirm too (optional',
					required: false
				},
				{
					type: ApplicationCommandOptionType.User,
					name: 'another_person',
					description: 'Another person who must confirm too (optional',
					required: false
				}
			]
		}
	],
	run: async ({
		options,
		user,
		interaction
	}: CommandRunOptions<{
		ephemeral?: boolean;
		other_person?: MahojiUserOption;
		another_person?: MahojiUserOption;
	}>) => {
		const ephemeral = options.ephemeral ?? false;
		const users = [user.id];
		if (options.other_person) users.push(options.other_person.user.id);
		if (options.another_person) users.push(options.another_person.user.id);
		if (ephemeral && users.length > 1) {
			return 'You cannot have multiple people confirm on an ephemeral message.';
		}
		await interaction.confirmation({
			content: `This is a normal confirmation. Users who must confirm: ${users.map(i => `<@${i}>`).join(', ')}`,
			users,
			// @ts-expect-error ddd
			ephemeral
		});
		// await interaction.confirmation({
		// 	content: 'Are you sure you want to roll a number?',
		// 	users: ['425134194436341760', user.id]
		// });
		// const limit = options.limit ?? 10;

		// function asdf() {
		// 	return `**${user.username}** rolled a random number from 1 to ${limit}...\n\n**${cryptoRng
		// 		.randInt(1, limit)
		// 		.toString()}**`;
		// }
		// return interaction.makePaginatedMessage({
		// 	ephemeral: true,
		// 	pages: [
		// 		() => ({ embeds: [new EmbedBuilder().setTitle(asdf()).setDescription(asdf())] }),
		// 		() => ({ embeds: [new EmbedBuilder().setTitle(asdf()).setDescription(asdf())] })
		// 	]
		// });
		return `https://cdn.oldschool.gg/monkey/${randInt(1, 39)}.webp`;
	}
};
