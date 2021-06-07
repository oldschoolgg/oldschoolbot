import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

import { PerkTier } from '../../lib/constants';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[hex:string]',
			cooldown: 3,
			categoryFlags: ['minion'],
			description: 'Allows you to set a custom bank background color.',
			examples: ['+bgcolor #FF0000', '+bgcolor reset'],
			perkTier: PerkTier.Four
		});
	}

	async run(msg: KlasaMessage, [hex]: [string | undefined]) {
		const currentColor = msg.author.settings.get(UserSettings.BankBackgroundHex);

		const embed = new MessageEmbed();

		if (hex === 'reset') {
			await msg.author.settings.reset(UserSettings.BankBackgroundHex);
			return msg.channel.send(`Reset your bank background color.`);
		}

		if (!hex) {
			if (!currentColor) {
				return msg.channel.send(`You have no background color set.`);
			}
			return msg.channel.send(
				embed
					.setColor(currentColor)
					.setDescription(`Your current background color is \`${currentColor}\`.`)
			);
		}

		hex = hex.toUpperCase();
		const isValid = hex.length === 7 && /^#([0-9A-F]{3}){1,2}$/i.test(hex);
		if (!isValid) {
			return msg.channel.send(`That's not a valid hex color.`);
		}

		await msg.author.settings.update(UserSettings.BankBackgroundHex, hex);

		return msg.send(
			embed.setColor(hex).setDescription(`Your background color is now \`${hex}\``)
		);
	}
}
