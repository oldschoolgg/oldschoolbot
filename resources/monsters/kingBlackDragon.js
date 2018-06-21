const kingBlackDragon = {
	drops: {
		dragonPickaxe: '<:Dragon_pickaxe:406000287841779716>',
		dragonMedHelm: '<:Dragon_med_helm:409997161145565185>',
		kbdHeads: '<:Kbd_heads:409997161393160192>',
		clueScroll: '<:Clue_scroll:365003979840552960>',
		pet: '<:Prince_black_dragon:324127378538364928>',
		draconicVisage: '<:Draconic_visage:403378090979491840>'
	},
	kill(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(1500)) loot.push(this.drops.dragonPickaxe);
			if (this.roll(128)) loot.push(this.drops.dragonMedHelm);
			if (this.roll(128)) loot.push(this.drops.kbdHeads);
			if (this.roll(450)) loot.push(this.drops.clueScroll);
			if (this.roll(3000)) loot.push(this.drops.pet);
			if (this.roll(5000)) loot.push(this.drops.draconicVisage);
		}
		return loot.join(' ');
	},
	roll(max) {
		return Math.floor((Math.random() * max) + 1) === 1;
	}
};

module.exports = kingBlackDragon;
