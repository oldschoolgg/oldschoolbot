const { Command } = require('klasa');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			permissionLevel: 0,
			description: 'Set your RuneScape Username, used for other commands.',
			usage: '[rsn:str{1,12}]'
		});
	}

	async run(msg, [newRSN]) {
		const RSN = msg.author.settings.get('RSN');
		if (!newRSN && RSN) {
			return msg.sendLocale('RSN_CURRENT', [msg.author.settings.get('RSN')]);
		}

		if (!newRSN && !RSN) {
			return msg.sendLocale('RSN_NOT_SET', [msg.guild.settings.get('prefix')]);
		}

		newRSN = newRSN.toLowerCase();
		if (!newRSN.match('^[A-Za-z0-9]{1}[A-Za-z0-9 -_\u00A0]{0,11}$')) {
			return msg.sendLocale('RSN_INVALID');
		}

		if (RSN === newRSN) {
			return msg.sendLocale('RSN_SET_ALREADY', [RSN]);
		}

		if (RSN !== null) {
			await msg.author.settings.update('RSN', newRSN);
			msg.sendLocale('RSN_CHANGED', [RSN, newRSN]);
		} else {
			await msg.author.settings.update('RSN', newRSN);
			msg.sendLocale('RSN_SET_TO', [newRSN]);
		}

		if (msg.author.settings.get('badges').length > 0) {
			this.client.tasks.get('badges').run();
		}

		if (msg.guild.settings.get('levelUpMessages')) {
			this.client.tasks.get('usernameCacher').run();
		}
	}
};
