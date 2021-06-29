import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { BitField } from '../../lib/constants';
import { requiresMinion } from '../../lib/minions/decorators';
import { getPOHObject, GroupedPohObjects, itemsNotRefundable, PoHObjects } from '../../lib/poh';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { PoHTable } from '../../lib/typeorm/PoHTable.entity';
import { itemID, itemNameFromID, stringMatches, updateBankSetting } from '../../lib/util';
import getOSItem from '../../lib/util/getOSItem';
import PoHImage from '../../tasks/pohImage';

const wallkits = [
	{
		bitfield: null,
		name: 'Default',
		imageID: 1
	},
	{
		bitfield: BitField.HasHosidiusWallkit,
		name: 'Hosidius',
		imageID: 2
	}
];

export default class POHCommand extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			altProtection: true,
			categoryFlags: ['minion'],
			description: 'Allows you to access and build in your POH.',
			examples: ['+poh build demonic throne', '+poh', '+poh items', '+poh destroy demonic throne'],
			subcommands: true,
			usage: '[build|destroy|items|mountItem|wallkit|list] [input:...str]',
			usageDelim: ' '
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage) {
		const poh = await msg.author.getPOH();
		return msg.channel.send({ files: [await this.genImage(poh)] });
	}

	@requiresMinion
	async wallkit(msg: KlasaMessage, [input]: [string]) {
		const poh = await msg.author.getPOH();
		const currentWallkit = wallkits.find(i => i.imageID === poh.backgroundID)!;
		const selectedKit = wallkits.find(i => stringMatches(i.name, input));

		if (!input || !selectedKit) {
			return msg.channel.send(
				`Your current wallkit is the '${currentWallkit.name}' wallkit. The available wallkits are: ${wallkits
					.map(i => i.name)
					.join(', ')}.`
			);
		}

		if (currentWallkit.imageID === selectedKit.imageID) {
			return msg.channel.send('This is already your wallkit.');
		}

		const bitfield = msg.author.settings.get(UserSettings.BitField);
		const userBank = msg.author.bank();
		if (selectedKit.bitfield && !bitfield.includes(BitField.HasHosidiusWallkit)) {
			if (selectedKit.imageID === 2 && userBank.has('Hosidius blueprints')) {
				await msg.author.removeItemFromBank(itemID('Hosidius blueprints'));
				await msg.author.settings.update(UserSettings.BitField, selectedKit.bitfield);
			} else {
				return msg.channel.send(`You haven't unlocked the ${selectedKit.name} wallkit!`);
			}
		}
		poh.backgroundID = selectedKit.imageID;
		await poh.save();
		return msg.channel.send({ files: [await this.genImage(poh)] });
	}

	async items(msg: KlasaMessage) {
		let str = 'POH Buildable Objects\n';
		for (const [key, arr] of Object.entries(GroupedPohObjects)) {
			str += `**${key}:** ${arr.map(i => i.name).join(', ')}\n`;
		}
		return msg.channel.send(str);
	}

	async list(msg: KlasaMessage) {
		let str = 'Currently built POH Objects\n';
		const poh = await msg.author.getPOH();

		for (const object of Object.values(PoHObjects)) {
			if (poh[object.slot]! > 0 && poh[object.slot] === object.id) {
				str += `**${object.slot.replace(/\b\S/g, t => t.toUpperCase())}:** ${object.name}\n`;
			}
		}
		return msg.channel.send(str);
	}

	genImage(poh: PoHTable, showSpaces = false) {
		return (this.client.tasks.get('pohImage') as PoHImage).run(poh, showSpaces);
	}

	async build(msg: KlasaMessage, [name]: [string]) {
		const poh = await msg.author.getPOH();

		if (!name) {
			return msg.channel.send({ files: [await this.genImage(poh, true)] });
		}

		const obj = PoHObjects.find(i => stringMatches(i.name, name));
		if (!obj) {
			return msg.channel.send("That's not a valid thing to build in your PoH.");
		}

		const level = msg.author.skillLevel(SkillsEnum.Construction);
		if (level < obj.level) {
			return msg.channel.send(`You need level ${obj.level} Construction to build a ${obj.name} in your house.`);
		}

		const inPlace = poh[obj.slot];
		if (obj.slot === 'mountedItem' && inPlace !== null) {
			return msg.channel.send(
				`You already have a item mount built. Use \`${msg.cmdPrefix}poh mountitem <tem>\` to mount an item on it.`
			);
		}

		if (obj.requiredInPlace && inPlace !== obj.requiredInPlace) {
			return msg.channel.send(
				`Building a ${obj.name} requires you have a ${
					getPOHObject(obj.requiredInPlace).name
				} built there first.`
			);
		}

		if (obj.itemCost) {
			const userBank = msg.author.bank().add('Coins', msg.author.settings.get(UserSettings.GP));
			if (!userBank.has(obj.itemCost.bank)) {
				return msg.channel.send(
					`You don't have enough items to build a ${obj.name}, you need ${obj.itemCost}.`
				);
			}
			let str = `${msg.author}, please confirm that you want to build a ${obj.name} using ${obj.itemCost}.`;
			if (inPlace !== null) {
				str += ` You will lose the ${getPOHObject(inPlace).name} that you currently have there.`;
			}
			await msg.confirm(str);
			await msg.author.removeItemsFromBank(obj.itemCost.bank);
			updateBankSetting(this.client, ClientSettings.EconomyStats.ConstructCostBank, obj.itemCost);
		}

		poh[obj.slot] = obj.id;
		await poh.save();
		return msg.channel.send({
			content: `You built a ${obj.name} in your house, using ${obj.itemCost}.`,
			files: [await this.genImage(poh)]
		});
	}

	async mountItem(msg: KlasaMessage, [name]: [string]) {
		if (1 < 2) {
			return msg.channel.send('Item mounting is currently disabled.');
		}
		const poh = await msg.author.getPOH();
		if (!name) {
			return msg.channel.send({ files: [await this.genImage(poh, true)] });
		}

		if (poh.mountedItem === null) {
			return msg.channel.send('You need to build a mount for the item first.');
		}

		const item = getOSItem(name);
		if (['Magic stone', 'Coins'].includes(item.name)) {
			return msg.channel.send("You can't mount this item.");
		}

		const userBank = msg.author.bank();
		let costBank = new Bank();
		let lootBank = new Bank();
		if (!userBank.has(item.id)) {
			return msg.channel.send(`You don't have 1x ${item.name}.`);
		}
		if (userBank.amount('Magic stone') < 2) {
			return msg.channel.send("You don't have 2x Magic stone.");
		}
		const currItem = poh.mountedItem === 1112 ? null : poh.mountedItem;

		costBank.add(item.id);
		if (currItem) {
			lootBank.add(item.id);
		}
		await msg.author.exchangeItemsFromBank({ costBank, lootBank });
		poh.mountedItem = item.id;
		await poh.save();
		return msg.channel.send({
			content: `You mounted a ${item.name} in your house, using 2x Magic stone and 1x ${
				item.name
			} (given back when another item is mounted).${currItem ? ` Refunded 1x ${itemNameFromID(currItem)}.` : ''}`,
			files: [await this.genImage(poh)]
		});
	}

	async destroy(msg: KlasaMessage, [name]: [string]) {
		const obj = PoHObjects.find(i => stringMatches(i.name, name));
		if (!obj) {
			return msg.channel.send("That's not a valid thing to build in your PoH.");
		}

		const poh = await msg.author.getPOH();

		const inPlace = poh[obj.slot];
		if (obj.slot === 'mountedItem' && ![1111, 1112, null].includes(inPlace)) {
			poh[obj.slot] = null;
			await poh.save();
			await msg.author.addItemsToBank({ [inPlace!]: 1 });
			return msg.channel.send({
				content: `You removed a ${obj.name} from your house, and were refunded 1x ${itemNameFromID(inPlace!)}.`,
				files: [await this.genImage(poh)]
			});
		}
		if (inPlace !== obj.id) {
			return msg.channel.send(`You don't have a ${obj.name} built in your house.`);
		}

		poh[obj.slot] = null;

		let str = `You removed a ${obj.name} from your house.`;
		if (obj.refundItems && obj.itemCost) {
			const itemsToRefund = new Bank(obj.itemCost.bank).remove(itemsNotRefundable);
			if (itemsToRefund.length > 0) {
				str += `\n\nYou were refunded: ${itemsToRefund}.`;
				await msg.author.addItemsToBank(itemsToRefund.bank);
			}
		}

		await poh.save();
		return msg.channel.send({ content: str, files: [await this.genImage(poh)] });
	}
}
