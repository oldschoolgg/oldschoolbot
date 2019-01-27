const raids = {
	drops: {
		pet: '<:Olmlet:324127376873357316>',
		curvedBone: '<:Curved_bone:405264444256681985>',
		dexterousPrayerScroll: '<:Dexterous_prayer_scroll:403018312562376725>',
		arcanePrayerScroll: '<:Arcane_prayer_scroll:403018312906309632>',
		twistedBuckler: '<:Twisted_buckler:403018312625291265>',
		dragonHunterCrossbow: '<:Dragon_hunter_crossbow:403018313107636224>',
		dinhsBulwark: '<:Dinhs_bulwark:403018312960835595>',
		ancestralHat: '<:Ancestral_hat:403018312482684938>',
		ancestralRobeTop: '<:Ancestral_robe_top:403018312818229248>',
		ancestralRobeBottom: '<:Ancestral_robe_bottom:403018312734343168>',
		dragonClaws: '<:Dragon_claws:403018313124282368>',
		elderMaul: '<:Elder_maul:403018312247803906>',
		kodaiInsignia: '<:Kodai_insignia:403018312264712193>',
		twistedBow: '<:Twisted_bow:403018312402862081>'
	},
	// The GP value of the items
	priceMap: {
		dexterousPrayerScroll: 81452329,
		arcanePrayerScroll: 8969516,
		twistedBuckler: 9735055,
		dragonHunterCrossbow: 119002779,
		dinhsBulwark: 8696916,
		ancestralHat: 18072915,
		ancestralRobeTop: 90391870,
		ancestralRobeBottom: 66595248,
		dragonClaws: 87503416,
		elderMaul: 32920093,
		kodaiInsignia: 84244333,
		twistedBow: 1195993510,
		pet: 0
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
				if (this.roll(65)) loot.push(this.drops.pet);
				const number = (Math.random() * 100).toFixed(2);
				switch (true) {
					case number < 29:
						loot.push(this.drops.dexterousPrayerScroll);
						break;
					case number < 58:
						loot.push(this.drops.arcanePrayerScroll);
						break;
					case number < 63.8:
						loot.push(this.drops.twistedBuckler);
						break;
					case number < 69.6:
						loot.push(this.drops.dragonHunterCrossbow);
						break;
					case number < 73.95:
						loot.push(this.drops.dinhsBulwark);
						break;
					case number < 78.3:
						loot.push(this.drops.ancestralHat);
						break;
					case number < 82.65:
						loot.push(this.drops.ancestralRobeTop);
						break;
					case number < 87:
						loot.push(this.drops.ancestralRobeBottom);
						break;
					case number < 91.35:
						loot.push(this.drops.dragonClaws);
						break;
					case number < 94.25:
						loot.push(this.drops.elderMaul);
						break;
					case number < 97.15:
						loot.push(this.drops.kodaiInsignia);
						break;
					case number < 100:
						loot.push(this.drops.twistedBow);
						break;
					default:
						break;
				}
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
			pet: 0
		};
		const displayLoot = [];
		let totalValue = 0;

		for (let i = 0; i < quantity; i++) {
			if (this.roll(25)) {
				if (this.roll(65)) loot.pet++;
				const number = (Math.random() * 100).toFixed(2);
				switch (true) {
					case number < 29:
						loot.dexterousPrayerScroll++;
						break;
					case number < 58:
						loot.arcanePrayerScroll++;
						break;
					case number < 63.8:
						loot.twistedBuckler++;
						break;
					case number < 69.6:
						loot.dragonHunterCrossbow++;
						break;
					case number < 73.95:
						loot.dinhsBulwark++;
						break;
					case number < 78.3:
						loot.ancestralHat++;
						break;
					case number < 82.65:
						loot.ancestralRobeTop++;
						break;
					case number < 87:
						loot.ancestralRobeBottom++;
						break;
					case number < 91.35:
						loot.dragonClaws++;
						break;
					case number < 94.25:
						loot.elderMaul++;
						break;
					case number < 97.15:
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
			displayLoot.push(`**${this.drops[key]}**: ${loot[key].toLocaleString()} `);
			totalValue += this.priceMap[key] * loot[key];
		}
		displayLoot.push(`\n**Total Value:** ${totalValue.toLocaleString()} GP`);
		displayLoot.push(`**GP/HR (30-Min Solo Raids):** ${(totalValue / (quantity / 2)).toLocaleString()} GP`);
		displayLoot.push(`**Total Hours**: ${(quantity / 2).toLocaleString()}`);
		return displayLoot.join('\n');
	},
	roll(max) {
		return Math.floor((Math.random() * max) + 1) === 1;
	}
};

module.exports = raids;
