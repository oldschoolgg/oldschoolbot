const brutalBlackDragon = {
	drops: {
		dragonPlatelegs: '<:Dragon_platelegs:409987344830169089>',
		dragonPlateskirt: '<:Dragon_plateskirt:409987345245405205>',
		uncutDragonstone: '<:Uncut_dragonstone:507042788555358208>',
		dragonSpear: '<:Dragon_spear:507042788584456192>',
		runeSpear: '<:Rune_spear:507043661624770560>',
		runeHasta: '<:Rune_hasta:507043661285163009>',
		runeLongsword: '<:Rune_longsword:507043661683621889>',
		dragonLongsword: '<:Dragon_longsword:507043661280706561>',
		dragonDagger: '<:Dragon_dagger:507043661524238347>'
	},
	kill(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(512)) loot.push(this.drops.dragonPlatelegs);
			if (this.roll(512)) loot.push(this.drops.dragonPlateskirt);
			if (this.roll(512)) loot.push(this.drops.uncutDragonstone);
			if (this.roll(512)) loot.push(this.drops.dragonSpear);

			if (this.roll(13)) loot.push(this.drops.runeSpear);
			if (this.roll(13)) loot.push(this.drops.runeHasta);
			if (this.roll(25)) loot.push(this.drops.runeLongsword);
			if (this.roll(85)) loot.push(this.drops.dragonLongsword);
			if (this.roll(128)) loot.push(this.drops.dragonDagger);
		}
		return loot.join(' ');
	},
	roll(max) {
		return Math.floor(Math.random() * max + 1) === 1;
	}
};

module.exports = brutalBlackDragon;
