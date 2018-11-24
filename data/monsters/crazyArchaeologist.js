const crazyArchaeologist = {
	drops: {
		fedora: '<:Fedora:456179157303427092>',
		odiumShard2: '<:Odium_shard_2:456179354339377182>',
		maledictionShard2: '<:Malediction_shard_2:456180315002765348>',
		clueScroll: '<:Clue_scroll:365003979840552960>'
	},
	kill(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(128)) loot.push(this.drops.fedora);
			if (this.roll(256)) loot.push(this.drops.odiumShard2);
			if (this.roll(256)) loot.push(this.drops.maledictionShard2);
			if (this.roll(128)) loot.push(this.drops.clueScroll);
		}
		return loot.join(' ');
	},
	roll(max) {
		return Math.floor((Math.random() * max) + 1) === 1;
	}
};

module.exports = crazyArchaeologist;
