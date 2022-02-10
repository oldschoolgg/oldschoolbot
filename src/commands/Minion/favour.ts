import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { KourendFavourActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { findFavour, KourendFavours } from './../../lib/minions/data/kourendFavour';
import { SkillsEnum } from './../../lib/skilling/types';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			usage: '[name:...string]',
			aliases: ['kf', 'kourend', 'kourendfavour'],
			categoryFlags: ['minion', 'minigame'],
			description: 'Sends your minion to complete Kourend Favours.',
			examples: ['+kf Arceuus', '+kourend', '+favour']
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage, [favourName]: [string | undefined]) {
		const currentUserFavour = msg.author.settings.get(UserSettings.KourendFavour);
		if (!favourName || msg.author.minionIsBusy) {
			let allFavourString: string = 'Your current Kourend Favour:';
			for (const [key, value] of Object.entries(currentUserFavour)) {
				allFavourString += `\n**${key}**: ${value}%`;
			}
			return msg.channel.send(allFavourString);
		}
		const favour = findFavour(favourName);
		if (!favour) {
			return msg.channel.send(
				`Cannot find matching Kourend Favour. Possible Favours are: ${KourendFavours.map(i => i.name).join(
					', '
				)}.`
			);
		}
		const maxTripLength = msg.author.maxTripLength('KourendFavour');
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
		let duration = quantity * favour.duration;

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
		let ns = false;
		if (favour.itemCost) {
			cost = favour.itemCost.clone().multiply(quantity);
			if (cost.has('Stamina potion(4)') && msg.flagArgs.ns) {
				// 50% longer trip time for not using stamina potion(4)
				ns = true;
				duration *= 1.5;
				cost.remove('Stamina potion(4)', cost.amount('Stamina potion (4)'));
			}
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
			type: 'KourendFavour'
		});

		return msg.channel.send(
			`${msg.author.minionName} is now completing ${favour.name} Favour tasks, it'll take around ${formatDuration(
				duration
			)} to finish.${cost.toString().length > 0 ? ` Removed ${cost} from your bank.` : ''}${
				ns ? '\n50% longer trip due to not using Stamina potions.' : ''
			}`
		);
	}
}
