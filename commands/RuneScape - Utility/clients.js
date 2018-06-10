const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 1,
			description: 'Shows all the clients you can play OSRS on.'
		});
	}

	async run(msg) {
		msg.send(`
<:OldSchoolRS:418691700068843521> **Official Client:** Fast, Stable, Light. No extra features. Other clients are not officially supported, use at own risk.
<http://www.runescape.com/oldschool/download>
<:RuneLite:418690749719117834> **RuneLite:** Open-source, make your own plugins. Free.
<https://runelite.net/>
<:Konduit:418690746082656257> **Konduit:** Free, Fast, lots of features.
<https://konduit.io/>
<:OSBuddy:418690747022180353> **OSBuddy:** Paid features, OpenGL, high memory usage.
<https://rsbuddy.com/osbuddy>
`);
	}

};
