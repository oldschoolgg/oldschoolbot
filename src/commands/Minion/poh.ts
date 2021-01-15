import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { BotCommand } from '../../lib/BotCommand';
import { Time } from '../../lib/constants';
import { requiresMinion } from '../../lib/minions/decorators';
import { getPOHObject, GroupedPohObjects, itemsNotRefundable, PoHObjects } from '../../lib/poh';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { PoHTable } from '../../lib/typeorm/PoHTable.entity';
import { stringMatches } from '../../lib/util';
import PoHImage from '../../tasks/pohImage';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			altProtection: true,
			categoryFlags: ['minion', 'minigame'],
			description: 'Sends your minion to do barbarian assault, or buy rewards and gamble.',
			examples: ['+pohfff [start]'],
			subcommands: true,
			usage: '[build|destroy|items] [input:...str]',
			usageDelim: ' '
		});
	}

	async getPOH(msg: KlasaMessage): Promise<PoHTable> {
		const poh = await PoHTable.findOne({ user_id: msg.author.id });
		if (poh !== undefined) return poh;
		await PoHTable.insert({ user_id: msg.author.id });
		const created = await PoHTable.findOne({ user_id: msg.author.id });
		if (!created) {
			throw new Error('Failed to find POH after creation.');
		}
		return created;
	}

	@requiresMinion
	async run(msg: KlasaMessage) {
		const poh = await this.getPOH(msg);
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
		const poh = await this.getPOH(msg);

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

	async destroy(msg: KlasaMessage, [name]: [string]) {
		const obj = PoHObjects.find(i => stringMatches(i.name, name));
		if (!obj) {
			return msg.send(`That's not a valid thing to build in your PoH.`);
		}

		const poh = await this.getPOH(msg);

		const inPlace = poh[obj.slot];
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
