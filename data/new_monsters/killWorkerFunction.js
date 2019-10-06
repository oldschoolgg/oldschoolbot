const { expose } = require('threads');

const { cleanString } = require('../../config/util');
const generateBankImage = require('./generateBankImage');

const zulrah = require('../new_monsters/zulrah');

const corp = require('../monsters/corp');
const raids = require('../monsters/raids');
const barrows = require('../monsters/barrows');
const tob = require('../monsters/tob');
const vorkath = require('../monsters/vorkath');
const grotesqueGuardians = require('../monsters/grotesqueGuardians');
const bandos = require('../monsters/bandos');
const saradomin = require('../monsters/saradomin');
const cerberus = require('../monsters/cerberus');
const demonicGorilla = require('../monsters/demonicGorilla');
const abbyDemon = require('../monsters/abbyDemon');
const kurask = require('../monsters/kurask');
const kalphiteQueen = require('../monsters/kalphiteQueen');
const zamorak = require('../monsters/zamorak');
const armadyl = require('../monsters/armadyl');
const lizardmanShaman = require('../monsters/lizardmanShaman');
const callisto = require('../monsters/callisto');
const vetion = require('../monsters/vetion');
const brutalBlackDragon = require('../monsters/brutalBlackDragon');
const venenatis = require('../monsters/venenatis');
const wyvern = require('../monsters/wyvern');
const ancientWyvern = require('../monsters/ancientWyvern');
const kingBlackDragon = require('../monsters/kingBlackDragon');
const abyssalSire = require('../monsters/abyssalSire');
const thermy = require('../monsters/thermy');
const giantMole = require('../monsters/giantMole');
const skotizo = require('../monsters/skotizo');
const scorpia = require('../monsters/scorpia');
const chaosElemental = require('../monsters/chaosElemental');
const wintertodt = require('../monsters/wintertodt');
const kraken = require('../monsters/kraken');
const obor = require('../monsters/obor');
const dagannothSupreme = require('../monsters/dagannothSupreme');
const dagannothRex = require('../monsters/dagannothRex');
const lavaDragon = require('../monsters/lavaDragon');
const dagannothPrime = require('../monsters/dagannothPrime');
const chaosFanatic = require('../monsters/chaosFanatic');
const crazyArchaeologist = require('../monsters/crazyArchaeologist');
const mithrilDragon = require('../monsters/mithrilDragon');
const adamantDragon = require('../monsters/adamantDragon');
const runeDragon = require('../monsters/runeDragon');
const bryophyta = require('../monsters/bryophyta');
const alchemicalHydra = require('../monsters/alchemicalHydra');
const hydra = require('../monsters/hydra');
const drake = require('../monsters/drake');
const wyrm = require('../monsters/wyrm');
const hespori = require('../monsters/hespori');
const sarachnis = require('../monsters/sarachnis');

