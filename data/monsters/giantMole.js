const giantMole = {
	drops: {
		pet: '<:Baby_mole:324127375858204672>',
		curvedBone: '<:Curved_bone:405264444256681985>'
	},
	kill(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(3000)) loot.push(this.drops.pet);
			if (this.roll(5000)) loot.push(this.drops.curvedBone);
		}
		return loot.join(' ');
	},
	roll(max) {
		return Math.floor((Math.random() * max) + 1) === 1;
	}
};

module.exports = giantMole;
