const chaosFanatic = {
	drops: {
		pet: '<:Pet_chaos_elemental:324127377070227456>',
		odiumShard1: '<:Odium_shard_1:506330718616551424>',
		maledictionShard1: '<:Malediction_shard_1:456180792851300352>',
		clueScroll: '<:Clue_scroll:365003979840552960>'
	},
	kill(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(1000)) loot.push(this.drops.pet);
			if (this.roll(256)) loot.push(this.drops.odiumShard1);
			if (this.roll(256)) loot.push(this.drops.maledictionShard1);
			if (this.roll(128)) loot.push(this.drops.clueScroll);
		}
		return loot.join(' ');
	},
	roll(max) {
		return Math.floor(Math.random() * max + 1) === 1;
	}
};

module.exports = chaosFanatic;
