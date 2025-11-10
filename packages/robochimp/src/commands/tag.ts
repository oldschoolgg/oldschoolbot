export const tagCommand = defineCommand({
	name: 'tag',
	description: 'Tag command.',
	options: [
		{
			type: 'Subcommand',
			name: 'add',
			description: 'Add a tag',
			options: [
				{
					type: 'String',
					name: 'name',
					description: 'The name.',
					required: true
				},
				{
					type: 'String',
					name: 'content',
					description: 'The content of the tag.',
					required: true
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'remove',
			description: 'Remove a tag',
			options: [
				{
					type: 'String',
					name: 'id',
					description: 'The tag to remove.',
					required: true,
					autocomplete: async ({ value }: StringAutoComplete) => {
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
		user
	}) => {
		if (!user.isMod()) return 'Ook.';
		if (options.add) {
			await roboChimpClient.tag.create({
				data: {
					name: options.add.name,
					content: options.add.content,
					user_id: user.id
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
});
