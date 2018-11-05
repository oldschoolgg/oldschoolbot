const { Command } = require('klasa');
const snekfetch = require('snekfetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 2,
			description: 'Theatre of Blood records'
		});
	}

	async run(msg) {
		const body = await snekfetch.get('https://www.runescape.com/oldschool/TOB/records')
			.then(res => res.body.toString());
		const regex = /(&nbsp;|<([^>]+)>)/ig;
		const numericalRecords = body
			.split("<div class='c-image-plate__content'>")[1]
			.split('</div>')[0]
			.split('</br>');
		const result = numericalRecords.map(record => record.replace('<h2>', '**')
			.replace('</h2>', '**')
			.replace(regex, '').replace(/(^[ \t]*\n)/gm, ''));
		return msg.send(result);
	}

};
