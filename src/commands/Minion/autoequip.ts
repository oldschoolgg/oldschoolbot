import { MessageAttachment } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { GearTypes } from '../../lib/gear';
import { generateGearImage } from '../../lib/gear/functions/generateGearImage';
import resolveGearTypeSetting from '../../lib/gear/functions/resolveGearTypeSetting';
import { requiresMinion } from '../../lib/minions/decorators';
import minionNotBusy from '../../lib/minions/decorators/minionNotBusy';
import getUserBestGearFromBank from '../../lib/minions/functions/getUserBestGearFromBank';
import { UserSettings } from '../../lib/settings/types/UserSettings';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage:
				'<melee|mage|range> <attack|defence> <crush|slash|stab|ranged|magic> [prayer|strength]',
			usageDelim: ' ',
			aliases: ['aep', 'aequip'],
			description:
				'Automatically equips the BIS gear you have in your bank, for a particular attack style, to one of your gear setups.',
			examples: ['+autoequip melee attack crush', '+autoequip mage attack magic']
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(
		msg: KlasaMessage,
		[gearType, type, style, extra = null]: [
			GearTypes.GearSetupTypes,
			string,
			string,
			string | null
		]
	) {
		await msg.author.settings.sync(true);
		const { gearToEquip, userFinalBank } = getUserBestGearFromBank(
			msg.author.settings.get(UserSettings.Bank),
			msg.author.rawGear()[gearType],
			gearType,
			type,
			style,
			extra
		);
		await msg.author.settings.update(UserSettings.Bank, userFinalBank);
		await msg.author.settings.update(resolveGearTypeSetting(gearType), gearToEquip);
		const image = await generateGearImage(
			this.client,
			msg.author,
			msg.author.settings.get(resolveGearTypeSetting(gearType)),
			gearType,
			msg.author.settings.get(UserSettings.Minion.EquippedPet)
		);
		return msg.send(
			`You auto-equipped your best ${style} stat gear for ${type} in your ${gearType} preset.`,
			new MessageAttachment(image, 'osbot.png')
		);
	}
}
