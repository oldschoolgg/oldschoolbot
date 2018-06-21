const armadyl = {
	drops: {
		shards: ['<:Godsword_shard_3:403049019040858112>',
			'<:Godsword_shard_2:403049019015954462>',
			'<:Godsword_shard_1:403049018764165121>'],
		armor: [
			'<:Armadyl_chainskirt:405262588222636042>',
			'<:Armadyl_helmet:405262588499329024>',
			'<:Armadyl_chestplate:405262588310454292>'
		],
		pet: '<:Pet_kreearra:324127377305239555>',
		armadylHilt: '<:Armadyl_hilt:405262588503523328>',
		curvedBone: '<:Curved_bone:405264444256681985>'
	},
	kill(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(128)) loot.push(this.drops.armor[Math.floor(Math.random() * this.drops.armor.length)]);
			if (this.roll(508)) loot.push(this.drops.armadylHilt);
			if (this.roll(5000)) loot.push(this.drops.pet);
			if (this.roll(5000)) loot.push();
			if (this.roll(86)) loot.push(this.drops.shards[Math.floor(Math.random() * this.drops.shards.length)]);
		}
		return loot.join(' ');
	},
	roll(max) {
		return Math.floor((Math.random() * max) + 1) === 1;
	}
};

module.exports = armadyl;
