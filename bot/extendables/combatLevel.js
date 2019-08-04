const { Extendable, Command } = require('klasa');

class combatLevel extends Extendable {
	constructor(...args) {
		super(...args, {
			appliesTo: [Command],
			enabled: true,
			klasa: true
		});
	}

	combatLevel({ Defence, Strength, Attack, Ranged, Magic, Prayer, Hitpoints }) {
		const base = 0.25 * (Defence.level + Hitpoints.level + Math.floor(Prayer.level / 2));
		const melee = 0.325 * (Attack.level + Strength.level);
		const range = 0.325 * (Math.floor(Ranged.level / 2) + Ranged.level);
		const mage = 0.325 * (Math.floor(Magic.level / 2) + Magic.level);
		return Math.floor(base + Math.max(melee, range, mage));
	}
}

module.exports = combatLevel;
