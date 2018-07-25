const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 1,
			description: 'Simulate killing bosses (shows only rare drops).',
			usage: '<quantity:int{1}> <BossName:str> [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [quantity, ...BossName]) {
		switch (BossName.join('').toUpperCase()) {
			case 'CORP': {
				if (quantity > 5000) return msg.send('I can only kill a maximum of 5000 Corp beasts at a time!');
				const corp = require('../../resources/monsters/corp');
				const loot = corp.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'RAIDS':
			case 'OLM': {
				if (quantity > 100000) return msg.send('I can only do a maximum of 100,000 Raids at a time!');
				const raids = require('../../resources/monsters/raids');
				const loot = raids.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'BARROWS': {
				if (quantity > 300) return msg.send('I can only do a maximum of 300 Barrows Chests at a time!');
				const barrows = require('../../resources/monsters/barrows');
				const loot = barrows.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'BANDOS': {
				if (quantity > 100000) return msg.send('I can only do a maximum of 100,000 Bandos kills at a time!');
				const bandos = require('../../resources/monsters/bandos');
				const loot = bandos.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'SARA': {
				if (quantity > 500) return msg.send('I can only do a maximum of 500 Sara kills at a time!');
				const saradomin = require('../../resources/monsters/saradomin');
				const loot = saradomin.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'ZULRAH': {
				if (quantity > 500) return msg.send('I can only do a maximum of 500 Zulrah kills at a time!');
				const zulrah = require('../../resources/monsters/zulrah');
				const loot = zulrah.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'VORKATH': {
				if (quantity > 500) return msg.send('I can only do a maximum of 500 Vorkath kills at a time!');
				const vorkath = require('../../resources/monsters/vorkath');
				const loot = vorkath.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'CERB':
			case 'CERBERUS': {
				if (quantity > 500) return msg.send('I can only do a maximum of 500 Cerberus kills at a time!');
				const cerberus = require('../../resources/monsters/cerberus');
				const loot = cerberus.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'ABYSSALDEMON':
			case 'ABBYDEMON':
			case 'ABBY': {
				if (quantity > 5000) return msg.send('I can only do a maximum of 5000 Abyssal Demon kills at a time!');
				const abbyDemon = require('../../resources/monsters/abbyDemon');
				const loot = abbyDemon.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'DEMONICGORILLA':
			case 'DEMONICGORILLAS':
			case 'DG':
			case 'GORILLAS': {
				if (quantity > 500) return msg.send("I can only kill 500 Demonic Gorilla's at a time!");
				const demonicGorilla = require('../../resources/monsters/demonicGorilla');
				const loot = demonicGorilla.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'KQ':
			case 'KALPHITEQUEEN': {
				if (quantity > 500) return msg.send("I can only kill 500 Kalphite Queen's at a time!");
				const kalphiteQueen = require('../../resources/monsters/kalphiteQueen');
				const loot = kalphiteQueen.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'ZAMORAK':
			case 'KRIL':
			case 'ZAMMY': {
				if (quantity > 500) return msg.send("I can only kill 500 K'ril Tsutsaroth's at a time!");
				const zamorak = require('../../resources/monsters/zamorak');
				const loot = zamorak.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'KREE':
			case 'ARMA': {
				if (quantity > 500) return msg.send("I can only kill 500 Kree'arra's at a time!");
				const armadyl = require('../../resources/monsters/armadyl');
				const loot = armadyl.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'LIZARDMANSHAMAN':
			case 'LIZARDMAN':
			case 'SHAMANS':
			case 'SHAMAN': {
				if (quantity > 1000) return msg.send("I can only kill 1000 Lizardman Shaman's at a time!");
				const lizardmanShaman = require('../../resources/monsters/lizardmanShaman');
				const loot = lizardmanShaman.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'CALLISTO': {
				if (quantity > 500) return msg.send("I can only kill 500 Callisto's at a time!");
				const callisto = require('../../resources/monsters/callisto');
				const loot = callisto.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'VETION': {
				if (quantity > 500) return msg.send("I can only kill 500 Vet'ions at a time!");
				const vetion = require('../../resources/monsters/vetion');
				const loot = vetion.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'VENENATIS': {
				if (quantity > 500) return msg.send('I can only kill 100 Venenatis at a time!');
				const venenatis = require('../../resources/monsters/venenatis');
				const loot = venenatis.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'WYVERN':
			case 'WYVERNS': {
				if (quantity > 1000) return msg.send('I can only kill 500 Skeletal Wyverns at a time!');
				const wyvern = require('../../resources/monsters/wyvern');
				const loot = wyvern.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'GROTESQUEGUARDIANS':
			case 'GG':
			case 'DUSK':
			case 'DAWN': {
				if (quantity > 500) return msg.send('I can only kill 500 Grotesque Guardians at a time!');
				const grotesqueGuardians = require('../../resources/monsters/grotesqueGuardians');
				const loot = grotesqueGuardians.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'KBD':
			case 'KINGBLACKDRAGON': {
				if (quantity > 500) return msg.send('I can only kill 100 King Black Dragons at a time!');
				const kingBlackDragon = require('../../resources/monsters/kingBlackDragon');
				const loot = kingBlackDragon.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'SIRE':
			case 'ABYSSALSIRE': {
				if (quantity > 500) return msg.send('I can only kill 500 Abyssal Sires at a time!');
				const abyssalSire = require('../../resources/monsters/abyssalSire');
				const loot = abyssalSire.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'THERMY': {
				if (quantity > 500) return msg.send("I can only kill 500 Thermonuclear smoke devil's at a time!");
				const thermy = require('../../resources/monsters/thermy');
				const loot = thermy.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'GIANTMOLE':
			case 'MOLE': {
				if (quantity > 5000) return msg.send("I can only kill 5000 Giant Mole's at a time!");
				const giantMole = require('../../resources/monsters/giantMole');
				const loot = giantMole.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'SKOTIZO': {
				if (quantity > 500) return msg.send('I can only kill 100 Skotizo at a time!');
				const skotizo = require('../../resources/monsters/skotizo');
				const loot = skotizo.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'SCORPIA': {
				if (quantity > 500) return msg.send('I can only kill 100 Scorpia at a time!');
				const scorpia = require('../../resources/monsters/scorpia');
				const loot = scorpia.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'CHAOSELE':
			case 'CHAOSELEMENTAL': {
				if (quantity > 500) return msg.send('I can only kill 500 Chaos Elementals at a time!');
				const chaosElemental = require('../../resources/monsters/chaosElemental');
				const loot = chaosElemental.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'WINTERTODT':
			case 'TODT': {
				if (quantity > 500) return msg.send("I can only kill 500 Wintertodt's at a time!");
				const wintertodt = require('../../resources/monsters/wintertodt');
				const loot = wintertodt.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'KRAKEN': {
				if (quantity > 500) return msg.send("I can only kill 500 Kraken's at a time!");
				const kraken = require('../../resources/monsters/kraken');
				const loot = kraken.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'OBOR': {
				if (quantity > 500) return msg.send("I can only kill 500 Obor's at a time!");
				const obor = require('../../resources/monsters/obor');
				const loot = obor.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'REX': {
				if (quantity > 500) return msg.send("I can only kill 500 Dagannoth Rex's at a time!");
				const dagannothRex = require('../../resources/monsters/dagannothRex');
				const loot = dagannothRex.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			default:
				return msg.send("I don't have that boss yet.");
		}
	}

};
