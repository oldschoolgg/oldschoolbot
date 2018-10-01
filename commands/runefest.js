const { Command } = require('klasa');
const moment = require('moment');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Shows how long until RuneFest 2018.'
		});
	}

	async run(msg) {
		const now = moment();
		const end = moment.unix(1538818200);
		var duration = moment.duration(end.diff(now));
		const days = parseInt(duration.asDays());
		const hours = parseInt(duration.asHours() - (days * 24));
		return msg.send(`
RuneFest 2018 starts in **${days} days, ${hours} hours**

**Twitch Event:** <https://www.twitch.tv/events/PyjgcvGIQ6Oa0YHc9h2B0g>
**Stream:** <https://www.twitch.tv/jagex>

**Schedule:**

10:45 - Opening Ceremony
12:00 - Cosplay Parade
13:00 - Creator Game Show
14:00 - Quest & Lore
15:00 - Golden Gnome Awards 2018
16:00 - Old School RuneScape - The First 5 Years
17:00 - RuneScape Winter Reveals
18:00 - Old School RuneScape Reveals
`);
	}

};
