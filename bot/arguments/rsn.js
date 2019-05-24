const { Argument } = require('klasa');

const { userOrMember } = require('../../config/constants');

module.exports = class extends Argument {

	async run(arg, possible, msg) {
		const prefix = msg.guild ? msg.guild.settings.get('prefix') : '+';
		if (typeof arg === 'undefined') {
			const player = msg.author.settings.get('RSN');
			if (player) return player;
			throw `Please specify a username, or set one with \`${prefix}setrsn <username>\``;
		}
		if (userOrMember.test(arg)) {
			const user = await this.client.users.fetch(userOrMember.exec(arg)[1]).catch(() => null);
			const rsn = user && user.settings.get('RSN');
			if (rsn) return rsn;
			throw "That person doesn't have an RSN set.";
		}
		if (arg.length > 12) throw 'Invalid username. Please try again.';
		return arg.toLowerCase();
	}

};