function killWorkerFunction(msg, quantity, bossName) {
	console.log(msg.send, quantity, bossName);
	switch (cleanString(bossName)) {
		case 'SARACHNIS':
		case 'SARACH':
		case 'SRARACHA': {
			if (quantity > 5000) {
				return 'I can only kill a maximum of 5000 Sarachnis at a time!';
			}
			const loot = sarachnis.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}
		case 'CORP':
		case 'CORPOREALBEAST':
		case 'CORPBEAST': {
			if (quantity > 5000) return 'I can only kill a maximum of 5000 Corp beasts at a time!';
			const loot = corp.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}
		case 'KURASK':
		case 'KURASKS': {
			if (quantity > 5000) return 'I can only kill a maximum of 5000 Kurasks at a time!';
			const loot = kurask.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}
		case 'LAVADRAGON':
		case 'LAVADRAGONS':
		case 'LAVADRAGS':
		case 'LAVADRAG': {
			if (quantity > 200) return 'I can only kill a maximum of 200 Lava Dragons at a time!';
			const loot = lavaDragon.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}
		case 'BRUTALBLACKDRAGON':
		case 'BBD':
		case 'BRUTALBLACKDRAGONS':
		case 'BRUTALBLACKDRAGS':
		case 'BRUTALBLACKS': {
			if (quantity > 100)
				return 'I can only kill a maximum of 100 Brutal Black Dragons at a time!';
			const loot = brutalBlackDragon.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}
		case 'RAIDS':
		case 'OLM':
		case 'RAIDS1':
		case 'COX':
		case 'CHAMBERSOFXERIC': {
			if (quantity > 100000) return 'I can only do a maximum of 100,000 Raids at a time!';
			const loot = raids.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}
		case 'RAIDS2':
		case 'THEATREOFBLOOD':
		case 'TOB': {
			if (quantity > 10000) {
				return "I can only do a maximum of 10,000 Theatres of Blood at a time! I'm not Woox!";
			}
			const loot = tob.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}
		case 'BARROWS': {
			if (quantity > 300) return 'I can only do a maximum of 300 Barrows Chests at a time!';
			const loot = barrows.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}
		case 'BANDOS':
		case 'GENERALGRAARDOR':
		case 'GRAARDOR': {
			if (quantity > 100000)
				return 'I can only do a maximum of 100,000 Bandos kills at a time!';
			const loot = bandos.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}
		case 'SARA':
		case 'SARADOMIN':
		case 'ZILY':
		case 'ZILYANA':
		case 'COMMANDERZILYANA': {
			if (quantity > 100000)
				return 'I can only do a maximum of 100,000 Sara kills at a time!';
			const loot = saradomin.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}
		case 'ZULRAH': {
			if (quantity > 10000) {
				return 'I can only do a maximum of 10000 Zulrah kills at a time!';
			}
			const loot = zulrah.kill(quantity);
			if (!loot) return 'You got nothing';
			return generateBankImage(loot);
		}
		case 'VORKATH': {
			if (quantity > 500) return 'I can only do a maximum of 500 Vorkath kills at a time!';
			const loot = vorkath.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}
		case 'CERB':
		case 'CERBERUS': {
			if (quantity > 500) return 'I can only do a maximum of 500 Cerberus kills at a time!';
			const loot = cerberus.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}
		case 'ABYSSALDEMON':
		case 'ABYSSALDEMONS':
		case 'ABBYDEMON':
		case 'ABBYDEMONS': {
			if (quantity > 5000)
				return 'I can only do a maximum of 5000 Abyssal Demon kills at a time!';
			const loot = abbyDemon.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}
		case 'GORILLAS':
		case 'DGS':
		case 'DEMONICGORILLAS':
		case 'DEMONICGORILLA':
		case 'DEMONICS': {
			if (quantity > 500) return "I can only kill 500 Demonic Gorilla's at a time!";
			const loot = demonicGorilla.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}
		case 'KQ':
		case 'KALPHITEQUEEN': {
			if (quantity > 500) return "I can only kill 500 Kalphite Queen's at a time!";
			const loot = kalphiteQueen.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}
		case 'ZAMMY':
		case 'ZAMORAK':
		case 'KRIL':
		case 'KRILTSUTSAROTH': {
			if (quantity > 100000) return "I can only kill 100,000 K'ril Tsutsaroth's at a time!";
			const loot = zamorak.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}
		case 'ARMA':
		case 'ARMADYL':
		case 'KREE':
		case 'KREEARRA': {
			if (quantity > 100000) return "I can only kill 100,000 Kree'arra's at a time!";
			const loot = armadyl.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}
		case 'SHAMANS':
		case 'LIZARDMANSHAMANS':
		case 'LIZARDMANSHAMAN':
		case 'LIZARDMEN': {
			if (quantity > 1000) return "I can only kill 1000 Lizardman Shaman's at a time!";
			const loot = lizardmanShaman.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}
		case 'CALLISTO': {
			if (quantity > 500) return "I can only kill 500 Callisto's at a time!";
			const loot = callisto.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}
		case 'VETION': {
			if (quantity > 500) return "I can only kill 500 Vet'ions at a time!";
			const loot = vetion.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}
		case 'VENENATIS': {
			if (quantity > 500) return 'I can only kill 500 Venenatis at a time!';
			const loot = venenatis.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}
		case 'SKELETALWYVERN':
		case 'SKELETALWYVERNS':
		case 'WYVERNS': {
			if (quantity > 1000) return 'I can only kill 1000 Skeletal Wyverns at a time!';
			const loot = wyvern.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}
		case 'ANCIENTWYVERN':
		case 'ANCIENTWYVERNS':
		case 'FOSSILISLANDWYVERNS': {
			if (quantity > 1000) return 'I can only kill 1000 Ancient Wyverns at a time!';
			const loot = ancientWyvern.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}
		case 'GROTESQUEGUARDIANS':
		case 'GGS':
		case 'DUSK':
		case 'DAWN': {
			if (quantity > 500) return 'I can only kill 500 Grotesque Guardians at a time!';
			const loot = grotesqueGuardians.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}
		case 'KBD':
		case 'KINGBLACKDRAGON': {
			if (quantity > 500) return 'I can only kill 500 King Black Dragons at a time!';
			const loot = kingBlackDragon.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}
		case 'ABYSSALSIRE':
		case 'ABBYSIRE':
		case 'SIRE': {
			if (quantity > 500) return 'I can only kill 500 Abyssal Sires at a time!';
			const loot = abyssalSire.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}
		case 'THERMY':
		case 'THERMONUCLEARSMOKEDEVIL': {
			if (quantity > 500) return "I can only kill 500 Thermonuclear smoke devil's at a time!";
			const loot = thermy.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}
		case 'GIANTMOLE':
		case 'MOLE': {
			if (quantity > 5000) return "I can only kill 5000 Giant Mole's at a time!";
			const loot = giantMole.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}
		case 'SKOTIZO': {
			if (quantity > 500) return 'I can only kill 500 Skotizo at a time!';
			const loot = skotizo.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}
		case 'SCORPIA': {
			if (quantity > 500) return 'I can only kill 500 Scorpia at a time!';
			const loot = scorpia.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}
		case 'CHAOSELE':
		case 'CHAOSELEMENTAL': {
			if (quantity > 500) return 'I can only kill 500 Chaos Elementals at a time!';
			const loot = chaosElemental.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}
		case 'WINTERTODT':
		case 'WINTERTOAD':
		case 'TODT':
		case 'WT': {
			if (quantity > 500) return "I can only kill 500 Wintertodt's at a time!";
			const loot = wintertodt.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}
		case 'KRAKEN': {
			if (quantity > 500) return "I can only kill 500 Kraken's at a time!";
			const loot = kraken.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}
		case 'OBOR':
		case 'HILLGIANTBOSS': {
			if (quantity > 500) return "I can only kill 500 Obor's at a time!";
			const loot = obor.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}
		case 'REX':
		case 'DAGANNOTHREX': {
			if (quantity > 500) return "I can only kill 500 Dagannoth Rex's at a time!";
			const loot = dagannothRex.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}
		case 'SUPREME':
		case 'DAGANNOTHSUPREME': {
			if (quantity > 500) return 'I can only kill 500 Dagannoth Supremes at a time!';
			const loot = dagannothSupreme.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}
		case 'PRIME':
		case 'DAGANNOTHPRIME': {
			if (quantity > 500) return 'I can only kill 500 Dagannoth Primes at a time!';
			const loot = dagannothPrime.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}

		case 'DAGKINGS':
		case 'DAGANNOTHKINGS':
		case 'DKS': {
			let quantityRex = 0;
			let quantitySupreme = 0;
			let quantityPrime = 0;
			if (quantity > 1000) return 'I can only kill 1000 Dagannoth Kings at a time!';
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
			return loot.length > 0 ? loot : 'You got nothing.';
		}
		case 'CHAOSFANATIC': {
			if (quantity > 500) return 'I can only kill 500 Chaos Fanatics at a time!';
			const loot = chaosFanatic.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}

		case 'CRAZYARCH':
		case 'CRAZYARCHAEOLOGIST': {
			if (quantity > 500) return 'I can only kill 500 Crazy Archaeologists at a time!';
			const loot = crazyArchaeologist.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}

		case 'MITHRILDRAGONS':
		case 'MITHRILDRAGS':
		case 'MITHDRAGS':
		case 'MITHDRAGONS': {
			if (quantity > 1000) return 'I can only kill 1000 Mithril Dragons at a time!';
			const loot = mithrilDragon.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}

		case 'ADAMANTDRAGONS':
		case 'ADAMANTDRAGS':
		case 'ADDYDRAGS':
		case 'ADDYDRAGONS': {
			if (quantity > 1000) return 'I can only kill 1000 Adamant Dragons at a time!';
			const loot = adamantDragon.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}

		case 'RUNEDRAGONS':
		case 'RUNEDRAGS': {
			if (quantity > 1000) return 'I can only kill 1000 Rune Dragons at a time!';
			const loot = runeDragon.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}

		case 'BRYOPHYTA':
		case 'MOSSGIANTBOSS': {
			if (quantity > 500) return "I can only kill 500 Bryophyta's at a time!";
			const loot = bryophyta.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}

		case 'ALCHEMICALHYDRA':
		case 'ALCHEMICALHYDRAS':
		case 'AHYDRA':
		case 'AHYDRAS':
		case 'HYDRAS':
		case 'HYDRA':
		case 'HYDRABOSS': {
			if (quantity > 100000) return 'I can only kill 100000 Alchemical Hydras at a time!';
			const loot = alchemicalHydra.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}

		case 'NORMALHYDRA':
		case 'NORMALHYDRAS':
		case 'BABYHYDRA':
		case 'BABYHYDRAS': {
			if (quantity > 500) return 'I can only kill 500 Hydras at a time!';
			const loot = hydra.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}

		case 'DRAKES':
		case 'DRAKE': {
			if (quantity > 500) return 'I can only kill 500 Drakes at a time!';
			const loot = drake.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}

		case 'WYRMS':
		case 'WYRM': {
			if (quantity > 500) return 'I can only kill 500 Wyrms at a time!';
			const loot = wyrm.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}

		case 'HESPORIS':
		case 'HESPORI': {
			if (quantity > 100) return 'I can only kill 100 Hesporis at a time!';
			const loot = hespori.kill(quantity);
			return loot.length > 0 ? loot : 'You got nothing.';
		}

		default:
			return "I don't have that monster!";
	}
}

expose(killWorkerFunction);
