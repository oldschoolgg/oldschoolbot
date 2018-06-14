const { Command } = require('klasa');
const Crystalmethlabs = require('crystalmethlabs');
const osrs = new Crystalmethlabs('osrs');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 2,
			description: 'CML Records for an account, in a period of day, week or month.',
			usage: '<day|week|month> <username:str> [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [timePeriod, ...username]) {
		const { emoji } = this.client;
		username = username.join(' ');

		const { err, records } = await osrs.recordsOfPlayer(username);
		if (err) return msg.send(err);

		for (const skill in records) {
			records[skill][timePeriod] = records[skill][timePeriod].toLocaleString();
		}

		const embed = new MessageEmbed()
			.setColor(3120895)
			.setFooter(`CrystalMathLabs / Records / ${timePeriod}`, 'https://i.imgur.com/k12Kmhg.png')
			.setDescription(username)
			.addField(
				'\u200b',
				`
${emoji.attack} ${records.attack[timePeriod]}
${emoji.strength} ${records.strength[timePeriod]}
${emoji.defence} ${records.defence[timePeriod]}
${emoji.ranged} ${records.ranged[timePeriod]}
${emoji.prayer} ${records.prayer[timePeriod]}
${emoji.magic} ${records.magic[timePeriod]}
${emoji.runecraft} ${records.runecrafting[timePeriod]}
${emoji.construction} ${records.construction[timePeriod]}`,
				true
			)
			.addField(
				'\u200b',
				`
${emoji.hitpoints} ${records.hitpoints[timePeriod]}
${emoji.agility} ${records.agility[timePeriod]}
${emoji.herblore} ${records.herblore[timePeriod]}
${emoji.thieving} ${records.thieving[timePeriod]}
${emoji.crafting} ${records.crafting[timePeriod]}
${emoji.fletching} ${records.fletching[timePeriod]}
${emoji.slayer} ${records.slayer[timePeriod]}
${emoji.hunter} ${records.hunter[timePeriod]}`,
				true
			)
			.addField(
				'\u200b',
				`
${emoji.mining} ${records.mining[timePeriod]}
${emoji.smithing} ${records.smithing[timePeriod]}
${emoji.fishing} ${records.fishing[timePeriod]}
${emoji.cooking} ${records.cooking[timePeriod]}
${emoji.firemaking} ${records.firemaking[timePeriod]}
${emoji.woodcutting} ${records.woodcutting[timePeriod]}
${emoji.farming} ${records.farming[timePeriod]}
${emoji.total} ${records.overall[timePeriod]}`,
				true
			)
			.addField(`${emoji.total} Overall`, records.overall[timePeriod], true)
			.addField(`${emoji.clock} EHP`, records.ehp[timePeriod], true)
			.addField('\u200b', '\u200b', true);

		return msg.send({ embed });
	}

};
