const hydra = {
	drops: {
		hydraTail: '<:Hydratail:545976358506070016>',
		ringPieces: [
			'<:Hydras_eye:545975448358748211>',
			'<:Hydras_fang:545975448580915210>',
			'<:Hydras_heart:545975448493096960>'
		],
		dragonWeaponry: [
			'<:Dragon_knife:545975448446828584>',
			'<:Dragon_thrownaxe:403018313187328010>'
		]
	},
	kill(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(1000)) loot.push(this.drops.hydraTail);
			if (this.roll(360))
				loot.push(
					this.drops.ringPieces[Math.floor(Math.random() * this.drops.ringPieces.length)]
				);
			if (this.roll(2000))
				loot.push(
					this.drops.dragonWeaponry[
						Math.floor(Math.random() * this.drops.dragonWeaponry.length)
					]
				);
		}
		return loot.join(' ');
	},
	roll(max) {
		return Math.floor(Math.random() * max + 1) === 1;
	}
};

module.exports = hydra;
