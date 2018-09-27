const { Event } = require('klasa');

module.exports = class extends Event {

	run(guild) {
		// this.client.guildLogs
		this.client.channels.get('346212633583681536')
			.send(`\`${guild.name}\` with \`${guild.memberCount.toLocaleString()}\` Members removed.`);
	}

};
