import { CommandStore, KlasaMessage } from 'klasa';
import { BotCommand } from '../../lib/BotCommand';
import { stringMatches } from '../../lib/util';
import { Time } from 'oldschooljs/dist/constants';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import slayerShopUnlock from '../../lib/skilling/skills/slayer/slayerShopRewards/slayerShopUnlock';
import slayerShopExtend from '../../lib/skilling/skills/slayer/slayerShopRewards/slayerShopExtend';
import slayerShopBuy from '../../lib/skilling/skills/slayer/slayerShopRewards/slayerShopBuy';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<shop:string> [item:...string]',
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
		if (shop === 'bal') {
			throw `Your current Slayer Points balance is: ${slayerInfo.slayerPoints}`;
		}
		if (shop === 'extend') {
			for (const extendedItem of slayerShopExtend) {
				if (extendedItem.name === item) {
					// Make extendedList into SlayerShopItem array on UserSettings
					extendList.concat(extendedItem);
				}
			}
		}
		const unlock = slayerShopItems.find(item => stringMatches(item.name, shop));
		if (!unlock) {
			throw `That's not a valid unlock. Valid unlocks are ${slayerShopItems
				.map(unlock => unlock.name)
				.join(`, `)}.`;
		}
		if (unlock.slayerPointsRequired > slayerInfo.slayerPoints) {
			throw `You need ${unlock.slayerPointsRequired} slayer points to purchase that.`;
		}
		/*
		if (msg.author.unlockedList.includes(unlock.ID)) {
			throw `You already have that unlocked, why would you want to buy it again?`;
		}
		*/

		const sellMsg = await msg.channel.send(
			`${msg.author}, say \`confirm\` to confirm that you want to purchase the ability to kill ${unlock.name} for ${unlock.slayerPointsRequired} slayer points.
You currently have ${slayerInfo.slayerPoints} slayer points.`
		);
		// Confirm the user wants to buy
		try {
			await msg.channel.awaitMessages(
				_msg =>
					_msg.author.id === msg.author.id && _msg.content.toLowerCase() === 'confirm',
				{
					max: 1,
					time: Time.Second * 10,
					errors: ['time']
				}
			);
		} catch (err) {
			return sellMsg.edit(`Cancelling purchase of ability to kill ${unlock.name}.`);
		}

		await msg.author.settings.update(UserSettings.Slayer.UnlockedList, unlock.ID, {
			arrayAction: 'add'
		});
		const newSlayerInfo = {
			...slayerInfo,
			slayerPoints: slayerInfo.slayerPoints - unlock.slayerPointsRequired
		};
		await msg.author.settings.update(UserSettings.Slayer.SlayerInfo, newSlayerInfo, {
			arrayAction: 'overwrite'
		});
		msg.send(`You purchased the ability to kill ${unlock.name} for ${unlock.slayerPointsRequired} slayer points! 
Your new total is ${slayerInfo.slayerPoints}`);
	}
}
