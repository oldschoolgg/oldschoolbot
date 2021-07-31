import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

import _quests from '../../lib/data/quests.json';
import { BotCommand } from '../../lib/structures/BotCommand';
import { cleanString } from '../../lib/util';

const quests = _quests as Record<string, Quest>;

const alternativeNameMap: Record<string, string> = {
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

interface Quest {
	name: any;
	description: any;
	url: string;
	thumbnail: string;
	difficulty: any;
	length: any;
	requirements: any[];
	rewards: any[];
	trivia: string | any[];
}

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 3,
			oneAtTime: true,
			aliases: ['qi'],
			description: 'Shows information on a Quest. Not all quests are available.',
			examples: ['+questinfo cooks assistant'],
			usage: '<questName:str>'
		});
	}

	async run(msg: KlasaMessage, [questName]: [string]) {
		const quest = cleanString(questName);

		if (quests[quest]) {
			return msg.channel.send({ embeds: [this.questInfo(quests[quest])] });
		}

		if (alternativeNameMap[quest]) {
			return msg.channel.send({ embeds: [this.questInfo(quests[alternativeNameMap[quest]])] });
		}

		return msg.channel.send("I don't have that quest, sorry!");
	}

	questInfo(quest: Quest) {
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
}
