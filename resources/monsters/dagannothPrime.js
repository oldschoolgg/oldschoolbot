const dagannothPrime = {
	drops: {
		pet: '<:Pet_dagannoth_prime:324127376877289474>',
		clueScroll: '<:Clue_scroll:365003979840552960>',
		dragonAxe: '<:Dragon_axe:405265921309933588>',
		seersRing: '<:Seers_ring:456175344723034122>',
		farseerHelm: '<:farseer helm',
		mudBattlestaff: '<:Mud_battlestaff:456175019345838083>',
		airTalisman: '<:Air_talisman:421047764248690688>'
	},
	kill(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(5000)) loot.push(this.drops.pet);
			if (this.roll(750)) loot.push(this.drops.clueScroll);
			if (this.roll(128)) loot.push(this.drops.dragonAxe);
			if (this.roll(128)) loot.push(this.drops.seersRing);
			if (this.roll(128)) loot.push(this.drops.farseerHelm);
			if (this.roll(128)) loot.push(this.drops.mudBattlestaff);
			if (this.roll(128)) loot.push(this.drops.airTalisman);
		}
		return loot.join(' ');
	},
	roll(max) {
		return Math.floor((Math.random() * max) + 1) === 1;
	}
};

module.exports = dagannothPrime;
