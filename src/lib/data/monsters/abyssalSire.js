const abyssalSire = {
	drops: {
		bludgeonPieces: [
			'<:Bludgeon_claw:412841187184214027>',
			'<:Bludgeon_spine:412841187284877312>',
			'<:Bludgeon_axon:412841187259711488>'
		],
		abyssalHead: '<:Abyssal_head:412841187041345538>',
		pet: '<:Abyssal_orphan:324127375774449664>',
		abyssalDagger: '<:Abyssal_dagger:403386370388918273>',
		abyssalWhip: '<:Abyssal_whip:403386370686582804>',
		jarOfMiasma: '<:Jar_of_miasma:412841187331014657>'
	},
	kill(quantity) {
		const loot = [];
		let sired = 0;

		for (let i = 0; i < quantity; i++) {
			if (this.roll(100)) sired++;
		}

		for (let i = 0; i < sired; i++) {
			const sireRoll = Math.floor(Math.random() * 128 + 1);
			switch (true) {
				case sireRoll <= 10:
					loot.push(this.drops.abyssalHead);
					break;
				case sireRoll <= 15:
					loot.push(this.drops.pet);
					break;
				case sireRoll <= 41:
					loot.push(this.drops.abyssalDagger);
					break;
				case sireRoll <= 53:
					loot.push(this.drops.abyssalWhip);
					break;
				case sireRoll <= 115:
					loot.push(
						this.drops.bludgeonPieces[
							Math.floor(Math.random() * this.drops.bludgeonPieces.length)
						]
					);
					break;
				case sireRoll <= 128:
					loot.push(this.drops.jarOfMiasma);
					break;
			}
		}
		return loot.join(' ');
	},
	roll(max) {
		return Math.floor(Math.random() * max + 1) === 1;
	}
};

module.exports = abyssalSire;
