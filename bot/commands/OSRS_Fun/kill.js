const { Command } = require('klasa');

const { cleanString } = require('../../../config/util');

const corp = require('../../../data/monsters/corp');
const raids = require('../../../data/monsters/raids');
const barrows = require('../../../data/monsters/barrows');
const tob = require('../../../data/monsters/tob');
const vorkath = require('../../../data/monsters/vorkath');
const grotesqueGuardians = require('../../../data/monsters/grotesqueGuardians');
const bandos = require('../../../data/monsters/bandos');
const saradomin = require('../../../data/monsters/saradomin');
const zulrah = require('../../../data/monsters/zulrah');
const cerberus = require('../../../data/monsters/cerberus');
const demonicGorilla = require('../../../data/monsters/demonicGorilla');
const abbyDemon = require('../../../data/monsters/abbyDemon');
const kurask = require('../../../data/monsters/kurask');
const kalphiteQueen = require('../../../data/monsters/kalphiteQueen');
const zamorak = require('../../../data/monsters/zamorak');
const armadyl = require('../../../data/monsters/armadyl');
const lizardmanShaman = require('../../../data/monsters/lizardmanShaman');
const callisto = require('../../../data/monsters/callisto');
const vetion = require('../../../data/monsters/vetion');
const brutalBlackDragon = require('../../../data/monsters/brutalBlackDragon');
const venenatis = require('../../../data/monsters/venenatis');
const wyvern = require('../../../data/monsters/wyvern');
const ancientWyvern = require('../../../data/monsters/ancientWyvern');
const kingBlackDragon = require('../../../data/monsters/kingBlackDragon');
const abyssalSire = require('../../../data/monsters/abyssalSire');
const thermy = require('../../../data/monsters/thermy');
const giantMole = require('../../../data/monsters/giantMole');
const skotizo = require('../../../data/monsters/skotizo');
const scorpia = require('../../../data/monsters/scorpia');
const chaosElemental = require('../../../data/monsters/chaosElemental');
const wintertodt = require('../../../data/monsters/wintertodt');
const kraken = require('../../../data/monsters/kraken');
const obor = require('../../../data/monsters/obor');
const dagannothSupreme = require('../../../data/monsters/dagannothSupreme');
const dagannothRex = require('../../../data/monsters/dagannothRex');
const lavaDragon = require('../../../data/monsters/lavaDragon');
const dagannothPrime = require('../../../data/monsters/dagannothPrime');
const chaosFanatic = require('../../../data/monsters/chaosFanatic');
const crazyArchaeologist = require('../../../data/monsters/crazyArchaeologist');
const mithrilDragon = require('../../../data/monsters/mithrilDragon');
const adamantDragon = require('../../../data/monsters/adamantDragon');
const runeDragon = require('../../../data/monsters/runeDragon');
const bryophyta = require('../../../data/monsters/bryophyta');
const alchemicalHydra = require('../../../data/monsters/alchemicalHydra');
const hydra = require('../../../data/monsters/hydra');
const drake = require('../../../data/monsters/drake');
const wyrm = require('../../../data/monsters/wyrm');
const hespori = require('../../../data/monsters/hespori');
const sarachnis = require('../../../data/monsters/sarachnis');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			cooldown: 1,
			description: 'Simulate killing bosses (shows only rare drops).',
			usage: '<quantity:int{1}> <BossName:...str>',
			usageDelim: ' '
		});
	}
	/* eslint-disable complexity */
	async run(msg, [quantity, bossName]) {
		switch (cleanString(bossName)) {
			case 'SARACHNIS':
			case 'SARACH':
			case 'SRARACHA': {
				if (quantity > 5000) {
					return msg.send('I can only kill a maximum of 5000 Sarachnis at a time!');
				}
				const loot = sarachnis.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'CORP':
			case 'CORPOREALBEAST':
			case 'CORPBEAST': {
				if (quantity > 5000)
					return msg.send('I can only kill a maximum of 5000 Corp beasts at a time!');
				const loot = corp.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'KURASK':
			case 'KURASKS': {
				if (quantity > 5000)
					return msg.send('I can only kill a maximum of 5000 Kurasks at a time!');
				const loot = kurask.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'LAVADRAGON':
			case 'LAVADRAGONS':
			case 'LAVADRAGS':
			case 'LAVADRAG': {
				if (quantity > 200)
					return msg.send('I can only kill a maximum of 200 Lava Dragons at a time!');
				const loot = lavaDragon.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'BRUTALBLACKDRAGON':
			case 'BBD':
			case 'BRUTALBLACKDRAGONS':
			case 'BRUTALBLACKDRAGS':
			case 'BRUTALBLACKS': {
				if (quantity > 100)
					return msg.send(
						'I can only kill a maximum of 100 Brutal Black Dragons at a time!'
					);
				const loot = brutalBlackDragon.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'RAIDS':
			case 'OLM':
			case 'RAIDS1':
			case 'COX':
			case 'CHAMBERSOFXERIC': {
				if (quantity > 100000)
					return msg.send('I can only do a maximum of 100,000 Raids at a time!');
				const loot = raids.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'RAIDS2':
			case 'THEATREOFBLOOD':
			case 'TOB': {
				if (quantity > 10000) {
					return msg.send(
						"I can only do a maximum of 10,000 Theatres of Blood at a time! I'm not Woox!"
					);
				}
				const loot = tob.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'BARROWS': {
				if (quantity > 300)
					return msg.send('I can only do a maximum of 300 Barrows Chests at a time!');
				const loot = barrows.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'BANDOS':
			case 'GENERALGRAARDOR':
			case 'GRAARDOR': {
				if (quantity > 100000)
					return msg.send('I can only do a maximum of 100,000 Bandos kills at a time!');
				const loot = bandos.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'SARA':
			case 'SARADOMIN':
			case 'ZILY':
			case 'ZILYANA':
			case 'COMMANDERZILYANA': {
				if (quantity > 100000)
					return msg.send('I can only do a maximum of 100,000 Sara kills at a time!');
				const loot = saradomin.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'ZULRAH': {
				if (quantity > 500)
					return msg.send('I can only do a maximum of 500 Zulrah kills at a time!');
				const loot = zulrah.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'VORKATH': {
				if (quantity > 500)
					return msg.send('I can only do a maximum of 500 Vorkath kills at a time!');
				const loot = vorkath.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'CERB':
			case 'CERBERUS': {
				if (quantity > 500)
					return msg.send('I can only do a maximum of 500 Cerberus kills at a time!');
				const loot = cerberus.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'ABYSSALDEMON':
			case 'ABYSSALDEMONS':
			case 'ABBYDEMON':
			case 'ABBYDEMONS': {
				if (quantity > 5000)
					return msg.send(
						'I can only do a maximum of 5000 Abyssal Demon kills at a time!'
					);
				const loot = abbyDemon.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'GORILLAS':
			case 'DGS':
			case 'DEMONICGORILLAS':
			case 'DEMONICGORILLA':
			case 'DEMONICS': {
				if (quantity > 500)
					return msg.send("I can only kill 500 Demonic Gorilla's at a time!");
				const loot = demonicGorilla.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'KQ':
			case 'KALPHITEQUEEN': {
				if (quantity > 500)
					return msg.send("I can only kill 500 Kalphite Queen's at a time!");
				const loot = kalphiteQueen.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'ZAMMY':
			case 'ZAMORAK':
			case 'KRIL':
			case 'KRILTSUTSAROTH': {
				if (quantity > 100000)
					return msg.send("I can only kill 100,000 K'ril Tsutsaroth's at a time!");
				const loot = zamorak.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'ARMA':
			case 'ARMADYL':
			case 'KREE':
			case 'KREEARRA': {
				if (quantity > 100000)
					return msg.send("I can only kill 100,000 Kree'arra's at a time!");
				const loot = armadyl.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'SHAMANS':
			case 'LIZARDMANSHAMANS':
			case 'LIZARDMANSHAMAN':
			case 'LIZARDMEN': {
				if (quantity > 1000)
					return msg.send("I can only kill 1000 Lizardman Shaman's at a time!");
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
				if (quantity > 1000)
					return msg.send('I can only kill 1000 Skeletal Wyverns at a time!');
				const loot = wyvern.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'ANCIENTWYVERN':
			case 'ANCIENTWYVERNS':
			case 'FOSSILISLANDWYVERNS': {
				if (quantity > 1000)
					return msg.send('I can only kill 1000 Ancient Wyverns at a time!');
				const loot = ancientWyvern.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'GROTESQUEGUARDIANS':
			case 'GGS':
			case 'DUSK':
			case 'DAWN': {
				if (quantity > 500)
					return msg.send('I can only kill 500 Grotesque Guardians at a time!');
				const loot = grotesqueGuardians.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'KBD':
			case 'KINGBLACKDRAGON': {
				if (quantity > 500)
					return msg.send('I can only kill 500 King Black Dragons at a time!');
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
				if (quantity > 500)
					return msg.send("I can only kill 500 Thermonuclear smoke devil's at a time!");
				const loot = thermy.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'GIANTMOLE':
			case 'MOLE': {
				if (quantity > 5000)
					return msg.send("I can only kill 5000 Giant Mole's at a time!");
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
				if (quantity > 500)
					return msg.send('I can only kill 500 Chaos Elementals at a time!');
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
				if (quantity > 500)
					return msg.send("I can only kill 500 Dagannoth Rex's at a time!");
				const loot = dagannothRex.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'SUPREME':
			case 'DAGANNOTHSUPREME': {
				if (quantity > 500)
					return msg.send('I can only kill 500 Dagannoth Supremes at a time!');
				const loot = dagannothSupreme.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'PRIME':
			case 'DAGANNOTHPRIME': {
				if (quantity > 500)
					return msg.send('I can only kill 500 Dagannoth Primes at a time!');
				const loot = dagannothPrime.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}

			case 'DAGKINGS':
			case 'DAGANNOTHKINGS':
			case 'DKS': {
				let quantityRex = 0;
				let quantitySupreme = 0;
				let quantityPrime = 0;
				if (quantity > 1000)
					return msg.send('I can only kill 1000 Dagannoth Kings at a time!');
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
				const rexLoot = dagannothRex.kill(quantityRex);
				const supremeLoot = dagannothSupreme.kill(quantitySupreme);
				const primeLoot = dagannothPrime.kill(quantityPrime);
				const loot = rexLoot.concat(supremeLoot.concat(primeLoot));
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'CHAOSFANATIC': {
				if (quantity > 500)
					return msg.send('I can only kill 500 Chaos Fanatics at a time!');
				const loot = chaosFanatic.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}

			case 'CRAZYARCH':
			case 'CRAZYARCHAEOLOGIST': {
				if (quantity > 500)
					return msg.send('I can only kill 500 Crazy Archaeologists at a time!');
				const loot = crazyArchaeologist.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}

			case 'MITHRILDRAGONS':
			case 'MITHRILDRAGS':
			case 'MITHDRAGS':
			case 'MITHDRAGONS': {
				if (quantity > 1000)
					return msg.send('I can only kill 1000 Mithril Dragons at a time!');
				const loot = mithrilDragon.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}

			case 'ADAMANTDRAGONS':
			case 'ADAMANTDRAGS':
			case 'ADDYDRAGS':
			case 'ADDYDRAGONS': {
				if (quantity > 1000)
					return msg.send('I can only kill 1000 Adamant Dragons at a time!');
				const loot = adamantDragon.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}

			case 'RUNEDRAGONS':
			case 'RUNEDRAGS': {
				if (quantity > 1000)
					return msg.send('I can only kill 1000 Rune Dragons at a time!');
				const loot = runeDragon.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}

			case 'BRYOPHYTA':
			case 'MOSSGIANTBOSS': {
				if (quantity > 500) return msg.send("I can only kill 500 Bryophyta's at a time!");
				const loot = bryophyta.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}

			case 'ALCHEMICALHYDRA':
			case 'ALCHEMICALHYDRAS':
			case 'AHYDRA':
			case 'AHYDRAS':
			case 'HYDRAS':
			case 'HYDRA':
			case 'HYDRABOSS': {
				if (quantity > 100000)
					return msg.send('I can only kill 100000 Alchemical Hydras at a time!');
				const loot = alchemicalHydra.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}

			case 'NORMALHYDRA':
			case 'NORMALHYDRAS':
			case 'BABYHYDRA':
			case 'BABYHYDRAS': {
				if (quantity > 500) return msg.send('I can only kill 500 Hydras at a time!');
				const loot = hydra.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}

			case 'DRAKES':
			case 'DRAKE': {
				if (quantity > 500) return msg.send('I can only kill 500 Drakes at a time!');
				const loot = drake.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}

			case 'WYRMS':
			case 'WYRM': {
				if (quantity > 500) return msg.send('I can only kill 500 Wyrms at a time!');
				const loot = wyrm.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}

			case 'HESPORIS':
			case 'HESPORI': {
				if (quantity > 100) return msg.send('I can only kill 100 Hesporis at a time!');
				const loot = hespori.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}

			default:
				return msg.send("I don't have that monster!");
		}
	}
};
