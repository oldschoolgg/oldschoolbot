const zulrah = {
	drops: {
		uniques: [{
			uncutOnyx: '<:Uncut_onyx:403059676402679808>',
			magicFang: '<:Magic_fang:403059673563004928>',
			serpentineVisage: '<:Serpentine_visage:403059676016672769>',
			tanzaniteFang: '<:Tanzanite_fang:403059675979055105>'
		}],
		mutagens: {
			magmaMutagen: '<:Magma_mutagen:403059676733898753>',
			tanzaniteMutagen: '<:Tanzanite_mutagen:403059676306079746>'
		},
		pet: '<:Pet_snakeling:324127377816944642>',
		jarOfSwamp: '<:Jar_of_swamp:403059673588170776>'
	},
	randomUnique() {
		const keys = Object.keys(this.drops.uniques[0]);
		const randomKey = keys[Math.floor(Math.random() * keys.length)];
		return this.drops.uniques[0][randomKey];
	},
	randomMutagen() {
		const keys = Object.keys(this.drops.mutagens);
		const randomKey = keys[Math.floor(Math.random() * keys.length)];
		return this.drops.mutagens[randomKey];
	},
	kill(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(5000)) loot.push(this.drops.pet);
			if (this.roll(3277)) loot.push(this.randomMutagen());
			if (this.roll(3000)) loot.push(this.drops.jarOfSwamp);
			if (this.roll(128)) loot.push(this.randomUnique());
		}
		return loot.join(' ');
	},
	roll(max) {
		return Math.floor((Math.random() * max) + 1) === 1;
	}
};

module.exports = zulrah;
