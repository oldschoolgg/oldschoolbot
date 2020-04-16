import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { stringMatches } from '../../lib/util';
import { Time } from 'oldschooljs/dist/constants';
import { UserSettings } from '../../lib/UserSettings';
import { Monsters } from 'oldschooljs';

const slayerShopItems = [
	{
		name: 'Aviansie',
		slayerPointsRequired: 80,
		ID: Monsters.AberrantSpectre.id
	},
	{
		name: 'Basilisk',
		slayerPointsRequired: 80,
		ID: Monsters.Basilisk.id
	},
	{
		name: 'Boss',
		slayerPointsRequired: 200,
		ID: Monsters.Vorkath.id
	},
	{
		name: 'Lizardman',
		slayerPointsRequired: 75,
		ID: Monsters.Lizardman.id
	},
	{
		name: 'Mithril dragon',
		slayerPointsRequired: 80,
		ID: Monsters.MithrilDragon.id
	},
	{
		name: 'Red dragon',
		slayerPointsRequired: 50,
		ID: Monsters.RedDragon.id
	}
	/*
	{
		name: 'TzHaar',
		slayerPointsRequired: 100,
		ID: Monsters.TzHaarKet.id
	}
	*/
];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<unlockname:...string>',
			usageDelim: ' ',
			oneAtTime: true,
			cooldown: 1,
			altProtection: true
		});
	}

	async run(msg: KlasaMessage, [unlockname]: [string]) {
		await msg.author.settings.sync(true);

		if (unlockname === 'bal') {
			throw `Your current Slayer Points balance is: ${msg.author.slayerInfo[4]}`;
		}
		const unlock = slayerShopItems.find(item => stringMatches(unlockname, item.name));
		if (!unlock) {
			throw `That's not a valid unlock. Valid unlocks are ${slayerShopItems
				.map(unlock => unlock.name)
				.join(`, `)}.`;
		}
		if (unlock.slayerPointsRequired > msg.author.slayerInfo[4]) {
			throw `You need ${unlock.slayerPointsRequired} slayer points to purchase that.`;
		}

		if (msg.author.unlockedList.includes(unlock.ID)) {
			throw `You already have that unlocked, why would you want to buy it again?`;
		}

		const sellMsg = await msg.channel.send(
			`${msg.author}, say \`confirm\` to confirm that you want to purchase the ability to kill ${unlock.name} for ${unlock.slayerPointsRequired} slayer points.
You currently have ${msg.author.slayerInfo[4]} slayer points.`
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

		const newQuantity = msg.author.slayerInfo[4] - unlock.slayerPointsRequired;
		const newInfo = [
			msg.author.slayerInfo[0],
			msg.author.slayerInfo[1],
			msg.author.slayerInfo[2],
			msg.author.slayerInfo[3],
			newQuantity,
			msg.author.slayerInfo[5]
		];
		await msg.author.settings.update(UserSettings.Slayer.SlayerInfo, newInfo, {
			arrayAction: 'overwrite'
		});
		msg.send(`You purchased the ability to kill ${unlock.name} for ${unlock.slayerPointsRequired} slayer points! 
Your new total is ${msg.author.slayerInfo[4]}`);
	}
}
