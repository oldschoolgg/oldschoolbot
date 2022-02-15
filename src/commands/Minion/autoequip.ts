import { MessageAttachment } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

import { PATRON_ONLY_GEAR_SETUP, PerkTier } from '../../lib/constants';
import { GearSetupType, resolveGearTypeSetting } from '../../lib/gear';
import { generateGearImage } from '../../lib/gear/functions/generateGearImage';
import { requiresMinion } from '../../lib/minions/decorators';
import minionNotBusy from '../../lib/minions/decorators/minionNotBusy';
import getUserBestGearFromBank from '../../lib/minions/functions/getUserBestGearFromBank';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { WILDY_PRESET_WARNING_MESSAGE } from './equip';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			usage: '<melee|mage|range|wildy> <attack|defence> <crush|slash|stab|ranged|magic> [prayer|strength]',
			usageDelim: ' ',
			aliases: ['aep', 'aequip'],
			description:
				'Automatically equips the BIS gear you have in your bank, for a particular attack style, to one of your gear setups.',
			examples: ['+autoequip melee attack crush', '+autoequip mage attack magic'],
			categoryFlags: ['minion']
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(
		msg: KlasaMessage,
		[gearType, type, style, extra = null]: [GearSetupType, string, string, string | null]
	) {
		await msg.author.settings.sync(true);

		if (gearType === 'wildy') await msg.confirm(WILDY_PRESET_WARNING_MESSAGE);

		if (gearType === 'other' && msg.author.perkTier < PerkTier.Four) {
			return msg.channel.send(PATRON_ONLY_GEAR_SETUP);
		}

		const { gearToEquip, toRemoveFromBank, toRemoveFromGear } = getUserBestGearFromBank(
			msg.author.settings.get(UserSettings.Bank),
			msg.author.getGear(gearType),
			gearType,
			msg.author.rawSkills,
			type,
			style,
			extra
		);

		if (Object.keys(toRemoveFromBank).length === 0) {
			return msg.channel.send("Couldn't find anything to equip.");
		}

		if (!msg.author.owns(toRemoveFromBank)) {
			return msg.channel.send(`You dont own ${toRemoveFromBank}!`);
		}

		await msg.author.removeItemsFromBank(toRemoveFromBank);
		await msg.author.addItemsToBank({ items: toRemoveFromGear, collectionLog: false });
		await msg.author.settings.update(resolveGearTypeSetting(gearType), gearToEquip);

		const image = await generateGearImage(
			this.client,
			msg.author,
			msg.author.getGear(gearType),
			gearType,
			msg.author.settings.get(UserSettings.Minion.EquippedPet)
		);
		return msg.channel.send({
			content: `You auto-equipped your best ${style} stat gear for ${type} in your ${gearType} preset.`,
			files: [new MessageAttachment(image, 'osbot.png')]
		});
	}
}
