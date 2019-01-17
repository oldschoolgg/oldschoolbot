const corp = {
	drops: {
		pet: '<:Pet_dark_core:324127377347313674>',
		elysianSigil: '<:Elysian_sigil:399999422295048223>',
		spectralSigil: '<:Spectral_sigil:399999422299373568>',
		arcaneSigil: '<:Arcane_sigil:399999422282596362>'
	},
	rollSigil(int) {
		if (int < 1) {
			return this.drops.elysianSigil;
		} else if (int < 4) {
			return this.drops.spectralSigil;
		} else {
			return this.drops.arcaneSigil;
		}
	},
	kill(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(5000)) loot.push(this.drops.pet);
			if (this.roll(585)) {
				loot.push(this.rollSigil(Math.floor(Math.random() * 8)));
			}
		}
		return loot.join(' ');
	},
	roll(max) {
		return Math.floor((Math.random() * max) + 1) === 1;
	}
};

module.exports = corp;
