import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { BitField } from '../../lib/constants';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import getOSItem from '../../lib/util/getOSItem';

interface UsableUnlock {
	item: Item;
	bitfield: BitField;
	resultMessage: string;
}

const usableUnlocks: UsableUnlock[] = [
	{
		item: getOSItem('Torn prayer scroll'),
		bitfield: BitField.HasTornPrayerScroll,
		resultMessage: 'You used your Torn prayer scroll, and unlocked the Preserve prayer.'
	},
	{
		item: getOSItem('Dexterous prayer scroll'),
		bitfield: BitField.HasDexScroll,
		resultMessage: 'You used your Dexterous prayer scroll, and unlocked the Rigour prayer.'
	},
	{
		item: getOSItem('Arcane prayer scroll'),
		bitfield: BitField.HasArcaneScroll,
		resultMessage: 'You used your Arcane prayer scroll, and unlocked the Augury prayer.'
	},
	{
		item: getOSItem('Slepey tablet'),
		bitfield: BitField.HasSlepeyTablet,
		resultMessage: 'You used your Slepey tablet, and unlocked the Slepe teleport.'
	}
];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<item:...string>',
			cooldown: 5,
			altProtection: true
		});
	}

	async run(msg: KlasaMessage, [firstItemStr]: [string]) {
		const bank = msg.author.bank();
		const firstItem = getOSItem(firstItemStr);

		if (!bank.has(firstItem.id)) {
			return msg.channel.send("You don't own this item.");
		}
		const usable = usableUnlocks.find(u => u.item === firstItem);
		if (!usable) {
			return msg.channel.send("That's not a usable item.");
		}
		if (msg.author.bitfield.includes(usable.bitfield)) {
			return msg.channel.send("You already used this item, you can't use it again.");
		}
		await msg.author.removeItemsFromBank(new Bank().add(usable.item.id));
		await msg.author.settings.update(UserSettings.BitField, usable.bitfield);
		return msg.channel.send(usable.resultMessage);
	}
}
