const { Command } = require('klasa');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, { description: 'Shows all the clients you can play OSRS on.' });
	}

	async run(msg) {
		return msg.send(`
<:OldSchoolRS:418691700068843521> **Official Client:** Fast, Stable, Light.
<http://www.runescape.com/oldschool/download>


<:RuneLite:418690749719117834> **RuneLite:** Open-source, make your own plugins. Free. **This is an unofficial client
and is *not* supported by Jagex. Use at your own risk.**
<https://runelite.net/>
`);
	}
};
