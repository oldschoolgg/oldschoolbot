const saradomin = {
	drops: {
		shards: ['<:Godsword_shard_3:403049019040858112>',
			'<:Godsword_shard_2:403049019015954462>',
			'<:Godsword_shard_1:403049018764165121>'],
		pet: '<:Pet_zilyana:324127378248957952>',
		saradominHilt: '<:Saradomin_hilt:403051383214833667>',
		armadylCrossbow: '<:Armadyl_crossbow:403052160931069952>',
		saradominSword: '<:Saradomin_sword:403052160822280192>',
		saradominsLight: '<:Saradomins_light:403052160977338378>'
	},
	kill(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(5000)) loot.push(this.drops.pet);
			if (this.roll(508)) loot.push(this.drops.armadylCrossbow);
			if (this.roll(508)) loot.push(this.drops.saradominHilt);
			if (this.roll(254)) loot.push(this.drops.saradominsLight);
			if (this.roll(127)) loot.push(this.drops.saradominSword);
			if (this.roll(86)) loot.push(this.drops.shards[Math.floor(Math.random() * this.drops.shards.length)]);
		}
		return loot.join(' ');
	},
	roll(max) {
		return Math.floor((Math.random() * max) + 1) === 1;
	}
};

module.exports = saradomin;
