const drake = {
	drops: {
		drakeTooth: '<:Drakes_tooth:545977597079715840>',
		drakeClaw: '<:Drakes_claw:545977596714811393>',
		dragonWeaponry: [
			'<:Dragon_knife:545975448446828584>',
			'<:Dragon_thrownaxe:403018313187328010>'
		],
		clueScroll: '<:Clue_scroll:365003979840552960>'
	},
	kill(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(512)) loot.push(this.drops.drakeTooth);
			if (this.roll(512)) loot.push(this.drops.drakeClaw);
			if (this.roll(2000))
				loot.push(
					this.drops.dragonWeaponry[
						Math.floor(Math.random() * this.drops.dragonWeaponry.length)
					]
				);
			if (this.roll(128)) loot.push(this.drops.clueScroll);
		}
		return loot.join(' ');
	},
	roll(max) {
		return Math.floor(Math.random() * max + 1) === 1;
	}
};

module.exports = drake;
