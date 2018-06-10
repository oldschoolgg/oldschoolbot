const { Command } = require('klasa');
const moment = require('moment');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 3,
			description: 'Shows the creation date/avg playtime of your account. See: https://i.imgur.com/PPviStZ.png',
			usage: '<playtime:int{1,10000}> <arrival:int{1,10000}>',
			usageDelim: ' '
		});
	}

	async run(msg, [playtime, arrival]) {
		const creationDate = moment()
			.subtract(arrival, 'd')
			.format('MMMM Do YYYY');
		const average = (playtime * 24 / arrival).toFixed(2);
		return msg.send(`
  Your account was made on: ${creationDate}, and you've played an average of ${average} Hours per day.`);
	}

};
