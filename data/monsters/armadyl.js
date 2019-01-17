const armadyl = {
	drops: {
		shards: ['<:Godsword_shard_3:403049019040858112>',
			'<:Godsword_shard_2:403049019015954462>',
			'<:Godsword_shard_1:403049018764165121>'],
		armor: [
			'<:Armadyl_chainskirt:405262588222636042>',
			'<:Armadyl_helmet:405262588499329024>',
			'<:Armadyl_chestplate:405262588310454292>'
		],
		pet: '<:Pet_kreearra:324127377305239555>',
		armadylHilt: '<:Armadyl_hilt:405262588503523328>',
		curvedBone: '<:Curved_bone:405264444256681985>'
	},
	emojiMap: {
		'<:Armadyl_chainskirt:405262588222636042>': 'armadylChainskirt',
		'<:Armadyl_helmet:405262588499329024>': 'armadylHelmet',
		'<:Armadyl_chestplate:405262588310454292>': 'armadylChestplate'
	},
	nameMap: {
		armadylChestplate: 'Armadyl Chestplate',
		armadylChainskirt: 'Armadyl Chainskirt',
		armadylHelmet: 'Armadyl Helmet',
		godswordShard: 'Godsword Shard',
		armadylHilt: 'Armadyl Hilt',
		pet: 'Pet',
		curvedBone: 'Curved Bone'
	},
	// prices as of 11/1/2018
	priceMap: {
		armadylChestplate: 41600000,
		armadylChainskirt: 34600000,
		armadylHelmet: 4400000,
		godswordShard: 150000,
		armadylHilt: 17600000,
		pet: 0,
		curvedBone: 0
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
			if (this.roll(128)) loot.push(this.drops.armor[Math.floor(Math.random() * this.drops.armor.length)]);
			if (this.roll(508)) loot.push(this.drops.armadylHilt);
			if (this.roll(5000)) loot.push(this.drops.pet);
			if (this.roll(86)) loot.push(this.drops.shards[Math.floor(Math.random() * this.drops.shards.length)]);
		}
		return loot.join(' ');
	},
	bigKill(quantity) {
		const loot = {
			armadylChestplate: 0,
			armadylChainskirt: 0,
			armadylHelmet: 0,
			godswordShard: 0,
			armadylHilt: 0,
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
			if (this.roll(508)) loot.armadylHilt++;
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

module.exports = armadyl;
