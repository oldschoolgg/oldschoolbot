import { CommandStore, KlasaMessage } from 'klasa';
import { cleanString } from 'oldschooljs/dist/util';

import { BotCommand } from '../../lib/BotCommand';
import { roll } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 10,
			description: 'Rolls a singular pet until you get it twice in a row.',
			usage: '<petName:str>',
			examples: ['+b2bpet mole'],
			categoryFlags: ['fun', 'simulation']
		});
	}

	async run(msg: KlasaMessage, [petName]: [string]) {
		const cleanName = cleanString(petName);
		switch (cleanName) {
			case 'GIANTMOLE':
			case 'MOLE':
			case 'BABYMOLE':
				return msg.send(
					`You had to kill ${this.petRoll(
						3000
					)} Giant Moles to get the Baby Mole Pet **Back-to-Back (2 in a row)!** <:Baby_mole:324127375858204672>`
				);
			case 'BLOODHOUND':
				return msg.send(
					`You had to complete ${this.petRoll(
						1000
					)} Master Clues to get the Bloodhound Pet **Back-to-Back (2 in a row)!** <:Bloodhound:324127375602483212>`
				);
			case 'CALLISTO':
			case 'CALLISTOCUB':
			case 'CUB':
				return msg.send(
					`You had to slay Callisto ${this.petRoll(
						2000
					)} times to get the Callisto Cub Pet **Back-to-Back (2 in a row)!** <:Callisto_cub:324127376273440768>`
				);
			case 'KALPHITE':
			case 'KALPHITEPRINCESS':
			case 'KALPHITEQUEEN':
			case 'KQ':
				return msg.send(
					`You had to kill the Kalphite Queen ${this.petRoll(
						3000
					)} times to get the Kalphite Princess Pet **Back-to-Back (2 in a row)!** <:Kalphite_princess_2nd_form:324127376915300352>`
				);
			case 'GARGOYLE':
			case 'NOON':
			case 'DAWN':
			case 'GG':
				return msg.send(
					`You had to kill ${this.petRoll(
						3000
					)} Grotesque Guardians to get the Noon Pet **Back-to-Back (2 in a row)!** <:Noon:379595337234382848>`
				);
			case 'OLMLET':
			case 'OLM':
			case 'RAIDS':
				return msg.send(
					`You had to do ${this.petRoll(
						3000
					)} Raids to get the Olmlet Pet **Back-to-Back (2 in a row)!** <:Olmlet:324127376873357316>`
				);
			case 'CHAOSELEMENTAL':
			case 'CHAOSELE':
				return msg.send(
					`You had to kill the Chaos Elemental ${this.petRoll(
						300
					)} times to get the Chaos Elemental Pet **Back-to-Back (2 in a row)!** <:Pet_chaos_elemental:324127377070227456>`
				);
			case 'PRIME':
			case 'DAGANNOTHPRIME':
				return msg.send(
					`You had to kill Dagannoth Prime ${this.petRoll(
						5000
					)} times to get the Dagannoth Prime Pet **Back-to-Back (2 in a row)!** <:Pet_dagannoth_prime:324127376877289474>`
				);
			case 'REX':
			case 'DAGANNOTHREX':
				return msg.send(
					`You had to kill Dagannoth Rex ${this.petRoll(
						5000
					)} times to get the Dagannoth Rex Pet **Back-to-Back (2 in a row)!** <:Pet_dagannoth_rex:324127377091330049>`
				);
			case 'SUPREME':
			case 'DAGANNOTHSUPREME':
				return msg.send(
					`You had to kill Dagannoth Supreme ${this.petRoll(
						5000
					)} times to get the Dagannoth Supreme Pet **Back-to-Back (2 in a row)!** <:Pet_dagannoth_supreme:324127377066164245>`
				);
			case 'DARKCORE':
			case 'CORE':
			case 'CORP':
				return msg.send(
					`You had to slay the Corporeal Beast ${this.petRoll(
						5000
					)} times to get the Dark Core Pet **Back-to-Back (2 in a row)!** <:Pet_dark_core:324127377347313674>`
				);
			case 'BANDOS':
			case 'GENERALGRAARDOR':
			case 'GENERALGRAARDORJR':
				return msg.send(
					`You had to kill General Graardor ${this.petRoll(
						5000
					)} times to get the General Graardor Jr. Pet **Back-to-Back (2 in a row)!** <:Pet_general_graardor:324127377376673792>`
				);
			case 'KRAKEN':
				return msg.send(
					`You had to slay the Kraken ${this.petRoll(
						3000
					)} times to get the Kraken Pet **Back-to-Back (2 in a row)!** <:Pet_kraken:324127377477206016>`
				);
			case 'KREE':
			case 'ARMA':
			case 'ARMADYL':
			case 'KREEARRA':
				return msg.send(
					`You had to kill Kree'arra ${this.petRoll(
						5000
					)} times to get the Kree'arra Pet **Back-to-Back (2 in a row)!** <:Pet_kreearra:324127377305239555>`
				);
			case 'KRIL':
			case 'ZAMMY':
			case 'ZAMORAK':
				return msg.send(
					`You had to kill K'ril Tsutsaroth ${this.petRoll(
						5000
					)} times to get the K'ril Tsutsaroth Pet **Back-to-Back (2 in a row)!** <:Pet_kril_tsutsaroth:324127377527406594>`
				);
			case 'PENANCE':
			case 'PENANCEQUEEN':
			case 'BA':
				return msg.send(
					`You had to do ${this.petRoll(
						1000
					)} High Level Gambles to get the Penance Queen Pet **Back-to-Back (2 in a row)!** <:Pet_penance_queen:324127377649303553>`
				);
			case 'SMOKEDEVIL':
			case 'THERMY':
				return msg.send(
					`You had to kill ${this.petRoll(
						3000
					)} Thermonuclear Smoke Devil's to get the Smoke Devil Pet **Back-to-Back (2 in a row)!** <:Pet_smoke_devil:324127377493852162>`
				);
			case 'ZULRAH':
			case 'SNAKELING':
				return msg.send(
					`You had to kill Zulrah ${this.petRoll(
						4000
					)} times to get the Snakeling Pet **Back-to-Back (2 in a row)!** <:Pet_snakeling:324127377816944642>`
				);
			case 'SARA':
			case 'SARADOMIN':
			case 'ZILYANA':
				return msg.send(
					`You had to kill Commander Zilyana ${this.petRoll(
						5000
					)} times to get the Zilyana Jr. Pet **Back-to-Back (2 in a row)!** <:Pet_zilyana:324127378248957952>`
				);
			case 'PHOENIX':
			case 'WINTERTODT':
			case 'FIREMAKING':
				return msg.send(
					`You had to open ${this.petRoll(
						5000
					)} Wintertodt Supply Crates to get the Phoenix Pet **Back-to-Back (2 in a row)!** <:Phoenix:324127378223792129>`
				);
			case 'KBD':
			case 'PRINCEBLACKDRAGON':
			case 'KINGBLACKDRAGON':
				return msg.send(
					`You had to kill the King Black Dragon ${this.petRoll(
						3000
					)} times to get the Prince Black Dragon Pet **Back-to-Back (2 in a row)!** <:Prince_black_dragon:324127378538364928>`
				);
			case 'SCORPIA':
			case 'SCORPION':
				return msg.send(
					`You had to kill Scorpia ${this.petRoll(
						2000
					)} times to get the Scorpia's Offspring Pet **Back-to-Back (2 in a row)!** <:Scorpias_offspring:324127378773377024>`
				);
			case 'SKOTOS':
			case 'SKOTIZO':
				return msg.send(
					`You had to kill Skotizo ${this.petRoll(
						65
					)} times to get the Skotos Pet **Back-to-Back (2 in a row)!** <:Skotos:324127378890817546>`
				);
			case 'JAD':
				return msg.send(
					`You had to kill Jad ${this.petRoll(
						200
					)} times to get the TzRek-Jad Pet **Back-to-Back (2 in a row)!** <:Tzrekjad:324127379188613121>`
				);
			case 'SPIDERLING':
			case 'VENNY':
			case 'VENENATIS':
			case 'SPIDER':
				return msg.send(
					`You had to kill Venenatis ${this.petRoll(
						2000
					)} times to get the Venenatis Spiderling Pet **Back-to-Back (2 in a row)!** <:Venenatis_spiderling:324127379092144129>`
				);
			case 'VETION':
				return msg.send(
					`You had to kill Vet'ion ${this.petRoll(
						2000
					)} times to get the Vet'ion Jr. Pet **Back-to-Back (2 in a row)!** <:Vetion_jr:324127378999738369>`
				);
			case 'SIRE':
			case 'ABYSSALSIRE':
			case 'ABYSSALOPRHAN':
				return msg.send(
					`You had to kill the Abyssal Sire ${this.petRoll(
						2560
					)} times to get the Abyssal orphan Pet **Back-to-Back (2 in a row)!** <:Abyssal_orphan:324127375774449664>`
				);
			case 'CERB':
			case 'CERBERUS':
			case 'HELLPUPPY':
				return msg.send(
					`You had to kill Cerberus ${this.petRoll(
						3000
					)} times to get the Hellpuppy Pet **Back-to-Back (2 in a row)!** <:Hellpuppy:324127376185491458>`
				);
			case 'CHOMPYCHICK':
				return msg.send(
					`You had to kill ${this.petRoll(
						500
					)} Chompy Birds to get the Chompy Chick Pet **Back-to-Back (2 in a row)!** <:Chompy_chick:346196885859598337>`
				);
			case 'INFERNO':
			case 'NIBBLER':
				return msg.send(
					`You had to complete the Inferno ${this.petRoll(
						100
					)} times to get the Jal-Nib-Rek Pet **Back-to-Back (2 in a row)!** <:Jalnibrek:346196886119514113>`
				);
			case 'HERBI':
			case 'HERBIBOAR':
				return msg.send(
					`You had to track down ${this.petRoll(
						6500
					)} Herbiboars to get the Herbi Pet **Back-to-Back (2 in a row)!** <:Herbi:357773175318249472>`
				);
			case 'VORKI':
			case 'VORKATH':
				return msg.send(
					`You had to slay the almighty Vorkath ${this.petRoll(
						3000
					)} times to get the Vorki Pet **Back-to-Back (2 in a row)!** <:Vorki:400713309252222977>`
				);
			case 'LILZIK':
			case 'RAIDS2':
			case 'ZIK':
				return msg.send(
					`You had to complete the Theatre of Blood ${this.petRoll(
						650
					)} times to get the Lil' Zik pet **Back-to-Back (2 in a row)!** <:Lil_zik:479460344423776266>`
				);
			default:
				return msg.send(
					"Invalid pet name. Skilling pets aren't available for this command."
				);
		}
	}

	petRoll(dropChance: number) {
		let hasPet = false;
		let amountOfRolls = 0;
		while (!hasPet) {
			if (roll(dropChance * dropChance)) hasPet = true;
			amountOfRolls++;
		}
		return amountOfRolls.toLocaleString();
	}

	skillPetRoll(dropChance: number) {
		let hasPet = false;
		let amountOfRolls = 0;
		while (!hasPet) {
			if (roll(dropChance * dropChance)) hasPet = true;
			amountOfRolls++;
		}
		return amountOfRolls;
	}
}
