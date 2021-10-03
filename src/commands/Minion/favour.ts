import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { Activity } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { KourendFavourActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { baseUserKourendFavour, findFavour, KourendFavours } from './../../lib/minions/data/kourendFavour';
import { SkillsEnum } from './../../lib/skilling/types';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[name:...string]',
			aliases: ['kf', 'kourand', 'kourandfavour'],
			categoryFlags: ['minion', 'minigame'],
			description: 'Sends your minion to complete Kourand Favours.',
			examples: ['+kf Arceuus', '+kourand', '+favour']
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [favourName]: [string | undefined]) {
		if (!favourName) return msg.channel.send('Insert picture here Fishy');
		const favour = findFavour(favourName);
		if (!favour) {
			return msg.channel.send(
				`Cannot find matching Kourend Favour. Possible Favours are: ${KourendFavours.map(i => i.name).join(
					', '
				)}.`
			);
		}
		const currentUserFavour = msg.author.settings.get(UserSettings.KourendFavour);
		msg.author.settings.update(UserSettings.KourendFavour, baseUserKourendFavour);
		const maxTripLength = msg.author.maxTripLength(Activity.KourendFavour);
		let currentPoints = 0;
		for (const [key, value] of Object.entries(currentUserFavour)) {
			if (key.toLowerCase() === favour.name.toLowerCase()) {
				if (value >= 100)
					return msg.channel.send(`You already have the maximum amount of ${key} Favour ${value}%.`);
				currentPoints = value;
				break;
			}
		}
		let quantity = Math.floor(maxTripLength / favour.duration);
		if (quantity * favour.pointsGain + currentPoints > 100) {
			quantity = Math.ceil((100 - currentPoints) / favour.pointsGain);
		}
		const duration = quantity * favour.duration;

		if (favour.qpRequired && msg.author.settings.get(UserSettings.QP) < favour.qpRequired) {
			return msg.channel.send(`You need ${favour.qpRequired} QP to do ${favour.name} Favour.`);
		}

		if (favour.skillReqs) {
			for (const [skillName, lvl] of Object.entries(favour.skillReqs)) {
				if (msg.author.skillLevel(skillName as SkillsEnum) < lvl) {
					return msg.channel.send(`You need ${lvl} ${skillName} to do ${favour.name} Favour.`);
				}
			}
		}
		let cost: Bank = new Bank();
		if (favour.itemCost) {
			cost = favour.itemCost.clone().multiply(quantity);
			if (!msg.author.owns(cost)) {
				return msg.channel.send(`You don't have the items needed for this trip, you need: ${cost}.`);
			}
			await msg.author.removeItemsFromBank(cost);
		}

		await addSubTaskToActivityTask<KourendFavourActivityTaskOptions>({
			favour,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.KourendFavour
		});

		return msg.channel.send(
			`${msg.author.minionName} is now completing ${favour.name} Favour tasks, it'll take around ${formatDuration(
				duration
			)} to finish.${cost.toString().length > 0 ? ` Removed ${cost} from your bank.` : ''}`
		);
	}
}
