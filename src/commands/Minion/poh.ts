import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { BotCommand } from '../../lib/BotCommand';
import { Time } from '../../lib/constants';
import { requiresMinion } from '../../lib/minions/decorators';
import { getPOHObject, GroupedPohObjects, itemsNotRefundable, PoHObjects } from '../../lib/poh';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { PoHTable } from '../../lib/typeorm/PoHTable.entity';
import { itemNameFromID, stringMatches } from '../../lib/util';
import getOSItem from '../../lib/util/getOSItem';
import PoHImage from '../../tasks/pohImage';

export default class POHCommand extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			altProtection: true,
			categoryFlags: ['minion'],
			description: 'Allows you to access and build in your POH.',
			examples: [
				'+poh build demonic throne',
				'+poh',
				'+poh items',
				'+poh destroy demonic throne'
			],
			subcommands: true,
			usage: '[build|destroy|items|mountItem] [input:...str]',
			usageDelim: ' '
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage) {
		const poh = await msg.author.getPOH();
		return msg.send(await this.genImage(poh));
	}

	async items(msg: KlasaMessage) {
		let str = 'POH Buildable Objects\n';
		for (const [key, arr] of Object.entries(GroupedPohObjects)) {
			str += `**${key}:** ${arr.map(i => i.name).join(', ')}\n`;
		}
		return msg.send(str, { split: true });
	}

	genImage(poh: PoHTable, showSpaces = false) {
		return (this.client.tasks.get('pohImage') as PoHImage).run(poh, showSpaces);
	}

	async build(msg: KlasaMessage, [name]: [string]) {
		const poh = await msg.author.getPOH();

		if (!name) {
			return msg.send(await this.genImage(poh, true));
		}

		const obj = PoHObjects.find(i => stringMatches(i.name, name));
		if (!obj) {
			return msg.send(`That's not a valid thing to build in your PoH.`);
		}

		const level = msg.author.skillLevel(SkillsEnum.Construction);
		if (level < obj.level) {
			return msg.send(
				`You need level ${obj.level} Construction to build a ${obj.name} in your house.`
			);
		}

		const inPlace = poh[obj.slot];
		if (obj.slot === 'mountedItem' && inPlace !== null) {
			return msg.send(
				`You already have a item mount built. Use \`${msg.cmdPrefix}poh mountitem <tem>\` to mount an item on it.`
			);
		}

		if (obj.requiredInPlace && inPlace !== obj.requiredInPlace) {
			return msg.send(
				`Building a ${obj.name} requires you have a ${
					getPOHObject(obj.requiredInPlace).name
				} built there first.`
			);
		}

		if (obj.itemCost) {
			const userBank = msg.author
				.bank()
				.add('Coins', msg.author.settings.get(UserSettings.GP));
			if (!userBank.has(obj.itemCost.bank)) {
				return msg.send(
					`You don't have enough items to build a ${obj.name}, you need ${obj.itemCost}.`
				);
			}
			if (!msg.flagArgs.cf && !msg.flagArgs.confirm) {
				let str = `${msg.author}, say \`confirm\` to confirm that you want to build a ${obj.name} using ${obj.itemCost}.`;
				if (inPlace !== null) {
					str += ` You will lose the ${
						getPOHObject(inPlace).name
					} that you currently have there.`;
				}
				const sellMsg = await msg.channel.send(str);

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
					return sellMsg.edit(`Cancelled.`);
				}
			}
			await msg.author.removeItemsFromBank(obj.itemCost.bank);
		}

		poh[obj.slot] = obj.id;
		await poh.save();
		return msg.send(
			`You built a ${obj.name} in your house, using ${obj.itemCost}.`,
			await this.genImage(poh)
		);
	}

	async mountItem(msg: KlasaMessage, [name]: [string]) {
		const poh = await msg.author.getPOH();
		if (!name) {
			return msg.send(await this.genImage(poh, true));
		}

		if (poh.mountedItem === 1111) {
			return msg.send(`You need to build a mount for the item first.`);
		}

		const item = getOSItem(name);
		if (['Magic stone', 'Coins'].includes(item.name)) {
			return msg.send(`You can't mount this item.`);
		}

		const userBank = msg.author.bank();
		if (!userBank.has(item.id)) {
			return msg.send(`You don't have 1x ${item.name}.`);
		}
		if (userBank.amount('Magic stone') < 2) {
			return msg.send(`You don't have 2x Magic stone.`);
		}
		const currItem = poh.mountedItem === 1112 ? null : poh.mountedItem;

		userBank.remove(item.id);
		if (currItem) {
			userBank.add(item.id);
		}
		await msg.author.settings.update(UserSettings.Bank, userBank.bank);
		poh.mountedItem = item.id;
		await poh.save();
		return msg.send(
			`You mounted a ${item.name} in your house, using 2x Magic stone and 1x ${
				item.name
			} (given back when another item is mounted).${
				currItem ? ` Refunded 1x ${itemNameFromID(currItem)}.` : ''
			}`,
			await this.genImage(poh)
		);
	}

	async destroy(msg: KlasaMessage, [name]: [string]) {
		const obj = PoHObjects.find(i => stringMatches(i.name, name));
		if (!obj) {
			return msg.send(`That's not a valid thing to build in your PoH.`);
		}

		const poh = await msg.author.getPOH();

		const inPlace = poh[obj.slot];
		if (obj.slot === 'mountedItem' && ![1111, 1112, null].includes(inPlace)) {
			poh[obj.slot] = null;
			await poh.save();
			await msg.author.addItemsToBank({ [inPlace!]: 1 });
			return msg.send(
				`You removed a ${obj.name} from your house, and were refunded 1x ${itemNameFromID(
					inPlace!
				)}.`,
				await this.genImage(poh)
			);
		}
		if (inPlace !== obj.id) {
			return msg.send(`You don't have a ${obj.name} built in your house.`);
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
		return msg.send(str, await this.genImage(poh));
	}
}
