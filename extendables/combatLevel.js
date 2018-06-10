const { Extendable } = require('klasa');

class combatLevel extends Extendable {

	constructor(...args) {
		super(...args, {
			appliesTo: ['Command'],
			enabled: true,
			klasa: true
		});
	}

	extend(Skills) {
		const base = 0.25 * (Skills.Defence.level + Skills.Hitpoints.level + Math.floor(Skills.Prayer.level / 2));
		const melee = 0.325 * (Skills.Attack.level + Skills.Strength.level);
		const range = 0.325 * (Math.floor(Skills.Ranged.level / 2) + Skills.Ranged.level);
		const mage = 0.325 * (Math.floor(Skills.Magic.level / 2) + Skills.Magic.level);
		return Math.floor(base + Math.max(melee, range, mage));
	}

}

module.exports = combatLevel;
