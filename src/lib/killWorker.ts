import { expose } from 'threads';
import { Monsters } from 'oldschooljs';
import { KillWorkerOptions } from './types';
import sarachnis = require('../../data/monsters/sarachnis');
import lavaDragon = require('../../data/monsters/lavaDragon');
import brutalBlackDragon = require('../../data/monsters/brutalBlackDragon');
import raids = require('../../data/monsters/raids');
import tob = require('../../data/monsters/tob');
import wyvern = require('../../data/monsters/wyvern');
import grotesqueGuardians = require('../../data/monsters/grotesqueGuardians');
import abyssalSire = require('../../data/monsters/abyssalSire');
import thermy = require('../../data/monsters/thermy');
import skotizo = require('../../data/monsters/skotizo');
import alchemicalHydra = require('../../data/monsters/alchemicalHydra');
import hydra = require('../../data/monsters/hydra');
import hespori = require('../../data/monsters/hespori');
import gauntlet = require('../../data/new_monsters/gauntlet');
import wintertodt = require('../../data/monsters/wintertodt');
import kraken = require('../../data/monsters/kraken');
import obor = require('../../data/monsters/obor');
import bryophyta = require('../../data/monsters/bryophyta');

export function cleanString(str: string) {
	return str.replace(/[^0-9a-zA-Z]/gi, '').toUpperCase();
}

export function stringMatches(str: string, str2: string) {
	return cleanString(str) === cleanString(str2);
}

expose({
	kill({ quantity, bossName, limit }: KillWorkerOptions) {
		const osjsMonster = Monsters.find(mon =>
			mon.aliases.some(alias => stringMatches(alias, bossName))
		);

		if (osjsMonster) {
			if (quantity > limit) {
				return (
					`The quantity you gave exceeds your limit of ${limit.toLocaleString()}! ` +
					`*You can increase your limit by up to 1 million by becoming a patron at <https://www.patreon.com/oldschoolbot>, ` +
					`or 100,000 by nitro boosting the support server.*`
				);
			}

			return osjsMonster.kill(quantity, {});
		}

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
			case 'LAVADRAGON':
			case 'LAVADRAGONS':
			case 'LAVADRAGS':
			case 'LAVADRAG': {
				if (quantity > 200) {
					return 'I can only kill a maximum of 200 Lava Dragons at a time!';
				}
				const loot = lavaDragon.kill(quantity);
				return loot.length > 0 ? loot : 'You got nothing.';
			}
			case 'BRUTALBLACKDRAGON':
			case 'BBD':
			case 'BRUTALBLACKDRAGONS':
			case 'BRUTALBLACKDRAGS':
			case 'BRUTALBLACKS': {
				if (quantity > 100) {
					return 'I can only kill a maximum of 100 Brutal Black Dragons at a time!';
				}
				const loot = brutalBlackDragon.kill(quantity);
				return loot.length > 0 ? loot : 'You got nothing.';
			}
			case 'RAIDS':
			case 'OLM':
			case 'RAIDS1':
			case 'COX':
			case 'CHAMBERSOFXERIC': {
				if (quantity > 10_000) return 'I can only do a maximum of 10,000 Raids at a time!';
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

			case 'SKELETALWYVERN':
			case 'SKELETALWYVERNS':
			case 'WYVERNS': {
				if (quantity > 1000) return 'I can only kill 1000 Skeletal Wyverns at a time!';
				const loot = wyvern.kill(quantity);
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

			case 'ABYSSALSIRE':
			case 'ABBYSIRE':
			case 'SIRE': {
				if (quantity > 500) return 'I can only kill 500 Abyssal Sires at a time!';
				const loot = abyssalSire.kill(quantity);
				return loot.length > 0 ? loot : 'You got nothing.';
			}
			case 'SKOTIZO': {
				if (quantity > 500) return 'I can only kill 500 Skotizo at a time!';
				const loot = skotizo.kill(quantity);
				return loot.length > 0 ? loot : 'You got nothing.';
			}

			case 'THERMY':
			case 'THERMONUCLEARSMOKEDEVIL': {
				if (quantity > 500) {
					return "I can only kill 500 Thermonuclear smoke devil's at a time!";
				}
				const loot = thermy.kill(quantity);
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

			case 'HESPORIS':
			case 'HESPORI': {
				if (quantity > 100) return 'I can only kill 100 Hesporis at a time!';
				const loot = hespori.kill(quantity);
				return loot.length > 0 ? loot : 'You got nothing.';
			}

			case 'GAUNTLET': {
				if (quantity > 500) return 'I can only kill 500 Gauntlets at a time!';
				const loot = gauntlet.kill(quantity);
				return loot.length > 0 ? loot : 'You got nothing.';
			}

			case 'CORRUPTEDGAUNTLET':
			case 'CG': {
				if (quantity > 500) return 'I can only kill 500 Gauntlets at a time!';
				const loot = gauntlet.kill(quantity, true);
				return loot.length > 0 ? loot : 'You got nothing.';
			}

			default:
				return "I don't have that monster!";
		}
	}
});
