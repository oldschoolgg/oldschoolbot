const { Task } = require('klasa');
const { Hiscores } = require('oldschooljs');
const pLimit = require('p-limit');

const limit = pLimit(10);

const { flatten, toTitleCase: tCase } = require('../../../config/util');
const emoji = require('../../../config/skill-emoji');

module.exports = class extends Task {
	async announce(username, message) {
		const usernameMap = this.client.settings.get('usernameCache');
		for (const [guildID, usernames] of Object.entries(usernameMap)) {
			// If the cached usernames for this guild doesnt include this username, continue;
			if (!usernames.includes(username)) continue;
			const guild = this.client.guilds.get(guildID);
			if (!guild) continue;
			const channel = this.client.channels.get(guild.settings.get('levelUpMessages'));
			if (!channel) continue;
			channel.send(message);
		}
	}

	async checkPlayers(players) {
		const lastPlayerStats = this.client.settings.get('lastPlayerStats');
		for (const player of players) {
			const { skills, username } = player;
			const oldPlayer = lastPlayerStats[username];

			lastPlayerStats[username] = player;

			if (oldPlayer && player.skills.overall.level <= oldPlayer.skills.overall.level) {
				if (username === 'mgby') {
					console.log(`Old player: ${JSON.stringify(oldPlayer, null, 4)}`);
					console.log(`New player: ${JSON.stringify(player, null, 4)}`);
				}
				continue;
			}

			if (!oldPlayer) {
				continue;
			}

			for (const [skillName, skillData] of Object.entries(skills)) {
				const oldLevel = oldPlayer.skills[skillName].level;

				if (skillName === 'overall') {
					// If their new overall level isnt 2277, or the old level was already 2277, continue;
					if (skillData.level !== 2277 || oldLevel === 2277) continue;

					this.announce(
						username,
						`**${tCase(username)} just reached the max total level of 2277!**`
					);
				}

				if (skillData.level > oldLevel) {
					this.announce(
						username,
						`${tCase(username)}'s ${tCase(skillName)} level is now ${
							skillData.level
						}! ${emoji[skillName]}`
					);
				}
			}
		}

		this.client.settings.update('lastPlayerStats', lastPlayerStats);
	}

	async run() {
		const usernameMap = this.client.settings.get('usernameCache');

		const allNames = [...new Set(flatten(Object.values(usernameMap)))];

		const fetchedPlayers = (await Promise.all(
			allNames.map(name =>
				limit(() =>
					Hiscores.fetch(name, { virtualLevels: true }).catch(() =>
						console.error(`[LVL-UP] Failed to fetch ${name}`)
					)
				)
			)
		)).filter(Boolean);

		this.checkPlayers(fetchedPlayers);
	}
};
