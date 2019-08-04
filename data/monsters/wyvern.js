const wyvern = {
	drops: {
		draconicVisage: '<:Draconic_visage:403378090979491840>',
		clueScroll: '<:Clue_scroll:365003979840552960>',
		dragonPlateskirt: '<:Dragon_plateskirt:409987345245405205>',
		dragonPlatelegs: '<:Dragon_platelegs:409987344830169089>',
		graniteLegs: '<:Granite_legs:409987344704208909>'
	},
	kill(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(10000)) loot.push(this.drops.draconicVisage);
			if (this.roll(350)) loot.push(this.drops.clueScroll);
			if (this.roll(512)) loot.push(this.drops.dragonPlatelegs);
			if (this.roll(512)) loot.push(this.drops.dragonPlateskirt);
			if (this.roll(512)) loot.push(this.drops.graniteLegs);
		}
		return loot.join(' ');
	},
	roll(max) {
		return Math.floor(Math.random() * max + 1) === 1;
	}
};

module.exports = wyvern;
