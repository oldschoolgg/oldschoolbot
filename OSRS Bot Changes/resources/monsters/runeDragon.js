const runeDragon = {
	drops: {
		draconicVisage: '<:Draconic_visage:403378090979491840>',
		dragonMetalLump: '<:Dragon_metal_lump:456178708777140244>',
		dragonLimbs: '<:Dragon_limbs:456178390928588800>',
		clueScroll: '<:Clue_scroll:365003979840552960>'
	},
	kill(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(5000)) loot.push(this.drops.dragonMetalLump);
			if (this.roll(800)) loot.push(this.drops.dragonLimbs);
			if (this.roll(8000)) loot.push(this.drops.draconicVisage);
			if (this.roll(300)) loot.push(this.drops.clueScroll);
		}
		return loot.join(' ');
	},
	roll(max) {
		return Math.floor((Math.random() * max) + 1) === 1;
	}
};

module.exports = runeDragon;
