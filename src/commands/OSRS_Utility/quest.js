const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

const quests = require('../../../data/quests.json');
const { cleanString } = require('../../util');

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
		const quest = cleanString(questName);

		if (quests[quest]) {
			return msg.send(this.questInfo(quests[quest]));
		}

		if (alternativeNameMap[quest]) {
			return msg.send(this.questInfo(quests[alternativeNameMap[quest]]));
		}

		return msg.send("I don't have that quest, sorry!");
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
			.addField(
				'Trivia',
				quest.trivia[Math.floor(Math.random() * quest.trivia.length)],
				true
			);
	}
};

const alternativeNameMap = {
	FREMMYISLES: 'FREMISLES',
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
	MOURNINGSENDPART2: 'MOURNINGSENDPARTII',
	MOURNINGSEND2: 'MOURNINGSENDPARTII',
	MOURNINGSENDPARTII: 'MOURNINGSENDPARTII',
	MEP2: 'MOURNINGSENDPARTII',
	MEPII: 'MOURNINGSENDPARTII',
	MOURNINGSEND: 'MOURNINGSENDPARTI',
	MOURNINGSENDPART1: 'MOURNINGSENDPARTI',
	MEP1: 'MOURNINGSENDPARTI',
	MEPI: 'MOURNINGSENDPARTI',
	MM: 'MONKEYMADNESS',
	MONKEYMADNESS1: 'MONKEYMADNESS',
	MM2: 'MONKEYMADNESSII',
	MONKEYMADNESS2: 'MONKEYMADNESSII',
	HEROSQUEST: 'HEROESQUEST',
	GRANDTREE: 'THEGRANDTREE',
	GARDENOFTRANQUILLITY: 'GARDENOFTRANQ',
	GARDENOFTRANQUILITY: 'GARDENOFTRANQ',
	FAIRYTALEPART1: 'FAIRYTALEIGROWINGPAINS',
	FAIRYTALE1: 'FAIRYTALEIGROWINGPAINS',
	FAIRYTALEPARTI: 'FAIRYTALEIGROWINGPAINS',
	FAIRYTALEI: 'FAIRYTALEIGROWINGPAINS',
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
	ALFREDGRIMHANDSBARCRAWL: 'BARCRAWL',
	DRAGONSLAYER1: 'DRAGONSLAYER',
	DS: 'DRAGONSLAYER',
	DS1: 'DRAGONSLAYER',
	DRAGONSLAYER2: 'DRAGONSLAYERII',
	DS2: 'DRAGONSLAYERII',
	THETALEOFTHERIGHTEOUS: 'TALEOFTHERIGHTEOUS',
	ATASTEOFHOPE: 'TASTEOFHOPE',
	THEQUEENOFTHIEVES: 'QUEENOFTHIEVES'
};
