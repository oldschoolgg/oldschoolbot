const wintertodt = {
	drops: {
		pet: '<:Phoenix:324127378223792129>',
		dragonAxe: '<:Dragon_axe:405265921309933588>',
		tomeOfFire: '<:Tome_of_fire_empty:405265922287468544>',
		pyromancerGarb: '<:Pyromancer_garb:405265922199257088>',
		pyromancerHood: '<:Pyromancer_hood:405265921872232448>',
		pyromancerBoots: '<:Pyromancer_boots:405265921603534848>',
		pyromancerRobe: '<:Pyromancer_robe:405265921553334283>',
		warmGloves: '<:Warm_gloves:405265922396258334>',
		brumaTorch: '<:Bruma_torch:421038270823006218>'
	},
	kill(quantity) {
		const loot = [];
		// droprates are based on 500 pts
		for (let i = 0; i < quantity; i++) {
			if (this.roll(2500)) loot.push(this.drops.pet);
			if (this.roll(5000)) loot.push(this.drops.dragonAxe);
			if (this.roll(500)) loot.push(this.drops.tomeOfFire);
			if (this.roll(75)) loot.push(this.drops.pyromancerGarb);
			if (this.roll(75)) loot.push(this.drops.pyromancerHood);
			if (this.roll(75)) loot.push(this.drops.pyromancerBoots);
			if (this.roll(75)) loot.push(this.drops.pyromancerRobe);
			if (this.roll(75)) loot.push(this.drops.warmGloves);
			if (this.roll(75)) loot.push(this.drops.brumaTorch);
		}
		return loot.join(' ');
	},
	roll(max) {
		return Math.floor(Math.random() * max + 1) === 1;
	}
};

module.exports = wintertodt;
