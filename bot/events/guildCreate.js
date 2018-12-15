const { Event } = require('klasa');

module.exports = class extends Event {

	run({ name, memberCount }) {
		this.client.channels.get(this.client.guildLogs)
			.send(`\`${name}\` with \`${memberCount.toLocaleString()}\` Members added.`);
	}

};
