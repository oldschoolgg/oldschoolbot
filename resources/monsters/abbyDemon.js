const abbyDemon = {
	drops: {
		abyssalDemonHead: '<:Abyssal_demon_head:403386370707423232>',
		abyssalWhip: '<:Abyssal_whip:403386370686582804>',
		abyssalDagger: '<:Abyssal_dagger:403386370388918273>',
		clueScroll: '<:Clue_scroll:365003979840552960>'
	},
	kill(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(6000)) loot.push(this.drops.abyssalDemonHead);
			if (this.roll(512)) loot.push(this.drops.abyssalWhip);
			if (this.roll(32768)) loot.push(this.drops.abyssalDagger);
			if (this.roll(1200)) loot.push(this.drops.clueScroll);
		}
		return loot.join(' ');
	},
	roll(max) {
		return Math.floor((Math.random() * max) + 1) === 1;
	}
};

module.exports = abbyDemon;
