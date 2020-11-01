import { roll } from '../../src/lib/util';

const drops = {
	blade: '<:Blade_of_saeldor_inactive:637345429868118046>',
	armorSeed: '<:Crystal_armour_seed:637345429805203466>',
	weaponSeed: '<:Crystal_weapon_seed:637345429620785174>',
	pet: '<:Youngllef:604670894798798858>'
};

const gauntlet = {
	kill(quantity: number, corrupted = false) {
		const loot = [];

		for (let i = 0; i < quantity; i++) {
			if (roll(corrupted ? 800 : 2000)) loot.push(drops.pet);
			if (roll(corrupted ? 50 : 120)) loot.push(drops.weaponSeed);
			if (roll(corrupted ? 50 : 120)) loot.push(drops.armorSeed);
			if (roll(corrupted ? 400 : 2000)) loot.push(drops.blade);
		}

		return loot.join(' ');
	}
};

export default gauntlet;
