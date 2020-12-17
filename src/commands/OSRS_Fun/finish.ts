import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

import pets from '../../lib/pets';
import tob = require('../../lib/data/monsters/tob');
import raids = require('../../lib/data/monsters/raids');
import alchemicalHydra = require('../../lib/data/monsters/alchemicalHydra');
import hespori = require('../../lib/data/monsters/hespori');
import { BotCommand } from '../../lib/BotCommand';
import { roll } from '../../lib/util';

// Use if Drop rate is X/Y
function rollX(xVar: number, max: number) {
	const randomRoll = Math.floor(Math.random() * (max + 1));
	return randomRoll <= xVar + 1 && randomRoll >= 1;
}

const BARROWS_ITEMS = [
	'<:Veracs_plateskirt:403038865130127361>',
	'<:Veracs_helm:403038865239179264>',
	'<:Veracs_flail:403038865176264715>',
	'<:Veracs_brassard:403038865079795722>',
	'<:Torags_platelegs:403038865092509705>',
	'<:Torags_platebody:403038865008361472>',
	'<:Torags_helm:403038864983457803>',
	'<:Torags_hammers:403038864853303296>',
	'<:Karils_leathertop:403038864798646282>',
	'<:Karils_leatherskirt:403038864777936921>',
	'<:Dharoks_greataxe:403038864299655169>',
	'<:Dharoks_helm:403038864199122947>',
	'<:Dharoks_platebody:403038864404512768>',
	'<:Dharoks_platelegs:403038864114974731>',
	'<:Guthans_chainskirt:403038864446586880>',
	'<:Guthans_helm:403038864404512770>',
	'<:Guthans_platebody:403038864299655171>',
	'<:Guthans_warspear:403038864681467905>',
	'<:Karils_coif:403038864718954497>',
	'<:Karils_crossbow:403038864777805825>',
	'<:Ahrims_staff:403038864350117889>',
	'<:Ahrims_robetop:403038864316301337>',
	'<:Ahrims_robeskirt:403038864350117888>',
	'<:Ahrims_hood:403038864362438666>'
];

