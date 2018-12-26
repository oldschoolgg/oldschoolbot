const { Command, Stopwatch } = require('klasa');
const { createHash } = require('crypto');

// The permssion levels of commands must be *lower* than this number to be
// shown in the docs.
const permissionLevel = 9;

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

	finish(data, stopwatch, format) {
		const buffer = Buffer.from(data);
		const hash = createHash('sha1').update(data).digest('base64').substr(0, 7);
		const duration = `Generated in ${stopwatch.stop()}`;
		return this.msg.channel.sendFile(buffer, `commands_${hash}.${format}`, duration);
	}

	async buildCommands(type, msg, normalize = false) {
		this.msg = msg;
		const stopwatch = new Stopwatch();
		let categories;
		const commands = normalize ? [] : {};
		if (normalize) categories = [];
		const commandNames = Array.from(this.client.commands.keys());
		await Promise.all(
			this.client.commands
				.filter(cmd => !cmd.permissionLevel || (cmd.permissionLevel &&
					cmd.permissionLevel < permissionLevel))
				.map(cmd => {
					if (normalize) {
						if (!categories.includes(cmd.category)) categories.push(cmd.category);
						return commands.push(cmd);
					}

					if (!commands.hasOwnProperty(cmd.category)) commands[cmd.category] = {};
					if (!commands[cmd.category].hasOwnProperty(cmd.subCategory)) {
						commands[cmd.category][cmd.subCategory] = [];
					}
					const description = typeof cmd.description === 'function' ?
						cmd.description(msg.language) : cmd.description || 'No description.';

					return commands[cmd.category][cmd.subCategory]
						.push({ name: cmd.name, aliases: cmd.aliases, description });
				})
		);
		if (!normalize) categories = Object.keys(commands);
		const longest = commandNames.reduce((long, str) => Math.max(long, str.length), 0);
		return { commands, categories, longest, stopwatch };
	}

	async markdown(msg) {
		const { commands, categories, stopwatch } = await this.buildCommands('markdown', msg);
		const markdown = [];

		markdown.push(`# ![${this.username}](${this.avatar(32)}) ${this.username}`);
		markdown.push(`[Invite Link](${this.invite})`);
		markdown.push(`# Commands\n`);

		for (let cat = 0; cat < categories.length; cat++) {
			const categoryName = categories[cat];
			const subCategories = Object.keys(commands[categories[cat]]);
			if (commands[categories[cat]].General) markdown.push(`\n## ${categoryName} / ${commands[categories[cat]].General.length} Commands`);

			for (let subCat = 0; subCat < subCategories.length; subCat++) {
				if (subCategories.length > 1) markdown.push(`\n### ${subCategories[subCat]}`);
				markdown.push(`| Command Name | Aliases  | Description              |`);
				markdown.push(`|--------------|----------|--------------------------|`);
				markdown.push(
					`${commands[categories[cat]][subCategories[subCat]]
						.map(cmd => `| ${this.prefix + cmd.name} | ${cmd.aliases.join(', ')} | ${cmd.description} |`)
						.join('\n')}`
				);
			}
		}

		this.finish(markdown.join('\n'), stopwatch, 'md');
	}

	async html(msg) {
		const { commands, categories, stopwatch } = await this.buildCommands('html', msg);
		const esc = this.escapeHtml;

		let html = `<!DOCTYPE html><html>
<head><title>${this.username}</title></head>
<body>
<div id="header">
<img alt="${esc(this.username)}" src="${this.avatar(128)}" />
<h1>${esc(this.username)}</h1>
</div>`;
		for (let cat = 0; cat < categories.length; cat++) {
			html += `<div class="category">`;
			const category = commands[categories[cat]].General;
			if (category) {
				html += `<h2 class="category-header">${esc(categories[cat])} / ${category.length} Commands</h2>`;
			}

			const subCategories = Object.keys(commands[categories[cat]]);

			for (let subCat = 0; subCat < subCategories.length; subCat++) {
				html += `<div class="subcategory">`;
				if (subCategories.length > 1) html += `<h3 class="subcategory-header">${esc(subCategories[subCat])}</h3>`;
				html += `<table class="category-table">`;
				html += `<thead>
<tr><th>Command</th><th>Aliases</th><th>Description</th></tr>
</thead>`;
				html += `<tbody>`;
				html += `${commands[categories[cat]][subCategories[subCat]]
					.map(cmd => `<tr><td>${esc(this.prefix + cmd.name)}</td>` +
					`<td>${esc(cmd.aliases.join(', '))}</td>` +
					`<td>${esc(cmd.description)}</td></tr>`)
					.join('\n')}`
				;
				html += `</tbody></table></div>`;
			}
			html += `</div>`;
		}
		html += '</body></html>';
		this.finish(html, stopwatch, 'html');
	}

	async plaintext(msg) {
		const { commands, categories, longest, stopwatch } = await this.buildCommands('plaintext', msg);
		const plaintext = [];

		plaintext.push(`${this.username}\n`);
		plaintext.push(`Invite Link: ${this.invite}\n`);
		plaintext.push(`Commands\n`);

		for (let cat = 0; cat < categories.length; cat++) {
			const categoryName = categories[cat];
			const subCategories = Object.keys(commands[categories[cat]]);
			if (commands[categories[cat]].General) plaintext.push(`${categoryName} / ${commands[categories[cat]].General.length} Commands\n`);

			for (let subCat = 0; subCat < subCategories.length; subCat++) {
				if (subCategories.length > 1) plaintext.push(`${subCategories[subCat]}\n`);
				plaintext.push(
					`${commands[categories[cat]][subCategories[subCat]].map(cmd => `${this.prefix + cmd.name.padEnd(longest)}: ${cmd.description}`).join('\n')}`
				);
				plaintext.push('\n');
			}
		}

		this.finish(plaintext.join('\n'), stopwatch, 'txt');
	}

	async json(msg) {
		const { commands, categories, stopwatch } = await this.buildCommands('json', msg, true);

		const meta = {
			username: this.username,
			avatar: this.avatar(128),
			prefix: this.prefix,
			invite: this.invite,
			categories
		};

		this.finish(JSON.stringify({ commands, meta }), stopwatch, 'json');
	}

	escapeHtml(text) {
		const map = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#039;'
		};

		return text.replace(/[&<>"']/g, (char) => map[char]);
	}

};
