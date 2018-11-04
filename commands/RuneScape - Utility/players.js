const { Command } = require('klasa');
const { parseTable } = require('../../resources/util');
const fetch = require('node-fetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 10,
			description: 'Shows how many people are playing OSRS.'
		});
	}

	toNum(str) {
		return parseInt(str.replace(/\D/g, ''));
	}

	async run(msg) {
		let worlds = await fetch('http://oldschool.runescape.com/slu')
			.then(res => res.text())
			.then(parseTable);

		let totalPlayers = 0;
		worlds = worlds.filter(world => world.players.includes('players'))
			.map(world => {
				if (!world.players.includes('players')) console.log(world.players);
				const players = this.toNum(world.players);
				totalPlayers += this.toNum(world.players);
				return {
					...world,
					number: this.toNum(world.name),
					players
				};
			})
			.sort((a, b) => b.players - a.players);

		const average = parseInt(totalPlayers / worlds.length);
		const highest = worlds[0];

		return msg.send(`
**Total players on OSRS**: ${totalPlayers.toLocaleString()}

**Average per world:** ${average}
**Highest world:** World ${highest.number} with ${highest.players} players
`);
	}

};
