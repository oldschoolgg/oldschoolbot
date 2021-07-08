import { MessageAttachment } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { table } from 'table';

import { requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SlayerRewardsShop } from '../../lib/slayer/slayerUnlocks';
import { getSlayerReward } from '../../lib/slayer/slayerUtil';
import { BotCommand } from '../../lib/structures/BotCommand';
import { stringMatches, toTitleCase } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[unlock|lock|buy] [name:...string]',
			usageDelim: ' ',
			oneAtTime: true,
			cooldown: 5,
			altProtection: true,
			subcommands: true,
			aliases: ['sls', 'slshop'],
			description: 'Allows a player to purchase slayer unlocks.',
			examples: ['+sls unlock malevolent masqureade', '+slshop unlock slayer helmet'],
			categoryFlags: ['minion']
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage, [_input]: [string]) {
		if (msg.flagArgs.unlocks || msg.flagArgs.help || _input === 'help' || _input === 'unlocks') {
			const unlockTable = table([
				['Slayer Points', 'Name', 'Description', 'Type'],
				...SlayerRewardsShop.map(i => [
					i.slayerPointCost,
					i.name,
					i.desc,
					i.item !== undefined ? 'item/buy' : i.extendMult !== undefined ? 'extend' : 'unlock'
				])
			]);
			return msg.channel.send({
				files: [new MessageAttachment(Buffer.from(unlockTable), 'slayerRewardsItems.txt')]
			});
		}

		const myUnlocks = await msg.author.settings.get(UserSettings.Slayer.SlayerUnlocks);
		const myPoints = await msg.author.settings.get(UserSettings.Slayer.SlayerPoints);

		let unlocksStr = myUnlocks
			.map(mu => {
				return getSlayerReward(mu);
			})
			.join('\n');
		if (unlocksStr !== '') unlocksStr = `${unlocksStr}`;
		const defaultMsg =
			`Current points: ${myPoints}\n**You currently have the following ` +
			`rewards unlocked:**\n${unlocksStr}\n\n` +
			`Usage:\n\`${msg.cmdPrefix}slayershop [unlock|lock|buy] Reward\`\nExample:` +
			`\n\`${msg.cmdPrefix}slayershop unlock Malevolent Masquerade\``;
		if (defaultMsg.length > 2000) {
			return msg.channel.send({
				files: [new MessageAttachment(Buffer.from(defaultMsg.replace(/`/g, '')), 'currentUnlocks.txt')]
			});
		}
		return msg.channel.send(defaultMsg);
	}

	async buy(msg: KlasaMessage, [buyableName = '']: [string]) {
		if (msg.flagArgs.items || msg.flagArgs.help || buyableName === 'help') {
			const myUnlocks = SlayerRewardsShop.filter(srs => {
				return srs.item !== undefined;
			});
			const unlockTable = table([
				['Slayer Points', 'Name', 'Description', 'Type'],
				...myUnlocks.map(i => [i.slayerPointCost, i.name, i.desc, 'item/buy'])
			]);
			return msg.channel.send({
				files: [new MessageAttachment(Buffer.from(unlockTable), 'slayerRewardsItems.txt')]
			});
		}

		if (buyableName === '') {
			return msg.channel.send(`You must specify an item to purchase.\nTry:\n\`${msg.cmdPrefix}sls buy --help\``);
		}

		const buyable = SlayerRewardsShop.filter(i => {
			return i.item !== undefined && i.item > 0;
		}).find(
			item =>
				stringMatches(buyableName, item.name) ||
				(item.aliases && item.aliases.some(alias => stringMatches(alias, buyableName)))
		);

		if (!buyable) {
			return msg.channel.send(
				`I don't recognize that.\nTry: \`${msg.cmdPrefix}slayershop [buy|unlock|lock] --help\` for a list.`
			);
		}

		await msg.author.settings.sync(true);

		if (buyable.haveOne && (await msg.author.numberOfItemInBank(buyable.item!)) >= 1) {
			return msg.channel.send(`You can only have 1 ${buyable.name}`);
		}

		const curSlayerPoints = msg.author.settings.get(UserSettings.Slayer.SlayerPoints);
		const { slayerPointCost } = buyable;

		if (curSlayerPoints < slayerPointCost) {
			return msg.channel.send(
				`You need ${slayerPointCost} Slayer points to make this purchase.\nYou have: ${curSlayerPoints}`
			);
		}

		let purchaseMsg = `1x ${buyable.name} for ${slayerPointCost} Slayer points`;

		await msg.confirm(`${msg.author}, please confirm that you want to buy ${purchaseMsg}.`);

		await msg.author.settings.update(UserSettings.Slayer.SlayerPoints, curSlayerPoints - slayerPointCost);

		await msg.author.addItemsToBank({ [buyable.item!]: 1 }, true);

		return msg.channel.send(`You bought ${toTitleCase(buyable.name)} for ${slayerPointCost} Slayer points.`);
	}

	async unlock(msg: KlasaMessage, [buyableName = '']: [string]) {
		if (msg.flagArgs.items || msg.flagArgs.help || buyableName === 'help') {
			const myUnlocks = SlayerRewardsShop.filter(srs => {
				return srs.item === undefined;
			});
			const unlockTable = table([
				['Slayer Points', 'Name', 'Description', 'Type'],
				...myUnlocks.map(i => [
					i.slayerPointCost,
					i.name,
					i.desc,
					i.extendMult === undefined ? 'unlock' : 'extend'
				])
			]);
			return msg.channel.send({
				files: [new MessageAttachment(Buffer.from(unlockTable), 'slayerRewardsUnlocks.txt')]
			});
		}

		if (buyableName === '') {
			return msg.channel.send(
				`You must specify an item to purchase.\nTry:\n\`${msg.cmdPrefix}sls unlock --help\``
			);
		}

		const buyable = SlayerRewardsShop.filter(srs => {
			return srs.item === undefined;
		}).find(
			item =>
				stringMatches(buyableName, item.name) ||
				(item.aliases && item.aliases.some(alias => stringMatches(alias, buyableName)))
		);

		if (!buyable) {
			return msg.channel.send(
				`I don't recognize that.\nRun\`${msg.cmdPrefix}slayershop [buy|unlock|lock] --help\` for a list.`
			);
		}

		await msg.author.settings.sync(true);

		if (msg.author.settings.get(UserSettings.Slayer.SlayerUnlocks).includes(buyable.id)) {
			return msg.channel.send(`You have already unlocked ${buyable.name}`);
		}

		const curSlayerPoints = msg.author.settings.get(UserSettings.Slayer.SlayerPoints);
		const { slayerPointCost } = buyable;

		if (curSlayerPoints < slayerPointCost) {
			return msg.channel.send(
				`You need ${slayerPointCost} Slayer points to make this purchase.\nYou have: ${curSlayerPoints}`
			);
		}

		let purchaseMsg = `${buyable.name} for ${slayerPointCost} Slayer points`;

		await msg.confirm(`${msg.author}, please confirm that you want to unlock ${purchaseMsg}.`);

		await msg.author.settings.update(UserSettings.Slayer.SlayerPoints, curSlayerPoints - slayerPointCost);

		await msg.author.settings.update(UserSettings.Slayer.SlayerUnlocks, buyable.id);

		return msg.channel.send(`You unlocked ${toTitleCase(buyable.name)} for ${slayerPointCost} Slayer points.`);
	}

	async lock(msg: KlasaMessage, [toLockName = '']: [string]) {
		if (toLockName === '') {
			return msg.channel.send('You must specify an Unlock to remove.');
		}

		const buyable = SlayerRewardsShop.find(
			item =>
				(stringMatches(toLockName, item.name) ||
					(item.aliases && item.aliases.some(alias => stringMatches(alias, toLockName)))) &&
				item.canBeRemoved
		);

		if (!buyable || toLockName === 'help' || msg.flagArgs.help) {
			const myLocks = SlayerRewardsShop.filter(srs => {
				return srs.canBeRemoved === true;
			});
			const lockTable = table([
				['Slayer Points', 'Name', 'Description', 'Type'],
				...myLocks.map(i => [i.slayerPointCost, i.name, i.desc, i.extendMult === undefined ? 'lock' : 'extend'])
			]);
			return msg.channel.send({
				files: [
					new MessageAttachment(
						Buffer.from(lockTable),
						'slayerRewardsLocks.txt',
						"I don't recognize that item. Here is a list of unlocks you can re-lock."
					)
				]
			});
		}

		await msg.author.settings.sync(true);

		if (!msg.author.settings.get(UserSettings.Slayer.SlayerUnlocks).includes(buyable.id)) {
			return msg.channel.send(`You don't have ${buyable.name} unlocked, so you cannot remove it.`);
		}

		let removeMsg =
			`${buyable.name}. You will have to spend another ${buyable.slayerPointCost} ` +
			'to unlock it again if you change your mind.';

		await msg.confirm(`${msg.author}, please confirm that you want to **lock** ${removeMsg}.`);

		await msg.author.settings.update(UserSettings.Slayer.SlayerUnlocks, buyable.id);

		return msg.channel.send(`You re-locked ${removeMsg}.`);
	}
}
