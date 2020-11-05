const hespori = {
	drops: {
		pet: '<:Tangleroot:324127378978635778>',
		bucket: '<:Bottomless_compost_bucket:545978484078411777>'
	},
	kill(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(7000)) loot.push(this.drops.pet);
			if (this.roll(35)) loot.push(this.drops.bucket);
		}
		return loot.join(' ');
	},
	finish() {
		const lootMSG = [];
		const loot = [];
		let kc = 0;
		while (loot.length < 1) {
			kc++;
			if (!loot.includes('BCB') && this.roll(35)) {
				loot.push('BCB');
				lootMSG.push(
					`**Bottomless Compost Bucket:** ${kc.toLocaleString()} KC ${this.drops.bucket}`
				);
			}
		}
		return [kc, lootMSG.join('\n')];
	},
	roll(max) {
		return Math.floor(Math.random() * max + 1) === 1;
	}
};

module.exports = hespori;
