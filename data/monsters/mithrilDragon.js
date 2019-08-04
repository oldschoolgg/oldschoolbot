const mithrilDragon = {
	drops: {
		draconicVisage: '<:Draconic_visage:403378090979491840>',
		dragonFullHelm: '<:Dragon_full_helm:456177009639424020>',
		chewedBones: '<:Chewed_bones:506330718356504586>',
		clueScroll: '<:Clue_scroll:365003979840552960>'
	},
	kill(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(32768)) loot.push(this.drops.dragonFullHelm);
			if (this.roll(42)) loot.push(this.drops.chewedBones);
			if (this.roll(10000)) loot.push(this.drops.draconicVisage);
			if (this.roll(350)) loot.push(this.drops.clueScroll);
		}
		return loot.join(' ');
	},
	roll(max) {
		return Math.floor(Math.random() * max + 1) === 1;
	}
};

module.exports = mithrilDragon;
