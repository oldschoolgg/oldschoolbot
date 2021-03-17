import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';

import { Activity, Time } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { BotCommand } from '../../lib/structures/BotCommand';
import { GloryChargingActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, itemID } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { skillsMeetRequirements } from '../../lib/util/skillsMeetRequirements';

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
			oneAtTime: true,
			cooldown: 1,
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
			return msg.send(
				`You don't have enough Amulets of glory to recharge. Your minion does trips of ${gloriesInventorySize}x glories.`
			);
		}

		const hasDiary = hasWildyEliteDiary(msg.author);

		let invDuration = gloriesInventoryTime;
		if (hasDiary) {
			invDuration /= 3;
		}

		const max = Math.min(
			amountHas / gloriesInventorySize,
			Math.floor(msg.author.maxTripLength / invDuration)
		);
		if (quantity === undefined) {
			quantity = Math.floor(max);
		}

		const duration = quantity * invDuration;

		if (duration > msg.author.maxTripLength) {
			return msg.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					msg.author.maxTripLength
				)}, try a lower quantity. The highest amount of inventories of glories you can recharge is ${Math.floor(
					msg.author.maxTripLength / invDuration
				)}.`
			);
		}
		const quantityGlories = gloriesInventorySize * quantity;

		if (userBank.amount('Amulet of glory') < quantityGlories) {
			return msg.send(`You don't have enough ${quantityGlories}x Amulet of glory.`);
		}

		await addSubTaskToActivityTask<GloryChargingActivityTaskOptions>(this.client, {
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.GloryCharging
		});

		await msg.author.removeItemFromBank(itemID('Amulet of glory'), quantityGlories);

		return msg.send(
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
