import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { BitField } from '../../lib/constants';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import getOSItem from '../../lib/util/getOSItem';

const usables = [
	{
		item: getOSItem('Scroll of farming'),
		run: async (msg: KlasaMessage) => {
			const bits = msg.author.bitfield;
			if (bits.includes(BitField.HasScrollOfFarming)) {
				return msg.channel.send(`You have already unlocked the Scroll of farming.`);
			}
			await msg.author.removeItemsFromBank(new Bank().add('Scroll of farming'));
			await msg.author.settings.update(UserSettings.BitField, BitField.HasScrollOfFarming);
			return msg.channel.send(
				`You have used your Scroll of farming - you feel your Farming skills have improved and are now able to use more Farming patches.`
			);
		}
	}
];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<item:...string>',
			oneAtTime: true,
			cooldown: 5,
			altProtection: true
		});
	}

	async run(msg: KlasaMessage, [firstItemStr]: [string]) {
		const bank = msg.author.bank();
		const firstItem = getOSItem(firstItemStr);
		const usable = usables.find(u => u.item === firstItem);
		if (!usable) {
			return msg.channel.send(`That's not a usable item.`);
		}

		if (!bank.has(firstItem.id)) {
			return msg.channel.send(`You don't own this item.`);
		}

		return usable.run(msg);
	}
}
