import { randInt } from '@oldschoolgg/rng';
import { EmbedBuilder } from 'discord.js';

export const monkeyCommand: OSBMahojiCommand = {
	name: 'monkey',
	description: 'monkey',
	options: [
		{
			type: 'Subcommand',
			name: 'confirm',
			description: 'A confirmation dialog',
			options: [
				{
					type: 'Boolean',
					name: 'ephemeral',
					description: 'Only you can see the response (default false)',
					required: false
				},
				{
					type: 'User',
					name: 'other_person',
					description: 'Other person who must confirm too (optional',
					required: false
				},
				{
					type: 'User',
					name: 'another_person',
					description: 'Another person who must confirm too (optional',
					required: false
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'party',
			description: 'Create a party',
			options: [

			]
		}
	],
	run: async ({
		options,
		user,
		interaction
	}: CommandRunOptions<{
		confirm?: {
			ephemeral?: boolean;
			other_person?: MahojiUserOption;
			another_person?: MahojiUserOption;
		}
		party?: {}
	}>) => {
		if (options.confirm) {
			const ephemeral = options.confirm.ephemeral ?? false;
			const users = [user.id];
			if (options.confirm.other_person) users.push(options.confirm.other_person.user.id);
			if (options.confirm.another_person) users.push(options.confirm.another_person.user.id);
			if (ephemeral && users.length > 1) {
				return 'You cannot have multiple people confirm on an ephemeral message.';
			}
			await interaction.confirmation({
				content: `This is a normal confirmation. Users who must confirm: ${users.map(i => `<@${i}>`).join(', ')}`,
				users,
				// @ts-expect-error ddd
				ephemeral
			});
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

		const party = await interaction.makeParty({
			maxSize: 5,
			minSize: 2,
			message: `Join the party!`,
			leader: user,
			ironmanAllowed: true
		});
		return `The party has now started with the following users: ${party.map(i => i.username).join(', ')}`;
	}
};
