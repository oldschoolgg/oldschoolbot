import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { Time } from '../../lib/constants';
import Createables from '../../lib/data/createables';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import {
	addBanks,
	bankHasAllItemsFromBank,
	itemNameFromID,
	multiplyBank,
	removeBankFromBank,
	stringMatches
} from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[quantity:int{1}] [itemName:...string]',
			usageDelim: ' ',
			oneAtTime: true,
			cooldown: 5,
			altProtection: true,
			description:
				'Allows you to create items, like godswords or spirit shields - and pack barrows armor sets.',
			examples: [
				'+create armadyl godsword',
				'+create elysian spirit shield',
				'+create dharoks armour set'
			],
			categoryFlags: ['minion']
		});
	}

	async run(msg: KlasaMessage, [quantity, itemName]: [number, string]) {
		if (msg.flagArgs.items) {
			return msg.channel.sendFile(
				Buffer.from(
					Createables.map(item => {
						const skillsRequired =
							item.requiredSkills === undefined
								? ''
								: `\nRequired skills: ${Object.entries(item.requiredSkills)
										.map(entry => `${entry[0]}: ${entry[1]}`)
										.join(',')}`;
						const qpRequired =
							item.QPRequired === undefined
								? ''
								: `\nQP Required: ${item.QPRequired}`;
						const gpCost = item.GPCost === undefined ? '' : `\nGP Cost: ${item.GPCost}`;
						return (
							`${item.name}: ${Object.entries(item.inputItems)
								.map(entry => `${entry[1]} ${itemNameFromID(parseInt(entry[0]))}`)
								.join(', ')}` + `${skillsRequired}${qpRequired}${gpCost}`
						);
					}).join('\n\n')
				),
				`Available creatable items.txt`
			);
		}
		if (itemName === undefined) {
			throw `Item name is a required argument.`;
		}
		itemName = itemName.toLowerCase();

		const createableItem = Createables.find(item => stringMatches(item.name, itemName));
		if (!createableItem) throw `That's not a valid item you can create.`;

		if (!quantity || createableItem.cantHaveItems) {
			quantity = 1;
		}

		if (
			createableItem.QPRequired &&
			msg.author.settings.get(UserSettings.QP) < createableItem.QPRequired
		) {
			throw `You need ${createableItem.QPRequired} QP to create this item.`;
		}

		if (createableItem.requiredSkills) {
			for (const [skillName, lvl] of Object.entries(createableItem.requiredSkills)) {
				if (msg.author.skillLevel(skillName as SkillsEnum) < lvl) {
					throw `You need ${lvl} ${skillName} to create this item.`;
				}
			}
		}

		if (
			createableItem.GPCost &&
			msg.author.settings.get(UserSettings.GP) < createableItem.GPCost * quantity
		) {
			throw `You need ${createableItem.GPCost.toLocaleString()} coins to create this item.`;
		}

		if (createableItem.cantBeInCL) {
			const cl = new Bank(msg.author.settings.get(UserSettings.CollectionLogBank));
			if (
				Object.keys(createableItem.outputItems).some(
					itemID => cl.amount(Number(itemID)) > 0
				)
			) {
				return msg.channel.send(`You can only create this item once!`);
			}
		}

		const outItems = multiplyBank(createableItem.outputItems, quantity);
		const inItems = multiplyBank(createableItem.inputItems, quantity);

		const outputItemsString = new Bank(outItems).toString();
		const inputItemsString = new Bank(inItems).toString();

		await msg.author.settings.sync(true);
		const userBank = msg.author.settings.get(UserSettings.Bank);

		// Ensure they have the required items to create the item.
		if (!bankHasAllItemsFromBank(userBank, inItems)) {
			throw `You don't have the required items to create this item. You need: ${inputItemsString}${
				createableItem.GPCost
					? ` and ${(createableItem.GPCost * quantity).toLocaleString()} GP`
					: ''
			}.`;
		}

		// Check for any items they cant have 2 of.
		if (createableItem.cantHaveItems) {
			for (const [itemID, qty] of Object.entries(createableItem.cantHaveItems)) {
				const numOwned = msg.author.numOfItemsOwned(parseInt(itemID));
				if (numOwned >= qty) {
					throw `You can't create this item, because you have ${new Bank(
						createableItem.cantHaveItems
					)} in your bank.`;
				}
			}
		}

		if (!msg.flagArgs.cf && !msg.flagArgs.confirm) {
			const sellMsg = await msg.channel.send(
				`${
					msg.author
				}, say \`confirm\` to confirm that you want to create **${outputItemsString}** using ${inputItemsString}${
					createableItem.GPCost
						? ` and ${(createableItem.GPCost * quantity).toLocaleString()} GP`
						: ''
				}.`
			);

			// Confirm the user wants to create the item(s)
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
				return sellMsg.edit(`Cancelling item creation.`);
			}
		}

		await msg.author.settings.update(
			UserSettings.Bank,
			addBanks([outItems, removeBankFromBank(userBank, inItems)])
		);

		if (createableItem.GPCost) {
			await msg.author.removeGP(createableItem.GPCost);
		}

		if (!createableItem.noCl) await msg.author.addItemsToCollectionLog(outItems);

		return msg.send(`You created ${outputItemsString}.`);
	}
}
