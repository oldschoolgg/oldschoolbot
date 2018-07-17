const medium = {
	drops: {
		rangerBoots: '<:Ranger_boots:468609846573531147>'
	},
	open(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(261)) loot.push(this.drops.rangerBoots);
		}
		return loot.join(' ');
	},
	roll(max) {
		return Math.floor((Math.random() * max) + 1) === 1;
	}
};

module.exports = medium;
