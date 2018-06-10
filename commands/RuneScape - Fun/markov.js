const { Command } = require('klasa');
const MarkovChain = require('markovchain');
const fs = require('fs');
const markovSample = fs.readFileSync('./resources/markovSample.txt').toString('utf-8');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Markov chain generated from lots of runescape text.',
			cooldown: 10
		});
	}

	async run(msg) {
		const quotes = new MarkovChain(markovSample);
		const chain = quotes.start(this.useUpperCase).end(30).process();
		return msg.send(chain.substring(0, 1999));
	}
	useUpperCase(wordList) {
		const tmpList = Object.keys(wordList).filter((word) => word[0] >= 'A' && word[0] <= 'Z');
		return tmpList[Math.floor(Math.random() * tmpList.length)];
	}

};
