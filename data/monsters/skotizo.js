const skotizo = {
	drops: {
		uncutOnyx: '<:Uncut_onyx:403059676402679808>',
		pet: '<:Skotos:324127378890817546>',
		shieldLeftHalf: '<:Shield_left_half:417703739349139466>',
		darkClaw: '<:Dark_claw:417703739218984960>',
		jarOfDarkness: '<:Jar_of_darkness:417703738858536972>'
	},
	kill(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(1000)) loot.push(this.drops.uncutOnyx);
			if (this.roll(65)) loot.push(this.drops.pet);
			if (this.roll(100)) loot.push(this.drops.shieldLeftHalf);
			if (this.roll(25)) loot.push(this.drops.darkClaw);
			if (this.roll(2500)) loot.push(this.drops.jarOfDarkness);
		}
		return loot.join(' ');
	},
	roll(max) {
		return Math.floor(Math.random() * max + 1) === 1;
	}
};

module.exports = skotizo;
