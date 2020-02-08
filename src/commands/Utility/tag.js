const { Util } = require('discord.js');
const { Command } = require('klasa');

class TagCommand extends Command {
	constructor(store, file, directory) {
		super(store, file, directory, {
			description: 'Allows you to create, remove or show tags.',
			runIn: ['text'],
			subcommands: true,
			usage: '<add|remove|source|list|show:default> (tag:string) [content:...string]',
			usageDelim: ' '
		});
		this.createCustomResolver('string', (arg, possible, message, [action]) => {
			if (action === 'list') {
				return arg;
			}
			return this.client.arguments.get('string').run(arg, possible, message);
		});
	}

	async add(message, [tag, content]) {
		const isStaff = await message.hasAtLeastPermissionLevel(6);
		if (!message.member || !isStaff) return;
		if (!content || content.length === 0) {
			return message.send('You must provide content for the tag.');
		}
		if (message.guild.settings.get('tags').some(_tag => _tag[0] === tag.toLowerCase())) {
			return message.send('That tag already exists.');
		}
		await message.guild.settings.update(
			'tags',
			[...message.guild.settings.get('tags'), [tag.toLowerCase(), content]],
			{ action: 'overwrite' }
		);
		return message.send(
			`Added the tag \`${tag}\` with content: \`\`\`${Util.escapeMarkdown(content)}\`\`\``
		);
	}

	async remove(message, [tag]) {
		const isStaff = await message.hasAtLeastPermissionLevel(6);
		if (!message.member || !isStaff) return;
		if (!message.guild.settings.get('tags').some(_tag => _tag[0] === tag.toLowerCase())) {
			return message.send("That tag doesn't exist.");
		}
		const filtered = message.guild.settings
			.get('tags')
			.filter(([name]) => name !== tag.toLowerCase());
		await message.guild.settings.update('tags', filtered, { action: 'overwrite' });
		return message.send(`Removed the tag \`${tag}\`.`);
	}

	list(message) {
		return message.send(
			`Tags for this guild are: ${message.guild.settings
				.get('tags')
				.map(([name]) => name)
				.join(', ')}`
		);
	}

	show(message, [tag]) {
		const emote = message.guild.settings
			.get('tags')
			.find(([name]) => name === tag.toLowerCase());
		if (!emote) {
			return null;
		}
		return message.send(emote[1]);
	}

	source(message, [tag]) {
		const emote = message.guild.settings
			.get('tags')
			.find(([name]) => name === tag.toLowerCase());
		if (!emote) {
			return message.send("That emote doesn't exist.");
		}
		return message.send(`\`\`\`${Util.escapeMarkdown(emote[1])}\`\`\``);
	}
}
exports.default = TagCommand;
