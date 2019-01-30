const { Extendable, Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const pets = require('../../data/pets');

class getStatsEmbed extends Extendable {

	constructor(...args) {
		super(...args, {
			appliesTo: [Command],
			enabled: true,
			klasa: true
		});
	}

	async getAllpetsEmbed(color, { Petrolls }, showExtra = true) {
		const embed = new MessageEmbed()
			.setColor(color)
			.addField(
				'\u200b',
				`
${pets[0].emoji} ${Petrolls.CHIN_PET + "Red Chins"}
${pets[1].emoji} ${Petrolls.MOLE_PET + "KC"}
${pets[2].emoji} ${Petrolls.WC_PET + "Magic Logs"}
${pets[3].emoji} ${Petrolls.BLOODHOUND_PET + "Masters"}
${pets[4].emoji} ${Petrolls.CALLISTO_PET + "KC"}
${pets[5].emoji} ${Petrolls.AGILITY_PET + "Argougne Laps"}
${pets[6].emoji} ${Petrolls.FISHING_PET + "Monkfish"}
${pets[7].emoji} ${Petrolls.KQ_PET + "KC"}
${pets[8].emoji} ${Petrolls.GARGOYLE_PET + "KC"}
${pets[9].emoji} ${Petrolls.OLM_PET + "Raids"}
${pets[10].emoji} ${Petrolls.CHAOS_ELE_PET + "KC"}
${pets[11].emoji} ${Petrolls.DAGGANOTH_PRIME_PET + "KC"}
${pets[12].emoji} ${Petrolls.DAGANNOTH_REX_PET + "KC"}
${pets[13].emoji} ${Petrolls.DAGANNOTH_SUPREME_PET + "KC"}`,
				true
			)
			.addField(
				'\u200b',
				`
${pets[14].emoji} ${Petrolls.CORP_PET + "KC"}
${pets[15].emoji} ${Petrolls.GRAARDOR_PET + "KC"}
${pets[16].emoji} ${Petrolls.KRAKEN_PET + "KC"}
${pets[17].emoji} ${Petrolls.KREE_PET + "KC"}
${pets[18].emoji} ${Petrolls.KRIL_PET + "KC"}
${pets[19].emoji} ${Petrolls.PENANCE_PET + "Gambles"}
${pets[20].emoji} ${Petrolls.THERMY_PET + "KC"}
${pets[21].emoji} ${Petrolls.ZULRAH_PET + "KC"}
${pets[22].emoji} ${Petrolls.ZILY_PET + "KC"}
${pets[23].emoji} ${Petrolls.PHOENIX_PET + "KC"}
${pets[24].emoji} ${Petrolls.KBD_PET + "KC"}
${pets[25].emoji} ${Petrolls.RC_PET + "Nature Runes"}
${pets[26].emoji} ${Petrolls.MINING_PET + "Paydirt"}
${pets[27].emoji} ${Petrolls.THIEVING_PET + "Ardougne Knights"}`,
				true
			)
			.addField(
				'\u200b',
				`
${pets[28].emoji} ${Petrolls.SCORPIA_PET + "KC"}
${pets[29].emoji} ${Petrolls.SKOTIZO_PET + "KC"}
${pets[30].emoji} ${Petrolls.FARMING_PET + "Magic Trees"}
${pets[31].emoji} ${Petrolls.JAD_PET + "KC"}
${pets[32].emoji} ${Petrolls.VENENATIS_PET + "KC"}
${pets[33].emoji} ${Petrolls.VETION_PET + "KC"}
${pets[34].emoji} ${Petrolls.SIRE_PET + "KC"}
${pets[35].emoji} ${Petrolls.CERBERUS_PET + "KC"}
${pets[36].emoji} ${Petrolls.CHOMPY_PET + "KC"}
${pets[37].emoji} ${Petrolls.INFERNO_PET + "KC"}
${pets[38].emoji} ${Petrolls.HERBI_PET + "Harvests"}
${pets[39].emoji} ${Petrolls.VORKATH_PET + "KC"}
${pets[40].emoji} ${Petrolls.VERZIK_PET + "Raids"}
${pets[41].emoji} ${Petrolls.HYDRA_PET + "KC"}`,
				true
			);
		return embed;
	}

}

module.exports = getStatsEmbed;
