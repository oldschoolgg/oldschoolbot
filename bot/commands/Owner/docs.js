const { Command, Stopwatch } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			guarded: true,
			description: 'Generates documentation in different formats.',
			permissionLevel: 10,
			usage: '<html|markdown|plaintext|json>',
			subcommands: true
		});
	}

	init() {
		this.username = this.client.user.username;
		this.avatar = (size) => this.client.user.avatarURL({ format: 'png', size: size });
		this.prefix = this.client.options.prefix;
		this.invite = this.client.invite;
	}

	async buildCommands(type, msg) {
		const stopwatch = new Stopwatch();
		const commands = {};
		const commandNames = Array.from(this.client.commands.keys());
		await Promise.all(
			this.client.commands.filter(command => !command.permissionLevel || (command.permissionLevel && command.permissionLevel < 9)).map(command => {
				if (!commands.hasOwnProperty(command.category)) commands[command.category] = {};
				if (!commands[command.category].hasOwnProperty(command.subCategory)) commands[command.category][command.subCategory] = [];
				const description = typeof command.description === 'function' ? command.description(msg) : command.description;
				return commands[command.category][command.subCategory].push({ name: command.name, aliases: command.aliases, description });
			})
		);

		const categories = Object.keys(commands);
		const longest = commandNames.reduce((long, str) => Math.max(long, str.length), 0);
		return [commands, categories, longest, stopwatch];
	}

	async markdown(msg) {
		const [commands, categories,, stopwatch] = await this.buildCommands('markdown', msg);
		const markdown = [];

		markdown.push(`# ![${this.username}](${this.avatar(32)}) ${this.username}  `);
		markdown.push(`[Invite Link](${this.invite}) / [Support Server](${this.client.supportGuild})<br><br>`);
		markdown.push(this.client.description);
		markdown.push(`# Commands`);

		for (let cat = 0; cat < categories.length; cat++) {
			const categoryName = categories[cat];
			const subCategories = Object.keys(commands[categories[cat]]);
			markdown.push(`## ${categoryName} / ${commands[categories[cat]].General.length} Commands`);

			for (let subCat = 0; subCat < subCategories.length; subCat++) {
				if (subCategories.length > 1) markdown.push(`### ${subCategories[subCat]}`);
				markdown.push(`| Command Name | Aliases  | Description              |`);
				markdown.push(`|--------------|----------|--------------------------|`);
				markdown.push(
					`${commands[categories[cat]][subCategories[subCat]]
						.map(cmd => `| ${this.prefix + cmd.name} | ${cmd.aliases.join(', ')} | ${cmd.description} |`)
						.join('\n')}`
				);
			}
		}

		const mdBuffer = Buffer.from(markdown.join('\n'));
		const duration = `Generated in ${stopwatch.stop().friendlyDuration}`;
		return msg.channel.sendFile(mdBuffer, 'commands.md', duration);
	}

	async html(msg) {
		const [commands, categories,, stopwatch] = await this.buildCommands('html', msg);

		const header = `<div id="header"><img src='${this.avatar(128)}'/><h1>${this.username}</h1></div>`;
		const page = [header];
		for (let cat = 0; cat < categories.length; cat++) {
			page.push(`<div class="category">`);
			page.push(`<h2>${categories[cat]} / ${commands[categories[cat]].General.length} Commands</h2>`);

			const subCategories = Object.keys(commands[categories[cat]]);

			for (let subCat = 0; subCat < subCategories.length; subCat++) {
				page.push(`<div class="subcategory">`);
				if (subCategories.length > 1) page.push(`<h3>${subCategories[subCat]}</h3>`);
				page.push(`<table>`);
				page.push(`<tr><th>Command Name</th><th>Aliases</th><th>Description</th></tr>`);
				page.push(
					`${commands[categories[cat]][subCategories[subCat]]
						.map(cmd => `<tr><td>${this.prefix + cmd.name}</td><td>${cmd.aliases.join(', ')}</td><td>${cmd.description}</td></tr>`)
						.join('\n')}`
				);
				page.push(`</table>`);
				page.push(`</div>`);
			}
			page.push(`</div>`);
		}
		const htmlBuffer = Buffer.from(page.join('\n'));
		const duration = `Generated in ${stopwatch.stop().friendlyDuration}`;
		return msg.channel.sendFile(htmlBuffer, 'index.html', duration);
	}

	async plaintext(msg) {
		const [commands, categories, longest, stopwatch] = await this.buildCommands('plaintext', msg);
		const plaintext = [];

		plaintext.push(`${this.username}\n`);
		plaintext.push(`Invite Link: ${this.invite}\n`);
		plaintext.push(`Support Server: ${this.client.supportGuild}\n`);
		plaintext.push(`${this.client.description}\n`);
		plaintext.push(`Commands\n`);

		for (let cat = 0; cat < categories.length; cat++) {
			const categoryName = categories[cat];
			const subCategories = Object.keys(commands[categories[cat]]);
			plaintext.push(`${categoryName} / ${commands[categories[cat]].General.length} Commands\n`);

			for (let subCat = 0; subCat < subCategories.length; subCat++) {
				if (subCategories.length > 1) plaintext.push(`${subCategories[subCat]}\n`);
				plaintext.push(
					`${commands[categories[cat]][subCategories[subCat]].map(cmd => `${this.prefix + cmd.name.padEnd(longest)}: ${cmd.description}`).join('\n')}`
				);
				plaintext.push('\n');
			}
		}

		const ptBuffer = Buffer.from(plaintext.join('\n'));
		const duration = `Generated in ${stopwatch.stop().friendlyDuration}`;
		return msg.channel.sendFile(ptBuffer, 'commands.txt', duration);
	}

	async json(msg) {
		const [commands, categories, longest, stopwatch] = await this.buildCommands('json', msg);

		const meta = {
			username: this.username,
			description: this.client.description,
			avatar: this.avatar(128),
			prefix: this.prefix,
			invite: this.invite,
			support: this.client.supportGuild,
			categories,
			longestCommandName: longest
		};
		const jsonBuffer = Buffer.from(JSON.stringify({ categories: commands, meta }));
		const duration = `Generated in ${stopwatch.stop().friendlyDuration}`;
		return msg.channel.sendFile(jsonBuffer, 'commands.json', duration);
	}

};
