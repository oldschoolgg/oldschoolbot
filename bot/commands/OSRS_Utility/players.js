const { Command } = require('klasa');
const { Worlds } = require('oldschooljs');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			cooldown: 10,
			description: 'Shows how many people are playing OSRS.'
		});
	}

	async run(msg) {
		await Worlds.fetch();

		const sortedWorlds = Worlds.sort((a, b) => b.players - a.players);
		const totalCount = Worlds.reduce((acc, curr) => acc + curr.players, 0);
		const average = totalCount / Worlds.size;
		const highest = sortedWorlds.first();

		return msg.send(`
**Total players on OSRS**: ${totalCount.toLocaleString()}

**Average per world:** ${parseInt(average)}
**Highest world:** World ${highest.number} with ${highest.players} players
`);
	}
};
