import { MessageEmbed } from 'discord.js';
import { randArrItem } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import { Time } from '../../lib/constants';
import { allMbTables, MysteryBoxes } from '../../lib/data/openables';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { DragonTable } from '../../lib/simulation/grandmasterClue';
import { BotCommand } from '../../lib/structures/BotCommand';
import { addBanks, formatDuration, updateBankSetting, updateGPTrackSetting } from '../../lib/util';
import getOSItem from '../../lib/util/getOSItem';
import { LampTable } from '../../lib/xpLamps';

const eightHours = Time.Hour * 8;
const contractTable = new LootTable()
	.every('Coins', [1_500_000, 4_500_000])
	.tertiary(50, LampTable)
	.tertiary(50, MysteryBoxes)
	.add(DragonTable, [1, 2], 2)
	.add(
		new LootTable()
			.add('Clue scroll (beginner)', 1, 50)
			.add('Clue scroll (easy)', 1, 40)
			.add('Clue scroll (medium)', 1, 30)
			.add('Clue scroll (hard)', 1, 20)
			.add('Clue scroll (elite)', 1, 10)
			.add('Clue scroll (master)', 1, 5)
			.add('Clue scroll (Grandmaster)', 1, 2)
	);

export default class DailyCommand extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 5,
			categoryFlags: ['minion'],
			usage: '[str:...string]'
		});
	}

	async run(msg: KlasaMessage, [str]: [string | undefined]) {
		await msg.author.settings.sync();
		const currentDate = new Date().getTime();
		const lastDate = msg.author.settings.get(UserSettings.LastItemContractDate);
		const difference = currentDate - lastDate;
		const totalContracts = msg.author.settings.get(UserSettings.TotalItemContracts);
		const total = `\n\nYou've completed ${totalContracts} Item Contracts.`;
		if (!msg.author.settings.get(UserSettings.CurrentItemContract)) {
			await msg.author.settings.update(
				UserSettings.CurrentItemContract,
				randArrItem(allMbTables)
			);
		}
		const currentItem = getOSItem(msg.author.settings.get(UserSettings.CurrentItemContract)!);
		let durationRemaining = formatDuration(Date.now() - (lastDate + eightHours));

		const embed = new MessageEmbed().setThumbnail(
			`https://static.runelite.net/cache/item/icon/${currentItem.id}.png`
		);

		if (difference < eightHours) {
			return msg.send(
				`You have no item contract available at the moment. Come back in ${durationRemaining}. ${total}`
			);
		}

		if (str === 'skip') {
			if (difference < eightHours) {
				return msg.channel.send(
					embed.setDescription(
						`Your current contract is a ${currentItem.name}, you can't skip it yet, you need to wait ${durationRemaining}. ${total}`
					)
				);
			}

			if (!msg.flagArgs.confirm && !msg.flagArgs.cf && !msg.flagArgs.yes) {
				const sellMsg = await msg.channel.send(
					embed.setDescription(
						`Are you sure you want to skip your item contract? You won't be able to get another contract for ${formatDuration(
							eightHours / 2
						)}. Say \`y\` to confirm.`
					)
				);

				try {
					await msg.channel.awaitMessages(
						_msg =>
							_msg.author.id === msg.author.id && _msg.content.toLowerCase() === 'y',
						{
							max: 1,
							time: 13_000,
							errors: ['time']
						}
					);
				} catch (err) {
					return sellMsg.edit(`Cancelled.`);
				}
			}
			const newItem = randArrItem(allMbTables);
			await msg.author.settings.update(
				UserSettings.LastItemContractDate,
				currentDate - eightHours / 2
			);
			await msg.author.settings.update(UserSettings.CurrentItemContract, newItem);
			return msg.channel.send(
				`You skipped your item contract, and your next contract will be available in ${formatDuration(
					eightHours / 2
				)}.`
			);
		}

		const userBank = msg.author.bank();
		const cost = new Bank().add(currentItem.id);
		if (!userBank.has(currentItem.id)) {
			embed.setDescription(
				`Your current contract is a ${currentItem.name}, go get one!${total}`
			);
			return msg.channel.send(embed);
		}

		if (!msg.flagArgs.confirm && !msg.flagArgs.cf) {
			const sellMsg = await msg.channel.send(
				embed.setDescription(
					`Are you sure you want to hand over 1x ${currentItem.name} to complete your item contract? Say \`y\` to confirm.`
				)
			);

			try {
				await msg.channel.awaitMessages(
					_msg => _msg.author.id === msg.author.id && _msg.content.toLowerCase() === 'y',
					{
						max: 1,
						time: 13_000,
						errors: ['time']
					}
				);
			} catch (err) {
				return sellMsg.edit(`Cancelled.`);
			}
		}

		const loot = new Bank().add(contractTable.roll());

		await Promise.all([
			msg.author.settings.update(UserSettings.LastItemContractDate, currentDate),
			msg.author.settings.update(UserSettings.TotalItemContracts, totalContracts + 1),
			msg.author.settings.update(UserSettings.CurrentItemContract, randArrItem(allMbTables)),
			msg.author.settings.update(
				UserSettings.ItemContractBank,
				addBanks([msg.author.settings.get(UserSettings.ItemContractBank), cost.bank])
			),
			msg.author.removeItemsFromBank(cost),
			msg.author.addItemsToBank(loot)
		]);
		updateBankSetting(this.client, ClientSettings.EconomyStats.ItemContractCost, cost);
		updateBankSetting(this.client, ClientSettings.EconomyStats.ItemContractLoot, loot);
		updateGPTrackSetting(
			this.client,
			ClientSettings.EconomyStats.GPSourceItemContracts,
			loot.amount('Coins')
		);
		return msg.channel.send(
			embed.setDescription(
				`You handed in a ${currentItem.name} and received ${loot}. You've completed ${
					totalContracts + 1
				} Item Contracts.`
			)
		);
	}
}
