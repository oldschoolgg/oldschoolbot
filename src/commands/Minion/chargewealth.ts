import { Time } from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { BotCommand } from '../../lib/structures/BotCommand';
import { ActivityTaskOptionsWithQuantity } from '../../lib/types/minions';
import { formatDuration, skillsMeetRequirements } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export const wealthInventorySize = 26;
export const wealthInventoryTime = Time.Minute * 2.2;

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
			description: 'Sends your minion to charge inventories of ring of wealths',
			examples: ['+chargewealth 5'],
			categoryFlags: ['minion']
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage, [quantity]: [number | undefined]) {
		await msg.author.settings.sync(true);
		const userBank = msg.author.bank();

		const amountHas = userBank.amount('Ring of wealth');
		if (amountHas < wealthInventorySize) {
			return msg.channel.send(
				`You don't have enough Rings of wealth to recharge. Your minion does trips of ${wealthInventorySize}x rings of wealth.`
			);
		}

		const hasDiary = hasWildyEliteDiary(msg.author);

		let invDuration = wealthInventoryTime;
		if (hasDiary) {
			invDuration /= 3;
		}

		const maxTripLength = msg.author.maxTripLength('WealthCharging');

		const max = Math.min(amountHas / wealthInventorySize, Math.floor(maxTripLength / invDuration));
		if (quantity === undefined) {
			quantity = Math.floor(max);
		}

		const duration = quantity * invDuration;

		if (duration > maxTripLength) {
			return msg.channel.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					maxTripLength
				)}, try a lower quantity. The highest amount of inventories of rings of wealth you can recharge is ${Math.floor(
					maxTripLength / invDuration
				)}.`
			);
		}
		const quantityWealths = wealthInventorySize * quantity;

		if (userBank.amount('Ring of wealth') < quantityWealths) {
			return msg.channel.send(`You don't have enough Rings of wealth, ${quantityWealths} required.`);
		}

		await addSubTaskToActivityTask<ActivityTaskOptionsWithQuantity>({
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: 'WealthCharging'
		});

		await msg.author.removeItemsFromBank(new Bank().add('Ring of wealth', quantityWealths));

		return msg.channel.send(
			`${
				msg.author.minionName
			} is now charging ${quantityWealths} Rings of wealth, doing ${wealthInventorySize} Rings of wealth in ${quantity} trips, it'll take around ${formatDuration(
				duration
			)} to finish. Removed ${quantityWealths}x Ring of wealth from your bank.${
				hasDiary ? ' 3x Boost for Wilderness Elite diary.' : ''
			}`
		);
	}
}
