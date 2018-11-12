const { Command, util: { chunk } } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Shows the links for some OSRS youtubers.',
			aliases: ['yt']
		});
	}

	async run(msg) {
		const random = youtubers.sort(() => Math.random() - 0.5);
		const formatted = chunk(random, 5).map(list => list.join(', ')).join('\n');

		const embed = new MessageEmbed()
			.setTitle('Here are some Old School RuneScape youtubers!')
			.setColor(14981973)
			.setDescription(formatted);

		return msg.send({ embed });
	}

};

const youtubers = [
	'[SirPugger](https://www.youtube.com/user/SirPugger)',
	'[Theoatrix](https://www.youtube.com/user/Theoatrix)',
	'[Slayermusiq1](https://www.youtube.com/user/slayermusiq1)',
	'[Torvesta](https://www.youtube.com/channel/UCIc3VLtBvQD0KqttqEJ4KYw)',
	'[Gunschilli](https://www.youtube.com/channel/UC8MlhKXmnpHmhSeI_5H1FSQ)',
	'[C Engineer](https://www.youtube.com/channel/UCUNoAjAgVHEHc6jrUr4XuWQ)',
	'[Seerz](https://www.youtube.com/user/RS2007Vids/)',
	'[Framed](https://www.youtube.com/user/iskiml0ot)',
	'[B0aty](https://www.youtube.com/user/MyNameIsB0aty)',
	'[A Friend](https://www.youtube.com/user/EraserGaming)',
	'[Alkan](https://www.youtube.com/user/AlkanRs)',
	'[Zulu](https://www.youtube.com/user/ReallyJon)',
	'[Mr No Sleep](https://www.youtube.com/channel/UCFXjcgTVt06R-4bsAv99a7w)',
	'[Devious](https://www.youtube.com/channel/UCo2qXs8sKnm1Fbc8ascCe6w)',
	'[RiceCup](https://www.youtube.com/channel/UCPTn3ay9blvIspHt1bR3F2A)',
	'[Solo Mission](https://www.youtube.com/channel/UC2W-gFz7UfNVdx0N1bgTB4A)',
	'[Raikesy](https://www.youtube.com/user/evelraikesy)',
	'[MiKa 279](https://www.youtube.com/user/MrBacar23)',
	'[Sparc Mac](https://www.youtube.com/user/ggggllo)',
	'[ThirdAgeFilm/Soup](https://www.youtube.com/user/ThirdAgeFilm)'
];
