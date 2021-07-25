import { ArrayActions } from '@klasa/settings-gateway';
import { deepClone, objectEntries, objectValues } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { requiresMinion } from '../../lib/minions/decorators';
import { CompostTier, FarmingPatchTypes } from '../../lib/minions/farming/types';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Farming from '../../lib/skilling/skills/farming';
import { TSeedType } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { stringMatches } from '../../lib/util';

const CompostTiers = [
	{
		name: 'Compost'
	},
	{
		name: 'Supercompost'
	},
	{
		name: 'Ultracompost'
	}
];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			usage: '[tier|pay|reminders|favorite|block] [CompostTierOrEnable:...string]',
			usageDelim: ' ',
			oneAtTime: true,
			subcommands: true,
			aliases: ['df'],
			description:
				'Changes which compost tier to automatically use while farming, whether or not to autopay for crops, if farming reminders will be on, favorite plants to plant and patches to block.',
			examples: [
				'+defaultfarming tier supercompost',
				'+defaultfarming pay enable',
				'+df reminders enable',
				'+df favorite ranarr',
				'+df block hops'
			]
		});
	}

	async getSettings(msg: KlasaMessage) {
		await msg.author.settings.sync(true);

		return {
			...deepClone(await msg.author.settings.get(UserSettings.Minion.FarmingSettings))
		};
	}

	@requiresMinion
	async run(msg: KlasaMessage) {
		const farmingSettings = await this.getSettings(msg);
		const currentCompostTier = farmingSettings.defaultCompost;
		const currentPaymentSetting = farmingSettings.defaultPay;

		return msg.channel.send(
			`Your current compost tier to automatically use is ${currentCompostTier}.` +
				`\nYour current payment default is ${currentPaymentSetting ? '' : '**not**'} to automatically pay.` +
				`\n\`${msg.cmdPrefix}defaultfarming tier <compost_type>\` will set your default compost to what you specify.` +
				`\n\`${msg.cmdPrefix}defaultfarming pay <enable/disable>\` will either enable automatic payments or disable them.`
		);
	}

	async tier(msg: KlasaMessage, [newCompostTier]: [CompostTier]) {
		const farmingSettings = await this.getSettings(msg);

		if (newCompostTier === undefined) {
			return msg.channel.send(
				'You must specify a valid compost type. The available tiers to select are `compost`, `supercompost`, and `ultracompost`.' +
					`For example, \`${msg.cmdPrefix}defaultfarming tier supercompost\`.`
			);
		}

		const compostTier = CompostTiers.find(i => stringMatches(newCompostTier, i.name));
		if (!compostTier) {
			return msg.channel.send(
				'The available tiers to select are `compost`, `supercompost`, and `ultracompost`.' +
					` For example, \`${msg.cmdPrefix}defaultfarming tier supercompost\`.`
			);
		}

		const currentCompostTier = farmingSettings.defaultCompost;

		if (currentCompostTier !== newCompostTier) {
			farmingSettings.defaultCompost = newCompostTier;
			await msg.author.settings.update(UserSettings.Minion.FarmingSettings, farmingSettings, {
				arrayAction: ArrayActions.Overwrite
			});

			return msg.channel.send(
				`Your minion will now automatically use ${newCompostTier} for farming, if you have any.`
			);
		}
		return msg.channel.send('You are already automatically using this type of compost.');
	}

	async pay(msg: KlasaMessage, [trueOrFalse]: ['enable' | 'disable']) {
		const farmingSettings = await this.getSettings(msg);

		if (trueOrFalse === 'enable') {
			farmingSettings.defaultPay = true;
			await msg.author.settings.update(UserSettings.Minion.FarmingSettings, farmingSettings, {
				arrayAction: ArrayActions.Overwrite
			});

			return msg.channel.send(
				'Your minion will now automatically pay for farming, if you have the payment needed.'
			);
		} else if (trueOrFalse === 'disable') {
			farmingSettings.defaultPay = false;
			await msg.author.settings.update(UserSettings.Minion.FarmingSettings, farmingSettings, {
				arrayAction: ArrayActions.Overwrite
			});

			return msg.channel.send('Your minion will now **not** automatically pay for farming.');
		}
		return msg.channel.send(
			'The available options for pay is `enable` and `disable`.' +
				`\nFor example, \`${msg.cmdPrefix}defaultfarming pay enable\`.`
		);
	}

	async reminders(msg: KlasaMessage, [trueOrFalse]: ['enable' | 'disable']) {
		const farmingSettings = await this.getSettings(msg);

		if (trueOrFalse === 'enable') {
			farmingSettings.remindersEnabled = true;
			await msg.author.settings.update(UserSettings.Minion.FarmingSettings, farmingSettings, {
				arrayAction: ArrayActions.Overwrite
			});

			return msg.channel.send('You will now be notified by a direct message when your crops grown.');
		} else if (trueOrFalse === 'disable') {
			farmingSettings.remindersEnabled = false;
			await msg.author.settings.update(UserSettings.Minion.FarmingSettings, farmingSettings, {
				arrayAction: ArrayActions.Overwrite
			});

			return msg.channel.send('You will NOT be notified by a direct message when your crops grown.');
		}
		return msg.channel.send(
			'The available options for pay is `enable` and `disable`.' +
				`\nFor example, \`${msg.cmdPrefix}defaultfarming reminders enable\`.`
		);
	}

	async favorite(msg: KlasaMessage, [plant]: [string]) {
		const farmingSettings = await this.getSettings(msg);
		let updated = false;
		if (plant) {
			const plantToFavorite = Farming.Plants.find(p => stringMatches(p.name, plant));
			if (!plantToFavorite) {
				return msg.channel.send(
					`${plant} is not a valid plant to favorite. The possible choices are: ${Farming.Plants.map(
						p => p.name
					).join(', ')}`
				);
			}

			// Check if favoritePlants is not null
			if (!farmingSettings.favoritePlants) {
				farmingSettings.favoritePlants = {
					[plantToFavorite.seedType]: plantToFavorite.name
				};
			} else if (
				farmingSettings.favoritePlants[plantToFavorite.seedType] &&
				farmingSettings.favoritePlants[plantToFavorite.seedType] === plantToFavorite.name
			) {
				delete farmingSettings.favoritePlants[plantToFavorite.seedType];
			} else {
				farmingSettings.favoritePlants[plantToFavorite.seedType] = plantToFavorite.name;
			}

			updated = true;
			await msg.author.settings.update(UserSettings.Minion.FarmingSettings, farmingSettings, {
				arrayAction: ArrayActions.Overwrite
			});
		}
		const favorites = farmingSettings.favoritePlants
			? objectEntries(farmingSettings.favoritePlants).map(v => `${v[1]} (${v[0]})`)
			: [];
		return msg.channel.send(
			`${updated ? 'You updated your favorite plants. ' : ''}This is your current favorites: ${
				favorites.length > 0 ? favorites.join(', ') : 'No favorites'
			}`
		);
	}

	async block(msg: KlasaMessage, [patch]: [TSeedType]) {
		const farmingSettings = await this.getSettings(msg);
		let updated = false;
		if (objectValues(FarmingPatchTypes).includes(patch as FarmingPatchTypes)) {
			// Check if favoritePlants is not null
			if (!farmingSettings.blockedPatches) {
				farmingSettings.blockedPatches = [patch];
			} else if (farmingSettings.blockedPatches.includes(patch)) {
				farmingSettings.blockedPatches.splice(farmingSettings.blockedPatches.indexOf(patch), 1);
			} else {
				farmingSettings.blockedPatches.push(patch);
			}
			updated = true;
			await msg.author.settings.update(UserSettings.Minion.FarmingSettings, farmingSettings, {
				arrayAction: ArrayActions.Overwrite
			});
		}
		const blocked = farmingSettings.blockedPatches ? farmingSettings.blockedPatches : [];
		return msg.channel.send(
			`${updated ? 'You updated your blocked patches. ' : ''}This is your current blocked patches: ${
				blocked.length > 0 ? blocked.join(', ') : 'No blocked patches'
			}`
		);
	}
}
