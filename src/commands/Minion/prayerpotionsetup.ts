import { MessageAttachment } from 'discord.js';
import { ArrayActions, CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/structures/BotCommand';
import Potions from '../../lib/minions/data/potions';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { generatePotionImage } from '../../lib/minions/functions/generatePotionImage';
import { generatePrayerImage } from '../../lib/minions/functions/generatePrayerImage';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Prayer from '../../lib/skilling/skills/prayer';
import { SkillsEnum } from '../../lib/skilling/types';
import { itemNameFromID } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			cooldown: 1,
			usage: '[unlock|prayer|potion] [prayerOrPotion:...string]',
			usageDelim: ' ',
			aliases: ['ps', 'prayersetup', 'potionsetup'],
			description: 'Select what prayer/potions to use or unlock prayer.',
			examples: [
				'+prayersetup prayer Thick Skin',
				'+potionsetup potion Saradomin brew',
				'+ps unlock Rigour'
			],
			categoryFlags: ['minion'],
			subcommands: true
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage) {
		const currentPrayers = msg.author.settings.get(UserSettings.SelectedPrayers);
		const currentPotions = msg.author.settings.get(UserSettings.SelectedPotions);

		console.log('potion length', currentPotions.length);
		console.log(currentPotions[0]);
		console.log('prayer length', currentPrayers.length);

		if (currentPrayers.length === 0 && currentPotions.length === 0) {
			return msg.send(`You have no prayers activated and no potions selected.`);
		}

		if (currentPrayers.length === 0) {
			const image = await generatePotionImage(this.client, msg.author);
			return msg.send(
				`You have no prayers activated.`,
				new MessageAttachment(image, 'osbot.png')
			);
		}

		if (currentPotions.length === 0) {
			const image = await generatePrayerImage(this.client, msg.author);
			return msg.send(
				`You have no potions selected.`,
				new MessageAttachment(image, 'osbot.png')
			);
		}

		const imagePrayerBuffer = await generatePrayerImage(this.client, msg.author);
		const imagePrayer = new MessageAttachment(imagePrayerBuffer, 'osbot2.png');
		const imagePotionBuffer = await generatePotionImage(this.client, msg.author);
		const imagePotion = new MessageAttachment(imagePotionBuffer, 'osbot1.png');

		return msg.send([imagePotion, imagePrayer]);
	}

	@requiresMinion
	@minionNotBusy
	async prayer(msg: KlasaMessage, [prayer = undefined]: [string | undefined]) {
		const currentPrayers = msg.author.settings.get(UserSettings.SelectedPrayers);
		const unlockedPrayers = msg.author.settings.get(UserSettings.UnlockedPrayers);
		if (!prayer) {
			if (currentPrayers.length === 0) {
				return msg.send(`You have no prayers activated.`);
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

		if (currentPrayers.includes(selectedPrayer.name.toLowerCase())) {
			await msg.author.settings.update(
				UserSettings.SelectedPrayers,
				selectedPrayer.name.toLowerCase(),
				{
					arrayAction: ArrayActions.Remove
				}
			);
			const image = await generatePrayerImage(this.client, msg.author);

			return msg.send(new MessageAttachment(image, 'osbot.png'));
		}

		if (
			!selectedPrayer.unlocked &&
			!unlockedPrayers.includes(selectedPrayer.name.toLowerCase())
		) {
			return msg.send(
				`${msg.author.minionName} needs to unlock ${selectedPrayer.name} before it can be activated.`
			);
		}

		if (msg.author.skillLevel(SkillsEnum.Prayer) < selectedPrayer.level) {
			return msg.send(
				`${msg.author.minionName} needs ${selectedPrayer.level} prayer to activate prayer ${selectedPrayer.name}.`
			);
		}

		if (
			selectedPrayer.offensive1 ||
			selectedPrayer.offensive2 ||
			selectedPrayer.overHead ||
			selectedPrayer.defensive
		) {
			for (let prayer of Prayer.Prayers) {
				if (
					currentPrayers.includes(prayer.name.toLowerCase()) &&
					prayer.offensive1 &&
					selectedPrayer.offensive1
				) {
					await msg.author.settings.update(
						UserSettings.SelectedPrayers,
						prayer.name.toLowerCase(),
						{
							arrayAction: ArrayActions.Remove
						}
					);
				} else if (
					currentPrayers.includes(prayer.name.toLowerCase()) &&
					prayer.offensive2 &&
					selectedPrayer.offensive2
				) {
					await msg.author.settings.update(
						UserSettings.SelectedPrayers,
						prayer.name.toLowerCase(),
						{
							arrayAction: ArrayActions.Remove
						}
					);
				} else if (
					currentPrayers.includes(prayer.name.toLowerCase()) &&
					prayer.defensive &&
					selectedPrayer.defensive
				) {
					await msg.author.settings.update(
						UserSettings.SelectedPrayers,
						prayer.name.toLowerCase(),
						{
							arrayAction: ArrayActions.Remove
						}
					);
				} else if (
					currentPrayers.includes(prayer.name.toLowerCase()) &&
					prayer.overHead &&
					selectedPrayer.overHead
				) {
					await msg.author.settings.update(
						UserSettings.SelectedPrayers,
						prayer.name.toLowerCase(),
						{
							arrayAction: ArrayActions.Remove
						}
					);
				}
			}
		}

		await msg.author.settings.update(
			UserSettings.SelectedPrayers,
			selectedPrayer.name.toLowerCase(),
			{
				arrayAction: ArrayActions.Add
			}
		);

		const image = await generatePrayerImage(this.client, msg.author);

		return msg.send(new MessageAttachment(image, 'osbot.png'));
	}

	@requiresMinion
	@minionNotBusy
	async potion(msg: KlasaMessage, [potion = undefined]: [string | undefined]) {
		const currentPotions = msg.author.settings.get(UserSettings.SelectedPotions);

		if (!potion) {
			if (currentPotions.length === 0) {
				return msg.send(`You have no potions selected.`);
			}
			const image = await generatePotionImage(this.client, msg.author);

			return msg.send(new MessageAttachment(image, 'osbot.png'));
		}
		const selectedPotion = Potions.find(
			_potion => _potion.name.toLowerCase() === potion.toLowerCase()
		);
		if (!selectedPotion) {
			return msg.send(
				`${potion} is not a potion, the following potions are possible to be selected: ${Potions.map(
					_potion => _potion.name
				).join(', ')}.`
			);
		}

		if (currentPotions.includes(selectedPotion.name.toLowerCase())) {
			await msg.author.settings.update(
				UserSettings.SelectedPotions,
				selectedPotion.name.toLowerCase(),
				{
					arrayAction: ArrayActions.Remove
				}
			);
			const image = await generatePotionImage(this.client, msg.author);

			return msg.send(new MessageAttachment(image, 'osbot.png'));
		}

		await msg.author.settings.update(
			UserSettings.SelectedPotions,
			selectedPotion.name.toLowerCase(),
			{
				arrayAction: ArrayActions.Add
			}
		);

		const image = await generatePotionImage(this.client, msg.author);

		return msg.send(new MessageAttachment(image, 'osbot.png'));
	}

	@requiresMinion
	async unlock(msg: KlasaMessage, [input]: [string | undefined]) {
		if (!input) {
			return msg.send(
				`Possible prayers to unlock are: ${Prayer.Prayers.map(_prayer =>
					!_prayer.unlocked ? _prayer.name : ''
				).join(', ')}.`
			);
		}

		const unlockable = Prayer.Prayers.find(
			_prayer => _prayer.name.toLowerCase() === input.toLowerCase()
		);

		if (!unlockable || unlockable.unlocked) {
			return msg.send(
				`That is not a valid prayer to unlock, possible prayers to unlock are: ${Prayer.Prayers.map(
					_prayer => (!_prayer.unlocked ? _prayer.name : '')
				).join(', ')}.`
			);
		}

		await msg.author.settings.sync(true);

		const unlockedPrayers = msg.author.settings.get(UserSettings.UnlockedPrayers);

		if (unlockedPrayers.includes(unlockable.name.toLowerCase())) {
			return msg.send(`You already unlocked prayer ${unlockable.name}.`);
		}

		if (unlockable.defLvl && msg.author.skillLevel(SkillsEnum.Defence) < unlockable.defLvl) {
			return msg.send(
				`${msg.author.minionName} needs ${unlockable.defLvl} defence to unlock prayer ${unlockable.name}.`
			);
		}

		if (
			unlockable.qpRequired &&
			msg.author.settings.get(UserSettings.QP) < unlockable.qpRequired
		) {
			return msg.send(
				`${msg.author.minionName} needs ${unlockable.qpRequired} questpoints to unlock prayer ${unlockable.name}.`
			);
		}

		if (unlockable.inputId) {
			const hasRequiredScroll = await msg.author.hasItem(unlockable.inputId, 1, true);
			if (!hasRequiredScroll)
				return msg.send(
					`You have no ${itemNameFromID(unlockable.inputId)} to unlock prayer ${
						unlockable.name
					}.`
				);

			await msg.author.removeItemFromBank(unlockable.inputId, 1);
		}

		await msg.author.settings.update(
			UserSettings.UnlockedPrayers,
			unlockable.name.toLowerCase(),
			{
				arrayAction: ArrayActions.Add
			}
		);

		return msg.send(
			`${msg.author.minionName} have unlocked prayer ${unlockable.name}. Congratulations!`
		);
	}
}
