import { reduceNumByPercent, Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { ActivityTaskOptionsWithQuantity } from '../../lib/types/minions';
import { formatDuration, randFloat } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			usage: '[tripTime:int{1}]',
			usageDelim: ' ',
			aliases: ['drift', 'dn'],
			description: 'Sends your minion to driftnet fishing.',
			examples: ['+driftnet 30', '+dn'],
			categoryFlags: ['minion', 'skilling']
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage, [tripTime]: [number | string | undefined]) {
		await msg.author.settings.sync(true);
		const userBank = msg.author.bank();
		const maxTripLength = msg.author.maxTripLength('DriftNet');

		if (typeof tripTime !== 'number') {
			tripTime = Math.floor(maxTripLength / Time.Minute);
		}
		await msg.author.settings.sync(true);

		if (msg.author.skillLevel(SkillsEnum.Fishing) < 47 || msg.author.skillLevel(SkillsEnum.Hunter) < 44) {
			return msg.channel.send('You need atleast level 44 Hunter and 47 Fishing to do Drift net fishing.');
		}

		if (
			!msg.author.hasItemEquippedAnywhere('Graceful gloves') ||
			!msg.author.hasItemEquippedAnywhere('Graceful top') ||
			!msg.author.hasItemEquippedAnywhere('Graceful legs')
		) {
			return msg.channel.send('You need Graceful top, legs and gloves equipped to do Drift net fishing.');
		}

		if (!msg.author.hasItemEquippedAnywhere('Merfolk trident')) {
			return msg.channel.send(
				'You need a trident equipped to do Drift net fishing. Example of tridents are Merfolk trident and Uncharged trident.'
			);
		}

		if (!Number(tripTime)) {
			return msg.channel.send(
				`Specify a valid trip length for example \`${msg.cmdPrefix}driftnet 10\` will send you out on a 10 minute trip.`
			);
		}

		let tripLength = Time.Minute * tripTime;

		if (tripLength > maxTripLength) {
			return msg.channel.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					maxTripLength
				)}, try a lower trip length. The highest amount of minutes you can send out is ${Math.floor(
					maxTripLength / Time.Minute
				)}.`
			);
		}

		const boosts = [];
		const itemsToRemove = new Bank();
		// Adjust numbers to end up with average 119 drift nets
		let oneDriftNetTime = randFloat(78, 106) * Time.Second;

		if (!msg.author.hasItemEquippedAnywhere('Flippers')) {
			boosts.push('-50% boost for not wearing Flippers');
		} else {
			oneDriftNetTime = reduceNumByPercent(oneDriftNetTime, 50);
		}

		if (msg.author.hasItemEquippedOrInBank('Stamina potion(4)') && !msg.flagArgs.ns) {
			if (
				msg.author.hasItemEquippedOrInBank('Ring of endurance (uncharged)') ||
				msg.author.hasItemEquippedOrInBank('Ring of endurance')
			) {
				oneDriftNetTime = reduceNumByPercent(oneDriftNetTime, 6);
				const ringStr = `6% boost for ${
					msg.author.hasItemEquippedOrInBank('Ring of endurance (uncharged)')
						? 'Ring of endurance (uncharged)'
						: 'Ring of endurance'
				}`;
				boosts.push(ringStr);
			}

			oneDriftNetTime = reduceNumByPercent(oneDriftNetTime, 30);
			boosts.push('30% boost for using Stamina potion(4)');
			itemsToRemove.add('Stamina potion(4)', 1);
		}

		const quantity = Math.round(tripLength / oneDriftNetTime);
		const duration = quantity * oneDriftNetTime;

		itemsToRemove.add('Drift net', quantity);

		if (!userBank.has(itemsToRemove.bank)) {
			return msg.channel.send(
				`You need ${quantity}x Drift net for the whole trip, try a lower trip length or make/buy more Drift net.`
			);
		}

		await addSubTaskToActivityTask<ActivityTaskOptionsWithQuantity>({
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: 'DriftNet'
		});

		await msg.author.removeItemsFromBank(itemsToRemove.bank);

		let str = `${msg.author.minionName} is now doing Drift net fishing, it will take around ${formatDuration(
			duration
		)}.`;

		if (itemsToRemove.length > 0) {
			str += ` Removed ${itemsToRemove} from your bank.`;
		}

		if (boosts.length > 0) {
			str += `\n\n**Boosts:** ${boosts.join(', ')}.`;
		}
		return msg.channel.send(str);
	}
}
