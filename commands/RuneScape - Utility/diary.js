// NOTE: This command is being re-written in ./diarytest.js
const { Command } = require('klasa');
const osrs = require('osrs-wrapper');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 2,
			aliases: ['d'],
			description: 'Check which diaries your account has the required stats to complete',
			usage: '[user:user|username:str]'
		});
	}

	async run(msg, [username]) {
		username = this.getUsername(username, msg);

		const Diaries = [[], [], [], [], [], [], [], [], [], [], [], []];

		const { Skills } = await osrs.hiscores
			.getPlayer(username, 'Normal')
			.then(player => player)
			.catch(() => { throw this.client.notFound; });

		const attack = Skills.Attack.level;
		const strength = Skills.Strength.level;
		const defence = Skills.Defence.level;
		const range = Skills.Ranged.level;
		const prayer = Skills.Prayer.level;
		const magic = Skills.Magic.level;
		const runecraft = Skills.Runecrafting.level;
		const construction = Skills.Construction.level;
		const hitpoints = Skills.Hitpoints.level;
		const agility = Skills.Agility.level;
		const herblore = Skills.Herblore.level;
		const thieving = Skills.Thieving.level;
		const crafting = Skills.Crafting.level;
		const fletching = Skills.Fletching.level;
		const slayer = Skills.Slayer.level;
		const hunter = Skills.Hunter.level;
		const mining = Skills.Mining.level;
		const smithing = Skills.Smithing.level;
		const fishing = Skills.Fishing.level;
		const cooking = Skills.Cooking.level;
		const firemaking = Skills.Firemaking.level;
		const woodcutting = Skills.Woodcutting.level;
		const farming = Skills.Farming.level;
		// Ardougne
		if (thieving > 14 && fishing > 4) {
			Diaries[0].push('Easy');
			if (strength > 37 && thieving > 37 && range > 20 && magic > 50 && attack > 49 && firemaking > 49 && farming > 30) {
				Diaries[0].push('Medium');
				if (smithing > 67 && thieving > 71 && hunter > 59 && magic > 65 && construction > 49 && farming > 69 && runecraft > 64) {
					Diaries[0].push('Hard');
					if (
						smithing > 90 &&
            fishing > 81 &&
            crafting > 9 &&
            thieving > 81 &&
            cooking > 90 &&
            magic > 93 &&
            fletching > 68 &&
            farming > 84 &&
            agility > 89
					) {
						Diaries[0].push('Elite');
					}
				}
			}
		}
		// Desert
		if (hunter > 4 && mining > 5 && thieving > 21) {
			Diaries[1].push('Easy');
			if (agility > 29 && slayer > 21 && hunter > 46 && thieving > 24 && strength > 44 && herblore > 35 && woodcutting > 34 && construction > 19) {
				Diaries[1].push('Medium');
				if (
					agility > 69 &&
          mining > 44 &&
          magic > 67 &&
          thieving > 64 &&
          slayer > 64 &&
          crafting > 54 &&
          attack > 49 &&
          defence > 9 &&
          firemaking > 59 &&
          smithing > 67
				) {
					Diaries[1].push('Hard');
					if (cooking > 84 && fletching > 94 && magic > 93 && construction > 77 && thieving > 90 && prayer > 84) {
						Diaries[1].push('Elite');
					}
				}
			}
		}
		// Falador
		if (construction > 15 && agility > 4 && mining > 9 && smithing > 12) {
			Diaries[2].push('Easy');
			if (
				firemaking > 48 &&
        magic > 36 &&
        farming > 46 &&
        slayer > 31 &&
        prayer > 9 &&
        defence > 19 &&
        agility > 41 &&
        woodcutting > 29 &&
        strength > 36 &&
        range > 18 &&
        thieving > 39 &&
        mining > 39 &&
        crafting > 39
			) {
				Diaries[2].push('Medium');
				if (attack + strength > 129 && runecraft > 55 && slayer > 71 && prayer > 69 && defence > 49 && agility > 49 && thieving > 49 && mining > 59) {
					Diaries[2].push('Hard');
					if (runecraft > 87 && farming > 90 && woodcutting > 74 && herblore > 80 && agility > 79) {
						Diaries[2].push('Elite');
					}
				}
			}
		}
		// Fremennik
		if (hunter > 10 && crafting > 22 && mining > 19 && smithing > 19 && thieving > 4 && woodcutting > 14 && firemaking > 14) {
			Diaries[3].push('Easy');
			if (hunter > 34 && slayer > 46 && mining > 39 && thieving > 41 && construction > 36) {
				Diaries[3].push('Medium');
				if (hunter > 54 && magic > 71 && mining > 69 && herblore > 65 && smithing > 59 && thieving > 74 && woodcutting > 55) {
					Diaries[3].push('Hard');
					if (runecraft > 81 && crafting > 79 && agility > 79 && slayer > 82 && hitpoints > 69 && strength > 69 && range > 69) {
						Diaries[3].push('Elite');
					}
				}
			}
		}
		// Kandarin
		if (fishing > 15 && farming > 12 && agility > 19) {
			Diaries[4].push('Easy');
			if (
				agility > 35 &&
        herblore > 47 &&
        range > 39 &&
        strength > 21 &&
        fishing > 45 &&
        cooking > 42 &&
        magic > 44 &&
        fletching > 49 &&
        farming > 25 &&
        thieving > 46 &&
        mining > 29
			) {
				Diaries[4].push('Medium');
				if (
					fishing > 69 &&
          agility > 59 &&
          strength > 49 &&
          woodcutting > 59 &&
          fletching > 69 &&
          crafting > 9 &&
          prayer > 69 &&
          defence > 69 &&
          magic > 55 &&
          firemaking > 64 &&
          construction > 49 &&
          smithing > 74
				) {
					Diaries[4].push('Hard');
					if (
						farming > 78 &&
            fishing > 75 &&
            cooking > 79 &&
            herblore > 85 &&
            agility > 59 &&
            smithing > 89 &&
            firemaking > 84 &&
            crafting > 84 &&
            magic > 86
					) {
						Diaries[4].push('Elite');
					}
				}
			}
		}
		// Karamja
		if (agility > 14 && mining > 39) {
			Diaries[5].push('Easy');
			if (agility > 29 && woodcutting > 49 && cooking > 15 && fishing > 64 && farming > 26 && hunter > 40 && mining > 39) {
				Diaries[5].push('Medium');
				if (
					runecraft > 43 &&
          cooking > 29 &&
          woodcutting > 33 &&
          strength > 49 &&
          agility > 52 &&
          thieving > 49 &&
          mining > 51 &&
          range > 41 &&
          slayer > 49
				) {
					Diaries[5].push('Hard');
					if (runecraft > 90 && farming > 71 && herblore > 86) {
						Diaries[5].push('Elite');
					}
				}
			}
		}
		// Lumbridge
		if (runecraft > 4 && slayer > 6 && agility > 9 && woodcutting > 14 && firemaking > 14 && fishing > 14 && mining > 14) {
			Diaries[6].push('Easy');
			if (
				strength > 18 &&
        agility > 19 &&
        runecraft > 22 &&
        fishing > 29 &&
        woodcutting > 29 &&
        magic > 30 &&
        range > 49 &&
        crafting > 37 &&
        thieving > 37 &&
        hunter > 41
			) {
				Diaries[6].push('Medium');
				if (agility > 45 && prayer > 51 && runecraft > 58 && woodcutting > 56 && magic > 59 && farming > 62 && firemaking > 64 && crafting > 69) {
					Diaries[6].push('Hard');
					if (agility > 69 && woodcutting > 74 && runecraft > 75 && thieving > 77 && range > 69 && strength > 69 && smithing > 87) {
						Diaries[6].push('Elite');
					}
				}
			}
		}
		// Morytania
		if (crafting > 14 && cooking > 11 && slayer > 14 && farming > 47) {
			Diaries[7].push('Easy');
			if (hunter > 28 && agility > 39 && woodcutting > 44 && slayer > 41 && cooking > 39 && smithing > 34 && herblore > 21) {
				Diaries[7].push('Medium');
				if (
					magic > 65 &&
          construction > 49 &&
          agility > 70 &&
          farming > 52 &&
          woodcutting > 49 &&
          firemaking > 49 &&
          slayer > 57 &&
          prayer > 69 &&
          defence > 69 &&
          mining > 54
				) {
					Diaries[7].push('Hard');
					if (
						fishing > 95 &&
            strength > 75 &&
            firemaking > 79 &&
            magic > 82 &&
            crafting > 83 &&
            slayer > 84 &&
            defence > 69 &&
            attack > 69 &&
            range > 69
					) {
						Diaries[7].push('Elite');
					}
				}
			}
		}
		// Varrock
		if (mining > 14 && agility > 12 && crafting > 7 && runecraft > 8 && fishing > 19 && thieving > 24) {
			Diaries[8].push('Easy');
			if (thieving > 24 && magic > 48 && firemaking > 39 && agility > 29 && farming > 29 && herblore > 9) {
				Diaries[8].push('Medium');
				if (hunter > 65 && woodcutting > 59 && magic > 53 && firemaking > 59 && construction > 49 && farming > 67 && prayer > 51 && agility > 50) {
					Diaries[8].push('Hard');
					if (herblore > 89 && magic > 85 && cooking > 94 && smithing > 87 && fletching > 80 && runecraft > 77) {
						Diaries[8].push('Elite');
					}
				}
			}
		}
		// Western
		if (hunter > 8 && mining > 14 && fletching > 19 && range > 29) {
			Diaries[9].push('Easy');
			if (agility > 36 && hunter > 30 && fishing > 45 && woodcutting > 34 && firemaking > 34 && cooking > 41 && mining > 39) {
				Diaries[9].push('Medium');
				if (
					range > 69 &&
          agility > 49 &&
          fishing > 61 &&
          cooking > 61 &&
          hunter > 68 &&
          woodcutting > 49 &&
          firemaking > 49 &&
          mining > 69 &&
          farming > 67 &&
          fletching > 4 &&
          construction > 64 &&
          magic > 63 &&
          thieving > 74
				) {
					Diaries[9].push('Hard');
					if (
						fletching > 84 &&
            slayer > 92 &&
            farming > 74 &&
            agility > 84 &&
            attack > 41 &&
            strength > 41 &&
            defence > 41 &&
            range > 41 &&
            magic > 41 &&
            prayer > 21 &&
            thieving > 84
					) {
						Diaries[9].push('Elite');
					}
				}
			}
		}
		// Wilderness
		if (magic > 20 && agility > 14 && mining > 14) {
			Diaries[10].push('Easy');
			if ((mining > 54 && woodcutting > 60 && agility > 59) || (strength > 59 && magic > 59 && slayer > 49 && smithing > 49)) {
				Diaries[10].push('Medium');
				if (magic > 65 && hunter > 66 && smithing > 74 && agility > 63 && slayer > 67 && fishing > 52) {
					Diaries[10].push('Hard');
					if (
						magic > 95 &&
            fishing > 84 &&
            cooking > 89 &&
            mining > 84 &&
            smithing > 89 &&
            thieving > 83 &&
            slayer > 82 &&
            woodcutting > 74 &&
            firemaking > 74
					) {
						Diaries[10].push('Elite');
					}
				}
			}
		}
		const Ardougne = Diaries[0].join(', ');
		const Desert = Diaries[1].join(', ');
		const Falador = Diaries[2].join(', ');
		const Fremennik = Diaries[3].join(', ');
		const Kandarin = Diaries[4].join(', ');
		const Karamja = Diaries[5].join(', ');
		const Lumbridge = Diaries[6].join(', ');
		const Morytania = Diaries[7].join(', ');
		const Varrock = Diaries[8].join(', ');
		const Western = Diaries[9].join(', ');
		const Wilderness = Diaries[10].join(', ');
		const embed = new MessageEmbed()
			.setColor(11132490)
			.setThumbnail('https://i.imgur.com/wV9zvLM.png')
			.setDescription(username)
			.addField(
				'Diary',
				'Ardougne\nDesert\nFalador\nFremennik\nKandarin\nKaramja\nLumbridge/Draynor\nMorytania\nVarrock\nWestern Prov.\nWilderness',
				true
			)
			.addField(
				'You can complete:',
				`${Ardougne}\n${Desert}\n${Falador}\n${Fremennik}\n${Kandarin}\n${Karamja}\n${Lumbridge}\n${Morytania}\n${Varrock}\n${Western}\n${Wilderness}`,
				true
			);
		return msg.send({ embed });
	}

};
