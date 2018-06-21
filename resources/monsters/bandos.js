const bandos = {
	drops: {
		pet: '<:Pet_general_graardor:324127377376673792>',
		bandosHilt: '<:Bandos_hilt:403047909072830464>',
		armor: ['<:Bandos_boots:403046849415610368>',
			'<:Bandos_chestplate:403046849440776202>',
			'<:Bandos_tassets:403046849465810945>'],
		shards: ['<:Godsword_shard_3:403049019040858112>',
			'<:Godsword_shard_2:403049019015954462>',
			'<:Godsword_shard_1:403049018764165121>'],
		curvedBone: '<:Curved_bone:421045456387309568>'
	},
	emojiMap: {
		'<:Bandos_boots:403046849415610368>': 'bandosBoots',
		'<:Bandos_chestplate:403046849440776202>': 'bandosChestplate',
		'<:Bandos_tassets:403046849465810945>': 'bandosTassets'
	},
	nameMap: {
		bandosChestplate: 'Bandos Chestplate',
		bandosTassets: 'Bandos Tassets',
		bandosBoots: 'Bandos Boots',
		godswordShard: 'Godsword Shard',
		bandosHilt: 'Bandos Hilt',
		pet: 'Pet',
		curvedBone: 'Curved Bone'
	},
	priceMap: {
		bandosChestplate: 15000000,
		bandosTassets: 26000000,
		bandosBoots: 200000,
		godswordShard: 150000,
		bandosHilt: 8000000,
		pet: 0,
		curvedBone: 0
	},
	kill(quantity) {
		if (quantity <= 250) {
			return this.smallKill(quantity);
		} else {
			return this.bigKill(quantity);
		}
	},
	smallKill(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(128)) loot.push(this.drops.armor[Math.floor(Math.random() * this.drops.armor.length)]);
			if (this.roll(508)) loot.push(this.drops.bandosHilt);
			if (this.roll(5000)) loot.push(this.drops.pet);
			if (this.roll(5000)) loot.push(this.drops.curvedBone);
			if (this.roll(86)) loot.push(this.drops.shards[Math.floor(Math.random() * this.drops.shards.length)]);
		}
		return loot.join(' ');
	},
	bigKill(quantity) {
		const loot = {
			bandosChestplate: 0,
			bandosTassets: 0,
			bandosBoots: 0,
			godswordShard: 0,
			bandosHilt: 0,
			pet: 0,
			curvedBone: 0
		};
		const displayLoot = [];
		let totalValue = 0;

		for (let i = 0; i < quantity; i++) {
			if (this.roll(128)) {
				const armorPiece = this.drops.armor[Math.floor(Math.random() * this.drops.armor.length)];
				loot[this.emojiMap[armorPiece]]++;
			}
			if (this.roll(508)) loot.bandosHilt++;
			if (this.roll(5000)) loot.pet++;
			if (this.roll(5000)) loot.curvedBone++;
			if (this.roll(86)) loot.godswordShard++;
		}

		for (const key in loot) {
			displayLoot.push(`**${this.nameMap[key]}**: ${loot[key].toLocaleString()} `);
			totalValue += this.priceMap[key] * loot[key];
		}

		displayLoot.push(`\n**Total Value:** ${totalValue.toLocaleString()} GP`);
		displayLoot.push(`**GP per Kill:** ${Math.round(totalValue / quantity).toLocaleString()} GP`);
		return displayLoot.join('\n');
	},
	roll(max) {
		return Math.floor((Math.random() * max) + 1) === 1;
	}
};

module.exports = bandos;
