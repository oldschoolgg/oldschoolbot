const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

const ZWS = '​'.repeat(20);

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			aliases: ['li']
		});
	}

	async run(msg) {
		const embed = new MessageEmbed()
			.setTitle('The Twisted League')
			.setURL('https://secure.runescape.com/m=news/the-twisted-league?oldschool=1')
			.setThumbnail(
				'https://cdn.runescape.com/assets/img/external/oldschool/2019/newsposts/2019-11-07/LeagueLogoFinal1.png'
			)
			.setColor(14981973)
			.setDescription(
				`Leagues is a new game mode. In this first League, The Twisted League, you’ll be playing as an Ironman restricted to Kebos & Kourend. To play, simply log into any of the worlds marked in green.`
			)
			.addField(
				ZWS,
				`<:league_logo:644488463416295424> [Blog Post](https://secure.runescape.com/m=news/the-twisted-league?oldschool=1)

<:league_tasks:644484481054539777>  [Tasks](https://oldschool.runescape.wiki/w/Twisted_League/Tasks)

<:league_relic:644484480999882752> [Relics](https://oldschool.runescape.wiki/w/Twisted_League#Relics)`,
				true
			)
			.addField(
				ZWS,
				`
<:Casket:365003978678730772> [Rewards](https://oldschool.runescape.wiki/w/Twisted_League#Rewards)

<:xp:630911040510623745> [Hiscores](https://secure.runescape.com/m=hiscore_oldschool_seasonal/overall.ws)

<:league_info:644484480936968192> [Guide](https://oldschool.runescape.wiki/w/Twisted_League/Guide)`,
				true
			);

		return msg.send({ embed });
	}
};
