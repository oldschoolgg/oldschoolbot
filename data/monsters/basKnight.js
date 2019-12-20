const basKnight = {
	drops: {
		jaw: '<:Basilisk_jaw:633310811976368138>',
		curvedBone: '<:Curved_bone:405264444256681985>',
		longBone: '<:Long_bone:421045456391634945>'
	},
	kill(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(1000)) loot.push(this.drops.jaw);
			if (this.roll(5000)) loot.push(this.drops.curvedBone);
			if (this.roll(400)) loot.push(this.drops.longBone);
		}
		return loot.join(' ');
	},
	roll(max) {
		return Math.floor(Math.random() * max + 1) === 1;
	}
};

module.exports = basKnight;
