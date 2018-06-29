const { Command } = require('klasa');
const moment = require('moment');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['dmt', 'tourney'],
			description: 'Information on the final hour of DMM.'
		});
	}

	async run(msg) {
		const time = new Date(1530383400 * 1000);
		const now = new Date();
		const difference = time - now;
		return msg.send(`
**The Permadeath Stage starts in ${Math.floor((difference / 1000) / 60 / 60)} hours.**

**Stream:** <http://www.twitch.tv/oldschoolrs>
**Seasonals:** Immediately after the tournament finishes
**Total Prize:** $32,000
**First Place Prize:** $20,000
**News Post:** <http://services.runescape.com/m=news/deadman-summer-finals-2018-live?oldschool=1>
`);
	}

};
