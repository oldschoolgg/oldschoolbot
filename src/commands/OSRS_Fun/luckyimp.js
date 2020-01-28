const { Command } = require('klasa');
const {
	Items,
	Monsters: { LuckyImp }
} = require('oldschooljs');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			cooldown: 1,
			usage: '[quantity:int{1}]',
			usageDelim: ' '
		});
	}
	async run(msg, [qty = 1]) {
		if (qty > 10 && msg.author.id !== '157797566833098752') {
			throw `I can only catch 10 Lucky Imps at a time!`;
		}

		const loot = LuckyImp.kill();

		const opened = `You caught ${qty} Lucky Imp${qty > 1 ? 's' : ''}`;

		if (Object.keys(loot).length === 0) return msg.send(`${opened} and got nothing :(`);

		let display = `${opened} and received...\n`;
		for (const [itemID, quantity] of Object.entries(loot)) {
			display += `**${Items.get(parseInt(itemID)).name}:** ${quantity.toLocaleString()}`;
			if (itemID === '9185') {
				display += ' <:swampletics:656224747587108912>';
			}
			if (quantity === 73) {
				display += ' <:bpaptu:660333438292983818>';
			}
			display += '\n';
		}

		return msg.sendLarge(display, `loot-from-${qty}-lucky-imps.txt`);
	}
};
