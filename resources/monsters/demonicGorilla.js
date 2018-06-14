const demonicGorilla = {
	drops: {
		zenyteShard: '<:Zenyte_shard:405245077972320256>',
		ballistaLimbs: '<:Ballista_limbs:405245077280129025>',
		ballistaSpring: '<:Ballista_spring:405245077590507531>',
		lightFrame: '<:Light_frame:405245077808742400>',
		heavyFrame: '<:Heavy_frame:405245077754216448>',
		monkeyTail: '<:Monkey_tail:405245077670068225>'
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

module.exports = demonicGorilla;
