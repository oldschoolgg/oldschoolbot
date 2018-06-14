const callisto = {
	drops: {
		pet: '<:Callisto_cub:324127376273440768>',
		tyrannicalRing: '<:Tyrannical_ring:406000288290570260>',
		dragon2hSword: '<:Dragon_2h_sword:405250171593818112>',
		dragonPickaxe: '<:Dragon_pickaxe:406000287841779716>'
	},
	kill(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(2000)) loot.push(this.drops.pet);
			if (this.roll(512)) loot.push(this.drops.tyrannicalRing);
			if (this.roll(256)) loot.push(this.drops.dragon2hSword);
			if (this.roll(171)) loot.push(this.drops.dragonPickaxe);
		}
		return loot.join(' ');
	},
	roll(max) {
		return Math.floor((Math.random() * max) + 1) === 1;
	}
};

module.exports = callisto;
