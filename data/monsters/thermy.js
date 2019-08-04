const thermy = {
	drops: {
		pet: '<:Pet_smoke_devil:324127377493852162>',
		clueScroll: '<:Clue_scroll:365003979840552960>',
		crystalKey: '<:Crystal_key:412845362261524480>',
		dragonChainbody: '<:Dragon_chainbody:405250171719647232>',
		occultNecklace: '<:Occult_necklace:412845632089358336>',
		smokeBattlestaff: '<:Smoke_battlestaff:412845709575061506>',
		ancientStaff: '<:Ancient_staff:412845709453426689>'
	},
	kill(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(3000)) loot.push(this.drops.pet);
			if (this.roll(500)) loot.push(this.drops.clueScroll);
			if (this.roll(128)) loot.push(this.drops.crystalKey);
			if (this.roll(2000)) loot.push(this.drops.dragonChainbody);
			if (this.roll(350)) loot.push(this.drops.occultNecklace);
			if (this.roll(512)) loot.push(this.drops.smokeBattlestaff);
			if (this.roll(129)) loot.push(this.drops.ancientStaff);
		}
		return loot.join(' ');
	},
	roll(max) {
		return Math.floor(Math.random() * max + 1) === 1;
	}
};

module.exports = thermy;
