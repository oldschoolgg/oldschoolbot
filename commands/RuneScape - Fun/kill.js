/* eslint-disable */
const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const corp = require('../../resources/monsters/corp');
const raids = require('../../resources/monsters/raids');
const barrows = require('../../resources/monsters/barrows');
const tob = require('../../resources/monsters/tob');
const vorkath = require('../../resources/monsters/vorkath');
const grotesqueGuardians = require('../../resources/monsters/grotesqueGuardians');
const bandos = require('../../resources/monsters/bandos');
const saradomin = require('../../resources/monsters/saradomin');
const zulrah = require('../../resources/monsters/zulrah');
const cerberus = require('../../resources/monsters/cerberus');
const demonicGorilla = require('../../resources/monsters/demonicGorilla');
const abbyDemon = require('../../resources/monsters/abbyDemon');
const kurask = require('../../resources/monsters/kurask');
const kalphiteQueen = require('../../resources/monsters/kalphiteQueen');
const zamorak = require('../../resources/monsters/zamorak');
const armadyl = require('../../resources/monsters/armadyl');
const lizardmanShaman = require('../../resources/monsters/lizardmanShaman');
const callisto = require('../../resources/monsters/callisto');
const vetion = require('../../resources/monsters/vetion');
const brutalBlackDragon = require('../../resources/monsters/brutalBlackDragon');
const venenatis = require('../../resources/monsters/venenatis');
const wyvern = require('../../resources/monsters/wyvern');
const ancientWyvern = require('../../resources/monsters/ancientWyvern');
const kingBlackDragon = require('../../resources/monsters/kingBlackDragon');
const abyssalSire = require('../../resources/monsters/abyssalSire');
const thermy = require('../../resources/monsters/thermy');
const giantMole = require('../../resources/monsters/giantMole');
const skotizo = require('../../resources/monsters/skotizo');
const scorpia = require('../../resources/monsters/scorpia');
const chaosElemental = require('../../resources/monsters/chaosElemental');
const wintertodt = require('../../resources/monsters/wintertodt');
const kraken = require('../../resources/monsters/kraken');
const obor = require('../../resources/monsters/obor');
const dagannothSupreme = require('../../resources/monsters/dagannothSupreme');
const dagannothRex = require('../../resources/monsters/dagannothRex');
const lavaDragon = require('../../resources/monsters/lavaDragon');
const dagannothPrime = require('../../resources/monsters/dagannothPrime');
const chaosFanatic = require('../../resources/monsters/chaosFanatic');
const crazyArchaeologist = require('../../resources/monsters/crazyArchaeologist');
const mithrilDragon = require('../../resources/monsters/mithrilDragon');
const adamantDragon = require('../../resources/monsters/adamantDragon');
const runeDragon = require('../../resources/monsters/runeDragon');
const bryophyta = require('../../resources/monsters/bryophyta');

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
			case 'CORP':
			case 'CORPOREALBEAST':
			case 'CORPBEAST': {
				if (quantity > 5000) return msg.send('I can only kill a maximum of 5000 Corp beasts at a time!');
				const loot = corp.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'KURASK': {
				if (quantity > 5000) return msg.send('I can only kill a maximum of 5000 Kurasks at a time!');
				const loot = kurask.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'LAVADRAGON':
			case 'LAVADRAG': {
				if (quantity > 200) return msg.send('I can only kill a maximum of 200 Lava Dragons at a time!');
				const loot = lavaDragon.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'BRUTALBLACKDRAGON':
			case 'BBD':
			case 'BRUTALBLACK': {
				if (quantity > 100) return msg.send('I can only kill a maximum of 100 Brutal Black Dragons at a time!');
				const loot = brutalBlackDragon.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'RAIDS':
			case 'OLM':
			case 'RAIDS1':
			case 'COX':
			case 'CHAMBERSOFXERIC': {
				if (quantity > 100000) return msg.send('I can only do a maximum of 100,000 Raids at a time!');
				const loot = raids.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'RAIDS2':
			case 'THEATREOFBLOOD':
			case 'TOB': {
				if (quantity > 10000) {
					return msg.send("I can only do a maximum of 10,000 Theatres of Blood at a time! I'm not Woox!");
				}
				const loot = tob.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'BARROWS': {
				if (quantity > 300) return msg.send('I can only do a maximum of 300 Barrows Chests at a time!');
				const loot = barrows.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'BANDOS':
			case 'GENERALGRAARDOR':
			case 'GRAARDOR': {
				if (quantity > 100000) return msg.send('I can only do a maximum of 100,000 Bandos kills at a time!');
				const loot = bandos.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'SARA':
			case 'SARADOMIN':
			case 'ZILY':
			case 'ZILYANA':
			case 'COMMANDERZILYANA': {
				if (quantity > 500) return msg.send('I can only do a maximum of 500 Sara kills at a time!');
				const loot = saradomin.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'ZULRAH': {
				if (quantity > 500) return msg.send('I can only do a maximum of 500 Zulrah kills at a time!');
				const loot = zulrah.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'VORKATH': {
				if (quantity > 500) return msg.send('I can only do a maximum of 500 Vorkath kills at a time!');
				const loot = vorkath.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'CERB':
			case 'CERBERUS': {
				if (quantity > 500) return msg.send('I can only do a maximum of 500 Cerberus kills at a time!');
				const loot = cerberus.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'ABYSSALDEMON':
			case 'ABYSSALDEMONS':
			case 'ABBYDEMON':
			case 'ABBYDEMONS': {
				if (quantity > 5000) return msg.send('I can only do a maximum of 5000 Abyssal Demon kills at a time!');
				const loot = abbyDemon.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'GORILLAS':
			case 'DGS':
			case 'DEMONICGORILLAS':
			case 'DEMONICGORILLA':
			case 'DEMONICS': {
				if (quantity > 500) return msg.send("I can only kill 500 Demonic Gorilla's at a time!");
				const loot = demonicGorilla.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'KQ':
			case 'KALPHITEQUEEN': {
				if (quantity > 500) return msg.send("I can only kill 500 Kalphite Queen's at a time!");
				const loot = kalphiteQueen.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'ZAMMY':
			case 'ZAMORAK':
			case 'KRIL':
			case 'KRILTSUTSAROTH': {
				if (quantity > 500) return msg.send("I can only kill 500 K'ril Tsutsaroth's at a time!");
				const loot = zamorak.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'ARMA':
			case 'ARMADYL':
			case 'KREE':
			case 'KREEARRA': {
				if (quantity > 500) return msg.send("I can only kill 500 Kree'arra's at a time!");
				const loot = armadyl.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'SHAMANS':
			case 'LIZARDMANSHAMANS':
			case 'LIZARDMANSHAMAN':
			case 'LIZARDMEN': {
				if (quantity > 1000) return msg.send("I can only kill 1000 Lizardman Shaman's at a time!");
				const loot = lizardmanShaman.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'CALLISTO': {
				if (quantity > 500) return msg.send("I can only kill 500 Callisto's at a time!");
				const loot = callisto.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'VETION': {
				if (quantity > 500) return msg.send("I can only kill 500 Vet'ions at a time!");
				const loot = vetion.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'VENENATIS': {
				if (quantity > 500) return msg.send('I can only kill 500 Venenatis at a time!');
				const loot = venenatis.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'SKELETALWYVERN':
			case 'SKELETALWYVERNS':
			case 'WYVERNS': {
				if (quantity > 1000) return msg.send('I can only kill 1000 Skeletal Wyverns at a time!');
				const loot = wyvern.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'ANCIENTWYVERN':
			case 'ANCIENTWYVERNS':
			case 'FOSSILISLANDWYVERNS': {
				if (quantity > 1000) return msg.send('I can only kill 1000 Ancient Wyverns at a time!');
				const loot = ancientWyvern.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'GROTESQUEGUARDIANS':
			case 'GGS':
			case 'DUSK':
			case 'DAWN': {
				if (quantity > 500) return msg.send('I can only kill 500 Grotesque Guardians at a time!');
				const loot = grotesqueGuardians.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'KBD':
			case 'KINGBLACKDRAGON': {
				if (quantity > 500) return msg.send('I can only kill 500 King Black Dragons at a time!');
				const loot = kingBlackDragon.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'ABYSSALSIRE':
			case 'ABBYSIRE':
			case 'SIRE': {
				if (quantity > 500) return msg.send('I can only kill 500 Abyssal Sires at a time!');
				const loot = abyssalSire.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'THERMY':
			case 'THERMONUCLEARSMOKEDEVIL': {
				if (quantity > 500) return msg.send("I can only kill 500 Thermonuclear smoke devil's at a time!");
				const loot = thermy.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'GIANTMOLE':
			case 'MOLE': {
				if (quantity > 5000) return msg.send("I can only kill 5000 Giant Mole's at a time!");
				const loot = giantMole.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'SKOTIZO': {
				if (quantity > 500) return msg.send('I can only kill 500 Skotizo at a time!');
				const loot = skotizo.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'SCORPIA': {
				if (quantity > 500) return msg.send('I can only kill 500 Scorpia at a time!');
				const loot = scorpia.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'CHAOSELE':
			case 'CHAOSELEMENTAL': {
				if (quantity > 500) return msg.send('I can only kill 500 Chaos Elementals at a time!');
				const loot = chaosElemental.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'WINTERTODT':
			case 'WINTERTOAD':
			case 'TODT':
			case 'WT': {
				if (quantity > 500) return msg.send("I can only kill 500 Wintertodt's at a time!");
				const loot = wintertodt.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'KRAKEN': {
				if (quantity > 500) return msg.send("I can only kill 500 Kraken's at a time!");
				const loot = kraken.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'OBOR':
			case 'HILLGIANTBOSS': {
				if (quantity > 500) return msg.send("I can only kill 500 Obor's at a time!");
				const loot = obor.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'REX':
			case 'DAGANNOTHREX': {
				if (quantity > 500) return msg.send("I can only kill 500 Dagannoth Rex's at a time!");
				const loot = dagannothRex.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'SUPREME':
			case 'DAGANNOTHSUPREME': {
				if (quantity > 500) return msg.send('I can only kill 500 Dagannoth Supremes at a time!');
				const loot = dagannothSupreme.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'PRIME':
			case 'DAGANNOTHPRIME': {
				if (quantity > 500) return msg.send('I can only kill 500 Dagannoth Primes at a time!');
				const loot = dagannothPrime.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}

			case 'DAGKINGS':
			case 'DAGANNOTHKINGS':
			case 'DKS': {
				let quantityRex = 0;
				let quantitySupreme = 0;
				let quantityPrime = 0;
				if (quantity > 1000) return msg.send('I can only kill 1000 Dagannoth Kings at a time!');
				if (quantity % 3 === 2) {
					quantitySupreme = Math.floor(quantity / 3) + 1;
					quantityRex = quantitySupreme;
					quantityPrime = quantityRex - 1;
				} else if (quantity % 3 === 1) {
					quantitySupreme = Math.floor(quantity / 3) + 1;
					quantityRex = quantitySupreme - 1;
					quantityPrime = quantityRex;
				} else {
					quantitySupreme = quantity / 3;
					quantityRex = quantity / 3;
					quantityPrime = quantity / 3;
				}
				const rexLoot = dagannothRex.kill(quantityRex)
				const supremeLoot = dagannothSupreme.kill(quantitySupreme)
				const primeLoot = dagannothPrime.kill(quantityPrime);

				return msg.send((rexLoot.length || supremeLoot.length || primeLoot.length) > 0 ? rexLoot + ' ' + supremeLoot + ' ' + primeLoot : 'You got nothing.');
			}
			case 'CHAOSFANATIC': {
				if (quantity > 500) return msg.send('I can only kill 500 Chaos Fanatics at a time!');
				const loot = chaosFanatic.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}

			case 'CRAZYARCH':
			case 'CRAZYARCHAEOLOGIST': {
				if (quantity > 500) return msg.send('I can only kill 500 Crazy Archaeologists at a time!');
				const loot = crazyArchaeologist.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}

			case 'MITHRILDRAGONS':
			case 'MITHRILDRAGS':
			case 'MITHDRAGS':
			case 'MITHDRAGONS': {
				if (quantity > 1000) return msg.send('I can only kill 1000 Mithril Dragons at a time!');
				const loot = mithrilDragon.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}

			case 'ADAMANTDRAGONS':
			case 'ADAMANTDRAGS':
			case 'ADDYDRAGS':
			case 'ADDYDRAGONS': {
				if (quantity > 1000) return msg.send('I can only kill 1000 Adamant Dragons at a time!');
				const loot = adamantDragon.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}

			case 'RUNEDRAGONS':
			case 'RUNEDRAGS': {
				if (quantity > 1000) return msg.send('I can only kill 1000 Rune Dragons at a time!');
				const loot = runeDragon.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}

			case 'BRYOPHYTA':
			case 'MOSSGIANTBOSS': {
				if (quantity > 500) return msg.send("I can only kill 500 Bryophyta's at a time!");
				const loot = bryophyta.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}

			default:
				return msg.send("I don't have that monster!");
		}
	}
};
