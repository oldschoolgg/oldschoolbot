const grotesqueGuardians = {
	drops: {
		pet: '<:Noon:379595337234382848>',
		jarOfStone: '<:Jar_of_stone:409989715928809473>',
		clueScroll: '<:Clue_scroll:365003979840552960>',
		blackTourmalineCore: '<:Black_tourmaline_core:409989716063289354>',
		graniteGloves: '<:Granite_gloves:409989716134592512>',
		graniteHammer: '<:Granite_hammer:409989716134592532>',
		graniteRing: '<:Granite_ring:409989716151369729>'
	},
	kill(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(5000)) loot.push(this.drops.jarOfStone);
			if (this.roll(3000)) loot.push(this.drops.pet);
			if (this.roll(500)) loot.push(this.drops.blackTourmalineCore);
			if (this.roll(375)) loot.push(this.drops.graniteRing);
			if (this.roll(250)) loot.push(this.drops.graniteGloves);
			if (this.roll(250)) loot.push(this.drops.graniteHammer);
			if (this.roll(230)) loot.push(this.drops.clueScroll);
		}
		return loot.join(' ');
	},
	roll(max) {
		return Math.floor(Math.random() * max + 1) === 1;
	}
};

module.exports = grotesqueGuardians;
