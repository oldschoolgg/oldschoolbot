const { Task } = require('klasa');

module.exports = class extends Task {
	async run() {
		const guildsWith = this.client.guilds.filter(g => g.settings.get('levelUpMessages'));
		const usernameMap = {};
		for (const guild of guildsWith.values()) {
			usernameMap[guild.id] = [];
			await guild.members.fetch({ limit: 2500 });
			for (const member of guild.members.values()) {
				if (!member.user) continue;
				if (!member.user.settings) continue;
				const RSN = member.user.settings.get('RSN');
				if (!RSN) continue;
				if (!usernameMap[guild.id].includes(RSN.toLowerCase())) {
					usernameMap[guild.id].push(RSN.toLowerCase());
				}
			}
		}

		this.client.settings.update('usernameCache', usernameMap);
	}
};
