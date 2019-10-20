const { roll, rand } = require('../../config/util');
const Items = require('./utils/commonLoot');
const LootTable = require('./utils/LootTable');

const drops = {
	uniques: [6571, 12932, 12927, 12922],
	mutagens: [13200, 13201],
	pet: 12921,
	jarOfSwamp: 12936,
	scales: 12934
};

const randomUnique = () => drops.uniques[Math.floor(Math.random() * drops.uniques.length)];
const randomMutagen = () => drops.mutagens[Math.floor(Math.random() * drops.mutagens.length)];

const NormalTable = new LootTable()
	/* Armour & Weapons */
	.add(Items.dragonMedHelm, 2)
	.add(Items.dragonHalberd, 2)
	.add(Items.battlestaff, 10, 10)
	/* Runes */
	.add(Items.pureEssence, 12, 200)
	.add(Items.chaosRune, 12, 500)
	.add(Items.deathRune, 12, 300)
	/* Herbs */
	.add(Items.snapdragon, 2, 10)
	.add(Items.dwarfWeed, 2, 30)
	.add(Items.torstol, 2, 25)
	.add(Items.toadflax, 2, 10)
	/* Materials */
	.add(Items.snakeskin, 11, 35)
	.add(Items.runiteOre, 11, 2)
	.add(Items.pureEssence, 10, 1500)
	.add(Items.flax, 10, 1000)
	.add(Items.yewLogs, 10, 35)
	.add(Items.adamantiteBar, 8, 20)
	.add(Items.coal, 8, 200)
	.add(Items.dragonBones, 8, 12)
	.add(Items.mahoganyLogs, 8, 50)
	/* Seeds */
	.add(Items.palmTreeSeed, 6)
	.add(Items.papayaTreeSeed, 6, 3)
	.add(Items.calquatTreeSeed, 6, 2)
	.add(Items.magicSeed, 4)
	.add(Items.toadflaxSeed, 2, 2)
	.add(Items.snapdragonSeed, 2)
	.add(Items.dwarfWeedSeed, 2, 2)
	.add(Items.torstolSeed, 2)
	.add(Items.spiritSeed, 1)
	/* Other */
	.add(Items.zulAndraTeleport, 15, 4)
	.add(Items.mantaRay, 35, 12)
	.add(Items.antidote24, 9, 10)
	.add(Items.dragonstoneBoltTips, 8, 12)
	.add(Items.grapes, 6, 250)
	.add(Items.grapes, 6, 250)
	.add(Items.coconut, 5, 20)
	.add(drops.scales, 5, 500);

const zulrah = {
	kill(quantity) {
		const loot = {};

		function addLoot(item, quantityToAdd = 1) {
			if (!loot[item]) loot[item] = quantityToAdd;
			else loot[item] += quantityToAdd;
		}

		for (let i = 0; i < quantity; i++) {
			if (roll(5000)) addLoot(drops.pet);
			if (roll(3277)) addLoot(randomMutagen());
			if (roll(3000)) addLoot(drops.jarOfSwamp);
			if (roll(128)) addLoot(randomUnique());

			const firstRoll = NormalTable.roll();
			if (firstRoll) addLoot(firstRoll.item, firstRoll.quantity);

			const secondRoll = NormalTable.roll();
			if (secondRoll) addLoot(secondRoll.item, secondRoll.quantity);

			addLoot(drops.scales, rand(100, 299));
		}

		return loot;
	}
};

module.exports = zulrah;
