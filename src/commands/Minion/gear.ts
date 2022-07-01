import { MessageAttachment } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

import { PATRON_ONLY_GEAR_SETUP, PerkTier } from '../../lib/constants';
import { GearSetupType, GearSetupTypes, resolveGearTypeSetting } from '../../lib/gear';
import { generateGearImage } from '../../lib/gear/functions/generateGearImage';
import { minionNotBusy } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			usage: `[swap] [${GearSetupTypes.join('|')}] [${GearSetupTypes.join('|')}]`,
			usageDelim: ' ',
			subcommands: true,
			aliases: ['gearall', 'gall'],
			description: 'Show and manage your gear.',
			examples: ['+gear melee', '+gear misc'],
			categoryFlags: ['minion', 'skilling']
		});
	}

	@minionNotBusy
	async swap(msg: KlasaMessage, [gear1, gear2]: [GearSetupType, GearSetupType]) {
		if (msg.commandText !== 'gear') return this.run(msg, [gear1]);
		if (!gear1 || !gear2) {
			return msg.channel.send(
				`**Invalid gear type**. The valid types are: ${GearSetupTypes.join(
					', '
				)}.\nExample of correct usage: \`${msg.cmdPrefix}gear swap melee range\``
			);
		}
		if (gear1 === 'wildy' || gear2 === 'wildy') {
			await msg.confirm(
				'Are you sure you want to swap your gear with a wilderness setup? You can lose items on your wilderness setup!'
			);
			msg.flagArgs.cf = '1';
		}

		if ([gear1, gear2].includes('other') && msg.author.perkTier < PerkTier.Four) {
			return msg.channel.send(PATRON_ONLY_GEAR_SETUP);
		}

		const _gear1 = msg.author.getGear(gear1);
		const _gear1Type = resolveGearTypeSetting(gear1);
		const _gear2 = msg.author.getGear(gear2);
		const _gear2Type = resolveGearTypeSetting(gear2);

		await msg.author.settings.update(_gear1Type, _gear2);
		await msg.author.settings.update(_gear2Type, _gear1);

		return msg.channel.send(`You swapped your ${gear1} gear with your ${gear2} gear.`);
	}

	async run(msg: KlasaMessage, [gearType]: [GearSetupType]) {
		const gear = msg.author.getGear(gearType);
		if (['gearall', 'gall'].includes(msg.commandText!)) msg.flagArgs.all = 'yes';

		if (!gearType && !msg.flagArgs.all) {
			return msg.channel.send(
				`**Invalid gear type**. The valid types are: ${GearSetupTypes.join(
					', '
				)}.\nYou can use \`--all\` or \`${msg.cmdPrefix}gearall\` to show all your gear in a single image.`
			);
		}

		if (msg.flagArgs.text) {
			return msg.channel.send('This feature has been moved to `/gear view`');
		}

		if (msg.flagArgs.all) {
			return msg.channel.send('This feature has been moved to `/gear view setup:all`');
		}

		const image = await generateGearImage(
			msg.author,
			gear,
			gearType,
			msg.author.settings.get(UserSettings.Minion.EquippedPet)
		);

		return msg.channel.send({
			content: 'This command has been moved to `/gear view`, but is temporarily still available.',
			files: [new MessageAttachment(image, 'osbot.png')]
		});
	}
}
