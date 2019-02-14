const drake = {
	drops: {
		drakeTooth: '<Drakes tooth>',
		drakeClaw: '<Drakes claw>',
		dragonWeaponry: ['<Dragon knife>',
			'<Dragon thrownaxe>'],
		clueScroll: '<:Clue_scroll:365003979840552960>'
	},
	kill(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(512)) loot.push(this.drops.drakeTooth);
			if (this.roll(512)) loot.push(this.drops.drakeClaw);
			if (this.roll(2000)) loot.push(this.drops.dragonWeaponry[Math.floor(Math.random() * this.drops.dragonWeaponry.length)]);
			if (this.roll(128)) loot.push(this.drops.clueScroll);
		}
		return loot.join(' ');
	},
	roll(max) {
		return Math.floor((Math.random() * max) + 1) === 1;
	}
};

module.exports = drake;
