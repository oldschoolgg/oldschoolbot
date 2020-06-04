import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Tasks, Time } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Cooking from '../../lib/skilling/skills/cooking';
import { SkillsEnum } from '../../lib/skilling/types';
import { CookingActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, removeItemFromBank, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import checkActivityQuantity from '../../lib/util/checkActivityQuantity';
import itemID from '../../lib/util/itemID';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[quantity:int{1}] <cookableName:...string>',
			usageDelim: ' '
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [quantity, cookableName]: [number, string]) {
		await msg.author.settings.sync(true);
		const cookable = Cooking.Cookables.find(
			cookable =>
				stringMatches(cookable.name, cookableName) ||
				stringMatches(cookable.name.split(' ')[0], cookableName)
		);

		if (!cookable) {
			return msg.send(
				`Thats not a valid item to cook. Valid cookables are ${Cooking.Cookables.map(
					cookable => cookable.name
				).join(', ')}.`
			);
		}

		if (msg.author.skillLevel(SkillsEnum.Cooking) < cookable.level) {
			return msg.send(
				`${msg.author.minionName} needs ${cookable.level} Cooking to cook ${cookable.name}s.`
			);
		}

		// Based off catherby fish/hr rates
		let timeToCookSingleCookable = Time.Second * 2.88;
		if (cookable.id === itemID('Jug of wine')) {
			timeToCookSingleCookable /= 1.6;
		}

		quantity = checkActivityQuantity(
			msg.author,
			quantity,
			timeToCookSingleCookable,
			cookable.inputCookables
		);
		const duration = quantity * timeToCookSingleCookable;

		const userBank = msg.author.settings.get(UserSettings.Bank);
		// Remove the cookables from their bank.
		let newBank = { ...userBank };
		for (const [cookableID, qty] of Object.entries(cookable.inputCookables)) {
			if (newBank[parseInt(cookableID)] < qty) {
				this.client.wtf(
					new Error(
						`${msg.author.sanitizedName} had insufficient cookables to be removed.`
					)
				);
				return;
			}
			newBank = removeItemFromBank(newBank, parseInt(cookableID), qty * quantity);
		}

		await addSubTaskToActivityTask<CookingActivityTaskOptions>(
			this.client,
			Tasks.SkillingTicker,
			{
				cookableID: cookable.id,
				userID: msg.author.id,
				channelID: msg.channel.id,
				quantity,
				duration,
				type: Activity.Cooking
			}
		);
		await msg.author.settings.update(UserSettings.Bank, newBank);

		return msg.send(
			`${msg.author.minionName} is now cooking ${quantity}x ${
				cookable.name
			}, it'll take around ${formatDuration(duration)} to finish.`
		);
	}
}
