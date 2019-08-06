const sarachnis = {
	drops: {
		sarachnisCudgel: '<:Sarachnis_cudgel:608231007904202780>',
		sraracha: '<:Sraracha:608231007803670529>',
		jarOfEyes: '<:Jar_of_eyes:608231007812059137>'
	},
	kill(quantity) {
		const loot = [];
		for (let i = 0; i < quantity; i++) {
			if (this.roll(3000)) loot.push(this.drops.sraracha);
			if (this.roll(384)) loot.push(this.drops.sarachnisCudgel);
			if (this.roll(2000)) loot.push(this.drops.jarOfEyes);
		}
		return loot.join(' ');
	},
	roll(max) {
		return Math.floor(Math.random() * max + 1) === 1;
	}
};

module.exports = sarachnis;
