const kraken = {
	drops: {
		pet: '<:Pet_kraken:324127377477206016>',
		tridentOfTheSeas: '<:Trident_of_the_seas:421042619913863198>',
		jarOfDirt: '<:Jar_of_dirt:421042619473199106>',
		magicSeed5: '<:Magic_seed_5:421042620022915084>',
		dragonstoneRing: '<:Dragonstone_ring:421042619754217472>',
		krakenTentacle: '<:Kraken_tentacle:421042619859337216>',
		clueScroll: '<:Clue_scroll:365003979840552960>'
	},
	kill(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(3000)) loot.push(this.drops.pet);
			if (this.roll(512)) loot.push(this.drops.tridentOfTheSeas);
			if (this.roll(1000)) loot.push(this.drops.jarOfDirt);
			if (this.roll(128)) loot.push(this.drops.magicSeed5);
			if (this.roll(128)) loot.push(this.drops.dragonstoneRing);
			if (this.roll(300)) loot.push(this.drops.krakenTentacle);
			if (this.roll(500)) loot.push(this.drops.clueScroll);
		}
		return loot.join(' ');
	},
	roll(max) {
		return Math.floor(Math.random() * max + 1) === 1;
	}
};

module.exports = kraken;
