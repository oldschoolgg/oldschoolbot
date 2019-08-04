const zamorak = {
	drops: {
		shards: [
			'<:Godsword_shard_3:403049019040858112>',
			'<:Godsword_shard_2:403049019015954462>',
			'<:Godsword_shard_1:403049018764165121>'
		],
		pet: '<:Pet_kril_tsutsaroth:324127377527406594>',
		staffOfTheDead: '<:Staff_of_the_dead:405251862695116801>',
		zamorakianSpear: '<:Zamorakian_spear:405251862883729418>',
		steamBattlestaff: '<:Steam_battlestaff:405251862451716097>',
		zamorakHilt: '<:Zamorak_hilt:405251862489595905>'
	},
	nameMap: {
		staffOfTheDead: 'Staff of the Dead',
		zamorakianSpear: 'Zamorakian Spear',
		steamBattlestaff: 'Steam Battlestaff',
		godswordShard: 'Godsword Shard',
		zamorakHilt: 'Zamorak Hilt',
		pet: 'Pet'
	},
	// prices as of 11/1/2018
	priceMap: {
		staffOfTheDead: 6300000,
		zamorakianSpear: 11700000,
		steamBattlestaff: 600000,
		godswordShard: 150000,
		zamorakHilt: 4200000,
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
			if (this.roll(508)) loot.push(this.drops.staffOfTheDead);
			if (this.roll(508)) loot.push(this.drops.zamorakHilt);
			if (this.roll(128)) loot.push(this.drops.zamorakianSpear);
			if (this.roll(128)) loot.push(this.drops.steamBattlestaff);
			if (this.roll(86))
				loot.push(this.drops.shards[Math.floor(Math.random() * this.drops.shards.length)]);
		}
		return loot.join(' ');
	},
	bigKill(quantity) {
		const loot = {
			staffOfTheDead: 0,
			zamorakianSpear: 0,
			steamBattlestaff: 0,
			godswordShard: 0,
			zamorakHilt: 0,
			pet: 0
		};
		const displayLoot = [];
		let totalValue = 0;

		for (let i = 0; i < quantity; i++) {
			if (this.roll(5000)) loot.pet++;
			if (this.roll(508)) loot.staffOfTheDead++;
			if (this.roll(508)) loot.zamorakHilt++;
			if (this.roll(128)) loot.zamorakianSpear++;
			if (this.roll(128)) loot.steamBattlestaff++;
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

module.exports = zamorak;
