import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { BlowpipeData } from '../../lib/minions/types';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import getOSItem from '../../lib/util/getOSItem';
import { parseStringBank } from '../../lib/util/parseStringBank';

export const blowpipeDarts = [
	'Bronze dart',
	'Iron dart',
	'Steel dart',
	'Black dart',
	'Mithril dart',
	'Adamant dart',
	'Rune dart',
	'Amethyst dart',
	'Dragon dart'
].map(getOSItem);

export function validateBlowpipeData(data: BlowpipeData) {
	if (Object.keys(data).length !== 3) throw new Error('Failed BP validation');
	if (data.dartID === null && data.dartQuantity !== 0) throw new Error('Failed BP validation');
	if (data.dartID !== null && !blowpipeDarts.some(d => d.id === data.dartID)) {
		throw new Error('has a non-dart equipped');
	}
	if (data.dartQuantity < 0 || data.scales < 0) throw new Error('Less than 0 scales/darts');
}

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			altProtection: true,
			categoryFlags: ['minion', 'pvm', 'minigame'],
			description: 'See your minions achievement diary, and claim the rewards.',
			examples: ['+ad ardougne', '+ad', '+ad claim falador'],
			subcommands: true,
			usage: '[add|uncharge|removedarts] [items:...str]',
			usageDelim: ' ',
			aliases: ['bp']
		});
	}

	async run(msg: KlasaMessage) {
		const rawBlowpipeData = msg.author.settings.get(UserSettings.Blowpipe);
		const hasBlowpipe = msg.author.owns('Toxic blowpipe');
		if (!hasBlowpipe) {
			return msg.channel.send("You don't own a Toxic blowpipe.");
		}

		try {
			validateBlowpipeData(rawBlowpipeData);
		} catch (err: any) {
			await msg.author.settings.reset(UserSettings.Blowpipe);

			return msg.channel.send(
				`Your blowpipe got corrupted somehow (${err.message}), this shouldn't happen! It's a bug. Your blowpipe was reset.`
			);
		}
		let str = `**Toxic Blowpipe** <:Toxic_blowpipe:887011870068838450>

Zulrah's scales: ${rawBlowpipeData.scales.toLocaleString()}x
`;

		const item = rawBlowpipeData.dartID ? getOSItem(rawBlowpipeData.dartID) : null;
		if (item) {
			str += `${item.name}'s: ${rawBlowpipeData.dartQuantity!.toLocaleString()}x`;
		}

		return msg.channel.send(str);
	}

	async add(msg: KlasaMessage, [_items = '']: [string]) {
		if (msg.author.minionIsBusy) {
			return msg.channel.send("You can't add to your blowpipe, because your minion is out on a trip.");
		}
		if (!msg.author.owns('Toxic blowpipe') && msg.author.owns('Toxic blowpipe (empty)')) {
			await msg.author.removeItemsFromBank(new Bank().add('Toxic blowpipe (empty)'));
			await msg.author.addItemsToBank(new Bank().add('Toxic blowpipe'));
		}

		const hasBlowpipe = msg.author.owns('Toxic blowpipe');

		if (!hasBlowpipe) {
			return msg.channel.send("You don't own a Toxic blowpipe.");
		}

		const userBank = msg.author.bank();

		const items = parseStringBank(_items);
		let itemsToRemove = new Bank();
		for (const [item, quantity] of items) {
			if (!blowpipeDarts.includes(item) && item !== getOSItem("Zulrah's scales")) {
				return msg.channel.send("You can only charge your blowpipe with darts and Zulrah's scales.");
			}

			itemsToRemove.add(item.id, Math.max(1, quantity ?? userBank.amount(item.id)));
			if (itemsToRemove.length >= 2) break;
		}

		if (itemsToRemove.length === 0) {
			return msg.channel.send(
				`You didn't specify what items to add to your blowpipe, for example: \`${msg.cmdPrefix}bp add 10 Dragon dart, 10 Zulrah's scales\``
			);
		}

		const dart = itemsToRemove.items().find(i => blowpipeDarts.includes(i[0]));

		const rawBlowpipeData = msg.author.settings.get(UserSettings.Blowpipe);
		validateBlowpipeData(rawBlowpipeData);
		if (dart && !itemsToRemove.amount(dart[0].id)) {
			throw new Error('wtf! not meant to happen');
		}

		if (rawBlowpipeData.dartID !== null && dart && rawBlowpipeData.dartID !== dart[0].id) {
			return msg.channel.send(
				`You already have ${getOSItem(rawBlowpipeData.dartID).name}'s in your Blowpipe, do \`${
					msg.cmdPrefix
				}blowpipe removedarts\` to remove the darts from it.`
			);
		}

		let currentData: BlowpipeData = rawBlowpipeData ?? {
			scales: 0,
			dartID: null,
			dartQuantity: 0
		};
		validateBlowpipeData(currentData);
		currentData.scales += itemsToRemove.amount("Zulrah's scales");

		if (dart) {
			if (currentData.dartID !== null && dart[0].id !== currentData.dartID) {
				throw new Error('wtf');
			}
			currentData.dartID = dart[0].id;
			currentData.dartQuantity += itemsToRemove.amount(dart[0].id);
		}
		validateBlowpipeData(currentData);
		if (!userBank.has(itemsToRemove.bank)) {
			return msg.channel.send(`You don't own ${itemsToRemove}.`);
		}
		await msg.author.removeItemsFromBank(itemsToRemove);
		await msg.author.settings.update(UserSettings.Blowpipe, currentData);
		return msg.channel.send(`You added ${itemsToRemove} to your Toxic blowpipe.`);
	}

	async removedarts(msg: KlasaMessage) {
		if (msg.author.minionIsBusy) {
			return msg.channel.send("You can't remove darts from your blowpipe, because your minion is out on a trip.");
		}
		const hasBlowpipe = msg.author.owns('Toxic blowpipe');
		if (!hasBlowpipe) {
			return msg.channel.send("You don't own a Toxic blowpipe.");
		}

		const rawBlowpipeData = { ...msg.author.settings.get(UserSettings.Blowpipe) };
		if (!rawBlowpipeData.dartID || rawBlowpipeData.dartQuantity === 0) {
			return msg.channel.send('Your Toxic blowpipe has no darts in it.');
		}
		validateBlowpipeData(rawBlowpipeData);
		const returnedBank = new Bank().add(rawBlowpipeData.dartID, rawBlowpipeData.dartQuantity);
		rawBlowpipeData.dartQuantity = 0;
		await msg.author.addItemsToBank(returnedBank);
		await msg.author.settings.update(UserSettings.Blowpipe, rawBlowpipeData);

		return msg.channel.send(`You removed ${returnedBank} from your Toxic blowpipe.`);
	}

	async uncharge(msg: KlasaMessage) {
		if (msg.author.minionIsBusy) {
			return msg.channel.send("You can't uncharge your blowpipe, because your minion is out on a trip.");
		}
		const hasBlowpipe = msg.author.owns('Toxic blowpipe');
		if (!hasBlowpipe) {
			return msg.channel.send("You don't own a Toxic blowpipe.");
		}

		const rawBlowpipeData = { ...msg.author.settings.get(UserSettings.Blowpipe) };
		let returnedBank = new Bank();
		if (rawBlowpipeData.scales) {
			returnedBank.add("Zulrah's scales", rawBlowpipeData.scales);
		}
		if (rawBlowpipeData.dartID) {
			returnedBank.add(rawBlowpipeData.dartID, rawBlowpipeData.dartQuantity);
		}

		if (returnedBank.length === 0) {
			return msg.channel.send('You have no darts or scales in your Blowpipe.');
		}

		await msg.author.addItemsToBank(returnedBank);
		await msg.author.settings.update(UserSettings.Blowpipe, { scales: 0, dartID: null, dartQuantity: 0 });

		return msg.channel.send(`You removed ${returnedBank} from your Toxic blowpipe.`);
	}
}
