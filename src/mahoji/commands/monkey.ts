import { randInt } from '@oldschoolgg/rng';
import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';

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
		// await interaction.confirmation({
		// 	content: `This is a normal confirmation. Users who must confirm: ${users.map(i => `<@${i}>`).join(', ')}`,
		// 	users,
		// 	// @ts-expect-error ddd
		// 	ephemeral
		// });

		if (users.length === 1) {
			const party = await interaction.makeParty({
				maxSize: 5,
				minSize: 1,
				message: `Join the party!`,
				leader: user,
				ironmanAllowed: true
			});
			return `The party has now started with the following users: ${party.map(i => i.username).join(', ')}`;
		}

		return interaction.makePaginatedMessage({
			ephemeral: true,
			pages: [
				() => ({
					embeds: [
						new EmbedBuilder()
							.setTitle(`Page 1`)
							.setImage(`https://cdn.oldschool.gg/monkey/${randInt(1, 39)}.webp`)
					]
				}),
				() => ({
					embeds: [
						new EmbedBuilder()
							.setTitle(`Page 2`)
							.setImage(`https://cdn.oldschool.gg/monkey/${randInt(1, 39)}.webp`)
					]
				}),
				() => ({
					embeds: [
						new EmbedBuilder()
							.setTitle(`Page 3`)
							.setImage(`https://cdn.oldschool.gg/monkey/${randInt(1, 39)}.webp`)
					]
				}),
				() => ({
					embeds: [
						new EmbedBuilder()
							.setTitle(`Page 4`)
							.setImage(`https://cdn.oldschool.gg/monkey/${randInt(1, 39)}.webp`)
					]
				})
			]
		});
	}
};
