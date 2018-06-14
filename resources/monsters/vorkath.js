const vorkath = {
	drops: {
		pet: '<:Vorki:400713309252222977>',
		jarOfDecay: '<:Jar_of_decay:403378091008851968>',
		dragonboneNecklace: '<:Dragonbone_necklace:403378090740547595>',
		draconicVisage: '<:Draconic_visage:403378090979491840>',
		skeletalVisage: '<:Skeletal_visage:403378091071766539>',
		vorkathsHead: '<:Vorkaths_head:403378091046469632>'
	},
	kill(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(1000)) loot.push(this.drops.dragonboneNecklace);
			if (this.roll(3000)) loot.push(this.drops.jarOfDecay);
			if (this.roll(3000)) loot.push(this.drops.pet);
			if (this.roll(5000)) loot.push(this.drops.draconicVisage);
			if (this.roll(5000)) loot.push(this.drops.skeletalVisage);
			if (this.roll(50)) loot.push(this.drops.vorkathsHead);
		}
		return loot.join(' ');
	},
	roll(max) {
		return Math.floor((Math.random() * max) + 1) === 1;
	}
};

module.exports = vorkath;
