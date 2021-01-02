const obor = {
	drops: {
		hillGiantClub: '<:Hill_giant_club:421045456194240523>',
		longBone: '<:Long_bone:421045456391634945>',
		curvedBone: '<:Curved_bone:421045456387309568>'
	},
	kill(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(118)) loot.push(this.drops.hillGiantClub);
			if (this.roll(400)) loot.push(this.drops.longBone);
			if (this.roll(5000)) loot.push(this.drops.curvedBone);
		}
		return loot.join(' ');
	},
	roll(max) {
		return Math.floor(Math.random() * max + 1) === 1;
	}
};

module.exports = obor;
