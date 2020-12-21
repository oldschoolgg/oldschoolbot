import { MessageAttachment } from 'discord.js';
import { ArrayActions, CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { generatePrayerImage } from '../../lib/minions/functions/generatePrayerImage';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Prayer from '../../lib/skilling/skills/prayer';
import { SkillsEnum } from './../../lib/skilling/types';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			cooldown: 1,
			usage: '[prayer:...string]',
			aliases: ['ps'],
			description: 'Select what prayer to use.',
			examples: ['+prayersetup'],
			categoryFlags: ['minion']
		});
	}

	async run(msg: KlasaMessage, [prayer]: [string | undefined]) {
		const currentPrayers = msg.author.settings.get(UserSettings.SelectedPrayers);

		if (!prayer) {
			if (currentPrayers.length === 0) {
				return msg.send(`You have no prayers selected.`);
			}
			const image = await generatePrayerImage(this.client, msg.author);

			return msg.send(new MessageAttachment(image, 'osbot.png'));
		}
		const selectedPrayer = Prayer.Prayers.find(
			_prayer => _prayer.name.toLowerCase() === prayer.toLowerCase()
		);
		if (!selectedPrayer) {
			return msg.send(
				`${prayer} is not a prayer, the following prayers are possible to be activated: ${Prayer.Prayers.map(
					_prayer => _prayer.name
				).join(', ')}.`
			);
		}

		if (currentPrayers.includes(selectedPrayer.name)) {
			await msg.author.settings.update(UserSettings.SelectedPrayers, selectedPrayer, {
				arrayAction: ArrayActions.Remove
			});
			const image = await generatePrayerImage(this.client, msg.author);

			return msg.send(new MessageAttachment(image, 'osbot.png'));
		}

		if (msg.author.skillLevel(SkillsEnum.Prayer) < selectedPrayer.level) {
			return msg.send(
				`${msg.author.minionName} needs ${selectedPrayer.level} prayer to activate prayer ${selectedPrayer.name}.`
			);
		}

		await msg.author.settings.update(UserSettings.SelectedPrayers, selectedPrayer, {
			arrayAction: ArrayActions.Add
		});

		const image = await generatePrayerImage(this.client, msg.author);

		return msg.send(new MessageAttachment(image, 'osbot.png'));
	}
}
