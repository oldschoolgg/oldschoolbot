const { Command } = require('klasa');
const fetch = require('node-fetch');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			cooldown: 2,
			description: 'Shows the Theatre of Blood records.',
			enabled: false
		});
	}

	async run(msg) {
		const body = await fetch('https://www.runescape.com/oldschool/TOB/records').then(res =>
			res.text()
		);

		const regex = /(&nbsp;|<([^>]+)>)/gi;

		const numericalRecords = body
			.split("<div class='c-image-plate__content'>")[1]
			.split('</div>')[0]
			.split('</br>');

		const result = numericalRecords.map(record =>
			record
				.replace('<h2>', '**')
				.replace('</h2>', '**')
				.replace('Can you beat it?', '')
				.replace(regex, '')
				.replace(/(^[ \t]*\n)/gm, '')
		);

		return msg.send(result);
	}
};
