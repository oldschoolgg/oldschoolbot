const { Event } = require('klasa');

module.exports = class extends Event {
	constructor(...args) {
		super(...args, { once: true, event: 'guildCreate' });
		this.enabled = this.client.production;
	}

	run(guild) {
		if (!guild.available) return;
		if (
			this.client.settings.get('guildBlacklist').includes(guild.id) ||
			(guild.owner && this.client.settings.get('guildBlacklist').includes(guild.owner.id))
		) {
			guild.leave();
			this.client.emit('warn', `Blacklisted guild detected: ${guild.name} [${guild.id}]`);
		}
	}
};
