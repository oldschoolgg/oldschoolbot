const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const quests = require('../../resources/quests.json');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 3,
			aliases: ['q'],
			description: 'Shows information on a Quest. (Work in Progress)',
			usage: '<questName:str>'
		});
	}

	async run(msg, [questName]) {
		const quest = this.cleanString(questName, true);

		if (quests[quest]) {
			return msg.send(this.questInfo(quests[quest]));
		} else if (alternativeNameMap[quest]) {
			return msg.send(this.questInfo(quests[alternativeNameMap[quest]]));
		} else {
			return msg.send("I don't have that quest, sorry!");
		}
	}
	questInfo(quest) {
		return new MessageEmbed()
			.setTitle(quest.name)
			.setDescription(quest.description)
			.setURL(quest.url)
			.setThumbnail(quest.thumbnail)
			.addField('**Difficulty**', quest.difficulty, true)
			.addField('**Length**', quest.length, true)
			.addField('Requirements', quest.requirements.join('\n'), true)
			.addField('Rewards', quest.rewards.join('\n'), true)
			.addField('Trivia', quest.trivia[Math.floor(Math.random() * quest.trivia.length)], true);
	}

};

const alternativeNameMap = {
	FREMENNIKISLES: 'FREMISLES',
	THEFREMENNIKISLES: 'FREMISLES',
	THEDIGSITE: 'DIGSITE',
	THEDEPTHSOFDESPAIR: 'DEPTHSOFDESPAIR',
	THEKNIGHTSSWORD: 'KNIGHTSSWORD',
	THECORSAIRCURSE: 'CORSAIRCURSE',
	RECIPEFORDISASTER: 'RFD',
	'ROMEO&JULIET': 'ROMEOANDJULIET',
	THERESTLESSGHOST: 'RESTLESSGHOST',
	'RAG&BONEMANWISHLIST': 'WISHLIST',
	RAGANDBONEMANWISHLIST: 'WISHLIST',
	FAIRYTALEPART2: 'FAIRYTALEIICUREAQUEEN',
	FAIRYTALE2: 'FAIRYTALEIICUREAQUEEN',
	FAIRYTALEPARTII: 'FAIRYTALEIICUREAQUEEN',
	FAIRYTALEII: 'FAIRYTALEIICUREAQUEEN',
	MOURNINGSENDPART2: 'MOURNINGSENDPARTI',
	MOURNINGSEND2: 'MOURNINGSENDPARTI',
	MOURNINGSENDPARTII: 'MOURNINGSENDPARTI',
	MOURNINGSEND: 'MOURNINGSENDPARTI',
	MOURNINGSENDPART1: 'MOURNINGSENDPARTI',
	MM: 'MONKEYMADNESS',
	MONEYMADNESS1: 'MONKEYMADNESS',
	MM2: 'MONKEYMADNESSII',
	MONEYMADNESS2: 'MONKEYMADNESSII',
	HEROSQUEST: 'HEROESQUEST',
	GRANDTREE: 'THEGRANDTREE',
	GARDENOFTRANQUILLITY: 'GARDENOFTRANQ',
	GARDENOFTRANQUILITY: 'GARDENOFTRANQ',
	FAIRYTALEPART1: 'FAIRYTALEIGROWINGPAINS',
	FAIRYTALE1: 'FAIRYTALEIGROWINGPAINS',
	FAIRYTALEPARTI: 'FAIRYTALEIGROWINGPAINS',
	ATAILOF2CATS: 'ATAILOFTWOCATS',
	TAILOF2CATS: 'ATAILOFTWOCATS',
	TAILOFTWOCATS: 'ATAILOFTWOCATS',
	FORGETTABLETALEOFADRUNKENDWARF: 'FORGETTABLETALE',
	EYESOFGLOUPHRIE: 'THEEYESOFGLOUPHRIE',
	CHOMPYBIRDHUNTING: 'BIGCHOMPYBIRDHUNTING',
	ELEMENTALWORKSHOP2: 'ELEMENTALWORKSHOPII',
	ELEMENTALWORKSHOP1: 'ELEMENTALWORKSHOPI',
	ELEMENTALWORKSHOP: 'ELEMENTALWORKSHOPI',
	EDGARSRUSE: 'EADGARSRUSE',
	ALFREDGRIMHANDSBARCRAWL: 'BARCRAWL'
};
