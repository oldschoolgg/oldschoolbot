import { MessageAttachment } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { BotCommand } from '../../lib/BotCommand';
import { GearRequired, hasGearEquipped } from '../../lib/gear/functions/hasGearEquipped';
import chatHeadImage from '../../lib/image/chatHeadImage';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { resolveNameBank } from '../../lib/util';
import resolveItems from '../../lib/util/resolveItems';

export async function santaChat(str: string) {
	const image = await chatHeadImage({ content: str, name: 'Santa', head: 'santa' });
	return new MessageAttachment(image);
}

export const baseSantaOutfit: GearRequired = {
	head: resolveItems(['Santa mask']),
	body: resolveItems(['Santa jacket']),
	legs: resolveItems(['Santa pantaloons']),
	hands: resolveItems(['Santa gloves']),
	feet: resolveItems(['Santa boots'])
};

const allSantaItems = [
	'Santa mask',
	'Santa jacket',
	'Santa pantaloons',
	'Santa gloves',
	'Santa boots'
];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			categoryFlags: ['minion']
		});
	}

	async run(msg: KlasaMessage) {
		await msg.author.settings.sync(true);
		const bank = new Bank(msg.author.settings.get(UserSettings.Bank));
		const gear = msg.author.settings.get(UserSettings.Gear.Misc);
		const hasFullSantaEquipped = hasGearEquipped(gear, baseSantaOutfit);
		const hasFullSantaBanked =
			bank.has(allSantaItems) ||
			allSantaItems.every(piece => msg.author.hasItemEquippedOrInBank(piece));

		if (!hasFullSantaEquipped) {
			if (hasFullSantaBanked) {
				return msg.send(
					await santaChat(
						'HOOOOO! You found my outfit...maybe you could deliver some presents for me...so I can have time off with Mrs Claus, equip it to your misc outfit and talk to me again!'
					)
				);
			}

			if (bank.amount('Carrot') === 0) {
				await msg.author.addItemsToBank(resolveNameBank({ Carrot: 5 }), true);
				return msg.send(
					await santaChat(
						'Ho-ho-ho! Player, I need some help - five of my reindeers have run off with my outfit, leaving me unable to deliver presents! Take these carrots and help me find them.'
					)
				);
			}

			return msg.send(
				await santaChat(
					"You still need to find my outfit from my reindeers! Try doing some activities to find them - they'll have to drop the outfit piece to eat the carrot from your bank."
				)
			);
		}
		if (!msg.author.hasItemEquippedOrInBank('Sack of presents')) {
			await msg.author.addItemsToBank(resolveNameBank({ 'Sack of presents': 1 }), true);
			return msg.send(
				await santaChat(
					'Here, take my sack of presents to give out to people - equip it in your misc outfit! Use +deliverpresents to deliver them.'
				)
			);
		}

		if (msg.author.hasItemEquippedOrInBank('Sack of presents')) {
			return msg.send(
				await santaChat(
					'Go deliver the presents now, the kids are waiting! Use +deliverpresents to deliver them.'
				)
			);
		}

		return msg.send(
			await santaChat(`This shouldn't be possible wtf!!!!!!!!!!!!! Tell Magnaboy`)
		);
	}
}
