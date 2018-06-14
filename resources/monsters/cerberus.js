const Monster = require('./Monster');
const cerberus = new Monster();

cerberus.drops = {
	crystals: [{
		smoulderingStone: '<:Smouldering_stone:403380366657978400>',
		eternalCrystal: '<:Eternal_crystal:403380366808973312>',
		pegasianCrystal: '<:Pegasian_crystal:403380366611578891>',
		primordialCrystal: '<:Primordial_crystal:403380366888665088>'
	}],
	jarOfSouls: '<:Jar_of_souls:403383744771391490>',
	hellpuppy: '<:Hellpuppy:324127376185491458>'
};

cerberus.randomCrystal = function randomCrystal() {
	const keys = Object.keys(this.drops.crystals);
	const randomKey = keys[Math.floor(Math.random() * keys.length)];
	return this.drops.crystals[randomKey];
};

cerberus.kill = function kill(quantity) {
	const loot = [];
	for (let i = 0; i < quantity; i++) {
		if (this.roll(128)) loot.push(this.randomCrystal());
		if (this.roll(2000)) loot.push(this.drops.jarOfSouls);
		if (this.roll(3000)) loot.push(this.drops.hellpuppy);
	}
	return loot.join(' ');
};

module.exports = cerberus;
