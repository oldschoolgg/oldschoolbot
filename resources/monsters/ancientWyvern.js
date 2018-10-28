const ancientWyvern = {
	drops: {
		draconicVisage: '<:Draconic_visage:403378090979491840>',
		dragonPlateskirt: '<:Dragon_plateskirt:409987345245405205>',
		dragonPlatelegs: '<:Dragon_platelegs:409987344830169089>',
		graniteLegs: '<:Granite_legs:409987344704208909>'
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
