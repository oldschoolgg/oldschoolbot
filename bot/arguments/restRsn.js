const { Argument } = require('klasa');

module.exports = class extends Argument {

	constructor(...args) {
		super(...args, { name: '...rsn', aliases: ['...rsn'] });
	}

	get rsnArg() {
		return this.store.get('rsn');
	}

	run(arg, possible, message) {
		if (!arg) return this.rsnArg.run(arg, possible, message);
		const {
			args,
			usage: { usageDelim }
		} = message.prompter;
		const index = args.indexOf(arg);
		const rest = args.splice(index, args.length - index).join(usageDelim);
		return this.rsnArg.run(rest, possible, message);
	}

};
