const { Task } = require('klasa');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

module.exports = class extends Task {
	async init() {
		this.run();
	}

	async run() {
		const body = await fetch(
			'http://services.runescape.com/m=poll/oldschool/index.ws',
		).then(res => res.text());

		const test = body.split('">Click here to view results')[0].split('href="')[9];

		let description = cheerio
		.load(body.split('<div class="previous">')[1].split('<a href="result')[0])
		.text()
		.replace('This poll will close', 'This poll closed');

		const title = description.split('\n')[0];

		description = description.replace(title, '');

		const html = await fetch(`http://services.runescape.com/m=poll/oldschool/${test}`)
		.then(res => res.text())
		.then(cheerio.load);

		const polls = html('.question');

		const questions = [];
		// eslint-disable-next-line array-callback-return
		polls.map((index, pollElement) => {
			const obj = {
				question: pollElement.children.find(el => el.name === 'b').children[0].data,
				votes: {},
			};

			pollElement.children
					   .find(el => el.name === 'table')
					   .children.find(el => el.name === 'tbody')
					   .children.filter(el => el.name === 'tr')
			// eslint-disable-next-line array-callback-return
					   .map(el => {
						   const [type, votes] = el.children
												   .filter(td => td.name === 'td' && td.children[0].data)
												   .map(td => td.children[0].data);
						   obj.votes[type] = votes;
					   });

			questions.push(obj);
		});

		const { errors } = this.client.settings.update('pollQuestions', {
			title,
			description,
			questions,
		});
		if (errors) this.client.emit('wtf', errors);
	}
};
