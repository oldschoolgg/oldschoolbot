const runeDragon = {
	drops: {
		draconicVisage: '<:Draconic_visage:403378090979491840>',
		dragonMetalSlice: '<:Dragon_metal_slice:456178390991634432>',
		dragonLimbs: '<:Dragon_limbs:456178390928588800>',
		clueScroll: '<:Clue_scroll:365003979840552960>'
	},
	kill(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(5000)) loot.push(this.drops.dragonMetalSlice);
			if (this.roll(1000)) loot.push(this.drops.dragonLimbs);
			if (this.roll(9000)) loot.push(this.drops.draconicVisage);
			if (this.roll(320)) loot.push(this.drops.clueScroll);
		}
		return loot.join(' ');
	},
	roll(max) {
		return Math.floor((Math.random() * max) + 1) === 1;
	}
};

module.exports = runeDragon;
