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
		const timeUntil = moment(new Date(1529778600 * 1000)).format('HH [hours] [and] mm [minutes]');
		return msg.send(`
**The Permadeath Stage starts in ${timeUntil}.**

**Stream:** <http://www.twitch.tv/oldschoolrs>
**Seasonals:** Immediately after the tournament finishes
**Total Prize:** $32,000
**First Place Prize:** $20,000
**News Post:** <http://services.runescape.com/m=news/deadman-summer-finals-2018-live?oldschool=1>
`);
	}

};
