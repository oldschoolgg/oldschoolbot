import { CommandStore, KlasaMessage } from 'klasa';

import { Time } from '../../lib/constants';
import { SlayerRewardsShop } from '../../lib/slayer/slayerUtil';
import { requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { stringMatches, toTitleCase } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[unlock|lock] [name:...string]',
			usageDelim: ' ',
			oneAtTime: true,
			cooldown: 5,
			altProtection: true,
			subcommands: true,
			aliases: ['tfs', 'tfshop'],
			description: `Allows a player to purchase farmer's items from the tithefarm shop.`,
			examples: ['+tfs farmers hat', '+tithefarmshop farmers jacket'],
			categoryFlags: ['minion']
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage, [_input]: [string]) {
		throw `Usage:\n\`${msg.cmdPrefix}slayeshop [unlock|lock] Reward\`\n\nExample:` +
			`\n\n\`${msg.cmdPrefix}slayershop unlock Malevolent Masquerade\``;
	}
	async unlock(msg: KlasaMessage, [buyableName = '']: [string]) {
		if (buyableName === '') {
			throw `You must specify an Unlock to purchase.`;
		}

		const buyable = SlayerRewardsShop.find(
			item =>
				stringMatches(buyableName, item.name) ||
				(item.aliases && item.aliases.some(alias => stringMatches(alias, buyableName)))
		);

		if (!buyable) {
			throw `I don't recognize that, the unlocks you can buy are: ${SlayerRewardsShop.map(
				item => `${item.name}: ${item.desc}`
			).join(`\n`)}.`;
		}

		await msg.author.settings.sync(true);

		if (
			msg.author.settings.get(UserSettings.Slayer.SlayerUnlocks)
				.includes(buyable.id)
		) {
			return msg.channel.send(`You have already unlocked ${buyable.name}`);
		}

		const curSlayerPoints = msg.author.settings.get(UserSettings.Slayer.SlayerPoints);
		const slayerPointCost = buyable.slayerPointCost;

		if (curSlayerPoints < slayerPointCost) {
			throw `You need ${slayerPointCost} Slayer points to make this purchase.\n` +
			`You have: ${curSlayerPoints}`;
		}

		let purchaseMsg = `${buyable.name} for ${slayerPointCost} Slayer points`;

		if (!msg.flagArgs.cf && !msg.flagArgs.confirm) {
			const sellMsg = await msg.channel.send(
				`${msg.author}, say \`confirm\` to confirm that you want to unlock ${purchaseMsg}.`
			);

			// Confirm the user wants to buy
			try {
				await msg.channel.awaitMessages(
					_msg =>
						_msg.author.id === msg.author.id &&
						_msg.content.toLowerCase() === 'confirm',
					{
						max: 1,
						time: Time.Second * 15,
						errors: ['time']
					}
				);
			} catch (err) {
				return sellMsg.edit(
					`Cancelling unlock of ${toTitleCase(buyable.name)}.`
				);
			}
		}

		await msg.author.settings.update(
			UserSettings.Slayer.SlayerPoints,
			curSlayerPoints - slayerPointCost
		);

		await msg.author.settings.update(UserSettings.Slayer.SlayerUnlocks, buyable.id);

		return msg.send(
			`You unlocked ${toTitleCase(buyable.name)} for ${slayerPointCost} Slayer points.`
		);
	}
	async lock(msg: KlasaMessage, [toLockName = '']: [string]) {
		if (toLockName === '') {
			throw `You must specify an Unlock to remove.`;
		}

		const buyable = SlayerRewardsShop.find(
			item =>
				(
					stringMatches(toLockName, item.name) ||
					(item.aliases && item.aliases.some(alias => stringMatches(alias, toLockName)))
				) &&
				item.canBeRemoved
		);

		if (!buyable) {
			throw `I don't recognize that, the unlocks you can remove are: ${SlayerRewardsShop.map(
				item => item.canBeRemoved ? `${item.name}: ${item.desc}` : ''
			).join(`\n`)}.`;
		}

		await msg.author.settings.sync(true);

		if (
			!msg.author.settings.get(UserSettings.Slayer.SlayerUnlocks)
				.includes(buyable.id)
		) {
			return msg.channel.send(`You don't have ${buyable.name} unlocked, so you cannot remove it.`);
		}

		let removeMsg = `${buyable.name}. You will have to spend another ${buyable.slayerPointCost} ` +
			`to unlock it again if you change your mind.`;

		if (!msg.flagArgs.cf && !msg.flagArgs.confirm) {
			const sellMsg = await msg.channel.send(
				`${msg.author}, say \`confirm\` to confirm that you want to unlock ${removeMsg}.`
			);

			// Confirm the user wants to buy
			try {
				await msg.channel.awaitMessages(
					_msg =>
						_msg.author.id === msg.author.id &&
						_msg.content.toLowerCase() === 'confirm',
					{
						max: 1,
						time: Time.Second * 15,
						errors: ['time']
					}
				);
			} catch (err) {
				return sellMsg.edit(
					`Cancelling lock of ${toTitleCase(buyable.name)}.`
				);
			}
		}

		await msg.author.settings.update(UserSettings.Slayer.SlayerUnlocks, buyable.id);

		return msg.send(
			`You re-locked ${removeMsg}.`
		);
	}
}
