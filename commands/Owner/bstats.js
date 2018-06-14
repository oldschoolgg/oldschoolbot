const { Command, version: klasaVersion, Duration } = require('klasa');
const { version: discordVersion } = require('discord.js');
const moment = require('moment');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			guarded: true,
			description: 'Displays more advanced statistics about the bot.',
			permissionLevel: 10
		});
	}

	async run(msg) {
		const duration = Duration.toNow(Date.now() - (process.uptime() * 1000));
		const g = {
			tiny: 0,
			small: 0,
			average: 0,
			large: 0,
			massive: 0,
			botfarms: 0,
			total: 0
		};

		let largest = this.client.guilds.first();

		for (const guild of this.client.guilds.values()) {
			if (guild.memberCount < 25) g.tiny++;
			else if (guild.memberCount < 100) g.small++;
			else if (guild.memberCount < 500) g.average++;
			else if (guild.memberCount < 1000) g.large++;
			else g.massive++;

			if (guild.members.filter(u => u.user.bot).size / guild.memberCount * 100 > 70) {
				guild.botfarms++;
			}
			g.total += guild.memberCount;
			if (guild.memberCount > largest.memberCount) largest = guild;
		}

		g.average = Math.floor(g.total / this.client.guilds.size);
		g.largest = largest.name;

		const guildStats = `
• Tiny: ${g.tiny}
• Small: ${g.small}
• Average: ${g.average}
• Large: ${g.large}
• Massive: ${g.massive}

• Total Guilds: ${this.client.guilds.size}
• Bot Farms: ${g.botfarms}`;

		const otherStats = `
• ID: ${this.client.user.id}
• Discord.js v${discordVersion}
• Node.js ${process.version}
• Klasa v${klasaVersion}
• Creation Date ${moment(this.client.user.createdAt).format('DD/MM/YY')}

${this.client.commands.size} Commands
Created by ${this.client.application.owner.username}
[Invite Link](${this.client.invite})
`;

		const embed = new MessageEmbed()
			.setColor(14981973)
			.setThumbnail(this.client.user.displayAvatarURL())
			.addField('Memory Usage', `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\n`, true)
			.addField('Uptime', duration, true)
			.addField('Guilds', guildStats, true)
			.addField('Other Stats', otherStats, true)
			.setFooter(this.client.user.username, this.client.user.displayAvatarURL());

		return msg.send({ embed });
	}

};
