import { calcWhatPercent, Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { Activity } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { TemporossActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, reduceNumByPercent } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['temp', 'ross', 'tempo', 'watertodt'],
			oneAtTime: true,
			altProtection: true,
			usage: '[quantity:int{1}]',
			usageDelim: ' ',
			categoryFlags: ['minion', 'skilling', 'minigame'],
			description: 'Sends your minion to fight Tempoross. Requires 35 fishing.',
			examples: ['+tempoross']
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage, [quantity = null]: [null | number]) {
		const fLevel = msg.author.skillLevel(SkillsEnum.Fishing);
		const user = msg.author;
		if (fLevel < 35) {
			return msg.channel.send('You need 35 Fishing to have a chance at defeating Tempoross.');
		}

		const messages = [];

		let durationPerRoss = Time.Minute * 15;

		let rewardBoost = 0;

		// Up to a 10% boost for 99 Fishing
		const fBoost = (fLevel + 1) / 10;
		if (fBoost > 1) messages.push(`${fBoost.toFixed(2)}% boost for Fishing level`);
		durationPerRoss = reduceNumByPercent(durationPerRoss, fBoost);

		const kc = await msg.author.getMinigameScore('Tempoross');
		const kcLearned = Math.min(100, calcWhatPercent(kc, 100));

		if (kcLearned > 0) {
			const percentReduced = kcLearned / 10;
			messages.push(`${percentReduced.toFixed(2)}% boost for KC`);
			durationPerRoss = reduceNumByPercent(durationPerRoss, percentReduced);
		}

		if (user.getGear('skilling').hasEquipped('Crystal harpoon') && fLevel >= 71) {
			messages.push('30% boost for Crystal harpoon');
			durationPerRoss = reduceNumByPercent(durationPerRoss, 30);
		} else if (user.getGear('skilling').hasEquipped('Infernal harpoon') && fLevel >= 75) {
			messages.push('10% boost for Infernal harpoon');
			durationPerRoss = reduceNumByPercent(durationPerRoss, 10);
			messages.push('100% more item rewards for Infernal harpoon');
			rewardBoost = 100;
		} else if (user.getGear('skilling').hasEquipped('Dragon harpoon') && fLevel >= 61) {
			messages.push('10% boost for Dragon harpoon');
			durationPerRoss = reduceNumByPercent(durationPerRoss, 10);
		}

		const maxTripLength = msg.author.maxTripLength(Activity.Tempoross);
		if (quantity === null) {
			quantity = Math.floor(maxTripLength / durationPerRoss);
		}

		const duration = durationPerRoss * quantity;

		if (duration > maxTripLength) {
			return msg.channel.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					maxTripLength
				)}, try a lower quantity. The highest amount of Tempoross that you can kill is ${Math.floor(
					maxTripLength / durationPerRoss
				)}.`
			);
		}

		await addSubTaskToActivityTask<TemporossActivityTaskOptions>({
			minigameID: 'Tempoross',
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Tempoross,
			rewardBoost
		});

		return msg.channel.send(
			`${
				msg.author.minionName
			} is now off to kill Tempoross ${quantity}x times, their trip will take ${formatDuration(
				duration
			)}. (${formatDuration(durationPerRoss)} per ross)\n\n${messages.join(', ')}.`
		);
	}
}
