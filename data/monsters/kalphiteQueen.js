const kalphiteQueen = {
	drops: {
		pet: '<:Kalphite_princess_2nd_form:324127376915300352>',
		jarOfSand: '<:Jar_of_sand:405249792839647232>',
		kqHead: '<:Kq_head:405249792567148545>',
		clueScroll: '<:Clue_scroll:365003979840552960>',
		dragon2hSword: '<:Dragon_2h_sword:405250171593818112>',
		dragonChainbody: '<:Dragon_chainbody:405250171719647232>'
	},
	kill(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(3000)) loot.push(this.drops.pet);
			if (this.roll(2000)) loot.push(this.drops.jarOfSand);
			if (this.roll(128)) loot.push(this.drops.kqHead);
			if (this.roll(100)) loot.push(this.drops.clueScroll);
			if (this.roll(256)) loot.push(this.drops.dragon2hSword);
			if (this.roll(128)) loot.push(this.drops.dragonChainbody);
		}
		return loot.join(' ');
	},
	roll(max) {
		return Math.floor((Math.random() * max) + 1) === 1;
	}
};

module.exports = kalphiteQueen;
