const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

const { toTitleCase } = require('../../../config/util');

const badgeMap = {
	im: '<:ironman:626647335900020746>',
	hcim: '<:hardcore_ironman:626647335283326978>',
	uim: '<:ultimate_ironman:626647335765671936>',
	normal: ''
};

module.exports = class extends Command {
	constructor(...args) {
		super(...args, { description: 'Shows the collections link.', enabled: true });
	}

	async run(msg) {
		const collectionsForUser = await this.client.osggDB
			.collection('account_collections')
			// eslint-disable-next-line camelcase
			.find({ user_id: msg.author.id })
			.toArray();

		if (collectionsForUser.length === 0) {
			return msg.send(`Create online, shareable collections to show how many items you've collected on your account -  <https://www.oldschool.gg/collections>
			
100% free, no ads, no personal data is collected. No sign up required, just log in with discord.`);
		}

		const embed = new MessageEmbed()
			.setTitle(`${msg.author.username}'s Collections`)
			.setColor(14981973)
			.setDescription(
				collectionsForUser.map(
					col =>
						`${badgeMap[col.account_type]} [${toTitleCase(
							col.username
						)}](https://www.oldschool.gg/collection/${encodeURIComponent(col.slug)}) `
				)
			);

		return msg.send(embed);
	}
};
