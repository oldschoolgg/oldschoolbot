const dagannothRex = {
	drops: {
		pet: '<:Pet_dagannoth_rex:324127377091330049>',
		clueScroll: '<:Clue_scroll:365003979840552960>',
		dragonAxe: '<:Dragon_axe:405265921309933588>',
		warriorRing: '<:Warrior_ring:421046902050783263>',
		ringOfLife: '<:Ring_of_life:421046902092595215>',
		berserkerRing: '<:Berserker_ring:421046901773697035>',
		airTalisman: '<:Air_talisman:421047764248690688>'
	},
	kill(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(5000)) loot.push(this.drops.pet);
			if (this.roll(750)) loot.push(this.drops.clueScroll);
			if (this.roll(128)) loot.push(this.drops.dragonAxe);
			if (this.roll(128)) loot.push(this.drops.warriorRing);
			if (this.roll(128)) loot.push(this.drops.ringOfLife);
			if (this.roll(128)) loot.push(this.drops.berserkerRing);
			if (this.roll(128)) loot.push(this.drops.airTalisman);
		}
		return loot.join(' ');
	},
	roll(max) {
		return Math.floor((Math.random() * max) + 1) === 1;
	}
};

module.exports = dagannothRex;
