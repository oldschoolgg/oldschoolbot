const lizardmanShaman = {
	drops: {
		dragonWarhammer: '<:Dragon_warhammer:405998717154623488>',
		curvedBone: '<:Curved_bone:405264444256681985>',
		longBone: '<:Long_bone:421045456391634945>',
		xericsTalisman: '<:Xerics_talisman_inert:456176488669249539>'
	},
	kill(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(5000)) loot.push(this.drops.dragonWarhammer);
			if (this.roll(5000)) loot.push(this.drops.curvedBone);
			if (this.roll(400)) loot.push(this.drops.longBone);
			if (this.roll(250)) loot.push(this.drops.xericsTalisman);
		}
		return loot.join(' ');
	},
	roll(max) {
		return Math.floor((Math.random() * max) + 1) === 1;
	}
};

module.exports = lizardmanShaman;
