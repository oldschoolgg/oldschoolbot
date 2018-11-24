const ancientWyvern = {
	drops: {
		wyvernVisage: '<:Wyvern_visage:506330718641586185>',
		graniteBoots: '<:Granite_boots:506330718516019230>',
		graniteLongsword: '<:Granite_longsword:506330718473945088>'
	},
	kill(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(10000)) loot.push(this.drops.wyvernVisage);
			if (this.roll(600)) loot.push(this.drops.graniteLongsword);
			if (this.roll(600)) loot.push(this.drops.graniteBoots);
		}
		return loot.join(' ');
	},
	roll(max) {
		return Math.floor((Math.random() * max) + 1) === 1;
	}
};

module.exports = ancientWyvern;
