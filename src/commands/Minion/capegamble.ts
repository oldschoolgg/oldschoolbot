import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Emoji, Events } from '../../lib/constants';
import mejJalImage from '../../lib/image/mejJalImage';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { roll } from '../../lib/util';
import { formatOrdinal } from '../../lib/util/formatOrdinal';
import itemID from '../../lib/util/itemID';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 5,
			categoryFlags: ['minion'],
			examples: ['+capegamble'],
			description: 'Allows you to gamble fire capes for a chance at the jad pet.'
		});
	}

	async run(msg: KlasaMessage) {
		await msg.author.settings.sync(true);
		const capesOwned = await msg.author.numberOfItemInBank(itemID('Fire cape'), true);

		if (capesOwned < 1) return msg.send(`You have no Fire capes to gamble!`);

		const sellMsg = await msg.channel.send(
			`Are you sure you want to gamble a Fire cape for a chance at the Tzrek-Jad pet? Say \`confirm\` to confirm.`
		);

		// Confirm the seller wants to sell
		try {
			await msg.channel.awaitMessages(
				_msg =>
					_msg.author.id === msg.author.id && _msg.content.toLowerCase() === 'confirm',
				{
					max: 1,
					time: 20_000,
					errors: ['time']
				}
			);
		} catch (err) {
			return sellMsg.edit(`Cancelling Fire cape gamble.`);
		}

		const newSacrificedCount =
			msg.author.settings.get(UserSettings.Stats.FireCapesSacrificed) + 1;
		await msg.author.removeItemFromBank(itemID('Fire cape'));
		await msg.author.settings.update(
			UserSettings.Stats.FireCapesSacrificed,
			newSacrificedCount
		);

		if (roll(200)) {
			await msg.author.addItemsToBank({ [itemID('Tzrek-Jad')]: 1 }, true);
			this.client.emit(
				Events.ServerNotification,
				`**${msg.author.username}'s** just received their ${formatOrdinal(
					msg.author.getCL(itemID('Tzrek-Jad')) + 1
				)} ${
					Emoji.TzRekJad
				} TzRek-jad pet by sacrificing a Fire cape for the ${formatOrdinal(
					newSacrificedCount
				)} time!`
			);
			return msg.channel.send(
				await mejJalImage(
					'You lucky. Better train him good else TzTok-Jad find you, JalYt.'
				)
			);
		}

		return msg.channel.send(
			await mejJalImage(
				`You not lucky. Maybe next time, JalYt. This is the ${formatOrdinal(
					newSacrificedCount
				)} time you gamble cape.`
			)
		);
	}
}
