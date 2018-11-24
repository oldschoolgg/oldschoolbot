const lavaDragon = {
	drops: {
		draconicVisage: '<:Draconic_visage:403378090979491840>',
		clueScroll: '<:Clue_scroll:365003979840552960>',
		lootingBag: '<:Looting_bag:507047285188722689>',
		mysteriousEmblem: '<:Mysterious_emblem:507047285402894336>',
		slayersEnchantment: '<:Slayers_enchantment:507047285310488587>'
	},
	kill(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(10000)) loot.push(this.drops.draconicVisage);
			if (this.roll(250)) loot.push(this.drops.clueScroll);
			if (this.roll(30)) loot.push(this.drops.lootingBag);
			if (this.roll(136)) loot.push(this.drops.slayersEnchantment);
			if (this.roll(40)) loot.push(this.drops.mysteriousEmblem);
		}
		return loot.join(' ');
	},
	roll(max) {
		return Math.floor(Math.random() * max + 1) === 1;
	}
};

module.exports = lavaDragon;
