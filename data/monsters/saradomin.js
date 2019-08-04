const saradomin = {
	drops: {
		shards: [
			'<:Godsword_shard_3:403049019040858112>',
			'<:Godsword_shard_2:403049019015954462>',
			'<:Godsword_shard_1:403049018764165121>'
		],
		pet: '<:Pet_zilyana:324127378248957952>',
		saradominHilt: '<:Saradomin_hilt:403051383214833667>',
		armadylCrossbow: '<:Armadyl_crossbow:403052160931069952>',
		saradominSword: '<:Saradomin_sword:403052160822280192>',
		saradominsLight: '<:Saradomins_light:403052160977338378>'
	},
	nameMap: {
		saradominSword: 'Saradomin Sword',
		saradominsLight: 'Saradomin Light',
		armadylCrossbow: 'Armadyl Crossbow',
		godswordShard: 'Godsword Shard',
		saradominHilt: 'Saradomin Hilt',
		pet: 'Pet'
	},
	// prices as of 11/1/2018
	priceMap: {
		saradominSword: 1200000,
		saradominsLight: 78000,
		armadylCrossbow: 31000000,
		godswordShard: 150000,
		saradominHilt: 42600000,
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
			if (this.roll(5000)) loot.push(this.drops.pet);
			if (this.roll(508)) loot.push(this.drops.armadylCrossbow);
			if (this.roll(508)) loot.push(this.drops.saradominHilt);
			if (this.roll(254)) loot.push(this.drops.saradominsLight);
			if (this.roll(127)) loot.push(this.drops.saradominSword);
			if (this.roll(86))
				loot.push(this.drops.shards[Math.floor(Math.random() * this.drops.shards.length)]);
		}
		return loot.join(' ');
	},
	bigKill(quantity) {
		const loot = {
			saradominSword: 0,
			saradominsLight: 0,
			armadylCrossbow: 0,
			godswordShard: 0,
			saradominHilt: 0,
			pet: 0
		};
		const displayLoot = [];
		let totalValue = 0;

		for (let i = 0; i < quantity; i++) {
			if (this.roll(5000)) loot.pet++;
			if (this.roll(508)) loot.armadylCrossbow++;
			if (this.roll(508)) loot.saradominHilt++;
			if (this.roll(254)) loot.saradominsLight++;
			if (this.roll(127)) loot.saradominSword++;
			if (this.roll(86)) loot.godswordShard++;
		}

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
	roll(max) {
		return Math.floor(Math.random() * max + 1) === 1;
	}
};

module.exports = saradomin;
