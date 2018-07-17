const { Command } = require('klasa');
const osrs = require('osrs-wrapper');
const { MessageEmbed } = require('discord.js');
const diaryReqs = require('../../resources/diaryReqs');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 2,
			aliases: ['d'],
			description: 'Check which diaries your account has the required stats to complete',
			usage: '[user:user|username:str]'
		});
	}

	async run(msg, [username]) {
		username = this.getUsername(username, msg);

		const { Skills } = await osrs.hiscores
			.getPlayer(username, 'Normal')
			.then(player => player)
			.catch(() => { throw this.client.notFound; });

		const embed = new MessageEmbed()
			.setColor(11132490)
			.setThumbnail('https://i.imgur.com/wV9zvLM.png')
			.setDescription(username)
			.addField(
				'Diary', Object.keys(diaryReqs).join('\n'),
				true
			)
			.addField(
				'You can complete:',
				Object.keys(diaryReqs).map(diary => this.check(Skills, diaryReqs[diary])).join('\n'),
				true
			);
		return msg.send({ embed });
	}

	check(skills, diary) {
		const levelMap = ['Easy', 'Medium', 'Hard', 'Elite'];
		const canComplete = [];
		for (let i = 0; i < 4; i++) {
			for (const req of Object.keys(diary)) {
				if (req !== 'Construction') {
					const statLevel = skills[req].level;
					const levelRequirement = diary[req][i];
					if (levelRequirement === 0) continue;
					if (statLevel < levelRequirement) break;
				} else {
					canComplete.push(levelMap[i]);
				}
			}
		}
		return canComplete.length ? canComplete.join(', ') : '-';
	}

};
