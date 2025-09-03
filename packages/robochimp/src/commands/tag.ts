import type { CommandRunOptions, ICommand } from '@oldschoolgg/toolkit/discord-util';
import { ApplicationCommandOptionType } from 'discord.js';

import { Bits, fetchUser } from '../util.js';

export const tagCommand: ICommand = {
	name: 'tag',
	description: 'Tag command.',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'add',
			description: 'Add a tag',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'name',
					description: 'The name.',
					required: true
				},
				{
					type: ApplicationCommandOptionType.String,
					name: 'content',
					description: 'The content of the tag.',
					required: true
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'remove',
			description: 'Remove a tag',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'id',
					description: 'The tag to remove.',
					required: true,
					autocomplete: async value => {
						const tags = await roboChimpClient.tag.findMany();
						return tags
							.filter(i =>
								!value ? true : `${i.name} ${i.content}`.toLowerCase().includes(value.toLowerCase())
							)
							.map(i => ({ name: i.name, value: i.id.toString() }));
					}
				}
			]
		}
	],
	run: async ({
		options,
		userID
	}: CommandRunOptions<{
		add?: { name: string; content: string };
		remove?: { id: string };
	}>) => {
		const dbUser = await fetchUser(userID);
		if (!dbUser.bits.includes(Bits.Mod)) return 'Ook.';
		if (options.add) {
			await roboChimpClient.tag.create({
				data: {
					name: options.add.name,
					content: options.add.content,
					user_id: dbUser.id
				}
			});
			return 'Done.';
		}
		if (options.remove) {
			const tag = await roboChimpClient.tag.findFirst({
				where: {
					id: Number(options.remove.id)
				}
			});
			if (!tag) return "Couldn't find any tag with that ID.";
			await roboChimpClient.tag.delete({
				where: {
					id: tag.id
				}
			});
			return 'Deleted.';
		}

		return 'HUH?';
	}
};
