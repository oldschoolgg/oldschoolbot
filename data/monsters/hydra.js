const hydra = {
	drops: {
		hydraTail: '<Hydra tail>',
		ringPieces: ['<Hydras eye>',
    			'<Hydras fang>',
    			'<Hydras heart>'],
		dragonWeaponry: ['<Dragon knife>',
			'<Dragon thrownaxe>']
	},
	kill(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(1000)) loot.push(this.drops.hydraTail);
			if (this.roll(360)) loot.push(this.drops.ringPieces[Math.floor(Math.random() * this.drops.ringPieces.length)]);
			if (this.roll(2000)) loot.push(this.drops.dragonWeaponry[Math.floor(Math.random() * this.drops.dragonWeaponry.length)]);
		}
		return loot.join(' ');
	},
	roll(max) {
		return Math.floor((Math.random() * max) + 1) === 1;
	}
};

module.exports = hydra;
