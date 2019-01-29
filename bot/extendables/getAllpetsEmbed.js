const { Extendable, Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const pets = require('../../data/pets');

class getAllpetsEmbed extends Extendable {

	constructor(...args) {
		super(...args, {
			appliesTo: [Command],
			enabled: true,
			klasa: true
		});
	}

	async getAllpetsEmbed(color, [PetsRecieved]) {
		const embed = new MessageEmbed()
			.setColor(color)
			.addField(
				'\u200b',
				`
				${pets[0].emoji} ${PetsRecieved[0]} Red Chins
				${pets[1].emoji} ${PetsRecieved[1]} KC
				${pets[2].emoji} ${PetsRecieved[2]} Magic Logs
				${pets[3].emoji} ${PetsRecieved[3]} Masters
				${pets[4].emoji} ${PetsRecieved[4]} KC
				${pets[5].emoji} ${PetsRecieved[5]} Argougne Laps
				${pets[6].emoji} ${PetsRecieved[6]} Monkfish
				${pets[7].emoji} ${PetsRecieved[7]} KC
				${pets[8].emoji} ${PetsRecieved[8]} KC
				${pets[9].emoji} ${PetsRecieved[9]} Raids
				${pets[10].emoji} ${PetsRecieved[10]} KC
				${pets[11].emoji} ${PetsRecieved[11]} KC
				${pets[12].emoji} ${PetsRecieved[12]} KC
				${pets[13].emoji} ${PetsRecieved[13]} KC`,
				true
			)
			.addField(
				'\u200b',
				`
				${pets[14].emoji} ${PetsRecieved[14]} KC
				${pets[15].emoji} ${PetsRecieved[15]} KC
				${pets[16].emoji} ${PetsRecieved[16]} KC
				${pets[17].emoji} ${PetsRecieved[17]} KC
				${pets[18].emoji} ${PetsRecieved[18]} KC
				${pets[19].emoji} ${PetsRecieved[19]} Gambles
				${pets[20].emoji} ${PetsRecieved[20]} KC
				${pets[21].emoji} ${PetsRecieved[21]} KC
				${pets[22].emoji} ${PetsRecieved[22]} KC
				${pets[23].emoji} ${PetsRecieved[23]} KC
				${pets[24].emoji} ${PetsRecieved[24]} KC
				${pets[25].emoji} ${PetsRecieved[25]} Nature Runes
				${pets[26].emoji} ${PetsRecieved[26]} Paydirt
				${pets[27].emoji} ${PetsRecieved[27]} Ardougne Knights`,
				true
			)
			.addField(
				'\u200b',
				`
				${pets[28].emoji} ${PetsRecieved[28]} KC
				${pets[29].emoji} ${PetsRecieved[29]} KC
				${pets[30].emoji} ${PetsRecieved[30]} Magic Trees
				${pets[31].emoji} ${PetsRecieved[31]} KC
				${pets[32].emoji} ${PetsRecieved[32]} KC
				${pets[33].emoji} ${PetsRecieved[33]} KC
				${pets[34].emoji} ${PetsRecieved[34]} KC
				${pets[35].emoji} ${PetsRecieved[35]} KC
				${pets[36].emoji} ${PetsRecieved[36]} KC
				${pets[37].emoji} ${PetsRecieved[37]} KC
				${pets[38].emoji} ${PetsRecieved[38]} Harvests
				${pets[39].emoji} ${PetsRecieved[39]} KC
				${pets[40].emoji} ${PetsRecieved[40]} Raids
				${pets[41].emoji} ${PetsRecieved[41]} KC`,
				true
			);
		return embed;
	}

}

module.exports = getAllpetsEmbed;
