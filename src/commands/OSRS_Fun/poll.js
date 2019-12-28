const { Command } = require('klasa');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			description: 'Creates a simple reaction poll for people to vote on.',
			cooldown: 2
		});
	}

	async run(msg) {
		return msg
			.react('420283725469974529')
			.then(react => react.message.react('421822898316115969'))
			.catch(() => {
				throw `There was an error <:Sad:421822898316115969> Do I have permissions to react to messages?`;
			});
	}
};
