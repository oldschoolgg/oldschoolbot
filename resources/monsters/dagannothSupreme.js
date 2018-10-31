const dagannothSupreme = {
	drops: {
		pet: '<:Pet_dagannoth_supreme:324127377066164245>',
		clueScroll: '<:Clue_scroll:365003979840552960>',
		dragonAxe: '<:Dragon_axe:405265921309933588>',
		archersRing: '<:Archers_ring:456174721676083210>',
		archersHelm: '<:Archer_helm:506330718209835019>',
		seercull: '<:Seercull:456174387633324042>',
		airTalisman: '<:Air_talisman:421047764248690688>'
	},
	kill(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(5000)) loot.push(this.drops.pet);
			if (this.roll(750)) loot.push(this.drops.clueScroll);
			if (this.roll(128)) loot.push(this.drops.dragonAxe);
			if (this.roll(128)) loot.push(this.drops.archersRing);
			if (this.roll(128)) loot.push(this.drops.archersHelm);
			if (this.roll(128)) loot.push(this.drops.seercull);
			if (this.roll(128)) loot.push(this.drops.airTalisman);
		}
		return loot.join(' ');
	},
	roll(max) {
		return Math.floor((Math.random() * max) + 1) === 1;
	}
};

module.exports = dagannothSupreme;