async function getAllPetsEmbed(petsRecieved: string[]) {
	const embed = new MessageEmbed()
		.setColor(7981338)
		.addField(
			'\u200b',
			`
				${pets[0].emoji} ${petsRecieved[0]} Red Chins
				${pets[1].emoji} ${petsRecieved[1]} KC
				${pets[2].emoji} ${petsRecieved[2]} Magic Logs
				${pets[3].emoji} ${petsRecieved[3]} Masters
				${pets[4].emoji} ${petsRecieved[4]} KC
				${pets[5].emoji} ${petsRecieved[5]} Ardougne Laps
				${pets[6].emoji} ${petsRecieved[6]} Monkfish
				${pets[7].emoji} ${petsRecieved[7]} KC
				${pets[8].emoji} ${petsRecieved[8]} KC
				${pets[9].emoji} ${petsRecieved[9]} Raids
				${pets[10].emoji} ${petsRecieved[10]} KC
				${pets[11].emoji} ${petsRecieved[11]} KC
				${pets[12].emoji} ${petsRecieved[12]} KC
				${pets[13].emoji} ${petsRecieved[13]} KC`,
			true
		)
		.addField(
			'\u200b',
			`
				${pets[14].emoji} ${petsRecieved[14]} KC
				${pets[15].emoji} ${petsRecieved[15]} KC
				${pets[16].emoji} ${petsRecieved[16]} KC
				${pets[17].emoji} ${petsRecieved[17]} KC
				${pets[18].emoji} ${petsRecieved[18]} KC
				${pets[19].emoji} ${petsRecieved[19]} Gambles
				${pets[20].emoji} ${petsRecieved[20]} KC
				${pets[21].emoji} ${petsRecieved[21]} KC
				${pets[22].emoji} ${petsRecieved[22]} KC
				${pets[23].emoji} ${petsRecieved[23]} KC
				${pets[24].emoji} ${petsRecieved[24]} KC
				${pets[25].emoji} ${petsRecieved[25]} Nature Runes
				${pets[26].emoji} ${petsRecieved[26]} Paydirt
				${pets[27].emoji} ${petsRecieved[27]} Ardougne Knights`,
			true
		)
		.addField(
			'\u200b',
			`
				${pets[28].emoji} ${petsRecieved[28]} KC
				${pets[29].emoji} ${petsRecieved[29]} KC
				${pets[30].emoji} ${petsRecieved[30]} Magic Trees
				${pets[31].emoji} ${petsRecieved[31]} KC
				${pets[32].emoji} ${petsRecieved[32]} KC
				${pets[33].emoji} ${petsRecieved[33]} KC
				${pets[34].emoji} ${petsRecieved[34]} KC
				${pets[35].emoji} ${petsRecieved[35]} KC
				${pets[36].emoji} ${petsRecieved[36]} KC
				${pets[37].emoji} ${petsRecieved[37]} KC
				${pets[38].emoji} ${petsRecieved[38]} Harvests
				${pets[39].emoji} ${petsRecieved[39]} KC
				${pets[40].emoji} ${petsRecieved[40]} Raids
				${pets[41].emoji} ${petsRecieved[41]} KC`,
			true
		)
		.addField(
			'\u200b',
			`
				${pets[42].emoji} ${petsRecieved[42]} KC
				${pets[43].emoji} ${petsRecieved[43]} Gauntlets
				${pets[44].emoji} ${petsRecieved[44]} KC`,
			true
		);
	return embed;
}

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 5,
			oneAtTime: true,
			description: "Simulates how long it takes you to 'finish' a boss (Get all its drops)",
			usage: '<BossName:str>',
			examples: ['+finish bandos', '+finish corp'],
			categoryFlags: ['fun', 'simulation']
		});
	}

	async run(msg: KlasaMessage, [BossName]: [string]) {
		const loot: string[] = [];
		let kc = 0;
		const duplicates: string[] = [];

		switch (BossName.replace(/\W/g, '').toUpperCase()) {
			case 'RAIDS2':
			case 'THEATREOFBLOOD':
			case 'TOB': {
				return msg.send(tob.finish());
			}
			case 'MOLE':
			case 'GIANTMOLE': {
				const lootMSG = [];
				let mc = 0;
				let ms = 0;
				let yl = 0;
				while (loot.length !== 1) {
					kc++;
					mc++;
					ms += Math.floor(Math.random() * 2) + 1;
					if (!loot.includes('PET') && roll(3000)) {
						loot.push('PET');
						lootMSG.push(
							`**Baby Mole:** ${kc.toLocaleString()} KC <:Baby_mole:324127375858204672>`
						);
					}
					if (rollX(5, 64)) yl++;
				}
				yl *= 100;
				return msg.send(`
It took you **${kc.toLocaleString()}** kills to finish Giant Mole <:Baby_mole:324127375858204672>

${lootMSG.join(
	'\n'
)} \n\nYou also received **${mc.toLocaleString()}** Mole Claws, **${ms.toLocaleString()}** Mole Skins, and **${yl.toLocaleString()}** Yew Logs!`);
			}
			case 'KBD':
			case 'KINGBLACKDRAGON': {
				const lootMSG = [];
				while (loot.length !== 5) {
					kc++;
					if (!loot.includes('DV') && roll(5000)) {
						loot.push('DV');
						lootMSG.push(
							`**Draconic Visage:** ${kc.toLocaleString()} KC <:Draconic_visage:403378090979491840>`
						);
					}
					if (!loot.includes('PET') && roll(3000)) {
						loot.push('PET');
						lootMSG.push(
							`**Prince Black Dragon:** ${kc.toLocaleString()} KC <:Prince_black_dragon:324127378538364928>`
						);
					}
					if (!loot.includes('DP') && roll(1500)) {
						loot.push('DP');
						lootMSG.push(
							`**Dragon Pickaxe:** ${kc.toLocaleString()} KC <:Dragon_pickaxe:406000287841779716>`
						);
					}
					if (roll(64)) {
						const randomRoll = Math.floor(Math.random() * 2) + 1;
						if (!loot.includes('KBDH') && randomRoll === 1) {
							loot.push('KBDH');
							lootMSG.push(
								`**Kbd heads:** ${kc.toLocaleString()} KC <:Kbd_heads:409997161393160192>`
							);
						}
						if (!loot.includes('DM') && randomRoll === 2) {
							loot.push('DM');
							lootMSG.push(
								`**Dragon Med Helm:** ${kc.toLocaleString()} KC <:Dragon_med_helm:409997161145565185>`
							);
						}
					}
				}
				return msg.send(`
It took you **${kc.toLocaleString()}** kills to finish King Black Dragon <:Kbd_heads:409997161393160192>

${lootMSG.join('\n')}`);
			}
			case 'DKS':
			case 'DAGANNOTHKINGS':
			case 'DAGKINGS': {
				let rexKC = 0;
				let supKC = 0;
				let primeKC = 0;
				const supLoot = [];
				const rexLoot = [];
				const primeLoot = [];
				const lootMSG = [];
				while (loot.length !== 10) {
					kc++;
					if (supLoot.length !== 4) {
						supKC++;
						if (!loot.includes('SPET') && roll(5000)) {
							loot.push('SPET');
							supLoot.push('SPET');
							lootMSG.push(
								`**Pet Dagannoth Supreme:** ${supKC.toLocaleString()} Supreme KC <:Pet_dagannoth_supreme:324127377066164245>`
							);
						}
						if (roll(64)) {
							const randomRoll = Math.floor(Math.random() * 2) + 1;
							if (!loot.includes('SC') && randomRoll === 1) {
								loot.push('SC');
								supLoot.push('SC');
								lootMSG.push(
									`**Seercull:** ${supKC.toLocaleString()} Supreme KC <:Seercull:456174387633324042>`
								);
							}
							if (!loot.includes('AR') && randomRoll === 2) {
								loot.push('AR');
								supLoot.push('AR');
								lootMSG.push(
									`**Archers Ring:** ${supKC.toLocaleString()} Supreme KC <:Archers_ring:456174721676083210>`
								);
							}
						}
						if (!loot.includes('DA') && roll(128)) {
							loot.push('DA');
							supLoot.push('DA');
							rexLoot.push('DA');
							primeLoot.push('DA');
							lootMSG.push(
								`**Dragon Axe:** ${supKC.toLocaleString()} Supreme KC <:Dragon_axe:405265921309933588>`
							);
						}
					}
					if (rexLoot.length !== 4) {
						rexKC++;
						if (!loot.includes('RPET') && roll(5000)) {
							loot.push('RPET');
							rexLoot.push('RPET');
							lootMSG.push(
								`**Pet Dagannoth Rex:** ${rexKC.toLocaleString()} Rex KC <:Pet_dagannoth_rex:324127377091330049>`
							);
						}
						if (roll(64)) {
							const randomRoll = Math.floor(Math.random() * 2) + 1;
							if (!loot.includes('WR') && randomRoll === 1) {
								loot.push('WR');
								rexLoot.push('WR');
								lootMSG.push(
									`**Warrior Ring:** ${rexKC.toLocaleString()} Rex KC <:Warrior_ring:421046902050783263>`
								);
							}
							if (!loot.includes('BR') && randomRoll === 2) {
								loot.push('BR');
								rexLoot.push('BR');
								lootMSG.push(
									`**Berserker Ring:** ${rexKC.toLocaleString()} Rex KC <:Berserker_ring:421046901773697035>`
								);
							}
						}
						if (!loot.includes('DA') && roll(128)) {
							loot.push('DA');
							supLoot.push('DA');
							rexLoot.push('DA');
							primeLoot.push('DA');
							lootMSG.push(
								`**Dragon Axe:** ${rexKC.toLocaleString()} Rex KC <:Dragon_axe:405265921309933588>`
							);
						}
					}
					if (primeLoot.length !== 4) {
						primeKC++;
						if (!loot.includes('PPET') && roll(5000)) {
							loot.push('PPET');
							primeLoot.push('PPET');
							lootMSG.push(
								`**Pet Dagannoth Prime:** ${primeKC.toLocaleString()} Prime KC <:Pet_dagannoth_prime:324127376877289474>`
							);
						}
						if (roll(64)) {
							const randomRoll = Math.floor(Math.random() * 2) + 1;
							if (!loot.includes('MB') && randomRoll === 1) {
								loot.push('MB');
								primeLoot.push('MB');
								lootMSG.push(
									`**Mud Battlestaff:** ${primeKC.toLocaleString()} Prime KC <:Mud_battlestaff:456175019345838083>`
								);
							}
							if (!loot.includes('SR') && randomRoll === 2) {
								loot.push('SR');
								primeLoot.push('SR');
								lootMSG.push(
									`**Seers Ring:** ${primeKC.toLocaleString()} Prime KC <:Seers_ring:456175344723034122>`
								);
							}
						}
						if (!loot.includes('DA') && roll(128)) {
							loot.push('DA');
							supLoot.push('DA');
							rexLoot.push('DA');
							primeLoot.push('DA');
							lootMSG.push(
								`**Dragon Axe:** ${primeKC.toLocaleString()} Prime KC <:Dragon_axe:405265921309933588>`
							);
						}
					}
				}
				return msg.send(`
It took you **${rexKC.toLocaleString()}** Rex kills, **${supKC.toLocaleString()}** Supreme kills, **${primeKC.toLocaleString()}** Prime kills to finish the Dagannoth Kings

${lootMSG.join('\n')}`);
			}
			case 'REX':
			case 'DAGANNOTHREX': {
				const lootMSG = [];
				while (loot.length !== 4) {
					kc++;
					if (!loot.includes('PET') && roll(5000)) {
						loot.push('PET');
						lootMSG.push(
							`**Pet Dagannoth Rex:** ${kc.toLocaleString()} KC <:Pet_dagannoth_rex:324127377091330049>`
						);
					}
					if (roll(64)) {
						const randomRoll = Math.floor(Math.random() * 2) + 1;
						if (!loot.includes('WR') && randomRoll === 1) {
							loot.push('WR');
							lootMSG.push(
								`**Warrior Ring:** ${kc.toLocaleString()} KC <:Warrior_ring:421046902050783263>`
							);
						}
						if (!loot.includes('BR') && randomRoll === 2) {
							loot.push('BR');
							lootMSG.push(
								`**Berserker Ring:** ${kc.toLocaleString()} KC <:Berserker_ring:421046901773697035>`
							);
						}
					}
					if (!loot.includes('DA') && roll(128)) {
						loot.push('DA');
						lootMSG.push(
							`**Dragon Axe:** ${kc.toLocaleString()} KC <:Dragon_axe:405265921309933588>`
						);
					}
				}
				return msg.send(`
It took you **${kc.toLocaleString()}** kills to finish Dagannoth Rex <:Pet_dagannoth_rex:324127377091330049>

${lootMSG.join('\n')}`);
			}
			case 'SUPREME':
			case 'DAGANNOTHSUPREME': {
				const lootMSG = [];
				while (loot.length !== 4) {
					kc++;
					if (!loot.includes('PET') && roll(5000)) {
						loot.push('PET');
						lootMSG.push(
							`**Pet Dagannoth Supreme:** ${kc.toLocaleString()} KC <:Pet_dagannoth_supreme:324127377066164245>`
						);
					}
					if (roll(64)) {
						const randomRoll = Math.floor(Math.random() * 2) + 1;
						if (!loot.includes('SC') && randomRoll === 1) {
							loot.push('SC');
							lootMSG.push(
								`**Seercull:** ${kc.toLocaleString()} KC <:Seercull:456174387633324042>`
							);
						}
						if (!loot.includes('AR') && randomRoll === 2) {
							loot.push('AR');
							lootMSG.push(
								`**Archers Ring:** ${kc.toLocaleString()} KC <:Archers_ring:456174721676083210>`
							);
						}
					}
					if (!loot.includes('DA') && roll(128)) {
						loot.push('DA');
						lootMSG.push(
							`**Dragon Axe:** ${kc.toLocaleString()} KC <:Dragon_axe:405265921309933588>`
						);
					}
				}
				return msg.send(`
It took you **${kc.toLocaleString()}** kills to finish Dagannoth Supreme <:Pet_dagannoth_supreme:324127377066164245>

${lootMSG.join('\n')}`);
			}
			case 'PRIME':
			case 'DAGANNOTHPRIME': {
				const lootMSG = [];
				while (loot.length !== 4) {
					kc++;
					if (!loot.includes('PET') && roll(5000)) {
						loot.push('PET');
						lootMSG.push(
							`**Pet Dagannoth Prime:** ${kc.toLocaleString()} KC <:Pet_dagannoth_prime:324127376877289474>`
						);
					}
					if (roll(64)) {
						const randomRoll = Math.floor(Math.random() * 2) + 1;
						if (!loot.includes('MB') && randomRoll === 1) {
							loot.push('MB');
							lootMSG.push(
								`**Mud Battlestaff:** ${kc.toLocaleString()} KC <:Mud_battlestaff:456175019345838083>`
							);
						}
						if (!loot.includes('SR') && randomRoll === 2) {
							loot.push('SR');
							lootMSG.push(
								`**Seers Ring:** ${kc.toLocaleString()} KC <:Seers_ring:456175344723034122>`
							);
						}
					}
					if (!loot.includes('DA') && roll(128)) {
						loot.push('DA');
						lootMSG.push(
							`**Dragon Axe:** ${kc.toLocaleString()} KC <:Dragon_axe:405265921309933588>`
						);
					}
				}
				return msg.send(`
It took you **${kc.toLocaleString()}** kills to finish Dagannoth Prime <:Pet_dagannoth_prime:324127376877289474>

${lootMSG.join('\n')}
    `);
			}
			case 'CHAOSELE':
			case 'CHAOSELEMENTAL': {
				const lootMSG = [];
				while (loot.length !== 3) {
					kc++;
					if (!loot.includes('PET') && roll(300)) {
						loot.push('PET');
						lootMSG.push(
							`**Pet Chaos Elemental:** ${kc.toLocaleString()} KC <:Pet_chaos_elemental:324127377070227456>`
						);
					}
					if (!loot.includes('DP') && roll(256)) {
						loot.push('DP');
						lootMSG.push(
							`**Dragon Pickaxe:** ${kc.toLocaleString()} KC <:Dragon_pickaxe:406000287841779716>`
						);
					}
					if (!loot.includes('D2H') && roll(128)) {
						loot.push('D2H');
						lootMSG.push(
							`**Dragon 2h Sword:** ${kc.toLocaleString()} KC <:Dragon_2h_sword:405250171593818112>`
						);
					}
				}
				return msg.send(`
It took you **${kc.toLocaleString()}** kills to finish Chaos Elemental <:Pet_chaos_elemental:324127377070227456>

${lootMSG.join('\n')}
    `);
			}
			case 'KQ':
			case 'KALPHITEQUEEN': {
				const lootMSG = [];
				while (loot.length !== 5) {
					kc++;
					if (!loot.includes('PET') && roll(3000)) {
						loot.push('PET');
						lootMSG.push(
							`**Kalphite Princess:** ${kc.toLocaleString()} KC <:Kalphite_princess_2nd_form:324127376915300352>`
						);
					}
					if (!loot.includes('JS') && roll(2000)) {
						loot.push('JS');
						lootMSG.push(
							`**Jar of sand:** ${kc.toLocaleString()} KC <:Jar_of_sand:405249792839647232>`
						);
					}
					if (roll(64)) {
						const randomRoll = Math.floor(Math.random() * 2) + 1;
						if (!loot.includes('DC') && randomRoll === 1) {
							loot.push('DC');
							lootMSG.push(
								`**Dragon Chainbody:** ${kc.toLocaleString()} KC <:Dragon_chainbody:405250171719647232>`
							);
						}
						if (!loot.includes('KQH') && randomRoll === 2) {
							loot.push('KQH');
							lootMSG.push(
								`**Kq head:** ${kc.toLocaleString()} KC <:Kq_head:405249792567148545>`
							);
						}
					}
					if (!loot.includes('D2H') && roll(256)) {
						loot.push('D2H');
						lootMSG.push(
							`**Dragon 2H Sword:** ${kc.toLocaleString()} KC <:Dragon_2h_sword:405250171593818112>`
						);
					}
				}
				return msg.send(`
It took you **${kc.toLocaleString()}** kills to finish Kalphite Queen <:Kalphite_princess_2nd_form:324127376915300352>

${lootMSG.join('\n')}`);
			}
			case 'BANDOS':
			case 'GENERALGRAARDOR':
			case 'GRAARDOR': {
				const lootMSG = [];
				while (loot.length !== 8) {
					kc++;
					if (!loot.includes('PET') && roll(5000)) {
						loot.push('PET');
						lootMSG.push(
							`**Pet General Graardor:** ${kc.toLocaleString()} KC <:Pet_general_graardor:324127377376673792>`
						);
					}
					if (!loot.includes('BH') && roll(508)) {
						loot.push('BH');
						lootMSG.push(
							`**Bandos Hilt:** ${kc.toLocaleString()} KC <:Bandos_hilt:403047909072830464>`
						);
					}
					if (roll(128)) {
						const randomRoll = Math.floor(Math.random() * 3) + 1;
						if (!loot.includes('TAS') && randomRoll === 1) {
							loot.push('TAS');
							lootMSG.push(
								`**Bandos Tassets:** ${kc.toLocaleString()} KC <:Bandos_tassets:403046849465810945>`
							);
						}
						if (!loot.includes('BCP') && randomRoll === 2) {
							loot.push('BCP');
							lootMSG.push(
								`**Bandos Chestplate:** ${kc.toLocaleString()} KC <:Bandos_chestplate:403046849440776202>`
							);
						}
						if (!loot.includes('BB') && randomRoll === 3) {
							loot.push('BB');
							lootMSG.push(
								`**Bandos Boots:** ${kc.toLocaleString()} KC <:Bandos_boots:403046849415610368>`
							);
						}
					}
					if (roll(86)) {
						const randomRoll = Math.floor(Math.random() * 3) + 1;
						if (!loot.includes('GS1') && randomRoll === 1) {
							loot.push('GS1');
							lootMSG.push(
								`**Godsword Shard 1:** ${kc.toLocaleString()} KC <:Godsword_shard_1:403049018764165121>`
							);
						}
						if (!loot.includes('GS2') && randomRoll === 2) {
							loot.push('GS2');
							lootMSG.push(
								`**Godsword Shard 2:** ${kc.toLocaleString()} KC <:Godsword_shard_2:403049019015954462>`
							);
						}
						if (!loot.includes('GS3') && randomRoll === 3) {
							loot.push('GS3');
							lootMSG.push(
								`**Godsword Shard 3:** ${kc.toLocaleString()} KC <:Godsword_shard_3:403049019040858112>`
							);
						}
					}
					// Minion Loot
					if (roll(5400)) {
						const randomRoll = Math.floor(Math.random() * 3) + 1;
						if (!loot.includes('TAS') && randomRoll === 1) {
							loot.push('TAS');
							lootMSG.push(
								`***Bandos Tassets:*** ${kc.toLocaleString()} KC <:Bandos_tassets:403046849465810945>`
							);
						}
						if (!loot.includes('BCP') && randomRoll === 2) {
							loot.push('BCP');
							lootMSG.push(
								`***Bandos Chestplate:*** ${kc.toLocaleString()} KC <:Bandos_chestplate:403046849440776202>`
							);
						}
						if (!loot.includes('BB') && randomRoll === 3) {
							loot.push('BB');
							lootMSG.push(
								`***Bandos Boots:*** ${kc.toLocaleString()} KC <:Bandos_boots:403046849415610368>`
							);
						}
					}
					if (roll(508)) {
						const randomRoll = Math.floor(Math.random() * 3) + 1;
						if (!loot.includes('GS1') && randomRoll === 1) {
							loot.push('GS1');
							lootMSG.push(
								`***Godsword Shard 1:*** ${kc.toLocaleString()} KC <:Godsword_shard_1:403049018764165121>`
							);
						}
						if (!loot.includes('GS2') && randomRoll === 2) {
							loot.push('GS2');
							lootMSG.push(
								`***Godsword Shard 2:*** ${kc.toLocaleString()} KC <:Godsword_shard_2:403049019015954462>`
							);
						}
						if (!loot.includes('GS3') && randomRoll === 3) {
							loot.push('GS3');
							lootMSG.push(
								`***Godsword Shard 3:*** ${kc.toLocaleString()} KC <:Godsword_shard_3:403049019040858112>`
							);
						}
					}
				}
				return msg.send(`
It took you **${kc.toLocaleString()}** kills to finish Bandos <:General_Graardor:437553427468255234>

${lootMSG.join('\n')}`);
			}
			case 'ARMA':
			case 'ARMADYL':
			case 'KREE':
			case 'KREEARRA': {
				const lootMSG = [];
				while (loot.length !== 8) {
					kc++;
					if (!loot.includes('PET') && roll(5000)) {
						loot.push('PET');
						lootMSG.push(
							`**Pet Kree'arra:** ${kc.toLocaleString()} KC <:Pet_kreearra:324127377305239555>`
						);
					}
					if (!loot.includes('AHilt') && roll(508)) {
						loot.push('AHilt');
						lootMSG.push(
							`**Armadyl Hilt:** ${kc.toLocaleString()} KC <:Armadyl_hilt:405262588503523328>`
						);
					}
					if (roll(128)) {
						const randomRoll = Math.floor(Math.random() * 3) + 1;
						if (!loot.includes('ACS') && randomRoll === 1) {
							loot.push('ACS');
							lootMSG.push(
								`**Armadyl Chainskirt:** ${kc.toLocaleString()} KC <:Armadyl_chainskirt:405262588222636042>`
							);
						}
						if (!loot.includes('ACP') && randomRoll === 2) {
							loot.push('ACP');
							lootMSG.push(
								`**Armadyl Chestplate:** ${kc.toLocaleString()} KC <:Armadyl_chestplate:405262588310454292>`
							);
						}
						if (!loot.includes('AHelm') && randomRoll === 3) {
							loot.push('AHelm');
							lootMSG.push(
								`**Armadyl Helmet:** ${kc.toLocaleString()} KC <:Armadyl_helmet:405262588499329024>`
							);
						}
					}
					if (roll(86)) {
						const randomRoll = Math.floor(Math.random() * 3) + 1;
						if (!loot.includes('GS1') && randomRoll === 1) {
							loot.push('GS1');
							lootMSG.push(
								`**Godsword Shard 1:** ${kc.toLocaleString()} KC <:Godsword_shard_1:403049018764165121>`
							);
						}
						if (!loot.includes('GS2') && randomRoll === 2) {
							loot.push('GS2');
							lootMSG.push(
								`**Godsword Shard 2:** ${kc.toLocaleString()} KC <:Godsword_shard_2:403049019015954462>`
							);
						}
						if (!loot.includes('GS3') && randomRoll === 3) {
							loot.push('GS3');
							lootMSG.push(
								`**Godsword Shard 3:** ${kc.toLocaleString()} KC <:Godsword_shard_3:403049019040858112>`
							);
						}
					}
					// Minion Loot
					if (roll(5400)) {
						const randomRoll = Math.floor(Math.random() * 3) + 1;
						if (!loot.includes('ACS') && randomRoll === 1) {
							loot.push('ACS');
							lootMSG.push(
								`***Armadyl Chainskirt:*** ${kc.toLocaleString()} KC <:Armadyl_chainskirt:405262588222636042>`
							);
						}
						if (!loot.includes('ACP') && randomRoll === 2) {
							loot.push('ACP');
							lootMSG.push(
								`***Armadyl Chestplate:*** ${kc.toLocaleString()} KC <:Armadyl_chestplate:405262588310454292>`
							);
						}
						if (!loot.includes('AHelm') && randomRoll === 3) {
							loot.push('AHelm');
							lootMSG.push(
								`***Armadyl Helmet:*** ${kc.toLocaleString()} KC <:Armadyl_helmet:405262588499329024>`
							);
						}
					}
					if (roll(508)) {
						const randomRoll = Math.floor(Math.random() * 3) + 1;
						if (!loot.includes('GS1') && randomRoll === 1) {
							loot.push('GS1');
							lootMSG.push(
								`***Godsword Shard 1:*** ${kc.toLocaleString()} KC <:Godsword_shard_1:403049018764165121>`
							);
						}
						if (!loot.includes('GS2') && randomRoll === 2) {
							loot.push('GS2');
							lootMSG.push(
								`***Godsword Shard 2:*** ${kc.toLocaleString()} KC <:Godsword_shard_2:403049019015954462>`
							);
						}
						if (!loot.includes('GS3') && randomRoll === 3) {
							loot.push('GS3');
							lootMSG.push(
								`***Godsword Shard 3:*** ${kc.toLocaleString()} KC <:Godsword_shard_3:403049019040858112>`
							);
						}
					}
				}
				return msg.send(`
It took you **${kc.toLocaleString()}** kills to finish Armadyl <:Pet_kreearra:324127377305239555>

${lootMSG.join('\n')}`);
			}
			case 'ZAMMY':
			case 'ZAMORAK':
			case 'KRIL':
			case 'KRILTSUTSAROTH': {
				const lootMSG = [];
				while (loot.length !== 8) {
					kc++;
					if (!loot.includes('PET') && roll(5000)) {
						loot.push('PET');
						lootMSG.push(
							`**Pet K'ril Tsutsaroth:** ${kc.toLocaleString()} KC <:Pet_kril_tsutsaroth:324127377527406594>`
						);
					}
					if (roll(256)) {
						const randomRoll = Math.floor(Math.random() * 2) + 1;
						if (!loot.includes('ZH') && randomRoll === 1) {
							loot.push('ZH');
							lootMSG.push(
								`**Zamorak Hilt:** ${kc.toLocaleString()} KC <:Zamorak_hilt:405251862489595905>`
							);
						}
						if (!loot.includes('SOTD') && randomRoll === 2) {
							loot.push('SOTD');
							lootMSG.push(
								`**Staff of the Dead:** ${kc.toLocaleString()} KC <:Staff_of_the_dead:405251862695116801>`
							);
						}
					}
					if (roll(64)) {
						const randomRoll = Math.floor(Math.random() * 2) + 1;
						if (!loot.includes('ZS') && randomRoll === 1) {
							loot.push('ZS');
							lootMSG.push(
								`**Zamorakian Spear:** ${kc.toLocaleString()} KC <:Zamorakian_spear:405251862883729418>`
							);
						}
						if (!loot.includes('SB') && randomRoll === 2) {
							loot.push('SB');
							lootMSG.push(
								`**Steam Battlestaff:** ${kc.toLocaleString()} KC <:Steam_battlestaff:405251862451716097>`
							);
						}
					}
					if (roll(86)) {
						const randomRoll = Math.floor(Math.random() * 3) + 1;
						if (!loot.includes('GS1') && randomRoll === 1) {
							loot.push('GS1');
							lootMSG.push(
								`**Godsword Shard 1:** ${kc.toLocaleString()} KC <:Godsword_shard_1:403049018764165121>`
							);
						}
						if (!loot.includes('GS2') && randomRoll === 2) {
							loot.push('GS2');
							lootMSG.push(
								`**Godsword Shard 2:** ${kc.toLocaleString()} KC <:Godsword_shard_2:403049019015954462>`
							);
						}
						if (!loot.includes('GS3') && randomRoll === 3) {
							loot.push('GS3');
							lootMSG.push(
								`**Godsword Shard 3:** ${kc.toLocaleString()} KC <:Godsword_shard_3:403049019040858112>`
							);
						}
					}
					// Minion Loot
					if (!loot.includes('ZS') && roll(5400)) {
						loot.push('ZS');
						lootMSG.push(
							`***Zamorakian Spear:*** ${kc.toLocaleString()} KC <:Zamorakian_spear:405251862883729418>`
						);
					}
					if (roll(508)) {
						const randomRoll = Math.floor(Math.random() * 3) + 1;
						if (!loot.includes('GS1') && randomRoll === 1) {
							loot.push('GS1');
							lootMSG.push(
								`***Godsword Shard 1:*** ${kc.toLocaleString()} KC <:Godsword_shard_1:403049018764165121>`
							);
						}
						if (!loot.includes('GS2') && randomRoll === 2) {
							loot.push('GS2');
							lootMSG.push(
								`***Godsword Shard 2:*** ${kc.toLocaleString()} KC <:Godsword_shard_2:403049019015954462>`
							);
						}
						if (!loot.includes('GS3') && randomRoll === 3) {
							loot.push('GS3');
							lootMSG.push(
								`***Godsword Shard 3:*** ${kc.toLocaleString()} KC <:Godsword_shard_3:403049019040858112>`
							);
						}
					}
				}
				return msg.send(`
It took you **${kc.toLocaleString()}** kills to finish Zamorak <:Pet_kril_tsutsaroth:324127377527406594>

${lootMSG.join('\n')}`);
			}
			case 'SARA':
			case 'SARADOMIN':
			case 'ZILY':
			case 'ZILYANA':
			case 'COMMANDERZILYANA': {
				const lootMSG = [];
				while (loot.length !== 8) {
					kc++;
					if (!loot.includes('PET') && roll(5000)) {
						loot.push('PET');
						lootMSG.push(
							`**Pet Zilyana:** ${kc.toLocaleString()} KC <:Pet_zilyana:324127378248957952>`
						);
					}
					if (roll(256)) {
						const randomRoll = Math.floor(Math.random() * 2) + 1;
						if (!loot.includes('SH') && randomRoll === 1) {
							loot.push('SH');
							lootMSG.push(
								`**Saradomin Hilt:** ${kc.toLocaleString()} KC <:Saradomin_hilt:403051383214833667>`
							);
						}
						if (!loot.includes('ACB') && randomRoll === 2) {
							loot.push('ACB');
							lootMSG.push(
								`**Armadyl Crossbow:** ${kc.toLocaleString()} KC <:Armadyl_crossbow:403052160931069952>`
							);
						}
					}
					if (!loot.includes('SL') && roll(254)) {
						loot.push('SL');
						lootMSG.push(
							`**Saradomin's Light:** ${kc.toLocaleString()} KC <:Saradomins_light:403052160977338378>`
						);
					}
					if (!loot.includes('SS') && roll(127)) {
						loot.push('SS');
						lootMSG.push(
							`**Saradomin Sword:** ${kc.toLocaleString()} KC <:Saradomin_sword:403052160822280192>`
						);
					}
					if (roll(86)) {
						const randomRoll = Math.floor(Math.random() * 3) + 1;
						if (!loot.includes('GS1') && randomRoll === 1) {
							loot.push('GS1');
							lootMSG.push(
								`**Godsword Shard 1:** ${kc.toLocaleString()} KC <:Godsword_shard_1:403049018764165121>`
							);
						}
						if (!loot.includes('GS2') && randomRoll === 2) {
							loot.push('GS2');
							lootMSG.push(
								`**Godsword Shard 2:** ${kc.toLocaleString()} KC <:Godsword_shard_2:403049019015954462>`
							);
						}
						if (!loot.includes('GS3') && randomRoll === 3) {
							loot.push('GS3');
							lootMSG.push(
								`**Godsword Shard 3:** ${kc.toLocaleString()} KC <:Godsword_shard_3:403049019040858112>`
							);
						}
					}
					// Minion Loot
					if (!loot.includes('SS') && roll(5400)) {
						loot.push('SS');
						lootMSG.push(
							`**Saradomin Sword:** ${kc.toLocaleString()} KC <:Saradomin_sword:403052160822280192>`
						);
					}
					if (roll(508)) {
						const randomRoll = Math.floor(Math.random() * 3) + 1;
						if (!loot.includes('GS1') && randomRoll === 1) {
							loot.push('GS1');
							lootMSG.push(
								`**Godsword Shard 1:** ${kc.toLocaleString()} KC <:Godsword_shard_1:403049018764165121>`
							);
						}
						if (!loot.includes('GS2') && randomRoll === 2) {
							loot.push('GS2');
							lootMSG.push(
								`**Godsword Shard 2:** ${kc.toLocaleString()} KC <:Godsword_shard_2:403049019015954462>`
							);
						}
						if (!loot.includes('GS3') && randomRoll === 3) {
							loot.push('GS3');
							lootMSG.push(
								`**Godsword Shard 3:** ${kc.toLocaleString()} KC <:Godsword_shard_3:403049019040858112>`
							);
						}
					}
				}
				return msg.send(`
It took you **${kc.toLocaleString()}** kills to finish Saradomin <:Pet_zilyana:324127378248957952>

${lootMSG.join('\n')}`);
			}
			case 'CORP':
			case 'CORPOREALBEAST':
			case 'CORPBEAST': {
				let elyKC = -1;
				let arcKC = -1;
				let specKC = -1;
				let petKC = -1;
				const lootMSG = [];
				while (loot.length < 4) {
					kc++;
					if (roll(5000)) {
						if (!loot.includes('PET')) {
							loot.push('PET');
							petKC = kc;
							lootMSG.push(
								`**Pet Dark Core:** ${petKC.toLocaleString()} KC <:Pet_dark_core:324127377347313674>`
							);
						} else {
							duplicates.push('<:Pet_dark_core:324127377347313674>');
						}
					}
					if (roll(585)) {
						const randomRoll = Math.floor(Math.random() * 8);
						if (randomRoll < 1) {
							if (!loot.includes('ELY')) {
								loot.push('ELY');
								elyKC = kc;
								lootMSG.push(
									`**Elysian Sigil:** ${elyKC.toLocaleString()} KC <:Elysian_sigil:399999422295048223>`
								);
							} else {
								duplicates.push('<:Elysian_sigil:399999422295048223>');
							}
						} else if (randomRoll < 4) {
							if (!loot.includes('SPEC')) {
								loot.push('SPEC');
								specKC = kc;
								lootMSG.push(
									`**Spectral Sigil:** ${specKC.toLocaleString()} KC <:Spectral_sigil:399999422299373568>`
								);
							} else {
								duplicates.push('<:Spectral_sigil:399999422299373568>');
							}
						} else if (!loot.includes('ARC')) {
							loot.push('ARC');
							arcKC = kc;
							lootMSG.push(
								`**Arcane Sigil:** ${arcKC.toLocaleString()} KC <:Arcane_sigil:399999422282596362>`
							);
						} else {
							duplicates.push('<:Arcane_sigil:399999422282596362>');
						}
					}
				}
				return msg.send(`
It took you **${kc.toLocaleString()}** kills to finish Corporeal Beast <:Corporeal_Beast:429333974968434702>

${lootMSG.join('\n')}

**Duplicates:** ${duplicates.length > 0 ? duplicates.slice(0, 10).join(' ') : 'None!'}`);
			}
			case 'ZULRAH': {
				const lootMSG = [];
				let zs = 0;
				while (loot.length !== 8) {
					kc++;
					zs += Math.floor((Math.random() * 2 + 1) * 100);
					if (!loot.includes('PET') && roll(4000)) {
						loot.push('PET');
						lootMSG.push(
							`**Pet Snakeling:** ${kc.toLocaleString()} KC <:Pet_snakeling:324127377816944642>`
						);
					}
					if (!loot.includes('JS') && roll(3000)) {
						loot.push('JS');
						lootMSG.push(
							`**Jar of swamp:** ${kc.toLocaleString()} KC <:Jar_of_swamp:403059673588170776>`
						);
					}
					if (roll(3277)) {
						const randomRoll = Math.floor(Math.random() * 2) + 1;
						if (!loot.includes('TM') && randomRoll === 1) {
							loot.push('TM');
							lootMSG.push(
								`**Tanzanite Mutagen:** ${kc.toLocaleString()} KC <:Tanzanite_mutagen:403059676306079746>`
							);
						}
						if (!loot.includes('MM') && randomRoll === 2) {
							loot.push('MM');
							lootMSG.push(
								`**Magma Mutagen:** ${kc.toLocaleString()} KC <:Magma_mutagen:403059676733898753>`
							);
						}
					}
					if (roll(128)) {
						const randomRoll = Math.floor(Math.random() * 4) + 1;
						if (!loot.includes('TF') && randomRoll === 1) {
							loot.push('TF');
							lootMSG.push(
								`**Tanzanite Fang:** ${kc.toLocaleString()} KC <:Tanzanite_fang:403059675979055105>`
							);
						}
						if (!loot.includes('MF') && randomRoll === 2) {
							loot.push('MF');
							lootMSG.push(
								`**Magic Fang:** ${kc.toLocaleString()} KC <:Magic_fang:403059673563004928>`
							);
						}
						if (!loot.includes('SV') && randomRoll === 3) {
							loot.push('SV');
							lootMSG.push(
								`**Serpentine Visage:** ${kc.toLocaleString()} KC <:Serpentine_visage:403059676016672769>`
							);
						}
						if (!loot.includes('UO') && randomRoll === 4) {
							loot.push('UO');
							lootMSG.push(
								`**Uncut Onyx:** ${kc.toLocaleString()} KC <:Uncut_onyx:403059676402679808>`
							);
						}
					}
					// This drop rate isn't confirmed, but estimated rate from https://tinyurl.com/yaugejo2
					if (rollX(5, 128)) zs += 500;
				}
				return msg.send(`
It took you **${kc.toLocaleString()}** kills to finish Zulrah <:Pet_snakeling:324127377816944642>

${lootMSG.join('\n')}\n\nYou also received **${zs.toLocaleString()}** Zulrah Scales!`);
			}
			case 'WINTERTODT':
			case 'WINTERTOAD':
			case 'TODT':
			case 'WT': {
				const lootMSG = [];
				let PC = 0;
				while (loot.length !== 9) {
					kc++;
					if (!loot.includes('DA') && roll(5000)) {
						loot.push('DA');
						lootMSG.push(
							`**Dragon Axe:** ${kc.toLocaleString()} KC <:Dragon_axe:405265921309933588>`
						);
					}
					if (!loot.includes('PET') && roll(2500)) {
						loot.push('PET');
						lootMSG.push(
							`**Phoenix:** ${kc.toLocaleString()} KC <:Phoenix:324127378223792129>`
						);
					}
					if (!loot.includes('TF') && roll(500)) {
						loot.push('TF');
						lootMSG.push(
							`**Tome of Fire:** ${kc.toLocaleString()} KC <:Tome_of_fire_empty:405265922287468544>`
						);
					}
					if (!loot.includes('WG') && roll(75)) {
						loot.push('WG');
						lootMSG.push(
							`**Warm Gloves:** ${kc.toLocaleString()} KC <:Warm_gloves:405265922396258334>`
						);
					}
					if (!loot.includes('BT') && roll(75)) {
						loot.push('BT');
						lootMSG.push(
							`**Bruma Torch:** ${kc.toLocaleString()} KC <:Bruma_torch:421038270823006218>`
						);
					}
					if (roll(75)) {
						let LOCK = false;
						if (!loot.includes('PG') && PC === 0) {
							loot.push('PG');
							lootMSG.push(
								`**Pyromancer Garb:** ${kc.toLocaleString()} KC <:Pyromancer_garb:405265922199257088>`
							);
							PC++;
							LOCK = true;
						}
						if (!loot.includes('PH') && !LOCK) {
							loot.push('PH');
							lootMSG.push(
								`**Pyromancer Hood:** ${kc.toLocaleString()} KC <:Pyromancer_hood:405265921872232448>`
							);
							PC++;
							LOCK = true;
						}
						if (!loot.includes('PR') && !LOCK) {
							loot.push('PR');
							lootMSG.push(
								`**Pyromancer Robe:** ${kc.toLocaleString()} KC <:Pyromancer_robe:405265921553334283>`
							);
							PC++;
							LOCK = true;
						}
						if (!loot.includes('PB') && !LOCK) {
							loot.push('PB');
							lootMSG.push(
								`**Pyromancer Boots:** ${kc.toLocaleString()} KC <:Pyromancer_boots:405265921603534848>`
							);
							PC++;
							LOCK = true;
						}
					}
				}
				return msg.send(`
It took you **${kc.toLocaleString()}** kills to finish Wintertodt <:Phoenix:324127378223792129>

${lootMSG.join('\n')}`);
			}
			case 'RAIDS':
			case 'OLM':
			case 'RAIDS1':
			case 'COX':
			case 'CHAMBERSOFXERIC':
				// eslint-disable-next-line no-case-declarations
				const theDrops = new Map();
				while (theDrops.size < 13) {
					kc++;
					if (!roll(25)) continue;
					const dropRecieved = raids.determineItem()!;
					if (roll(65)) {
						if (!theDrops.has(raids.drops.pet.shortName)) {
							theDrops.set(raids.drops.pet.shortName, {
								theKC: `**${raids.drops.pet.name}:** ${kc} KC ${raids.drops.pet.emoji} with ${dropRecieved.emoji}`,
								dup: 0
							});
						} else {
							theDrops.get(raids.drops.pet.shortName).theKC += ` ${
								dropRecieved!.emoji
							}`;
							theDrops.get(raids.drops.pet.shortName).dup++;
						}
					}

					if (!theDrops.has(dropRecieved.shortName)) {
						theDrops.set(dropRecieved.shortName, {
							theKC: `**${dropRecieved.name}** ${kc} KC ${dropRecieved.emoji}`,
							dup: 0
						});
					} else {
						theDrops.get(dropRecieved.shortName).dup++;
					}
				}

				theDrops.forEach(value => loot.push(`${value.theKC} ${value.dup} duplicates`));
				return msg.send(
					`It took you **${kc.toLocaleString()}** kills to finish the Chambers of Xeric <:Olmlet:324127376873357316> ${loot.join(
						'\n'
					)}`
				);
			// end of chambers of xeric finish command
			case 'VORKATH': {
				const lootMSG = [];
				let vh = 0;
				while (loot.length !== 6) {
					kc++;
					if (!loot.includes('DN') && roll(1000)) {
						loot.push('DN');
						lootMSG.push(
							`**Dragonbone Necklace:** ${kc.toLocaleString()} KC <:Dragonbone_necklace:403378090740547595>`
						);
					}
					if (roll(1500)) {
						const randomRoll = Math.floor(Math.random() * 2) + 1;
						if (!loot.includes('JD') && randomRoll === 1) {
							loot.push('JD');
							lootMSG.push(
								`**Jar of decay:** ${kc.toLocaleString()} KC <:Jar_of_decay:403378091008851968>`
							);
						}
						if (!loot.includes('PET') && randomRoll === 2) {
							loot.push('PET');
							lootMSG.push(
								`**Vorki:** ${kc.toLocaleString()} KC <:Vorki:400713309252222977>`
							);
						}
					}
					if (roll(2500)) {
						const randomRoll = Math.floor(Math.random() * 2) + 1;
						if (!loot.includes('SV') && randomRoll === 1) {
							loot.push('SV');
							lootMSG.push(
								`**Skeletal Visage:** ${kc.toLocaleString()} KC <:Skeletal_visage:403378091071766539>`
							);
						}
						if (!loot.includes('DV') && randomRoll === 2) {
							loot.push('DV');
							lootMSG.push(
								`**Draconic Visage:** ${kc.toLocaleString()} KC <:Draconic_visage:403378090979491840>`
							);
						}
					}
					if (roll(50)) {
						if (vh === 0) {
							loot.push('VH');
							lootMSG.push(
								`**Vorkath's Head:** ${kc.toLocaleString()} KC <:Vorkaths_head:403378091046469632>`
							);
						}
						vh++;
					}
					if (kc === 50) {
						if (vh === 0) {
							loot.push('VH');
							lootMSG.push(
								`**Vorkath's Head:** ${kc.toLocaleString()} KC <:Vorkaths_head:403378091046469632>`
							);
						}
						vh++;
					}
				}
				return msg.send(`
It took you **${kc.toLocaleString()}** kills to finish Vorkath <:Vorki:400713309252222977>

${lootMSG.join('\n')}

You also received **${vh.toLocaleString()}** Vorkath Heads!`);
			}
			case 'OBOR':
			case 'HILLGIANTBOSS': {
				while (loot.length !== 1) {
					kc++;
					if (!loot.includes('HGC') && roll(118)) {
						loot.push('HGC');
					}
				}
				return msg.send(`
					You received **Hill Giant Club** on **${kc.toLocaleString()}** KC to finish Obor! <:Hill_giant_club:421045456194240523>
					`);
			}
			case 'BRYOPHYTA':
			case 'MOSSGIANTBOSS': {
				while (loot.length !== 1) {
					kc++;
					if (!loot.includes('BE') && roll(118)) {
						loot.push('BE');
					}
				}
				return msg.send(`
You received **Bryophyta's Essence** on **${kc.toLocaleString()}** KC to finish Bryophyta! <:Bryophytas_essence:455835859799769108>
`);
			}
			case 'SHAMANS':
			case 'LIZARDMANSHAMANS':
			case 'LIZARDMANSHAMAN':
			case 'LIZARDMEN': {
				const lootMSG = [];
				while (loot.length !== 2) {
					kc++;
					if (!loot.includes('DWH') && roll(5000)) {
						loot.push('DWH');
						lootMSG.push(
							`**Dragon Warhammer:** ${kc.toLocaleString()} KC <:Dragon_warhammer:405998717154623488>`
						);
					}
					if (!loot.includes('XT') && roll(250)) {
						loot.push('XT');
						lootMSG.push(
							`**Xeric's Talisman:** ${kc.toLocaleString()} KC <:Xerics_talisman_inert:456176488669249539>`
						);
					}
				}
				return msg.send(`
It took you **${kc.toLocaleString()}** kills to finish Lizardman Shamans <:Lizardman_shaman:456176702167449612>

${lootMSG.join('\n')}`);
			}
			case 'GORILLAS':
			case 'DGS':
			case 'DEMONICGORILLAS':
			case 'DEMONICGORILLA':
			case 'DEMONICS': {
				const lootMSG = [];
				while (loot.length !== 9) {
					kc++;
					if (!loot.includes('MT') && roll(1500)) {
						loot.push('MT');
						lootMSG.push(
							`**Monkey Tail:** ${kc.toLocaleString()} KC <:Monkey_tail:405245077670068225>`
						);
					}
					if (!loot.includes('HF') && roll(1500)) {
						loot.push('HF');
						lootMSG.push(
							`**Heavy Frame:** ${kc.toLocaleString()} KC <:Heavy_frame:405245077754216448>`
						);
					}
					if (!loot.includes('LF') && roll(750)) {
						loot.push('LF');
						lootMSG.push(
							`**Light Frame:** ${kc.toLocaleString()} KC <:Light_frame:405245077808742400>`
						);
					}
					if (roll(250)) {
						const randomRoll = Math.floor(Math.random() * 2) + 1;
						if (!loot.includes('BS') && randomRoll === 1) {
							loot.push('BS');
							lootMSG.push(
								`**Ballista Spring:** ${kc.toLocaleString()} KC <:Ballista_spring:405245077590507531>`
							);
						}
						if (!loot.includes('BL') && randomRoll === 2) {
							loot.push('BL');
							lootMSG.push(
								`**Balista Limbs** ${kc.toLocaleString()} KC <:Ballista_limbs:405245077280129025>`
							);
						}
					}
					if (roll(300)) {
						if (!loot.includes('ZS4') && loot.includes('ZS3')) {
							loot.push('ZS4');
							lootMSG.push(
								`**Zenyte Shard #4:** ${kc.toLocaleString()} KC <:Zenyte_shard:405245077972320256>`
							);
						}
						if (!loot.includes('ZS3') && loot.includes('ZS2')) {
							loot.push('ZS3');
							lootMSG.push(
								`**Zenyte Shard #3:** ${kc.toLocaleString()} KC <:Zenyte_shard:405245077972320256>`
							);
						}
						if (!loot.includes('ZS2') && loot.includes('ZS1')) {
							loot.push('ZS2');
							lootMSG.push(
								`**Zenyte Shard #2:** ${kc.toLocaleString()} KC <:Zenyte_shard:405245077972320256>`
							);
						}
						if (!loot.includes('ZS1')) {
							loot.push('ZS1');
							lootMSG.push(
								`**Zenyte Shard #1:** ${kc.toLocaleString()} KC <:Zenyte_shard:405245077972320256>`
							);
						}
					}
				}
				return msg.send(`
It took you **${kc.toLocaleString()}** kills to finish Demonic Gorillas <:Demonic_gorilla:456176858178912266>

${lootMSG.join('\n')}`);
			}
			case 'SKOTIZO': {
				const lootMSG = [];
				while (loot.length !== 4) {
					kc++;
					if (!loot.includes('JD') && roll(2500)) {
						loot.push('JD');
						lootMSG.push(
							`**Jar of Darkness:** ${kc.toLocaleString()} KC <:Jar_of_darkness:417703738858536972>`
						);
					}
					if (!loot.includes('UO') && roll(1000)) {
						loot.push('UO');
						lootMSG.push(
							`**Uncut Onyx:** ${kc.toLocaleString()} KC <:Uncut_onyx:403059676402679808>`
						);
					}
					if (!loot.includes('PET') && roll(65)) {
						loot.push('PET');
						lootMSG.push(
							`**Skotos:** ${kc.toLocaleString()} KC <:Skotos:324127378890817546>`
						);
					}
					if (!loot.includes('DC') && roll(25)) {
						loot.push('DC');
						lootMSG.push(
							`**Dark Claw:** ${kc.toLocaleString()} KC <:Dark_claw:417703739218984960>`
						);
					}
				}
				const SE = kc * 64114;
				// AVG Slay XP = https://tinyurl.com/y8hbcdca
				return msg.send(`
It took you **${kc.toLocaleString()}** kills to finish Skotizo <:Skotos:324127378890817546>

${lootMSG.join('\n')}\n\nYou also gained **${SE.toLocaleString()}** Slayer XP!`);
			}
			case 'ANCIENTWYVERN':
			case 'ANCIENTWYVERNS':
			case 'FOSSILISLANDWYVERNS': {
				const lootMSG = [];
				let unidFoss = 0;
				while (loot.length !== 3) {
					kc++;
					if (!loot.includes('WV') && roll(10000)) {
						loot.push('WV');
						lootMSG.push(
							`**Wyvern Visage:** ${kc.toLocaleString()} KC <:Wyvern_visage:506330718641586185>`
						);
					}
					if (!loot.includes('GLS') && roll(600)) {
						loot.push('GLS');
						lootMSG.push(
							`**Granite Longsword:** ${kc.toLocaleString()} KC <:Granite_longsword:506330718473945088>`
						);
					}
					if (!loot.includes('GB') && roll(600)) {
						loot.push('GB');
						lootMSG.push(
							`**Granite Boots:** ${kc.toLocaleString()} KC <:Granite_boots:506330718516019230>`
						);
					}
					if (rollX(12, 175)) unidFoss++;
				}
				return msg.send(`
It took you **${kc.toLocaleString()}** kills to finish Ancient Wyverns <:Ancient_Wyvern:506330720558383124>

${lootMSG.join('\n')}\n\nYou also received **${unidFoss.toLocaleString()}** Unidentified Fossils!`);
			}
			case 'MITHRILDRAGONS':
			case 'MITHRILDRAGS':
			case 'MITHDRAGONS':
			case 'MITHDRAGS': {
				// ancient page count
				let ap = 0;
				// chewed bones count
				let cb = 0;
				const lootMSG = [];
				while (loot.length !== 2) {
					kc++;
					if (!loot.includes('DV') && roll(10000)) {
						loot.push('DV');
						lootMSG.push(
							`**Draconic Visage:** ${kc.toLocaleString()} KC <:Draconic_visage:403378090979491840>`
						);
					}
					if (!loot.includes('DFH') && roll(32768)) {
						loot.push('DFH');
						lootMSG.push(
							`**Dragon Full Helm:** ${kc.toLocaleString()} KC from a Mithril Dragon <:Dragon_full_helm:456177009639424020>`
						);
					}
					if (roll(64)) {
						ap++;
					}
					if (roll(42)) {
						cb++;
						if (!loot.includes('DFH') && roll(250)) {
							loot.push('DFH');
							lootMSG.push(
								`**Dragon Full Helm:** ${kc.toLocaleString()} KC from Chewed Bone #${cb.toLocaleString()} <:Dragon_full_helm:456177009639424020>`
							);
						}
					}
				}
				return msg.send(`
It took you **${kc.toLocaleString()}** kills to finish Mithril Dragons <:Mithril_dragon:456177739339399168>

${lootMSG.join(
	'\n'
)}\n\nYou also received **${ap.toLocaleString()}** Ancient Pages and **${cb.toLocaleString()}** Chewed Bones!`);
			}
			case 'ADAMANTDRAGONS':
			case 'ADAMANTDRAGS':
			case 'ADDYDRAGONS':
			case 'ADDYDRAGS': {
				const lootMSG = [];
				while (loot.length !== 3) {
					kc++;
					if (!loot.includes('DV') && roll(9000)) {
						loot.push('DV');
						lootMSG.push(
							`**Draconic Visage:** ${kc.toLocaleString()} KC <:Draconic_visage:403378090979491840>`
						);
					}
					if (!loot.includes('DMS') && roll(5000)) {
						loot.push('DMS');
						lootMSG.push(
							`**Dragon Metal Slice:** ${kc.toLocaleString()} KC <:Dragon_metal_slice:456178390991634432>`
						);
					}
					if (!loot.includes('DL') && roll(1000)) {
						loot.push('DL');
						lootMSG.push(
							`**Dragon Limbs:** ${kc.toLocaleString()} KC <:Dragon_limbs:456178390928588800>`
						);
					}
				}
				return msg.send(`
It took you **${kc.toLocaleString()}** kills to finish Adamant Dragons <:Adamant_dragon:456178397941334016>

${lootMSG.join('\n')}`);
			}
			case 'RUNEDRAGS':
			case 'RUNEDRAGONS': {
				const lootMSG = [];
				while (loot.length !== 3) {
					kc++;
					if (!loot.includes('DV') && roll(8000)) {
						loot.push('DV');
						lootMSG.push(
							`**Draconic Visage:** ${kc.toLocaleString()} KC <:Draconic_visage:403378090979491840>`
						);
					}
					if (!loot.includes('DML') && roll(5000)) {
						loot.push('DML');
						lootMSG.push(
							`**Dragon Metal Lump:** ${kc.toLocaleString()} KC <:Dragon_metal_lump:456178708777140244>`
						);
					}
					if (!loot.includes('DL') && roll(800)) {
						loot.push('DL');
						lootMSG.push(
							`**Dragon Limbs:** ${kc.toLocaleString()} KC <:Dragon_limbs:456178390928588800>`
						);
					}
				}
				return msg.send(`
It took you **${kc.toLocaleString()}** kills to finish Rune Dragons <:Rune_dragon:456178949483921430>

${lootMSG.join('\n')}`);
			}
			case 'VETION': {
				const lootMSG = [];
				while (loot.length !== 4) {
					kc++;
					if (!loot.includes('PET') && roll(2000)) {
						loot.push('PET');
						lootMSG.push(
							`**Vet'ion Jr:** ${kc.toLocaleString()} KC <:Vetion_jr:324127378999738369>`
						);
					}
					if (!loot.includes('ROTG') && roll(512)) {
						loot.push('ROTG');
						lootMSG.push(
							`**Ring of the Gods:** ${kc.toLocaleString()} KC <:Ring_of_the_gods:406002360947703808>`
						);
					}
					if (!loot.includes('D2H') && roll(256)) {
						loot.push('D2H');
						lootMSG.push(
							`**Dragon 2h Sword:** ${kc.toLocaleString()} KC <:Dragon_2h_sword:405250171593818112>`
						);
					}
					if (!loot.includes('DP') && roll(171)) {
						loot.push('DP');
						lootMSG.push(
							`**Dragon Pickaxe:** ${kc.toLocaleString()} KC <:Dragon_pickaxe:406000287841779716>`
						);
					}
				}
				return msg.send(`
It took you **${kc.toLocaleString()}** kills to finish Vet'ion <:Vetion_jr:324127378999738369>

${lootMSG.join('\n')}`);
			}
			case 'VENENATIS': {
				const lootMSG = [];
				while (loot.length !== 4) {
					kc++;
					if (!loot.includes('PET') && roll(2000)) {
						loot.push('PET');
						lootMSG.push(
							`**Venenatis Spiderling:** ${kc.toLocaleString()} KC <:Venenatis_spiderling:324127379092144129>`
						);
					}
					if (!loot.includes('TR') && roll(512)) {
						loot.push('TR');
						lootMSG.push(
							`**Treasonous Ring:** ${kc.toLocaleString()} KC <:Treasonous_ring:406008615728578561>`
						);
					}
					if (!loot.includes('D2H') && roll(256)) {
						loot.push('D2H');
						lootMSG.push(
							`**Dragon 2h Sword:** ${kc.toLocaleString()} KC <:Dragon_2h_sword:405250171593818112>`
						);
					}
					if (!loot.includes('DP') && roll(171)) {
						loot.push('DP');
						lootMSG.push(
							`**Dragon Pickaxe:** ${kc.toLocaleString()} KC <:Dragon_pickaxe:406000287841779716>`
						);
					}
				}
				return msg.send(`
It took you **${kc.toLocaleString()}** kills to finish Venenatis <:Venenatis_spiderling:324127379092144129>

${lootMSG.join('\n')}`);
			}
			case 'CALLISTO': {
				const lootMSG = [];
				while (loot.length !== 4) {
					kc++;
					if (!loot.includes('PET') && roll(2000)) {
						loot.push('PET');
						lootMSG.push(
							`**Callisto Cub:** ${kc.toLocaleString()} KC <:Callisto_cub:324127376273440768>`
						);
					}
					if (!loot.includes('TR') && roll(512)) {
						loot.push('TR');
						lootMSG.push(
							`**Tyrannical Ring:** ${kc.toLocaleString()} KC <:Tyrannical_ring:406000288290570260>`
						);
					}
					if (!loot.includes('D2H') && roll(256)) {
						loot.push('D2H');
						lootMSG.push(
							`**Dragon 2h Sword:** ${kc.toLocaleString()} KC <:Dragon_2h_sword:405250171593818112>`
						);
					}
					if (!loot.includes('DP') && roll(171)) {
						loot.push('DP');
						lootMSG.push(
							`**Dragon Pickaxe:** ${kc.toLocaleString()} KC <:Dragon_pickaxe:406000287841779716>`
						);
					}
				}
				return msg.send(`
It took you **${kc.toLocaleString()}** kills to finish Callisto <:Callisto_cub:324127376273440768>

${lootMSG.join('\n')}`);
			}
			case 'CRAZYARCHAEOLOGIST':
			case 'CRAZYARCH': {
				const lootMSG = [];
				while (loot.length !== 3) {
					kc++;
					if (roll(128)) {
						const randomRoll = Math.floor(Math.random() * 3) + 1;
						if (!loot.includes('FD') && randomRoll === 1) {
							loot.push('FD');
							lootMSG.push(
								`**Fedora:** ${kc.toLocaleString()} KC <:Fedora:456179157303427092>`
							);
						}
						if (!loot.includes('OS2') && randomRoll === 2) {
							loot.push('OS2');
							lootMSG.push(
								`**Odium Shard 2:** ${kc.toLocaleString()} KC <:Odium_shard_2:456179354339377182>`
							);
						}
						if (!loot.includes('MS2') && randomRoll === 3) {
							loot.push('MS2');
							lootMSG.push(
								`**Malediction Shard 2:** ${kc.toLocaleString()} KC <:Malediction_shard_2:456180315002765348>`
							);
						}
					}
				}
				return msg.send(`
It took you **${kc.toLocaleString()}** kills to finish Crazy Archaeologist <:Crazy_archaeologist:456180487287996419>

${lootMSG.join('\n')}`);
			}
			case 'SCORPIA': {
				const lootMSG = [];
				while (loot.length !== 3) {
					kc++;
					if (!loot.includes('PET') && roll(2000)) {
						loot.push('PET');
						lootMSG.push(
							`**Scorpia's Offspring:** ${kc.toLocaleString()} KC <:Scorpias_offspring:324127378773377024>`
						);
					}
					if (roll(128)) {
						const randomRoll = Math.floor(Math.random() * 2) + 1;
						if (!loot.includes('OS3') && randomRoll === 1) {
							loot.push('OS3');
							lootMSG.push(
								`**Odium Shard 3:** ${kc.toLocaleString()} KC <:Odium_shard_3:417705570921873419>`
							);
						}
						if (!loot.includes('MS3') && randomRoll === 2) {
							loot.push('MS3');
							lootMSG.push(
								`**Malediction Shard 3:** ${kc.toLocaleString()} KC <:Malediction_shard_3:417705571173531658>`
							);
						}
					}
				}
				return msg.send(`
It took you **${kc.toLocaleString()}** kills to finish Scorpia <:Scorpias_offspring:324127378773377024>

${lootMSG.join('\n')}`);
			}
			case 'CHAOSFANATIC': {
				const lootMSG = [];
				while (loot.length !== 3) {
					kc++;
					if (!loot.includes('PET') && roll(1000)) {
						loot.push('PET');
						lootMSG.push(
							`**Pet Chaos Elemental:** ${kc.toLocaleString()} KC <:Pet_chaos_elemental:324127377070227456>`
						);
					}
					if (roll(128)) {
						const randomRoll = Math.floor(Math.random() * 2) + 1;
						if (!loot.includes('OS1') && randomRoll === 1) {
							loot.push('OS1');
							lootMSG.push(
								`**Odium Shard 1:** ${kc.toLocaleString()} KC <:Odium_shard_1:506330718616551424>`
							);
						}
						if (!loot.includes('MS1') && randomRoll === 2) {
							loot.push('MS1');
							lootMSG.push(
								`**Malediction Shard 1:** ${kc.toLocaleString()} KC <:Malediction_shard_1:456180792851300352>`
							);
						}
					}
				}
				return msg.send(`
It took you **${kc.toLocaleString()}** kills to finish Chaos Fanatic <:Pet_chaos_elemental:324127377070227456>

${lootMSG.join('\n')}`);
			}
			case 'GROTESQUEGUARDIANS':
			case 'GGS':
			case 'DUSK':
			case 'DAWN': {
				const lootMSG = [];
				let gd = 0;
				while (loot.length !== 6) {
					kc++;
					gd += Math.floor((Math.random() + 1) * 50);
					if (!loot.includes('JS') && roll(5000)) {
						loot.push('JS');
						lootMSG.push(
							`**Jar of stone:** ${kc.toLocaleString()} KC <:Jar_of_stone:409989715928809473>`
						);
					}
					if (!loot.includes('PET') && roll(3000)) {
						loot.push('PET');
						lootMSG.push(
							`**Noon/Midnight:** ${kc.toLocaleString()} KC <:Noon:379595337234382848>`
						);
					}
					if (!loot.includes('BTC') && roll(1000)) {
						loot.push('BTC');
						lootMSG.push(
							`**Black Tourmaline Core:** ${kc.toLocaleString()} KC <:Black_tourmaline_core:409989716063289354>`
						);
					}
					if (!loot.includes('GH') && roll(750)) {
						loot.push('GH');
						lootMSG.push(
							`**Granite Hammer:** ${kc.toLocaleString()} KC <:Granite_hammer:409989716134592532>`
						);
					}
					if (roll(250)) {
						const randomRoll = Math.floor(Math.random() * 2) + 1;
						if (!loot.includes('GR') && randomRoll === 1) {
							loot.push('GR');
							lootMSG.push(
								`**Granite Ring:** ${kc.toLocaleString()} KC <:Granite_ring:409989716151369729>`
							);
						}
						if (!loot.includes('GG') && randomRoll === 2) {
							loot.push('GG');
							lootMSG.push(
								`**Granite Gloves:** ${kc.toLocaleString()} KC <:Granite_gloves:409989716134592512>`
							);
						}
					}
				}
				return msg.send(`
It took you **${kc.toLocaleString()}** kills to finish the Grotesque Guardians <:Noon:379595337234382848>

${lootMSG.join('\n')}

You also received **${gd.toLocaleString()}** Granite Dust!`);
			}
			case 'ABYSSALSIRE':
			case 'ABBYSIRE':
			case 'SIRE': {
				let uns = 0;
				// Bludgeon Piece Count (0-2)
				let bpc = 0;
				const lootMSG = [];
				while (loot.length !== 8) {
					kc++;
					if (roll(100)) {
						uns++;
						const randomRoll = Math.floor(Math.random() * 128) + 1;
						if (randomRoll >= 1 && randomRoll <= 5) {
							if (!loot.includes('PET')) {
								loot.push('PET');
								lootMSG.push(
									`**Abyssal orphan:** ${kc.toLocaleString()} KC <:Abyssal_orphan:324127375774449664>`
								);
							}
						}
						if (randomRoll >= 6 && randomRoll <= 15) {
							if (!loot.includes('AH')) {
								loot.push('AH');
								lootMSG.push(
									`**Abyssal head:** ${kc.toLocaleString()} KC <:Abyssal_head:412841187041345538>`
								);
							}
						}
						if (randomRoll >= 16 && randomRoll <= 27) {
							if (!loot.includes('AW')) {
								loot.push('AW');
								lootMSG.push(
									`**Abyssal whip:** ${kc.toLocaleString()} KC <:Abyssal_whip:403386370686582804>`
								);
							}
						}
						if (randomRoll >= 28 && randomRoll <= 40) {
							if (!loot.includes('JM')) {
								loot.push('JM');
								lootMSG.push(
									`**Jar of miasma:** ${kc.toLocaleString()} KC <:Jar_of_miasma:412841187331014657>`
								);
							}
						}
						if (randomRoll >= 41 && randomRoll <= 66) {
							if (!loot.includes('AD')) {
								loot.push('AD');
								lootMSG.push(
									`**Abyssal Dagger:** ${kc.toLocaleString()} KC <:Abyssal_dagger:403386370388918273>`
								);
							}
						}
						if (randomRoll >= 67 && randomRoll <= 128) {
							if (bpc === 2) {
								bpc = 0;
								if (!loot.includes('BC')) {
									loot.push('BC');
									lootMSG.push(
										`**Bludgeon Claw:** ${kc.toLocaleString()} KC <:Bludgeon_claw:412841187184214027>`
									);
								}
								if (!loot.includes('BS')) {
									loot.push('BS');
									lootMSG.push(
										`**Bludgeon Spine:** ${kc.toLocaleString()} KC <:Bludgeon_spine:412841187284877312>`
									);
								}
								if (!loot.includes('BA')) {
									loot.push('BA');
									lootMSG.push(
										`**Bludgeon Axon:** ${kc.toLocaleString()} KC <:Bludgeon_axon:412841187259711488>`
									);
								}
							}
							if (bpc === 1) {
								bpc++;
								let force = false;
								if (loot.includes('BC')) {
									const bludgRoll = Math.floor(Math.random() * 2) + 1;
									if (bludgRoll === 1) {
										loot.push('BA');
										lootMSG.push(
											`**Bludgeon Axon:** ${kc.toLocaleString()} KC <:Bludgeon_axon:412841187259711488>`
										);
										force = true;
									}
									if (bludgRoll === 2) {
										loot.push('BS');
										lootMSG.push(
											`**Bludgeon Spine:** ${kc.toLocaleString()} KC <:Bludgeon_spine:412841187284877312>`
										);
										force = true;
									}
								}
								if (loot.includes('BS') && !force) {
									const bludgRoll = Math.floor(Math.random() * 2) + 1;
									if (bludgRoll === 1) {
										loot.push('BA');
										lootMSG.push(
											`**Bludgeon Axon:** ${kc.toLocaleString()} KC <:Bludgeon_axon:412841187259711488>`
										);
										force = true;
									}
									if (bludgRoll === 2) {
										loot.push('BC');
										lootMSG.push(
											`**Bludgeon Claw:** ${kc.toLocaleString()} KC <:Bludgeon_claw:412841187184214027>`
										);
										force = true;
									}
								}
								if (loot.includes('BA') && !force) {
									const bludgRoll = Math.floor(Math.random() * 2) + 1;
									if (bludgRoll === 1) {
										loot.push('BS');
										lootMSG.push(
											`**Bludgeon Spine:** ${kc.toLocaleString()} KC <:Bludgeon_spine:412841187284877312>`
										);
									}
									if (bludgRoll === 2) {
										loot.push('BC');
										lootMSG.push(
											`**Bludgeon Claw:** ${kc.toLocaleString()} KC <:Bludgeon_claw:412841187184214027>`
										);
									}
								}
							}
							if (
								bpc === 0 &&
								!loot.includes('BC') &&
								!loot.includes('BA') &&
								!loot.includes('BS')
							) {
								const bludgRoll = Math.floor(Math.random() * 3) + 1;
								bpc++;
								if (bludgRoll === 1) {
									loot.push('BC');
									lootMSG.push(
										`**Bludgeon Claw:** ${kc.toLocaleString()} KC <:Bludgeon_claw:412841187184214027>`
									);
								}
								if (bludgRoll === 2) {
									loot.push('BS');
									lootMSG.push(
										`**Bludgeon Spine:** ${kc.toLocaleString()} KC <:Bludgeon_spine:412841187284877312>`
									);
								}
								if (bludgRoll === 3) {
									loot.push('BA');
									lootMSG.push(
										`**Bludgeon Axon:** ${kc.toLocaleString()} KC <:Bludgeon_axon:412841187259711488>`
									);
								}
							}
						}
					}
				}
				return msg.send(`
It took you **${kc.toLocaleString()}** kills to finish Abyssal Sire <:Abyssal_orphan:324127375774449664>

${lootMSG.join('\n')}

You also received **${uns.toLocaleString()}** Unsireds!`);
			}
			case 'KRAKEN': {
				const lootMSG = [];
				while (loot.length !== 4) {
					kc++;
					if (!loot.includes('JD') && roll(1000)) {
						loot.push('JD');
						lootMSG.push(
							`**Jar of dirt:** ${kc.toLocaleString()} KC <:Jar_of_dirt:421042619473199106>`
						);
					}
					if (!loot.includes('PET') && roll(3000)) {
						loot.push('PET');
						lootMSG.push(
							`**Pet Kraken:** ${kc.toLocaleString()} KC <:Pet_kraken:324127377477206016>`
						);
					}
					if (!loot.includes('KT') && roll(300)) {
						loot.push('KT');
						lootMSG.push(
							`**Kraken Tentacle:** ${kc.toLocaleString()} KC <:Kraken_tentacle:421042619859337216>`
						);
					}
					if (!loot.includes('TOTS') && roll(512)) {
						loot.push('TOTS');
						lootMSG.push(
							`**Trident of the Seas:** ${kc.toLocaleString()} KC <:Trident_of_the_seas:421042619913863198>`
						);
					}
				}
				return msg.send(`
It took you **${kc.toLocaleString()}** kills to finish Kraken <:Pet_kraken:324127377477206016>

${lootMSG.join('\n')}`);
			}
			case 'CERBERUS':
			case 'CERB': {
				const lootMSG = [];
				while (loot.length !== 6) {
					kc++;
					if (!loot.includes('JS') && roll(2000)) {
						loot.push('JS');
						lootMSG.push(
							`**Jar of souls:** ${kc.toLocaleString()} KC <:Jar_of_souls:403383744771391490>`
						);
					}
					if (!loot.includes('PET') && roll(3000)) {
						loot.push('PET');
						lootMSG.push(
							`**Hellpuppy:** ${kc.toLocaleString()} KC <:Hellpuppy:324127376185491458>`
						);
					}
					if (roll(128)) {
						const randomRoll = Math.floor(Math.random() * 4) + 1;
						if (!loot.includes('PRIMC') && randomRoll === 1) {
							loot.push('PRIMC');
							lootMSG.push(
								`**Primordial Crystal:** ${kc.toLocaleString()} KC <:Primordial_crystal:403380366888665088>`
							);
						}
						if (!loot.includes('PEGC') && randomRoll === 2) {
							loot.push('PEGC');
							lootMSG.push(
								`**Pegasian Crystal:** ${kc.toLocaleString()} KC <:Pegasian_crystal:403380366611578891>`
							);
						}
						if (!loot.includes('EC') && randomRoll === 3) {
							loot.push('EC');
							lootMSG.push(
								`**Eternal Crystal** ${kc.toLocaleString()} KC <:Eternal_crystal:403380366808973312>`
							);
						}
						if (!loot.includes('SS') && randomRoll === 4) {
							loot.push('SS');
							lootMSG.push(
								`**Smouldering Stone:** ${kc.toLocaleString()} KC <:Smouldering_stone:403380366657978400>`
							);
						}
					}
				}
				return msg.send(`
It took you **${kc.toLocaleString()}** kills to finish Cerberus <:Hellpuppy:324127376185491458>

${lootMSG.join('\n')}`);
			}
			case 'THERMY':
			case 'THERMONUCLEARSMOKEDEVIL': {
				const lootMSG = [];
				while (loot.length !== 4) {
					kc++;
					if (!loot.includes('SB') && roll(512)) {
						loot.push('SB');
						lootMSG.push(
							`**Smoke Battlestaff:** ${kc.toLocaleString()} KC <:Smoke_battlestaff:412845709575061506>`
						);
					}
					if (!loot.includes('PET') && roll(3000)) {
						loot.push('PET');
						lootMSG.push(
							`**Pet Smoke Devil:** ${kc.toLocaleString()} KC <:Pet_smoke_devil:324127377493852162>`
						);
					}
					if (!loot.includes('ON') && roll(350)) {
						loot.push('ON');
						lootMSG.push(
							`**Occult Necklace:** ${kc.toLocaleString()} KC <:Occult_necklace:412845632089358336>`
						);
					}
					if (!loot.includes('DC') && roll(2000)) {
						loot.push('DC');
						lootMSG.push(
							`**Dragon Chainbody:** ${kc.toLocaleString()} KC <:Dragon_chainbody:405250171719647232>`
						);
					}
				}
				return msg.send(`
It took you **${kc.toLocaleString()}** kills to finish Thermonuclear Smoke Devil <:Pet_smoke_devil:324127377493852162>

${lootMSG.join('\n')}`);
			}
			case 'BARROWS': {
				while (loot.length < 24) {
					kc++;
					if (roll(17)) {
						const drop =
							BARROWS_ITEMS[Math.floor(Math.random() * BARROWS_ITEMS.length)];
						if (loot.includes(drop)) {
							continue;
						}
						loot.push(drop);
					}
				}
				return msg.send(
					`It took you ${kc.toLocaleString()} Barrows Chests to get all the Barrows Pieces. You also got ${duplicates} duplicate items.`
				);
			}
			case 'ALCHEMICALHYDRA':
			case 'ALCHEMICALHYDRAS':
			case 'AHYDRA':
			case 'AHYDRAS':
			case 'HYDRAS':
			case 'HYDRA':
			case 'HYDRABOSS': {
				const [kc, lootMSG, emote] = alchemicalHydra.finish();
				return msg.send(`
It took you **${kc}** kills to finish Alchemical Hydra ${emote}

${lootMSG}`);
			}
			case 'HESPORIS':
			case 'HESPORI': {
				const [kc, lootMSG] = hespori.finish();
				return msg.send(`
It took you **${kc}** kills to finish Hespori!

${lootMSG}`);
			}
			case 'ALLPETS':
			case 'PETS':
			case 'ALLPET': {
				const petsRecieved: string[] = [];
				pets.forEach(pet => {
					let kcpet = 1;
					while (!roll(pet.chance)) {
						kcpet++;
					}
					petsRecieved.push(kcpet.toLocaleString());
				});
				return msg.send(await getAllPetsEmbed(petsRecieved));
			}
			default:
				return msg.send("I don't have that monster!");
		}
	}
}
