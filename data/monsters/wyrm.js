const wyrm = {
	drops: {
		dragonWeaponry: [
			'<:Dragon_knife:545975448446828584>',
			'<:Dragon_thrownaxe:403018313187328010>',
			'<:Dragon_sword:403018313078145025>',
			'<:Dragon_harpoon:403018313115893767>'
		],
		clueScroll: '<:Clue_scroll:365003979840552960>'
	},
	kill(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(2000))
				loot.push(
					this.drops.dragonWeaponry[
						Math.floor(Math.random() * this.drops.dragonWeaponry.length)
					]
				);
			if (this.roll(256)) loot.push(this.drops.clueScroll);
		}
		return loot.join(' ');
	},
	roll(max) {
		return Math.floor(Math.random() * max + 1) === 1;
	}
};

module.exports = wyrm;
