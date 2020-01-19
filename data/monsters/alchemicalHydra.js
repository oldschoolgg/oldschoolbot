const alchemicalHydra = {
	drops: {
		pet: '<:Ikkle_hydra:534941897228156948>',
		jar: '<:Jar_of_chemicals:545975448547622912>',
		hydraClaw: '<:Hydras_claw:545975448178262057>',
		hydraLeather: '<:Hydra_leather:545975447973003267>',
		hydraTail: '<:Hydratail:545976358506070016>',
		hydraHeads: '<:Alchemical_hydra_heads:545975448153227267>',
		ringPieces: [
			'<:Hydras_eye:545975448358748211>',
			'<:Hydras_fang:545975448580915210>',
			'<:Hydras_heart:545975448493096960>'
		],
		dragonWeaponry: [
			'<:Dragon_knife:545975448446828584>',
			'<:Dragon_thrownaxe:403018313187328010>'
		]
	},
	nameMap: {
		hydraHeads: 'Alchemical hydra heads',
		hydraLeather: 'Hydra leather',
		hydraTail: 'Hydra tail',
		ring: 'Brimstone Ring',
		hydraClaw: 'Hydras Claw',
		dragonK: 'Dragon knives',
		dragonTA: 'Dragon Thrownaxes',
		jar: 'Jar of chemicals',
		pet: 'Ikkle hydra'
	},
	// prices as of 2/13/2018
	priceMap: {
		hydraHeads: 0,
		hydraLeather: 7070000,
		hydraTail: 432220,
		ring: 6150000,
		hydraClaw: 78500000,
		dragonK: 2050,
		dragonTA: 370,
		jar: 300000,
		pet: 0
	},
	kill(quantity) {
		if (quantity <= 500) {
			return this.smallKill(quantity);
		} else {
			return this.bigKill(quantity);
		}
	},
	smallKill(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(3000)) loot.push(this.drops.pet);
			if (this.roll(2000)) loot.push(this.drops.jar);
			if (this.roll(1000)) loot.push(this.drops.hydraClaw);
			if (this.roll(512)) loot.push(this.drops.hydraLeather);
			if (this.roll(512)) loot.push(this.drops.hydraTail);
			if (this.roll(256)) loot.push(this.drops.hydraHeads);
			if (this.roll(180))
				loot.push(
					this.drops.ringPieces[Math.floor(Math.random() * this.drops.ringPieces.length)]
				);
			if (this.roll(2000))
				loot.push(
					this.drops.dragonWeaponry[
						Math.floor(Math.random() * this.drops.dragonWeaponry.length)
					]
				);
		}
		return loot.join(' ');
	},
	bigKill(quantity) {
		const loot = {
			hydraHeads: 0,
			hydraLeather: 0,
			hydraTail: 0,
			ring: 0,
			hydraClaw: 0,
			dragonK: 0,
			dragonTA: 0,
			jar: 0,
			pet: 0
		};
		const displayLoot = [];
		let totalValue = 0;

		for (let i = 0; i < quantity; i++) {
			if (this.roll(3000)) loot.pet++;
			if (this.roll(2000)) loot.jar++;
			if (this.roll(1000)) loot.hydraClaw++;
			if (this.roll(512)) loot.hydraLeather++;
			if (this.roll(512)) loot.hydraTail++;
			if (this.roll(256)) loot.hydraHeads++;
			if (this.roll(540)) loot.ring++;
			if (this.roll(2000)) loot.dragonK++;
			if (this.roll(2000)) loot.dragonTA++;
		}
		loot.dragonK *= Math.floor((Math.random() * 5 + 5) * 100);
		loot.dragonTA *= Math.floor((Math.random() * 5 + 5) * 100);

		for (const key in loot) {
			displayLoot.push(`**${this.nameMap[key]}**: ${loot[key].toLocaleString()} `);
			totalValue += this.priceMap[key] * loot[key];
		}

		displayLoot.push(`\n**Total Value:** ${totalValue.toLocaleString()} GP`);
		displayLoot.push(
			`**GP per Kill:** ${Math.round(totalValue / quantity).toLocaleString()} GP`
		);
		return displayLoot.join('\n');
	},
	finish() {
		const lootMSG = [];
		const loot = [];
		let kc = 0;
		let RP = 0;
		while (loot.length !== 9) {
			kc++;
			if (!loot.includes('PET') && this.roll(3000)) {
				loot.push('PET');
				lootMSG.push(`**Ikkle hydra:** ${kc.toLocaleString()} KC ${this.drops.pet}`);
			}
			if (!loot.includes('JOC') && this.roll(2000)) {
				loot.push('JOC');
				lootMSG.push(`**Jar of chemicals:** ${kc.toLocaleString()} KC ${this.drops.jar}`);
			}
			if (!loot.includes('HC') && this.roll(1000)) {
				loot.push('HC');
				lootMSG.push(`**Hydra's claw:** ${kc.toLocaleString()} KC ${this.drops.hydraClaw}`);
			}
			if (!loot.includes('HL') && this.roll(512)) {
				loot.push('HL');
				lootMSG.push(
					`**Hydra leather:** ${kc.toLocaleString()} KC ${this.drops.hydraLeather}`
				);
			}
			if (!loot.includes('HT') && this.roll(512)) {
				loot.push('HT');
				lootMSG.push(`**Hydra tail:** ${kc.toLocaleString()} KC ${this.drops.hydraTail}`);
			}
			if (!loot.includes('HHeads') && this.roll(256)) {
				loot.push('HHeads');
				lootMSG.push(
					`**Alchemical hydra heads:** ${kc.toLocaleString()} KC ${this.drops.hydraHeads}`
				);
			}
			if (this.roll(180)) {
				let LOCK = false;
				if (!loot.includes('HE') && RP === 0) {
					loot.push('HE');
					lootMSG.push(
						`**Hydra's eye:** ${kc.toLocaleString()} KC ${this.drops.ringPieces[0]}`
					);
					RP++;
					LOCK = true;
				}
				if (!loot.includes('HF') && !LOCK) {
					loot.push('HF');
					lootMSG.push(
						`**Hydra's fang:** ${kc.toLocaleString()} KC ${this.drops.ringPieces[1]}`
					);
					RP++;
					LOCK = true;
				}
				if (!loot.includes('HH') && !LOCK) {
					loot.push('HH');
					lootMSG.push(
						`**Hydra's heart:** ${kc.toLocaleString()} KC ${this.drops.ringPieces[2]}`
					);
					RP++;
					LOCK = true;
				}
			}
		}
		return [kc, lootMSG.join('\n'), this.drops.pet];
	},
	roll(max) {
		return Math.floor(Math.random() * max + 1) === 1;
	}
};

module.exports = alchemicalHydra;
