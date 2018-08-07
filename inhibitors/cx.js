const { Inhibitor } = require('klasa');

module.exports = class extends Inhibitor {

	async run(msg) {
		if (msg.guild && msg.guild.id === '189457265730781185') return !msg.author.roles.has('434233953688354826');
		else return false;
	}

};
