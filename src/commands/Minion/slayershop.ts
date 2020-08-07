import { CommandStore, KlasaMessage } from 'klasa';
import { BotCommand } from '../../lib/BotCommand';
import { Bank } from '../../lib/types';
import itemID from '../../lib/util/itemID';
import { Time } from 'oldschooljs/dist/constants';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import slayerShopUnlock from '../../lib/skilling/skills/slayer/slayerShopRewards/slayerShopUnlock';
import slayerShopExtend from '../../lib/skilling/skills/slayer/slayerShopRewards/slayerShopExtend';
import slayerShopBuy from '../../lib/skilling/skills/slayer/slayerShopRewards/slayerShopBuy';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[shop:string] [item:...string]',
			usageDelim: ' ',
			oneAtTime: true,
			cooldown: 1,
			altProtection: true
		});
	}

	async run(msg: KlasaMessage, [shop = '', item = '']: [string, string]) {
		await msg.author.settings.sync(true);
		const slayerInfo = msg.author.settings.get(UserSettings.Slayer.SlayerInfo);
		const extendList = msg.author.settings.get(UserSettings.Slayer.ExtendList);
		const unlockedList = msg.author.settings.get(UserSettings.Slayer.UnlockedList);
		shop = shop.toLowerCase();

		// Show current Slayer points
		if (shop === 'bal') {
			throw `Your current Slayer Points balance is: ${slayerInfo.slayerPoints}`;
		}

		// Use of the SlayerShopExtend
		if (shop === 'extend') {
			if (item.toLowerCase() === 'show') {
				let str = 'Your current extension list: ';
				if (extendList.length === 0) {
					throw `You have a empty extension list.`;
				}
				for (let i = 0; i < extendList.length; i++) {
					const extendName = extendList[i].name;
					str += `${extendName}, `;
				}
				str = str.replace(/,\s*$/, '');
				throw str;
			}
			for (const extendedItem of slayerShopExtend) {
				if (extendedItem.name.toLowerCase() === item.toLowerCase()) {
					if (extendedItem.slayerPointsRequired > slayerInfo.slayerPoints) {
						throw `You need ${extendedItem.slayerPointsRequired} slayer points to purchase ${extendedItem.name}.`;
					}
					if (extendList.some(extend => extend.name === extendedItem.name)) {
						throw `You already have ${extendedItem.name} extended.`;
					}
					const sellMsg = await msg.channel.send(
						`${msg.author}, say \`confirm\` to confirm that you want to purchase the ability to extend ${extendedItem.name} for ${extendedItem.slayerPointsRequired} slayer points.
			You currently have ${slayerInfo.slayerPoints} slayer points.`
					);
					// Confirm the user wants to buy
					try {
						await msg.channel.awaitMessages(
							_msg =>
								_msg.author.id === msg.author.id &&
								_msg.content.toLowerCase() === 'confirm',
							{
								max: 1,
								time: Time.Second * 10,
								errors: ['time']
							}
						);
					} catch (err) {
						return sellMsg.edit(
							`Cancelling purchase of extending ${extendedItem.name}.`
						);
					}
					await msg.author.settings.update(UserSettings.Slayer.ExtendList, extendedItem, {
						arrayAction: 'add'
					});
					const newSlayerInfo = {
						...slayerInfo,
						slayerPoints: slayerInfo.slayerPoints - extendedItem.slayerPointsRequired
					};
					await msg.author.settings.update(
						UserSettings.Slayer.SlayerInfo,
						newSlayerInfo,
						{
							arrayAction: 'overwrite'
						}
					);
					return msg.send(
						`The extension of ${
							extendedItem.name
						} has been **added** to your extension list. You have ${slayerInfo.slayerPoints -
							extendedItem.slayerPointsRequired} Slayer Points left.`
					);
				}
			}
			throw `That's not a valid extension. Valid extensions are ${slayerShopExtend
				.map(extend => extend.name)
				.join(
					`, `
				)}.\nFor more information go to <https://oldschool.runescape.wiki/w/Slayer_reward_point>`;
		}

		// Use of the SlayerShopUnlock
		if (shop === 'unlock') {
			if (item.toLowerCase() === 'show') {
				let str = 'Your current unlock list: ';
				if (unlockedList.length === 0) {
					throw `You have a empty unlock list.`;
				}
				for (let i = 0; i < unlockedList.length; i++) {
					const unlockedName = unlockedList[i].name;
					str += `${unlockedName}, `;
				}
				str = str.replace(/,\s*$/, '');
				throw str;
			}
			for (const unlockItem of slayerShopUnlock) {
				if (unlockItem.name.toLowerCase() === item.toLowerCase()) {
					if (unlockItem.slayerPointsRequired > slayerInfo.slayerPoints) {
						throw `You need ${unlockItem.slayerPointsRequired} slayer points to purchase ${unlockItem.name}.`;
					}
					if (unlockedList.some(unlock => unlock.name === unlockItem.name)) {
						throw `You already have ${unlockItem.name} unlocked.`;
					}
					const sellMsg = await msg.channel.send(
						`${msg.author}, say \`confirm\` to confirm that you want to purchase the ability to unlock ${unlockItem.name} for ${unlockItem.slayerPointsRequired} slayer points.
			You currently have ${slayerInfo.slayerPoints} slayer points.`
					);
					// Confirm the user wants to buy
					try {
						await msg.channel.awaitMessages(
							_msg =>
								_msg.author.id === msg.author.id &&
								_msg.content.toLowerCase() === 'confirm',
							{
								max: 1,
								time: Time.Second * 10,
								errors: ['time']
							}
						);
					} catch (err) {
						return sellMsg.edit(`Cancelling purchase of unlocking ${unlockItem.name}.`);
					}
					await msg.author.settings.update(UserSettings.Slayer.UnlockedList, unlockItem, {
						arrayAction: 'add'
					});
					const newSlayerInfo = {
						...slayerInfo,
						slayerPoints: slayerInfo.slayerPoints - unlockItem.slayerPointsRequired
					};
					await msg.author.settings.update(
						UserSettings.Slayer.SlayerInfo,
						newSlayerInfo,
						{
							arrayAction: 'overwrite'
						}
					);
					return msg.send(
						`The extension of ${
							unlockItem.name
						} has been **added** to your unlocked list. You have ${slayerInfo.slayerPoints -
							unlockItem.slayerPointsRequired} Slayer Points left.`
					);
				}
			}
			throw `That's not a valid unlock. Valid unlocks are ${slayerShopUnlock
				.map(unlock => unlock.name)
				.join(
					`, `
				)}.\nFor more information go to <https://oldschool.runescape.wiki/w/Slayer_reward_point>`;
		}

		// Use of the SlayerShopBuy
		if (shop === 'buy') {
			for (const buyItem of slayerShopBuy) {
				if (buyItem.name.toLowerCase() === item.toLowerCase()) {
					if (buyItem.slayerPointsRequired > slayerInfo.slayerPoints) {
						throw `You need ${buyItem.slayerPointsRequired} slayer points to purchase ${buyItem.name}.`;
					}
					const sellMsg = await msg.channel.send(
						`${msg.author}, say \`confirm\` to confirm that you want to purchase ${buyItem.name} x ${buyItem.itemAmount} for ${buyItem.slayerPointsRequired} slayer points.
			You currently have ${slayerInfo.slayerPoints} slayer points.`
					);
					// Confirm the user wants to buy
					try {
						await msg.channel.awaitMessages(
							_msg =>
								_msg.author.id === msg.author.id &&
								_msg.content.toLowerCase() === 'confirm',
							{
								max: 1,
								time: Time.Second * 10,
								errors: ['time']
							}
						);
					} catch (err) {
						return sellMsg.edit(
							`Cancelling purchase of ${buyItem.name} x ${buyItem.itemAmount}.`
						);
					}
					const itemBought: Bank = { [itemID(buyItem.name)]: buyItem.itemAmount! };
					await msg.author.addItemsToBank(itemBought, true);
					const newSlayerInfo = {
						...slayerInfo,
						slayerPoints: slayerInfo.slayerPoints - buyItem.slayerPointsRequired
					};
					await msg.author.settings.update(
						UserSettings.Slayer.SlayerInfo,
						newSlayerInfo,
						{
							arrayAction: 'overwrite'
						}
					);
					return msg.send(
						`${
							buyItem.name
						} has been **added** to your bank. You have ${slayerInfo.slayerPoints -
							buyItem.slayerPointsRequired} Slayer Points left.`
					);
				}
			}
			throw `I don't recognize that item, the items you can buy are: ${slayerShopBuy
				.map(buy => buy.name)
				.join(`, `)}.`;
		}

		throw `The valid slayershop commands are \`${msg.cmdPrefix}slayershop bal\`, \`${msg.cmdPrefix}slayershop extend\`, \`${msg.cmdPrefix}slayershop unlock\` and \`${msg.cmdPrefix}slayershop buy\`.`;
	}
}
