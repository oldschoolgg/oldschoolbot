const { Extendable, Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const pets = require('../../data/pets');

class getAllPetsEmbed extends Extendable {
	constructor(...args) {
		super(...args, {
			appliesTo: [Command],
			enabled: true,
			klasa: true
		});
	}

	async getAllPetsEmbed(color, [petsRecieved]) {
		const embed = new MessageEmbed()
			.setColor(color)
			.addField(
				'\u200b',
				`
				${pets[0].emoji} ${petsRecieved[0]} Red Chins
				${pets[1].emoji} ${petsRecieved[1]} KC
				${pets[2].emoji} ${petsRecieved[2]} Magic Logs
				${pets[3].emoji} ${petsRecieved[3]} Masters
				${pets[4].emoji} ${petsRecieved[4]} KC
				${pets[5].emoji} ${petsRecieved[5]} Ardougne Laps
				${pets[6].emoji} ${petsRecieved[6]} Monkfish
				${pets[7].emoji} ${petsRecieved[7]} KC
				${pets[8].emoji} ${petsRecieved[8]} KC
				${pets[9].emoji} ${petsRecieved[9]} Raids
				${pets[10].emoji} ${petsRecieved[10]} KC
				${pets[11].emoji} ${petsRecieved[11]} KC
				${pets[12].emoji} ${petsRecieved[12]} KC
				${pets[13].emoji} ${petsRecieved[13]} KC`,
				true
			)
			.addField(
				'\u200b',
				`
				${pets[14].emoji} ${petsRecieved[14]} KC
				${pets[15].emoji} ${petsRecieved[15]} KC
				${pets[16].emoji} ${petsRecieved[16]} KC
				${pets[17].emoji} ${petsRecieved[17]} KC
				${pets[18].emoji} ${petsRecieved[18]} KC
				${pets[19].emoji} ${petsRecieved[19]} Gambles
				${pets[20].emoji} ${petsRecieved[20]} KC
				${pets[21].emoji} ${petsRecieved[21]} KC
				${pets[22].emoji} ${petsRecieved[22]} KC
				${pets[23].emoji} ${petsRecieved[23]} KC
				${pets[24].emoji} ${petsRecieved[24]} KC
				${pets[25].emoji} ${petsRecieved[25]} Nature Runes
				${pets[26].emoji} ${petsRecieved[26]} Paydirt
				${pets[27].emoji} ${petsRecieved[27]} Ardougne Knights`,
				true
			)
			.addField(
				'\u200b',
				`
				${pets[28].emoji} ${petsRecieved[28]} KC
				${pets[29].emoji} ${petsRecieved[29]} KC
				${pets[30].emoji} ${petsRecieved[30]} Magic Trees
				${pets[31].emoji} ${petsRecieved[31]} KC
				${pets[32].emoji} ${petsRecieved[32]} KC
				${pets[33].emoji} ${petsRecieved[33]} KC
				${pets[34].emoji} ${petsRecieved[34]} KC
				${pets[35].emoji} ${petsRecieved[35]} KC
				${pets[36].emoji} ${petsRecieved[36]} KC
				${pets[37].emoji} ${petsRecieved[37]} KC
				${pets[38].emoji} ${petsRecieved[38]} Harvests
				${pets[39].emoji} ${petsRecieved[39]} KC
				${pets[40].emoji} ${petsRecieved[40]} Raids
				${pets[41].emoji} ${petsRecieved[41]} KC`,
				true
			);
		return embed;
	}
}

module.exports = getAllPetsEmbed;
