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
				const loot = [];
				for (let i = 0; i < quantity; i++) {
					if (this.roll(5000)) loot.push('<:Pet_dark_core:324127377347313674>');
					if (this.roll(585)) {
						const randomRoll = Math.floor(Math.random() * 8);
						if (randomRoll < 1) loot.push('<:Elysian_sigil:399999422295048223>');
						else if (randomRoll < 4) loot.push('<:Spectral_sigil:399999422299373568>');
						else loot.push('<:Arcane_sigil:399999422282596362>');
					}
				}
				return msg.send(loot.length > 0 ? loot.join(' ') : 'You got nothing.');
			}
			case 'RAIDS':
			case 'OLM':
				return msg.send(this.Raids(quantity));
			case 'BARROWS': {
				if (quantity > 300) return msg.send('I can only do a maximum of 300 Barrows Chests at a time!');
				const loot = [];
				for (let i = 0; i < quantity; i++) {
					if (this.roll(17)) loot.push(BARROWS_ITEMS[Math.floor(Math.random() * BARROWS_ITEMS.length)]);
				}
				return msg.send(loot.length > 0 ? loot.join(' ') : 'You got nothing.');
			}
			case 'BANDOS':
				return msg.send(this.Bandos(quantity));
			case 'SARA': {
				if (quantity > 500) return msg.send('I can only do a maximum of 500 Sara kills at a time!');
				const loot = [];
				for (let i = 0; i < quantity; i++) {
					if (this.roll(254)) loot.push('<:Saradomins_light:403052160977338378>');
					if (this.roll(127)) loot.push('<:Saradomin_sword:403052160822280192>');
					if (this.roll(508)) loot.push('<:Armadyl_crossbow:403052160931069952>');
					if (this.roll(508)) loot.push('<:Saradomin_hilt:403051383214833667>');
					if (this.roll(5000)) loot.push('<:Pet_zilyana:324127378248957952>');
					if (this.roll(86)) loot.push(GODSWORD_SHARDS[Math.floor(Math.random() * GODSWORD_SHARDS.length)]);
				}
				return msg.send(loot.length > 0 ? loot.join(' ') : 'You got nothing.');
			}
			case 'ZULRAH': {
				if (quantity > 500) return msg.send('I can only do a maximum of 500 Zulrah kills at a time!');
				const ZULRAH_UNIQUE = [
					'<:Uncut_onyx:403059676402679808>',
					'<:Magic_fang:403059673563004928>',
					'<:Serpentine_visage:403059676016672769>',
					'<:Tanzanite_fang:403059675979055105>'
				];
				const loot = [];
				for (let i = 0; i < quantity; i++) {
					if (this.roll(128)) loot.push(ZULRAH_UNIQUE[Math.floor(Math.random() * ZULRAH_UNIQUE.length)]);
					if (this.roll(5000)) loot.push('<:Pet_snakeling:324127377816944642>');
					if (this.roll(3000)) loot.push('<:Jar_of_swamp:403059673588170776>');
					if (this.roll(3277)) { loot.push(Math.random() < 0.5 ? '<:Magma_mutagen:403059676733898753>' : '<:Tanzanite_mutagen:403059676306079746>'); }
				}
				return msg.send(loot.length > 0 ? loot.join(' ') : 'You got nothing.');
			}
			case 'VORKATH': {
				if (quantity > 500) return msg.send('I can only do a maximum of 500 Vorkath kills at a time!');
				const loot = [];
				for (let i = 0; i < quantity; i++) {
					if (this.roll(1000)) loot.push('<:Dragonbone_necklace:403378090740547595>');
					if (this.roll(3000)) loot.push('<:Jar_of_decay:403378091008851968>');
					if (this.roll(3000)) loot.push('<:Vorki:400713309252222977>');
					if (this.roll(5000)) loot.push('<:Draconic_visage:403378090979491840>');
					if (this.roll(5000)) loot.push('<:Skeletal_visage:403378091071766539>');
					if (this.roll(50)) loot.push('<:Vorkaths_head:403378091046469632>');
				}
				return msg.send(loot.length > 0 ? loot.join(' ') : 'You got nothing.');
			}
			case 'CERB':
			case 'CERBERUS': {
				if (quantity > 500) return msg.send('I can only do a maximum of 500 Cerberus kills at a time!');
				const cerb = require('../../resources/monsters/Cerberus.js');
				const loot = cerb.kill(quantity);
				return msg.send(loot.length > 0 ? loot : 'You got nothing.');
			}
			case 'ABYSSALDEMON':
			case 'ABBYDEMON':
			case 'ABBY': {
				if (quantity > 5000) return msg.send('I can only do a maximum of 5000 Abyssal Demon kills at a time!');
				const loot = [];
				for (let i = 0; i < quantity; i++) {
					if (this.roll(6000)) loot.push('<:Abyssal_demon_head:403386370707423232>');
					if (this.roll(512)) loot.push('<:Abyssal_whip:403386370686582804>');
					if (this.roll(32768)) loot.push('<:Abyssal_dagger:403386370388918273>');
					if (this.roll(1200)) loot.push('<:Clue_scroll:365003979840552960>');
				}
				return msg.send(loot.length > 0 ? loot.join(' ') : 'You got nothing.');
			}
			case 'DEMONICGORILLA':
			case 'DEMONICGORILLAS': {
				if (quantity > 500) return msg.send("I can only kill 500 Demonic Gorilla's at a time!");
				const loot = [];
				for (let i = 0; i < quantity; i++) {
					if (this.roll(300)) loot.push('<:Zenyte_shard:405245077972320256>');
					if (this.roll(500)) loot.push('<:Ballista_limbs:405245077280129025>');
					if (this.roll(500)) loot.push('<:Ballista_spring:405245077590507531>');
					if (this.roll(750)) loot.push('<:Light_frame:405245077808742400>');
					if (this.roll(1500)) loot.push('<:Heavy_frame:405245077754216448>');
					if (this.roll(1500)) loot.push('<:Monkey_tail:405245077670068225>');
				}
				return msg.send(loot.length > 0 ? loot.join(' ') : 'You got nothing.');
			}
			case 'KQ':
			case 'KALPHITEQUEEN': {
				if (quantity > 500) return msg.send("I can only kill 500 Kalphite Queen's at a time!");
				const loot = [];
				for (let i = 0; i < quantity; i++) {
					if (this.roll(3000)) loot.push('<:Kalphite_princess_2nd_form:324127376915300352>');
					if (this.roll(2000)) loot.push('<:Jar_of_sand:405249792839647232>');
					if (this.roll(128)) loot.push('<:Kq_head:405249792567148545>');
					if (this.roll(100)) loot.push('<:Clue_scroll:365003979840552960>');
					if (this.roll(256)) loot.push('<:Dragon_2h_sword:405250171593818112>');
					if (this.roll(128)) loot.push('<:Dragon_chainbody:405250171719647232>');
				}
				return msg.send(loot.length > 0 ? loot.join(' ') : 'You got nothing.');
			}
			case 'ZAMORAK':
			case 'KRIL':
			case 'ZAMMY': {
				if (quantity > 500) return msg.send("I can only kill 500 K'ril Tsutsaroth's at a time!");
				const loot = [];
				for (let i = 0; i < quantity; i++) {
					if (this.roll(508)) loot.push('<:Staff_of_the_dead:405251862695116801>');
					if (this.roll(406)) loot.push('<:Rune_sword:405251862674014209>');
					if (this.roll(128)) loot.push('<:Zamorakian_spear:405251862883729418>');
					if (this.roll(128)) loot.push('<:Steam_battlestaff:405251862451716097>');
					if (this.roll(508)) loot.push('<:Zamorak_hilt:405251862489595905>');
					if (this.roll(5000)) loot.push('<:Pet_kril_tsutsaroth:324127377527406594>');
					if (this.roll(86)) loot.push(GODSWORD_SHARDS[Math.floor(Math.random() * GODSWORD_SHARDS.length)]);
				}
				return msg.send(loot.length > 0 ? loot.join(' ') : 'You got nothing.');
			}
			case 'KREE':
			case 'ARMA': {
				if (quantity > 500) return msg.send("I can only kill 500 Kree'arra's at a time!");
				const ARMADYL_ARMOR = [
					'<:Armadyl_chainskirt:405262588222636042>',
					'<:Armadyl_helmet:405262588499329024>',
					'<:Armadyl_chestplate:405262588310454292>'
				];
				const loot = [];
				for (let i = 0; i < quantity; i++) {
					if (this.roll(128)) loot.push(ARMADYL_ARMOR[Math.floor(Math.random() * ARMADYL_ARMOR.length)]);
					if (this.roll(508)) loot.push('<:Armadyl_hilt:405262588503523328>');
					if (this.roll(5000)) loot.push('<:Pet_kreearra:324127377305239555>');
					if (this.roll(5000)) loot.push('<:Curved_bone:405264444256681985>');
					if (this.roll(86)) loot.push(GODSWORD_SHARDS[Math.floor(Math.random() * GODSWORD_SHARDS.length)]);
				}
				return msg.send(loot.length > 0 ? loot.join(' ') : 'You got nothing.');
			}
			case 'LIZARDMANSHAMAN':
			case 'LIZARDMAN':
			case 'SHAMANS':
			case 'SHAMAN': {
				if (quantity > 1000) return msg.send("I can only kill 1000 Lizardman Shaman's at a time!");
				const loot = [];
				for (let i = 0; i < quantity; i++) {
					if (this.roll(5000)) loot.push('<:Dragon_warhammer:405998717154623488>');
					if (this.roll(5000)) loot.push('<:Curved_bone:405264444256681985>');
					if (this.roll(400)) loot.push('<:Long_bone:421045456391634945>');
					if (this.roll(250)) loot.push('<:Xerics_talisman_inert:456176488669249539>');
				}
				return msg.send(loot.length > 0 ? loot.join(' ') : 'You got nothing.');
			}
			case 'CALLISTO': {
				if (quantity > 500) return msg.send("I can only kill 500 Callisto's at a time!");
				const loot = [];
				for (let i = 0; i < quantity; i++) {
					if (this.roll(2000)) loot.push('<:Callisto_cub:324127376273440768>');
					if (this.roll(512)) loot.push('<:Tyrannical_ring:406000288290570260>');
					if (this.roll(256)) loot.push('<:Dragon_2h_sword:405250171593818112>');
					if (this.roll(171)) loot.push('<:Dragon_pickaxe:406000287841779716>');
				}
				return msg.send(loot.length > 0 ? loot.join(' ') : 'You got nothing.');
			}
			case 'VETION': {
				if (quantity > 500) return msg.send("I can only kill 500 Vet'ions at a time!");
				const loot = [];
				for (let i = 0; i < quantity; i++) {
					if (this.roll(5000)) loot.push('<:Skeleton_champion_scroll:406002360742182913>');
					if (this.roll(5000)) loot.push('<:Curved_bone:405264444256681985>');
					if (this.roll(2000)) loot.push('<:Vetion_jr:324127378999738369>');
					if (this.roll(512)) loot.push('<:Ring_of_the_gods:406002360947703808>');
					if (this.roll(256)) loot.push('<:Dragon_2h_sword:405250171593818112>');
					if (this.roll(171)) loot.push('<:Dragon_pickaxe:406000287841779716>');
				}
				return msg.send(loot.length > 0 ? loot.join(' ') : 'You got nothing.');
			}
			case 'VENENATIS': {
				if (quantity > 500) return msg.send('I can only kill 100 Venenatis at a time!');
				const loot = [];
				for (let i = 0; i < quantity; i++) {
					if (this.roll(5000)) loot.push('<:Curved_bone:405264444256681985>');
					if (this.roll(2000)) loot.push('<:Venenatis_spiderling:324127379092144129>');
					if (this.roll(512)) loot.push('<:Treasonous_ring:406008615728578561>');
					if (this.roll(256)) loot.push('<:Dragon_2h_sword:405250171593818112>');
					if (this.roll(171)) loot.push('<:Dragon_pickaxe:406000287841779716>');
				}
				return msg.send(loot.length > 0 ? loot.join(' ') : 'You got nothing.');
			}
			case 'WYVERN':
			case 'WYVERNS': {
				if (quantity > 1000) return msg.send('I can only kill 500 Skeletal Wyverns at a time!');
				const loot = [];
				for (let i = 0; i < quantity; i++) {
					if (this.roll(10000)) loot.push('<:Draconic_visage:403378090979491840>');
					if (this.roll(350)) loot.push('<:Clue_scroll:365003979840552960>');
					if (this.roll(512)) loot.push('<:Dragon_plateskirt:409987345245405205>');
					if (this.roll(512)) loot.push('<:Dragon_platelegs:409987344830169089>');
					if (this.roll(512)) loot.push('<:Granite_legs:409987344704208909>');
				}
				return msg.send(loot.length > 0 ? loot.join(' ') : 'You got nothing.');
			}
			case 'GROTESQUEGUARDIANS':
			case 'GG':
			case 'DUSK':
			case 'DAWN': {
				if (quantity > 500) return msg.send('I can only kill 500 Grotesque Guardians at a time!');
				const loot = [];
				for (let i = 0; i < quantity; i++) {
					if (this.roll(5000)) loot.push('<:Jar_of_stone:409989715928809473>');
					if (this.roll(3000)) loot.push('<:Noon:379595337234382848>');
					if (this.roll(1000)) loot.push('<:Black_tourmaline_core:409989716063289354>');
					if (this.roll(230)) loot.push('<:Clue_scroll:365003979840552960>');
					if (this.roll(500)) loot.push('<:Granite_gloves:409989716134592512>');
					if (this.roll(500)) loot.push('<:Granite_hammer:409989716134592532>');
					if (this.roll(750)) loot.push('<:Granite_ring:409989716151369729>');
				}
				return msg.send(loot.length > 0 ? loot.join(' ') : 'You got nothing.');
			}
			case 'KBD':
			case 'KINGBLACKDRAGON': {
				if (quantity > 500) return msg.send('I can only kill 100 King Black Dragons at a time!');
				const loot = [];
				for (let i = 0; i < quantity; i++) {
					if (this.roll(1500)) loot.push('<:Dragon_pickaxe:406000287841779716>');
					if (this.roll(128)) loot.push('<:Dragon_med_helm:409997161145565185>');
					if (this.roll(128)) loot.push('<:Kbd_heads:409997161393160192>');
					if (this.roll(450)) loot.push('<:Clue_scroll:365003979840552960>');
					if (this.roll(3000)) loot.push('<:Prince_black_dragon:324127378538364928>');
					if (this.roll(5000)) loot.push('<:Draconic_visage:403378090979491840>');
				}
				return msg.send(loot.length > 0 ? loot.join(' ') : 'You got nothing.');
			}
			case 'SIRE':
			case 'ABYSSALSIRE': {
				if (quantity > 500) return msg.send('I can only kill 500 Abyssal Sires at a time!');
				const SIRE_ITEMS = ['<:Bludgeon_claw:412841187184214027>', '<:Bludgeon_spine:412841187284877312>', '<:Bludgeon_axon:412841187259711488>'];
				const loot = [];
				let sired = 0;
				for (let i = 0; i < quantity; i++) {
					if (this.roll(100)) sired++;
				}
				for (let i = 0; i < sired; i++) {
					const sire_roll = this.randInt(128);
					switch (true) {
						case sire_roll <= 10:
							loot.push('<:Abyssal_head:412841187041345538>');
							break;
						case sire_roll <= 15:
							loot.push('<:Abyssal_orphan:324127375774449664>');
							break;
						case sire_roll <= 41:
							loot.push('<:Abyssal_dagger:403386370388918273>');
							break;
						case sire_roll <= 53:
							loot.push('<:Abyssal_whip:403386370686582804>');
							break;
						case sire_roll <= 115:
							loot.push(SIRE_ITEMS[Math.floor(Math.random() * SIRE_ITEMS.length)]);
							break;
						case sire_roll <= 128:
							loot.push('<:Jar_of_miasma:412841187331014657>');
							break;
					}
				}
				return msg.send(loot.length > 0 ? loot.join(' ') : 'You got nothing.');
			}
			case 'THERMY': {
				if (quantity > 500) return msg.send("I can only kill 500 Thermonuclear smoke devil's at a time!");
				const loot = [];
				for (let i = 0; i < quantity; i++) {
					if (this.roll(3000)) loot.push('<:Pet_smoke_devil:324127377493852162>');
					if (this.roll(500)) loot.push('<:Clue_scroll:365003979840552960>');
					if (this.roll(128)) loot.push('<:Crystal_key:412845362261524480>');
					if (this.roll(2000)) loot.push('<:Dragon_chainbody:405250171719647232>');
					if (this.roll(350)) loot.push('<:Occult_necklace:412845632089358336>');
					if (this.roll(512)) loot.push('<:Smoke_battlestaff:412845709575061506>');
					if (this.roll(129)) loot.push('<:Ancient_staff:412845709453426689>');
				}
				return msg.send(loot.length > 0 ? loot.join(' ') : 'You got nothing.');
			}
			case 'GIANTMOLE':
			case 'MOLE': {
				if (quantity > 5000) return msg.send("I can only kill 5000 Giant Mole's at a time!");
				const loot = [];
				for (let i = 0; i < quantity; i++) {
					if (this.roll(3000)) loot.push('<:Baby_mole:324127375858204672>');
					if (this.roll(5000)) loot.push('<:Curved_bone:405264444256681985>');
				}
				return msg.send(loot.length > 0 ? loot.join(' ') : 'You got nothing.');
			}
			case 'SKOTIZO': {
				if (quantity > 500) return msg.send('I can only kill 100 Skotizo at a time!');
				const loot = [];
				for (let i = 0; i < quantity; i++) {
					if (this.roll(1000)) loot.push('<:Uncut_onyx:403059676402679808>');
					if (this.roll(65)) loot.push('<:Skotos:324127378890817546>');
					if (this.roll(100)) loot.push('<:Shield_left_half:417703739349139466>');
					if (this.roll(25)) loot.push('<:Dark_claw:417703739218984960> ');
					if (this.roll(2500)) loot.push('<:Jar_of_darkness:417703738858536972>');
				}
				return msg.send(loot.length > 0 ? loot.join(' ') : 'You got nothing.');
			}
			case 'SCORPIA': {
				if (quantity > 500) return msg.send('I can only kill 100 Scorpia at a time!');
				const loot = [];
				for (let i = 0; i < quantity; i++) {
					if (this.roll(2000)) loot.push('<:Scorpias_offspring:324127378773377024>');
					if (this.roll(256)) loot.push('<:Odium_shard_3:417705570921873419>');
					if (this.roll(256)) loot.push('<:Malediction_shard_3:417705571173531658>');
				}
				return msg.send(loot.length > 0 ? loot.join(' ') : 'You got nothing.');
			}
			case 'CHAOSELE':
			case 'CHAOSELEMENTAL': {
				if (quantity > 500) return msg.send('I can only kill 500 Chaos Elementals at a time!');
				const loot = [];
				for (let i = 0; i < quantity; i++) {
					if (this.roll(128)) loot.push('<:Dragon_2h_sword:405250171593818112>');
					if (this.roll(256)) loot.push('<:Dragon_pickaxe:406000287841779716>');
					if (this.roll(200)) loot.push('<:Clue_scroll:365003979840552960>');
					if (this.roll(300)) loot.push('<:Pet_chaos_elemental:324127377070227456>');
				}
				return msg.send(loot.length > 0 ? loot.join(' ') : 'You got nothing.');
			}
			case 'WINTERTODT':
			case 'TODT': {
				if (quantity > 500) return msg.send("I can only kill 500 Wintertodt's at a time!");
				const loot = [];
				for (let i = 0; i < quantity; i++) {
					if (this.roll(5000)) {
						loot.push('<:Phoenix:324127378223792129>');
						continue;
					}
					if (this.roll(10000)) {
						loot.push('<:Dragon_axe:405265921309933588>');
						continue;
					}
					if (this.roll(1000)) {
						loot.push('<:Tome_of_fire_empty:405265922287468544>');
						continue;
					}
					if (this.roll(150)) {
						loot.push('<:Pyromancer_garb:405265922199257088>');
						continue;
					}
					if (this.roll(150)) {
						loot.push('<:Pyromancer_hood:405265921872232448>');
						continue;
					}
					if (this.roll(150)) {
						loot.push('<:Pyromancer_boots:405265921603534848>');
						continue;
					}
					if (this.roll(150)) {
						loot.push('<:Pyromancer_robe:405265921553334283>');
						continue;
					}
					if (this.roll(150)) {
						loot.push('<:Warm_gloves:405265922396258334>');
						continue;
					}
					if (this.roll(150)) {
						loot.push('<:Bruma_torch:421038270823006218>');
						continue;
					}
				}
				return msg.send(loot.length > 0 ? loot.join(' ') : 'You got nothing.');
			}
			case 'KRAKEN': {
				if (quantity > 500) return msg.send("I can only kill 500 Kraken's at a time!");
				const loot = [];
				for (let i = 0; i < quantity; i++) {
					if (this.roll(3000)) {
						loot.push('<:Pet_kraken:324127377477206016>');
						continue;
					}
					if (this.roll(512)) {
						loot.push('<:Trident_of_the_seas:421042619913863198>');
						continue;
					}
					if (this.roll(1000)) {
						loot.push('<:Jar_of_dirt:421042619473199106>');
						continue;
					}
					if (this.roll(128)) {
						loot.push('<:Magic_seed_5:421042620022915084>');
						continue;
					}
					if (this.roll(128)) {
						loot.push('<:Dragonstone_ring:421042619754217472>');
						continue;
					}
					if (this.roll(300)) {
						loot.push('<:Kraken_tentacle:421042619859337216>');
						continue;
					}
					if (this.roll(500)) {
						loot.push('<:Clue_scroll:365003979840552960>');
						continue;
					}
				}
				return msg.send(loot.length > 0 ? loot.join(' ') : 'You got nothing.');
			}
			case 'OBOR': {
				if (quantity > 500) return msg.send("I can only kill 500 Obor's at a time!");
				const loot = [];
				for (let i = 0; i < quantity; i++) {
					if (this.roll(118)) loot.push('<:Hill_giant_club:421045456194240523>');
					if (this.roll(400)) loot.push('<:Long_bone:421045456391634945>');
					if (this.roll(5000)) loot.push('<:Curved_bone:421045456387309568>');
					if (this.roll(5000)) loot.push('<:Hill_giant_club:421045456194240523>');
				}
				return msg.send(loot.length > 0 ? loot.join(' ') : 'You got nothing.');
			}
			case 'REX': {
				if (quantity > 500) return msg.send("I can only kill 500 Dagannoth Rex's at a time!");
				const loot = [];
				for (let i = 0; i < quantity; i++) {
					if (this.roll(5000)) {
						loot.push('<:Pet_dagannoth_rex:324127377091330049>');
						continue;
					}
					if (this.roll(750)) {
						loot.push('<:Clue_scroll:365003979840552960>');
						continue;
					}
					if (this.roll(128)) {
						loot.push('<:Dragon_axe:405265921309933588>');
						continue;
					}
					if (this.roll(128)) {
						loot.push('<:Warrior_ring:421046902050783263>');
						continue;
					}
					if (this.roll(128)) {
						loot.push('<:Ring_of_life:421046902092595215>');
						continue;
					}
					if (this.roll(128)) {
						loot.push('<:Berserker_ring:421046901773697035>');
						continue;
					}
					if (this.roll(128)) {
						loot.push('<:Air_talisman:421047764248690688>');
						continue;
					}
				}
				return msg.send(loot.length > 0 ? loot.join(' ') : 'You got nothing.');
			}
			default:
				return msg.send("I don't have that boss yet.");
		}
	}

	randInt(max) {
		return Math.floor(Math.random() * max + 1);
	}

	Raids(quantity) {
		if (quantity <= 100) {
			const loot = [];
			for (let i = 0; i < quantity; i++) {
				if (this.roll(25)) {
					if (this.roll(65)) loot.push('<:Olmlet:324127376873357316>');
					const number = (Math.random() * 100).toFixed(2);
					switch (true) {
						case number < 23.81:
							loot.push('<:Dexterous_prayer_scroll:403018312562376725>');
							break;
						case number < 47.61:
							loot.push('<:Arcane_prayer_scroll:403018312906309632>');
							break;
						case number < 53.56:
							loot.push('<:Dragon_sword:403018313078145025>');
							break;
						case number < 59.51:
							loot.push('<:Dragon_harpoon:403018313115893767>');
							break;
						case number < 65.46:
							loot.push('<:Dragon_thrownaxe:403018313187328010>');
							break;
						case number < 70.22:
							loot.push('<:Twisted_buckler:403018312625291265>');
							break;
						case number < 74.98:
							loot.push('<:Dragon_hunter_crossbow:403018313107636224>');
							break;
						case number < 78.55:
							loot.push('<:Dinhs_bulwark:403018312960835595>');
							break;
						case number < 82.12:
							loot.push('<:Ancestral_hat:403018312482684938>');
							break;
						case number < 85.69:
							loot.push('<:Ancestral_robe_top:403018312818229248>');
							break;
						case number < 89.26:
							loot.push('<:Ancestral_robe_bottom:403018312734343168>');
							break;
						case number < 92.83:
							loot.push('<:Dragon_claws:403018313124282368>');
							break;
						case number < 95.21:
							loot.push('<:Elder_maul:403018312247803906>');
							break;
						case number < 97.58:
							loot.push('<:Kodai_insignia:403018312264712193>');
							break;
						case number < 100:
							loot.push('<:Twisted_bow:403018312402862081>');
							break;
						default:
							break;
					}
				}
			}
			return loot.length > 0 ? loot.join(' ') : 'You got nothing.';
		} else {
			if (quantity > 100000) return 'I can only do up to 100,000 Raids!';
			const loot = {
				dexterousPrayerScroll: 0,
				arcanePrayerScroll: 0,
				dragonSword: 0,
				dragonHarpoon: 0,
				dragonThrownaxe: 0,
				twistedBuckler: 0,
				dragonHunterCrossbow: 0,
				dinhsBulwark: 0,
				ancestralHat: 0,
				ancestralRobeTop: 0,
				ancestralRobeBottom: 0,
				dragonClaws: 0,
				elderMaul: 0,
				kodaiInsignia: 0,
				twistedBow: 0,
				olmlet: 0
			};
			const displayLoot = [];
			let totalValue = 0;
			const priceMap = {
				dexterousPrayerScroll: 75000000,
				arcanePrayerScroll: 10000000,
				dragonSword: 500000,
				dragonHarpoon: 5000000,
				dragonThrownaxe: 400000,
				twistedBuckler: 16000000,
				dragonHunterCrossbow: 60000000,
				dinhsBulwark: 12000000,
				ancestralHat: 18000000,
				ancestralRobeTop: 100000000,
				ancestralRobeBottom: 79000000,
				dragonClaws: 73000000,
				elderMaul: 47000000,
				kodaiInsignia: 105000000,
				twistedBow: 1000000000,
				olmlet: 0
			};
			for (let i = 0; i < quantity; i++) {
				if (this.roll(25)) {
					if (this.roll(65)) loot.olmlet++;
					const number = (Math.random() * 100).toFixed(2);
					switch (true) {
						case number < 23.81:
							loot.dexterousPrayerScroll++;
							break;
						case number < 47.61:
							loot.arcanePrayerScroll++;
							break;
						case number < 53.56:
							loot.dragonSword++;
							break;
						case number < 59.51:
							loot.dragonHarpoon++;
							break;
						case number < 65.46:
							loot.dragonThrownaxe++;
							break;
						case number < 70.22:
							loot.twistedBuckler++;
							break;
						case number < 74.98:
							loot.dragonHunterCrossbow++;
							break;
						case number < 78.55:
							loot.dinhsBulwark++;
							break;
						case number < 82.12:
							loot.ancestralHat++;
							break;
						case number < 85.69:
							loot.ancestralRobeTop++;
							break;
						case number < 89.26:
							loot.ancestralRobeBottom++;
							break;
						case number < 92.83:
							loot.dragonClaws++;
							break;
						case number < 95.21:
							loot.elderMaul++;
							break;
						case number < 97.58:
							loot.kodaiInsignia++;
							break;
						case number < 100:
							loot.twistedBow++;
							break;
						default:
							break;
					}
				}
			}
			for (const key in loot) {
				displayLoot.push(`**${raidsItemEmoji[key]}**: ${loot[key].toLocaleString()} `);
				totalValue += priceMap[key] * loot[key];
			}
			displayLoot.push(`\n**Total Value:** ${totalValue.toLocaleString()} GP`);
			displayLoot.push(`**GP/HR (30-Min Solo Raids):** ${(totalValue / (quantity / 2)).toLocaleString()} GP`);
			displayLoot.push(`**Total Hours**: ${(quantity / 2).toLocaleString()}`);
			return displayLoot.join('\n');
		}
	}

	Bandos(quantity) {
		const BANDOS_ARMOR = ['<:Bandos_tassets:403046849465810945>', '<:Bandos_chestplate:403046849440776202>', '<:Bandos_boots:403046849415610368>'];
		if (quantity <= 250) {
			const loot = [];
			for (let i = 0; i < quantity; i++) {
				if (this.roll(128)) loot.push(BANDOS_ARMOR[Math.floor(Math.random() * BANDOS_ARMOR.length)]);
				if (this.roll(508)) loot.push('<:Bandos_hilt:403047909072830464>');
				if (this.roll(5000)) loot.push('<:Pet_general_graardor:324127377376673792>');
				if (this.roll(5000)) loot.push('<:Curved_bone:405264444256681985>');
				if (this.roll(86)) loot.push(GODSWORD_SHARDS[Math.floor(Math.random() * GODSWORD_SHARDS.length)]);
			}
			return loot.length > 0 ? loot.join(' ') : 'You got nothing.';
		} else {
			if (quantity > 100000) return 'I can only do up to 100,000 Bandos Kills!';
			const loot = {
				Bandos_chestplate: 0,
				Bandos_tassets: 0,
				Bandos_boots: 0,
				Godsword_Shard: 0,
				Bandos_hilt: 0,
				Pet_general_graardor: 0,
				Curved_bone: 0
			};
			const displayLoot = [];
			let totalValue = 0;
			const priceMap = {
				Bandos_chestplate: 15000000,
				Bandos_tassets: 26000000,
				Bandos_boots: 200000,
				Godsword_Shard: 150000,
				Bandos_hilt: 8000000,
				Pet_general_graardor: 0,
				Curved_bone: 0
			};

			for (let i = 0; i < quantity; i++) {
				if (this.roll(128)) {
					const ITEM = ['Bandos_tassets', 'Bandos_boots', 'Bandos_chestplate'][Math.floor(Math.random() * 3)];
					loot[ITEM]++;
				}
				if (this.roll(508)) loot.Bandos_hilt++;
				if (this.roll(5000)) loot.Pet_general_graardor++;
				if (this.roll(5000)) loot.Curved_bone++;
				if (this.roll(86)) loot.Godsword_Shard++;
			}

			for (var key in loot) {
				displayLoot.push(`**${key.replace(/_/g, ' ')}**: ${loot[key].toLocaleString()} `);
				totalValue += priceMap[key] * loot[key];
			}

			displayLoot.push(`\n**Total Value:** ${totalValue.toLocaleString()} GP`);
			displayLoot.push(`**GP per Kill:** ${Math.round(totalValue / quantity).toLocaleString()} GP`);
			return displayLoot.join('\n');
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

const GODSWORD_SHARDS = [
	'<:Godsword_shard_3:403049019040858112>',
	'<:Godsword_shard_2:403049019015954462>',
	'<:Godsword_shard_1:403049018764165121>'
];

const raidsItemEmoji = {
	dexterousPrayerScroll: '<:Dexterous_prayer_scroll:403018312562376725>',
	arcanePrayerScroll: '<:Arcane_prayer_scroll:403018312906309632>',
	dragonSword: '<:Dragon_sword:403018313078145025>',
	dragonHarpoon: '<:Dragon_harpoon:403018313115893767>',
	dragonThrownaxe: '<:Dragon_thrownaxe:403018313187328010>',
	twistedBuckler: '<:Twisted_buckler:403018312625291265>',
	dragonHunterCrossbow: '<:Dragon_hunter_crossbow:403018313107636224>',
	dinhsBulwark: '<:Dinhs_bulwark:403018312960835595>',
	ancestralHat: '<:Ancestral_hat:403018312482684938>',
	ancestralRobeTop: '<:Ancestral_robe_top:403018312818229248>',
	ancestralRobeBottom: '<:Ancestral_robe_bottom:403018312734343168>',
	dragonClaws: '<:Dragon_claws:403018313124282368>',
	elderMaul: '<:Elder_maul:403018312247803906>',
	kodaiInsignia: '<:Kodai_insignia:403018312264712193>',
	twistedBow: '<:Twisted_bow:403018312402862081>',
	olmlet: '<:Olmlet:324127376873357316>'
};
