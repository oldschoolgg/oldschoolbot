const { Command } = require('klasa');
const { MessageAttachment } = require('discord.js');
const { Clues, Items } = require('oldschooljs');
const { Beginner, Easy, Medium, Hard, Elite, Master } = Clues;

const uniqueItems = require('../../../data/rareClueItems');

const ClueTiers = [
	{
		name: 'Beginner',
		table: Beginner,
		casketImage: 23245
	},
	{
		name: 'Easy',
		table: Easy,
		casketImage: 20543
	},
	{
		name: 'Medium',
		table: Medium,
		casketImage: 20544
	},
	{
		name: 'Hard',
		table: Hard,
		casketImage: 20545
	},
	{
		name: 'Elite',
		table: Elite,
		casketImage: 20546
	},
	{
		name: 'Master',
		table: Master,
		casketImage: 19836
	}
];

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			cooldown: 1,
			aliases: ['clue'],
			usage: '<ClueTier:string> [quantity:int{1}]',
			usageDelim: ' '
		});
	}
	async run(msg, [tier, quantity = 1]) {
		if (quantity > 5 && msg.author.id !== '157797566833098752') {
			throw `I can only open 5 caskets at a time!`;
		}

		const clueTier = ClueTiers.find(_tier => _tier.name.toLowerCase() === tier.toLowerCase());
		if (!clueTier) {
			throw `Not a valid clue tier. The valid tiers are: ${ClueTiers.map(
				_tier => _tier.name
			).join(', ')}`;
		}
		const lootResult = clueTier.table.open(quantity);

		const loot = {};

		for (const casketResult of lootResult) {
			for (const item of casketResult) {
				if (!uniqueItems.has(item.item)) continue;
				if (!loot[item.item]) loot[item.item] = item.quantity;
				else loot[item.item] += item.quantity;
			}
		}
		const opened = `You opened ${quantity} ${clueTier.name} Clue Casket${
			quantity > 1 ? 's' : ''
		}`;

		if (Object.keys(loot).length === 0) return msg.send(`${opened} and got nothing :(`);

		const image = await this.client.tasks.get('bankImage').generateBankImage(loot);

		return msg.send(new MessageAttachment(image, 'osbot.png'));
	}
};
