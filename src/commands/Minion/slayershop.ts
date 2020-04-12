import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { stringMatches } from '../../lib/util';
import { Time } from 'oldschooljs/dist/constants';
import { UserSettings } from '../../lib/UserSettings';

const slayerShopItems = [
	{
		name: 'Aviansie',
		slayerPointsRequired: 80
	},
	{
		name: 'Basilisk',
		slayerPointsRequired: 80
	},
	{
		name: 'Boss',
		slayerPointsRequired: 200
	},
	{
		name: 'Lizardman',
		slayerPointsRequired: 75
	},
	{
		name: 'Mithril dragon',
		slayerPointsRequired: 80
	},
	{
		name: 'Red dragon',
		slayerPointsRequired: 50
	},
	{
		name: 'TzHaar',
		slayerPointsRequired: 100
	}
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
			throw `Your current Slayer Points balance is: ${msg.author.slayerPoints}`;
		}
		const unlock = slayerShopItems.find(item => stringMatches(unlockname, item.name));
		if (!unlock) {
			throw `That's not a valid unlock. Valid unlocks are ${slayerShopItems
				.map(unlock => unlock.name)
				.join(`, `)}.`;
		}
		if (unlock.slayerPointsRequired > msg.author.slayerPoints) {
			throw `You need ${unlock.slayerPointsRequired} slayer points to purchase that.`;
		}

		const sellMsg = await msg.channel.send(
			`${msg.author}, say \`confirm\` to confirm that you want to purchase the ability to kill ${unlock.name} for ${unlock.slayerPointsRequired} slayer points.
You currently have ${msg.author.slayerPoints} slayer points.`
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

		// This needs a better way
		if (unlock.name === 'Aviansie') {
			if (msg.author.unlockedAviansie) {
				throw `You already have that unlocked, why would you want to buy it again?`;
			}
			await msg.author.settings.update(UserSettings.Slayer.UnlockedAviansie, true);
		}
		if (unlock.name === 'Basilisk') {
			if (msg.author.unlockedBasilisk) {
				throw `You already have that unlocked, why would you want to buy it again?`;
			}
			await msg.author.settings.update(UserSettings.Slayer.UnlockedBasilisk, true);
		}
		if (unlock.name === 'Boss') {
			if (msg.author.unlockedBoss) {
				throw `You already have that unlocked, why would you want to buy it again?`;
			}
			await msg.author.settings.update(UserSettings.Slayer.UnlockedBoss, true);
		}
		if (unlock.name === 'Lizardman') {
			if (msg.author.unlockedLizardman) {
				throw `You already have that unlocked, why would you want to buy it again?`;
			}
			await msg.author.settings.update(UserSettings.Slayer.UnlockedLizardman, true);
		}
		if (unlock.name === 'Mithril dragon') {
			if (msg.author.unlockedMithrilDragon) {
				throw `You already have that unlocked, why would you want to buy it again?`;
			}
			await msg.author.settings.update(UserSettings.Slayer.UnlockedMithrilDragon, true);
		}
		if (unlock.name === 'Red dragon') {
			if (msg.author.unlockedRedDragon) {
				throw `You already have that unlocked, why would you want to buy it again?`;
			}
			await msg.author.settings.update(UserSettings.Slayer.UnlockedRedDragon, true);
		}
		if (unlock.name === 'TzHaar') {
			if (msg.author.unlockedTzHaar) {
				throw `You already have that unlocked.`;
			}
			await msg.author.settings.update(UserSettings.Slayer.UnlockedTzHaar, true);
		}
		const newQuantity = msg.author.slayerPoints - unlock.slayerPointsRequired;
		await msg.author.settings.update(UserSettings.Slayer.SlayerPoints, newQuantity);
		msg.send(`You purchased the ability to kill ${unlock.name} for ${unlock.slayerPointsRequired} slayer points! 
Your new total is ${msg.author.slayerPoints}`);
	}
}
