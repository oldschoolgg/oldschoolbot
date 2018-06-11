const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 2,
			description: "Simulates how long it takes you to 'finish' a boss (Get all its drops)",
			usage: '<BossName:str>'
		});
	}

	async run(msg, [BossName]) {
		const loot = [];
		let kc = 0;
		let duplicates = [];

		switch (BossName.replace(/\W/g, '').toUpperCase()) {
			case 'CORP': {
				let elyKC, arcKC, specKC, petKC;
				const lootMSG = [];
				while (loot.length < 4) {
					kc++;
					if (this.roll(5000)) {
						if (!loot.includes('PET')) {
							loot.push('PET');
							petKC = kc;
							lootMSG.push(`**Pet:** ${petKC.toLocaleString()} KC <:Pet_dark_core:324127377347313674>`);
						} else { duplicates.push('<:Pet_dark_core:324127377347313674>'); }
					}
					if (this.roll(585)) {
						const randomRoll = Math.floor(Math.random() * 8);
						if (randomRoll < 1) {
							if (!loot.includes('ELY')) {
								loot.push('ELY');
								elyKC = kc;
								lootMSG.push(`**Elysian Sigil:** ${elyKC.toLocaleString()} KC <:Elysian_sigil:399999422295048223>`);
							} else { duplicates.push('<:Elysian_sigil:399999422295048223>'); }
						} else if (randomRoll < 4) {
							if (!loot.includes('SPEC')) {
								loot.push('SPEC');
								specKC = kc;
								lootMSG.push(`**Spectral Sigil:** ${specKC.toLocaleString()} KC <:Spectral_sigil:399999422299373568>`);
							} else { duplicates.push('<:Spectral_sigil:399999422299373568>'); }
						} else if (!loot.includes('ARC')) {
							loot.push('ARC');
							arcKC = kc;
							lootMSG.push(`**Arcane Sigil:** ${arcKC.toLocaleString()} KC <:Arcane_sigil:399999422282596362>`);
						} else { duplicates.push('<:Arcane_sigil:399999422282596362>'); }
					}
				}
				return msg.send(`
It took you **${kc.toLocaleString()}** kills to finish Corp <:Corporeal_Beast:429333974968434702>

${lootMSG.join('\n')}

**Duplicates:** ${duplicates.length > 0 ? duplicates.slice(0, 10).join(' ') : 'None!'}
  `);
			}
			case 'BARROWS': {
				while (loot.length < 24) {
					kc++;
					if (this.roll(17)) {
						const drop = BARROWS_ITEMS[Math.floor(Math.random() * BARROWS_ITEMS.length)];
						if (loot.includes(drop)) {
							duplicates++;
							continue;
						}
						loot.push(drop);
					}
				}
				return msg.send(
					`It took you ${kc.toLocaleString()} Barrows Chests to get all the Barrows Pieces. You also got ${duplicates} duplicate items.`
				);
			}
			case 'RAIDS':
			case 'OLM':
				const lootTrack = [];
				while (loot.length < 16) {
					kc++;
					if (!this.roll(25)) continue;
					if (!lootTrack.includes('PET') && this.roll(65)) {
						lootTrack.push('PET');
						loot.push(`**Olmlet:** ${kc} KC <:Olmlet:324127376873357316>`);
					} else { duplicates.push('<:Olmlet:324127376873357316>'); }
					const number = (Math.random() * 100).toFixed(2);
					switch (true) {
						case number < 23.81:
							if (!lootTrack.includes('DEX')) {
								loot.push(`**Dexterous Prayer Scroll:** ${kc} KC <:Dexterous_prayer_scroll:403018312562376725>`);
								lootTrack.push('DEX');
							} else { duplicates.push('<:Dexterous_prayer_scroll:403018312562376725>'); }
							break;
						case number < 47.61:
							if (!lootTrack.includes('ARC')) {
								loot.push(`**Arcane Prayer Scroll:** ${kc} KC <:Arcane_prayer_scroll:403018312906309632>`);
								lootTrack.push('ARC');
							} else { duplicates.push('<:Arcane_prayer_scroll:403018312906309632>'); }
							break;
						case number < 53.56:
							if (!lootTrack.includes('DSW')) {
								loot.push(`**Dragon Sword:** ${kc} KC <:Dragon_sword:403018313078145025>`);
								lootTrack.push('DSW');
							} else { duplicates.push('<:Dragon_sword:403018313078145025>'); }
							break;
						case number < 59.51:
							if (!lootTrack.includes('DH')) {
								loot.push(`**Dragon Harpoon:** ${kc} KC <:Dragon_harpoon:403018313115893767>`);
								lootTrack.push('DH');
							} else { duplicates.push('<:Dragon_harpoon:403018313115893767>'); }
							break;
						case number < 65.46:
							if (!lootTrack.includes('DTA')) {
								loot.push(`**Dragon Thrownaxe:** ${kc} KC <:Dragon_thrownaxe:403018313187328010>`);
								lootTrack.push('DTA');
							} else { duplicates.push('<:Dragon_thrownaxe:403018313187328010>'); }
							break;
						case number < 70.22:
							if (!lootTrack.includes('TB')) {
								loot.push(`**Twisted Buckler:** ${kc} KC <:Twisted_buckler:403018312625291265>`);
								lootTrack.push('TB');
							} else { duplicates.push('<:Twisted_buckler:403018312625291265>'); }
							break;
						case number < 74.98:
							if (!lootTrack.includes('DHC')) {
								loot.push(`**Dragon Hunter Crossbow:** ${kc} KC <:Dragon_hunter_crossbow:403018313107636224>`);
								lootTrack.push('DHC');
							} else { duplicates.push('<:Twisted_buckler:403018312625291265>'); }
							break;
						case number < 78.55:
							if (!lootTrack.includes('DB')) {
								loot.push(`**Dinhs Bulwark:** ${kc} KC <:Dinhs_bulwark:403018312960835595>`);
								lootTrack.push('DB');
							} else { duplicates.push('<:Dinhs_bulwark:403018312960835595>'); }
							break;
						case number < 82.12:
							if (!lootTrack.includes('AH')) {
								loot.push(`**Ancestral hat:** ${kc} KC <:Ancestral_hat:403018312482684938>`);
								lootTrack.push('AH');
							} else { duplicates.push('<:Ancestral_hat:403018312482684938>'); }
							break;
						case number < 85.69:
							if (!lootTrack.includes('ART')) {
								loot.push(`**Ancestral robe top:** ${kc} KC <:Ancestral_robe_top:403018312818229248>`);
								lootTrack.push('ART');
							} else { duplicates.push('<:Ancestral_robe_top:403018312818229248>'); }
							break;
						case number < 89.26:
							if (!lootTrack.includes('ARB')) {
								loot.push(`**Ancestral robe bottom:** ${kc} KC <:Ancestral_robe_bottom:403018312734343168>`);
								lootTrack.push('ARB');
							} else { duplicates.push('<:Ancestral_robe_bottom:403018312734343168>'); }
							break;
						case number < 92.83:
							if (!lootTrack.includes('DC')) {
								loot.push(`**Dragon claws:** ${kc} KC <:Dragon_claws:403018313124282368>`);
								lootTrack.push('DC');
							} else { duplicates.push('<:Dragon_claws:403018313124282368>'); }
							break;
						case number < 95.21:
							if (!lootTrack.includes('EM')) {
								loot.push(`**Elder maul:** ${kc} KC <:Elder_maul:403018312247803906>`);
								lootTrack.push('EM');
							} else { duplicates.push('<:Elder_maul:403018312247803906>'); }
							break;
						case number < 97.58:
							if (!lootTrack.includes('KI')) {
								loot.push(`**Kodai insignia:** ${kc} KC <:Kodai_insignia:403018312264712193>`);
								lootTrack.push('KI');
							} else { duplicates.push('<:Kodai_insignia:403018312264712193>'); }
							break;
						case number < 100:
							if (!lootTrack.includes('TBO')) {
								loot.push(`**Twisted bow:** ${kc} KC <:Twisted_bow:403018312402862081>`);
								lootTrack.push('TBO');
							} else { duplicates.push('<:Twisted_bow:403018312402862081>'); }
							break;
						default:
							break;
					}
				}
				return msg.send(loot.join('\n'));
			case 'BANDOS': {
				const lootMSG = [];
				while (loot.length !== 8) {
					kc++;
					if (!loot.includes('PET') && this.roll(5000)) {
						loot.push('PET');
						lootMSG.push(`**Bandos Pet:** ${kc.toLocaleString()} KC <:Pet_general_graardor:324127377376673792>`);
					}
					if (this.roll(128)) {
						const randomRoll = Math.floor(Math.random() * 3) + 1;
						if (!loot.includes('TAS') && randomRoll === 1) {
							loot.push('TAS');
							lootMSG.push(`**Bandos Tassets:** ${kc.toLocaleString()} KC <:Bandos_tassets:403046849465810945>`);
						}
						if (!loot.includes('BCP') && randomRoll === 2) {
							loot.push('BCP');
							lootMSG.push(`**Bandos Chestplate:** ${kc.toLocaleString()} KC <:Bandos_chestplate:403046849440776202>`);
						}
						if (!loot.includes('BB') && randomRoll === 3) {
							loot.push('BB');
							lootMSG.push(`**Bandos Boots:** ${kc.toLocaleString()} KC <:Bandos_boots:403046849415610368>`);
						}
					}
					if (!loot.includes('BH') && this.roll(508)) {
						loot.push('BH');
						lootMSG.push(`**Bandos Hilt:** ${kc.toLocaleString()} KC <:Bandos_hilt:403047909072830464>`);
					}
					if (this.roll(86)) {
						const randomRoll = Math.floor(Math.random() * 3) + 1;
						if (!loot.includes('GS1') && randomRoll === 1) {
							loot.push('GS1');
							lootMSG.push(`**Godsword Shard 1:** ${kc.toLocaleString()} KC <:Godsword_shard_1:403049018764165121>`);
						}
						if (!loot.includes('GS2') && randomRoll === 2) {
							loot.push('GS2');
							lootMSG.push(`**Godsword Shard 2:** ${kc.toLocaleString()} KC <:Godsword_shard_2:403049019015954462>`);
						}
						if (!loot.includes('GS3') && randomRoll === 3) {
							loot.push('GS3');
							lootMSG.push(`**Godsword Shard 3:** ${kc.toLocaleString()} KC <:Godsword_shard_3:403049019040858112>`);
						}
					}
				}
				return msg.send(`
It took you **${kc.toLocaleString()}** kills to finish Bandos <:General_Graardor:437553427468255234>

${lootMSG.join('\n')}
    `);
			}
			default:
				return msg.send("I don't have that boss yet.");
		}
	}

};

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
