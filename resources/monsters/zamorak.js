const abbyDemon = {
	drops: {
		shards: ['<:Godsword_shard_3:403049019040858112>',
			'<:Godsword_shard_2:403049019015954462>',
			'<:Godsword_shard_1:403049018764165121>'],
		pet: '<:Pet_kril_tsutsaroth:324127377527406594>',
		staffOfTheDead: '<:Staff_of_the_dead:405251862695116801>',
		runeSword: '<:Abyssal_whip:403386370686582804>',
		zamorakianSpear: '<:Abyssal_dagger:403386370388918273>',
		steamBattlestaff: '<:Clue_scroll:365003979840552960>',
		zamorakHilt: '<:Pet_kril_tsutsaroth:324127377527406594>'
	},
	kill(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(5000)) loot.push(this.drops.pet);
			if (this.roll(508)) loot.push(this.drops.staffOfTheDead);
			if (this.roll(508)) loot.push(this.drops.zamorakHilt);
			if (this.roll(406)) loot.push(this.drops.runeSword);
			if (this.roll(128)) loot.push(this.drops.zamorakianSpear);
			if (this.roll(128)) loot.push(this.drops.steamBattlestaff);
			if (this.roll(86)) loot.push(this.drops.shards[Math.floor(Math.random() * this.drops.shards.length)]);
		}
		return loot.join(' ');
	},
	roll(max) {
		return Math.floor((Math.random() * max) + 1) === 1;
	}
};

module.exports = abbyDemon;
