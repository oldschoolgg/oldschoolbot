const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, { description: 'See how long it takes you to get a Dragon Defender.' });
	}

	async run(msg) {
		let KC = 0;
		let DKC = 0;
		let defenders = 0;
		while (defenders < 7) {
			if (this.roll(50)) {
				defenders++;
				KC++;
				continue;
			}
			KC++;
		}
		while (defenders < 8) {
			if (this.roll(100)) {
				defenders++;
				DKC++;
				continue;
			}
			DKC++;
		}
		return msg.send(`You had to kill ${KC} Cyclops to get up to a Rune Defender, and then another ${DKC} for the Dragon Defender.`);
	}

};
