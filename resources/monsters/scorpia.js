const scorpia = {
	drops: {
		scorpiasOffspring: '<:Scorpias_offspring:324127378773377024>',
		odiumShard3: '<:Odium_shard_3:417705570921873419>',
		maledictionShard3: '<:Malediction_shard_3:417705571173531658>'
	},
	kill(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(2000)) loot.push(this.drops.scorpiasOffspring);
			if (this.roll(256)) loot.push(this.drops.odiumShard3);
			if (this.roll(256)) loot.push(this.drops.maledictionShard3);
		}
		return loot.join(' ');
	},
	roll(max) {
		return Math.floor((Math.random() * max) + 1) === 1;
	}
};

module.exports = scorpia;
