import { objectEntries, reduceNumByPercent } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { Activity } from '../../lib/constants';
import { MorytaniaDiary, userhasDiaryTier } from '../../lib/diaries';
import { GearSetupTypes } from '../../lib/gear';
import { difficulties, trekBankBoosts } from '../../lib/minions/data/templeTrekking';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { formatDuration, itemNameFromID, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { TempleTrekkingActivityTaskOptions } from './../../lib/types/minions';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			usage: '<quantity:int{1}|difficulty:...string> [name:...string]',
			usageDelim: ' ',
			categoryFlags: ['minion', 'minigame'],
			description: 'Sends your minion to Temple Trek.',
			examples: ['+trek easy/medium/hard']
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [quantity, difficulty = 'easy']: [null | number | string, string]) {
		if (typeof quantity === 'string') {
			difficulty = quantity;
			quantity = null;
		}

		const tier = difficulties.find(item => stringMatches(item.difficulty, difficulty));

		if (tier === undefined) return msg.send('Cannot start temple trekking due to unknown tier! Valid tiers are easy/medium/hard. Example: +trek medium');

		const minLevel = tier.minCombat;
		const qp = msg.author.settings.get(UserSettings.QP);
		const gear = msg.author.getGear(GearSetupTypes.Melee);

		if (!gear.meetsStatRequirements(tier.minimumGearRequirements)) {
			let ret = '';
			for (const stat of objectEntries(tier.minimumGearRequirements)) {
				if (ret === '') {
					ret += ', ';
				}
				ret += stat;
			}
			return msg.send(`You need at least ${ret} to do Temple Trekking.`);
		}

		if (qp < 30) {
			return msg.send('You need atleast level 30 QP to do Temple Trekking.');
		}

		if (minLevel !== undefined && msg.author.combatLevel < minLevel) {
			return msg.send(`You need to be at least combat level ${minLevel} for ${difficulty} Temple Trekking.`);
		}

		let tripTime = tier.time;
		const boosts = [];

		// Every 25 trips becomes 1% faster to a cap of 10%
		const percentFaster = Math.min(Math.floor((await msg.author.getMinigameScore('TempleTrekking')) / 25), 10);

		boosts.push(`${percentFaster.toFixed(1)}% for minion learning`);

		tripTime = reduceNumByPercent(tripTime, percentFaster);

		for (const [id, percent] of objectEntries(trekBankBoosts)) {
			if (msg.author.hasItemEquippedOrInBank(Number(id))) {
				boosts.push(`${percent}% for ${itemNameFromID(Number(id))}`);
				tripTime = reduceNumByPercent(tripTime, percent);
			}
		}

		if (!msg.author.hasGracefulEquipped()) {
			boosts.push('-15% for not having graceful equipped anywhere');
			tripTime *= 1.15;
		}

		const [hasMoryHard] = await userhasDiaryTier(msg.author, MorytaniaDiary.hard);

		if (hasMoryHard) {
			boosts.push('15% for Morytania hard diary');
			tripTime *= 0.85;
		}

		if (msg.author.hasItemEquippedOrInBank('Ivandis flail')) {
			let flailBoost = tier.boosts.ivandis;
			let itemName = 'Ivandis';
			if (msg.author.hasItemEquippedOrInBank('Blisterwood flail')) {
				flailBoost -= 1 - tier.boosts.blisterwood;
				itemName = 'Blisterwood';
			}

			itemName += ' flail';
			boosts.push(`${((1 - flailBoost) * 100).toFixed(1)}% ${itemName}`);
			tripTime *= flailBoost;
		}

		const maxTripLength = msg.author.maxTripLength(Activity.Trekking);

		if (quantity === undefined || quantity === null) {
			quantity = Math.floor(maxTripLength / tripTime);
		}

		const duration = quantity * tripTime;

		if (duration > maxTripLength) {
			return msg.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					maxTripLength
				)}, try a lower quantity. The highest amount of Treks you can go on is ${Math.floor(
					maxTripLength / tripTime
				)}.`
			);
		}

		await addSubTaskToActivityTask<TempleTrekkingActivityTaskOptions>({
			difficulty,
			quantity,
			userID: msg.author.id,
			duration,
			type: Activity.Trekking,
			channelID: msg.channel.id,
			minigameID: 'TempleTrekking'
		});

		let str = `${
			msg.author.minionName
		} is now doing Temple Trekking ${quantity} times. The trip will take ${formatDuration(
			duration
		)}, with each trek taking ${formatDuration(tripTime)}.`;

		if (boosts.length > 0) {
			str += `\n\n**Boosts:** ${boosts.join(', ')}.`;
		}

		return msg.send(str);
	}
}
