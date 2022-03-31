import { Time } from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { BotCommand } from '../../lib/structures/BotCommand';
import { ActivityTaskOptionsWithQuantity } from '../../lib/types/minions';
import { formatDuration, skillsMeetRequirements } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export const gloriesInventorySize = 26;
export const gloriesInventoryTime = Time.Minute * 2.2;

export function hasWildyEliteDiary(user: KlasaUser): boolean {
	return skillsMeetRequirements(user.rawSkills, {
		woodcutting: 75,
		agility: 60,
		cooking: 90,
		firemaking: 75,
		fishing: 85,
		magic: 96,
		mining: 85,
		smithing: 90,
		thieving: 84,
		hunter: 67
	});
}

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			usage: '[quantity:int{1}]',
			usageDelim: ' ',
			description: 'Sends your minion to charge inventories of glory',
			examples: ['+chargeglories 5'],
			categoryFlags: ['minion']
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage, [quantity]: [number | undefined]) {
		await msg.author.settings.sync(true);
		const userBank = msg.author.bank();

		const amountHas = userBank.amount('Amulet of glory');
		if (amountHas < gloriesInventorySize) {
			return msg.channel.send(
				`You don't have enough Amulets of glory to recharge. Your minion does trips of ${gloriesInventorySize}x glories.`
			);
		}

		const hasDiary = hasWildyEliteDiary(msg.author);

		let invDuration = gloriesInventoryTime;
		if (hasDiary) {
			invDuration /= 3;
		}

		const maxTripLength = msg.author.maxTripLength('GloryCharging');

		const max = Math.min(amountHas / gloriesInventorySize, Math.floor(maxTripLength / invDuration));
		if (quantity === undefined) {
			quantity = Math.floor(max);
		}

		const duration = quantity * invDuration;

		if (duration > maxTripLength) {
			return msg.channel.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					maxTripLength
				)}, try a lower quantity. The highest amount of inventories of glories you can recharge is ${Math.floor(
					maxTripLength / invDuration
				)}.`
			);
		}
		const quantityGlories = gloriesInventorySize * quantity;

		if (userBank.amount('Amulet of glory') < quantityGlories) {
			return msg.channel.send(`You don't have enough ${quantityGlories}x Amulet of glory.`);
		}

		await addSubTaskToActivityTask<ActivityTaskOptionsWithQuantity>({
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: 'GloryCharging'
		});

		await msg.author.removeItemsFromBank(new Bank().add('Amulet of glory', quantityGlories));

		return msg.channel.send(
			`${
				msg.author.minionName
			} is now charging ${quantityGlories} Amulets of glory, doing ${gloriesInventorySize} glories in ${quantity} trips, it'll take around ${formatDuration(
				duration
			)} to finish. Removed ${quantityGlories}x Amulet of glory from your bank.${
				hasDiary ? ' 3x Boost for Wilderness Elite diary.' : ''
			}`
		);
	}
}
