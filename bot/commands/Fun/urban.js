const { Command } = require('klasa');
const fetch = require('node-fetch');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			nsfw: true,
			description:
				'Searches the Urban Dictionary library for a definition to the search term.',
			usage: '<search:str> [resultNum:int]',
			usageDelim: ', '
		});
	}

	async run(msg, [search, index = 1]) {
		const { list } = await fetch(
			`http://api.urbandictionary.com/v0/define?term=${encodeURIComponent(search)}`
		).then(res => res.json());

		this.getDefinition(search, list, --index, msg);
	}

	getDefinition(search, list, index, msg) {
		const result = list[index];
		if (!result) return msg.sendLocale('URBAN_NO_ENTRY');

		const wdef =
			result.definition.length > 1000
				? `${this.splitText(result.definition, 1000)}...`
				: result.definition;

		return msg.sendLocale('URBAN_RESULT', [search, result, wdef]);
	}

	splitText(string, length, endBy = ' ') {
		const a = string.substring(0, length).lastIndexOf(endBy);
		const pos = a === -1 ? length : a;
		return string.substring(0, pos);
	}
};
