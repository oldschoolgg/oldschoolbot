const { Event } = require('klasa');

module.exports = class extends Event {

	run(guild) {
		this.client.guildLogs.send(`\`${guild.name}\` with \`${guild.memberCount.toLocaleString()}\` Members removed.`);
	}

};
