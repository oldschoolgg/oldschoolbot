const chaosElemental = {
	drops: {
		pet: '<:Pet_chaos_elemental:324127377070227456>',
		dragon2hSword: '<:Dragon_2h_sword:405250171593818112>',
		dragonPickaxe: '<:Dragon_pickaxe:406000287841779716>',
		clueScroll: '<:Clue_scroll:365003979840552960>'
	},
	kill(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(300)) loot.push(this.drops.pet);
			if (this.roll(128)) loot.push(this.drops.dragon2hSword);
			if (this.roll(256)) loot.push(this.drops.dragonPickaxe);
			if (this.roll(200)) loot.push(this.drops.clueScroll);
		}
		return loot.join(' ');
	},
	roll(max) {
		return Math.floor((Math.random() * max) + 1) === 1;
	}
};

module.exports = chaosElemental;
