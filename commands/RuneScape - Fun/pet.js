const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 2,
			description: 'Rolls a singular pet until you get it and shows the KC/Rolls',
			usage: '<petName:str>'
		});
	}

	async run(msg, [petName]) {
		let drop;
		let xp;
		let gp;
		let amount;
		switch (petName
			.replace("'", '')
			.replace(/\s+/g, '')
			.replace(/\./g, '')
			.toUpperCase()) {
			case 'CHINCHOMPA':
			case 'BABYCHINCHOMPA':
			case 'CHIN':
				drop = this.skillpetRoll(95898);
				xp = (drop * 265).toLocaleString();
				gp = (drop * 1504).toLocaleString();
				amount = drop.toLocaleString();
				return msg.send(`You had to catch ${amount} Red Chinchompas to get the Baby Chinchompa Pet! <:Baby_chinchompa_red:324127375539306497> You also got...\n<:SkillTotal:395812233000517650> ${xp} XP\n<:RSGP:369349580040437770> ${gp} GP`);
			case 'GIANTMOLE':
			case 'MOLE':
			case 'BABYMOLE':
				return msg.send(`You had to kill ${this.petRoll(3000)} Giant Moles to get the Baby Mole Pet! <:Baby_mole:324127375858204672>`);
			case 'BEAVER':
			case 'WOODCUTTING':
				drop = this.skillpetRoll(69846);
				xp = (drop * 250).toLocaleString();
				gp = (drop * 1162).toLocaleString();
				amount = drop.toLocaleString();
				return msg.send(`You had to cut ${amount} Magic Logs to get the Beaver Pet! <:Beaver:324127375761604611> You also got...\n<:SkillTotal:395812233000517650> ${xp} XP\n<:RSGP:369349580040437770> ${gp} GP`);
			case 'BLOODHOUND':
				return msg.send(`You had to complete ${this.petRoll(1000)} Master Clues to get the Bloodhound Pet! <:Bloodhound:324127375602483212>`);
			case 'CALLISTO':
			case 'CALLISTOCUB':
			case 'CUB':
				return msg.send(`You had to slay Callisto ${this.petRoll(2000)} times to get the Callisto Cub Pet! <:Callisto_cub:324127376273440768>`);
			case 'SQUIRREL':
			case 'GIANTSQUIRREL':
			case 'AGILITY': {
				drop = this.skillpetRoll(32730);
				xp = (drop * 570).toLocaleString();
				const hours = Math.round(drop * 45 / 3600);
				amount = drop.toLocaleString();
				return msg.send(`You had to run around the Seers' Village Rooftops ${amount} times to get the Giant Squirrel Pet! <:Giant_squirrel:324127376432824320> You also got...\n<:SkillTotal:395812233000517650> ${xp} XP\n<:ehpclock:352323705210142721> ${hours} Hours of your time wasted!`);
			}
			case 'HERON':
			case 'FISHING':
				drop = this.skillpetRoll(136108);
				xp = (drop * 120).toLocaleString();
				gp = (drop * 423).toLocaleString();
				amount = drop.toLocaleString();
				return msg.send(`You had to catch ${amount} Monkfish to get the Heron Pet! <:Heron:324127376516841483> You also got...\n<:SkillTotal:395812233000517650> ${xp} XP\n<:RSGP:369349580040437770> ${gp} GP`);
			case 'KALPHITE':
			case 'KALPHITEPRINCESS':
			case 'KALPHITEQUEEN':
			case 'KQ':
				return msg.send(`You had to kill the Kalphite Queen ${this.petRoll(3000)} times to get the Kalphite Princess Pet! <:Kalphite_princess_2nd_form:324127376915300352>`);
			case 'GARGOYLE':
			case 'NOON':
			case 'DAWN':
			case 'GG':
				return msg.send(`You had to kill ${this.petRoll(3000)} Grotesque Guardians to get the Noon Pet! <:Noon:379595337234382848>`);
			case 'OLMLET':
			case 'OLM':
			case 'RAIDS':
				return msg.send(`You had to do ${this.petRoll(3000)} Raids to get the Olmlet Pet! <:Olmlet:324127376873357316>`);
			case 'CHAOSELEMENTAL':
			case 'CHAOSELE':
				return msg.send(`You had to kill the Chaos Elemental ${this.petRoll(300)} times to get the Chaos Elemental Pet! <:Pet_chaos_elemental:324127377070227456>`);
			case 'PRIME':
			case 'DAGANNOTHPRIME':
				return msg.send(`You had to kill Dagannoth Prime ${this.petRoll(5000)} times to get the Dagannoth Prime Pet! <:Pet_dagannoth_prime:324127376877289474>`);
			case 'REX':
			case 'DAGANNOTHREX':
				return msg.send(`You had to kill Dagannoth Rex ${this.petRoll(5000)} times to get the Dagannoth Rex Pet! <:Pet_dagannoth_rex:324127377091330049>`);
			case 'SUPREME':
			case 'DAGANNOTHSUPREME':
				return msg.send(`You had to kill Dagannoth Supreme ${this.petRoll(5000)} times to get the Dagannoth Supreme Pet! <:Pet_dagannoth_supreme:324127377066164245>`);
			case 'DARKCORE':
			case 'CORE':
			case 'CORP':
				return msg.send(`You had to slay the Corporeal Beast ${this.petRoll(5000)} times to get the Dark Core Pet! <:Pet_dark_core:324127377347313674>`);
			case 'BANDOS':
			case 'GENERALGRAARDOR':
			case 'GENERALGRAARDORJR':
				return msg.send(`You had to kill General Graardor ${this.petRoll(5000)} times to get the General Graardor Jr. Pet! <:Pet_general_graardor:324127377376673792>`);
			case 'KRAKEN':
				return msg.send(`You had to slay the Kraken ${this.petRoll(3000)} times to get the Kraken Pet! <:Pet_kraken:324127377477206016>`);
			case 'KREE':
			case 'ARMA':
			case 'ARMADYL':
			case 'KREEARRA':
				return msg.send(`You had to kill Kree'arra ${this.petRoll(5000)} times to get the Kree'arra Pet! <:Pet_kreearra:324127377305239555>`);
			case 'KRIL':
			case 'ZAMMY':
			case 'ZAMORAK':
				return msg.send(`You had to kill K'ril Tsutsaroth ${this.petRoll(5000)} times to get the K'ril Tsutsaroth Pet! <:Pet_kril_tsutsaroth:324127377527406594>`);
			case 'PENANCE':
			case 'PENANCEQUEEN':
			case 'BA':
				return msg.send(`You had to do ${this.petRoll(1000)} High Level Gambles to get the Penance Queen Pet! <:Pet_penance_queen:324127377649303553>`);
			case 'SMOKEDEVIL':
			case 'THERMY':
				return msg.send(`You had to kill ${this.petRoll(3000)} Thermonuclear Smoke Devil's to get the Smoke Devil Pet! <:Pet_smoke_devil:324127377493852162>`);
			case 'ZULRAH':
			case 'SNAKELING':
				return msg.send(`You had to kill Zulrah ${this.petRoll(4000)} times to get the Snakeling Pet! <:Pet_snakeling:324127377816944642>`);
			case 'SARA':
			case 'SARADOMIN':
			case 'ZILYANA':
				return msg.send(`You had to kill Commander Zilyana ${this.petRoll(5000)} times to get the Zilyana Jr. Pet! <:Pet_zilyana:324127378248957952>`);
			case 'PHOENIX':
			case 'WINTERTODT':
			case 'FIREMAKING':
				return msg.send(`You had to open ${this.petRoll(5000)} Wintertodt Supply Crates to get the Phoenix Pet! <:Phoenix:324127378223792129>`);
			case 'KBD':
			case 'PRINCEBLACKDRAGON':
			case 'KINGBLACKDRAGON':
				return msg.send(`You had to kill the King Black Dragon ${this.petRoll(3000)} times to get the Prince Black Dragon Pet! <:Prince_black_dragon:324127378538364928>`);
			case 'RIFTGUARDIAN':
			case 'RUNECRAFTING':
			case 'RC':
				return msg.send(`You had to craft ${this.petRoll(1793283)} Nature Runes to get the Rift Guardian Pet! <:Rift_guardian_fire:324127378588827648>`);
			case 'GOLEM':
			case 'ROCKGOLEM':
			case 'MINING':
				return msg.send(`You had to mine ${this.petRoll(244725)} Paydirt at Motherlode Mine to get the Rock Golem Pet! <:Rock_golem:324127378429313026>`);
			case 'ROCKY':
			case 'THIEVING':
				drop = this.skillpetRoll(254736);
				xp = (drop * 84).toLocaleString();
				gp = (drop * 100).toLocaleString();
				amount = drop.toLocaleString();
				return msg.send(`You had to pickpocket that Ardougne Knight ${amount} times to get the Rocky Pet! <:Rocky:324127378647285771> You also got...\n<:SkillTotal:395812233000517650> ${xp} XP\n<:RSGP:369349580040437770> ${gp} GP`);
			case 'SCORPIA':
			case 'SCORPION':
				return msg.send(`You had to kill Scorpia ${this.petRoll(2000)} times to get the Scorpia's Offspring Pet! <:Scorpias_offspring:324127378773377024>`);
			case 'SKOTOS':
			case 'SKOTIZO':
				return msg.send(`You had to kill Skotizo ${this.petRoll(65)} times to get the Skotos Pet! <:Skotos:324127378890817546>`);
			case 'TANGLEROOT':
			case 'FARMING':
				drop = this.skillpetRoll(6893);
				xp = (drop * 13913).toLocaleString();
				gp = (drop * 210000).toLocaleString();
				amount = drop.toLocaleString();
				return msg.send(`You had to harvest ${amount} Magic Trees to get the Tangleroot Pet! <:Tangleroot:324127378978635778> You also got...\n<:SkillTotal:395812233000517650> ${xp} XP\n<:RSGP:369349580040437770> -${gp} GP`);
			case 'JAD':
				return msg.send(`You had to kill Jad ${this.petRoll(200)} times to get the TzRek-Jad Pet! <:Tzrekjad:324127379188613121>`);
			case 'SPIDERLING':
			case 'VENNY':
			case 'VENENATIS':
			case 'SPIDER':
				return msg.send(`You had to kill Venenatis ${this.petRoll(2000)} times to get the Venenatis Spiderling Pet! <:Venenatis_spiderling:324127379092144129>`);
			case 'VETION':
				return msg.send(`You had to kill Vet'ion ${this.petRoll(2000)} times to get the Vet'ion Jr. Pet! <:Vetion_jr:324127378999738369>`);
			case 'SIRE':
			case 'ABYSSALSIRE':
			case 'ABYSSALOPRHAN':
				return msg.send(`You had to kill the Abyssal Sire ${this.petRoll(2560)} times to get the Abyssal orphan Pet! <:Abyssal_orphan:324127375774449664>`);
			case 'CERB':
			case 'CERBERUS':
			case 'HELLPUPPY':
				return msg.send(`You had to kill Cerberus ${this.petRoll(3000)} times to get the Hellpuppy Pet! <:Hellpuppy:324127376185491458>`);
			case 'CHOMPYCHICK':
				return msg.send(`You had to kill ${this.petRoll(500)} Chompy Birds to get the Chompy Chick Pet! <:Chompy_chick:346196885859598337>`);
			case 'INFERNO':
			case 'NIBBLER':
				return msg.send(`You had to complete the Inferno ${this.petRoll(100)} times to get the Jal-Nib-Rek Pet! <:Jalnibrek:346196886119514113>`);
			case 'HERBI':
			case 'HERBIBOAR':
				return msg.send(`You had to track down ${this.petRoll(6500)} Herbiboars to get the Herbi Pet! <:Herbi:357773175318249472>`);
			case 'VORKI':
			case 'VORKATH':
				return msg.send(`You had to slay the almighty Vorkath ${this.petRoll(3000)} times to get the Vorki Pet! <:Vorki:400713309252222977>`);
			case 'LILZIK':
			case 'RAIDS2':
			case 'ZIK':
				return msg.send(`You had to complete the Theatre of Blood ${this.petRoll(650)} times to get the Lil' Zik pet! <:Lil_zik:479460344423776266>`);
			default:
				return msg.send('Did you spell the pet name correctly? Try again!');
		}
	}
	petRoll(dropChance) {
		let hasPet = false;
		let amountOfRolls = 0;
		while (!hasPet) {
			if (this.roll(dropChance)) hasPet = true;
			amountOfRolls++;
		}
		return amountOfRolls.toLocaleString();
	}

	skillpetRoll(dropChance) {
		let hasPet = false;
		let amountOfRolls = 0;
		while (!hasPet) {
			if (this.roll(dropChance)) hasPet = true;
			amountOfRolls++;
		}
		return amountOfRolls;
	}

};
