const raids = {
	drops: {
		pet: {
			emoji: '<:Olmlet:324127376873357316>',
			name: 'Olmlet',
			price: 0,
			shortName: 'pet',
			weighting: 0
		},
		curvedBone: {
			emoji: '<:Curved_bone:405264444256681985>',
			name: 'Curved Bone',
			price: 0,
			shortName: 'curvedBone'
		},
		dexterousPrayerScroll: {
			emoji: '<:Dexterous_prayer_scroll:403018312562376725>',
			name: 'Dexterous Prayer Scroll',
			price: 71009490,
			shortName: 'dexterousPrayerScroll',
			weighting: 20
		},
		arcanePrayerScroll: {
			emoji: '<:Arcane_prayer_scroll:403018312906309632>',
			name: 'Arcane Prayer Scroll',
			price: 6444816,
			shortName: 'arcanePrayerScroll',
			weighting: 20
		},
		twistedBuckler: {
			emoji: '<:Twisted_buckler:403018312625291265>',
			name: 'Twisted Buckler',
			price: 9603882,
			shortName: 'twistedBuckler',
			weighting: 4
		},
		dragonHunterCrossbow: {
			emoji: '<:Dragon_hunter_crossbow:403018313107636224>',
			name: 'Dragon Hunter Crossbow',
			price: 131785171,
			shortName: 'dragonHunterCrossbow',
			weighting: 4
		},
		dinhsBulwark: {
			emoji: '<:Dinhs_bulwark:403018312960835595>',
			name: 'Dinhs Bulwark',
			price: 5998828,
			shortName: 'dinhsBulwark',
			weighting: 3
		},
		ancestralHat: {
			emoji: '<:Ancestral_hat:403018312482684938>',
			name: 'Ancestral Hat',
			price: 14341857,
			shortName: 'ancestralHat',
			weighting: 3
		},
		ancestralRobeTop: {
			emoji: '<:Ancestral_robe_top:403018312818229248>',
			name: 'Ancestral Robe Top',
			price: 73315016,
			shortName: 'ancestralRobeTop',
			weighting: 3
		},
		ancestralRobeBottom: {
			emoji: '<:Ancestral_robe_bottom:403018312734343168>',
			name: 'Ancestral Robe Bottom',
			price: 63293227,
			shortName: 'ancestralRobeBottom',
			weighting: 3
		},
		dragonClaws: {
			emoji: '<:Dragon_claws:403018313124282368>',
			name: 'Dragon Claws',
			price: 68950625,
			shortName: 'dragonClaws',
			weighting: 3
		},
		elderMaul: {
			emoji: '<:Elder_maul:403018312247803906>',
			name: 'Elder Maul',
			price: 22262379,
			shortName: 'elderMaul',
			weighting: 2
		},
		kodaiInsignia: {
			emoji: '<:Kodai_insignia:403018312264712193>',
			name: 'Kodai Insignia',
			price: 68244811,
			shortName: 'kodaiInsignia',
			weighting: 2
		},
		twistedBow: {
			emoji: '<:Twisted_bow:403018312402862081>',
			name: 'Twisted Bow',
			price: 1176227720,
			shortName: 'twistedBow',
			weighting: 2
		}
	},
	kill(quantity) {
		if (quantity <= 100) {
			return this.smallKill(quantity);
		} else {
			return this.bigKill(quantity);
		}
	},
	smallKill(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(25)) {
				if (this.roll(53)) loot.push(this.drops.pet.emoji);
				loot.push(this.determineItem().emoji);
			}
		}
		return loot.join(' ');
	},
	bigKill(quantity) {
		const loot = {
			dexterousPrayerScroll: 0,
			arcanePrayerScroll: 0,
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
			pet: {
				amount: 0,
				items: ''
			}
		};
		const displayLoot = [];
		let totalValue = 0;
		let itemReceived;

		for (let i = 0; i < quantity; i++) {
			if (this.roll(25)) {
				itemReceived = this.determineItem();
				if (this.roll(65)) {
					loot.pet.amount++;
					if (loot.pet.amount > 1) {
						loot.pet.items += ` ${itemReceived.emoji}`;
					} else {
						loot.pet.items += `with ${itemReceived.emoji}`;
					}
				}
				loot[itemReceived.shortName]++;
			}
		}
		for (const key in loot) {
			if (key === 'pet') {
				displayLoot.push(
					`**${this.drops[key].emoji}**: ${loot[key].amount.toLocaleString()} ${
						loot[key].items
					}`
				);
				totalValue += this.drops[key].price * loot[key].amount;
			} else {
				displayLoot.push(`**${this.drops[key].emoji}**: ${loot[key].toLocaleString()} `);
				totalValue += this.drops[key].price * loot[key];
			}
		}
		displayLoot.push(`\n**Total Value:** ${totalValue.toLocaleString()} GP`);
		displayLoot.push(
			`**GP/HR (30-Min Solo Raids):** ${(totalValue / (quantity / 2)).toLocaleString()} GP`
		);
		displayLoot.push(`**Total Hours**: ${(quantity / 2).toLocaleString()}`);
		return displayLoot.join('\n').slice(0, 1999);
	},
	roll(max) {
		return Math.floor(Math.random() * max + 1) === 1;
	},
	determineItem() {
		const number = Math.random() * 69;
		switch (true) {
			case number <= 20:
				return this.drops.dexterousPrayerScroll;
			case number <= 40:
				return this.drops.arcanePrayerScroll;
			case number <= 44:
				return this.drops.twistedBuckler;
			case number <= 48:
				return this.drops.dragonHunterCrossbow;
			case number <= 51:
				return this.drops.dinhsBulwark;
			case number <= 54:
				return this.drops.ancestralHat;
			case number <= 57:
				return this.drops.ancestralRobeTop;
			case number <= 60:
				return this.drops.ancestralRobeBottom;
			case number <= 63:
				return this.drops.dragonClaws;
			case number <= 65:
				return this.drops.elderMaul;
			case number <= 67:
				return this.drops.kodaiInsignia;
			case number <= 69:
				return this.drops.twistedBow;
		}
	}
};

module.exports = raids;
