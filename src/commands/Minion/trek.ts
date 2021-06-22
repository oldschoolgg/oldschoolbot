import { objectEntries, reduceNumByPercent } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { Activity } from '../../lib/constants';
import { GearSetupTypes } from '../../lib/gear';
import { difficulties, ivandisRequirements, trekBankBoosts } from '../../lib/minions/data/templeTrekking';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { calcWhatPercent, formatDuration, itemNameFromID } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { TempleTrekkingActivityTaskOptions } from './../../lib/types/minions';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
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

		const tier = difficulties.find(item => item.difficulty === difficulty);

		if (tier === undefined) return msg.send('Cannot start temple trekking due to unknown tier!');

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

		// Gear boost. If not on easy difficulty,
		if (tier.difficulty !== 'easy') {
			let gearBoost = 1;
			const gearStat = gear.getStats().defence_stab;
			const maxValue = tier.gearBoostThreshold.defence_stab;
			const minValue = tier.minimumGearRequirements.defence_stab;

			gearBoost -= reduceNumByPercent(
				1 - tier.boosts.gearStats,
				calcWhatPercent(gearStat - minValue, maxValue - gearStat)
			);

			tripTime *= gearBoost;
			boosts.push(`${gearBoost}% time boost for gear stats`);
		}

		// Every 50 trips becomes 1% faster to a cap of 10%
		const percentFaster = Math.min(Math.floor((await msg.author.getMinigameScore('PyramidPlunder')) / 50), 10);

		boosts.push(`${percentFaster.toFixed(1)}% for minion learning`);

		tripTime = reduceNumByPercent(tripTime, percentFaster);

		for (const [id, percent] of objectEntries(trekBankBoosts)) {
			if (msg.author.hasItemEquippedOrInBank(Number(id))) {
				boosts.push(`${percent}% for ${itemNameFromID(Number(id))}`);
				tripTime = reduceNumByPercent(tripTime, percent);
			}
		}

		const [hasIvandisReqs, reason] = msg.author.hasSkillReqs(ivandisRequirements);
		if (!hasIvandisReqs) {
			boosts.push(`${(tier.boosts.ivandis - 1) * 100}% for not having requirements for Ivandis Flail: ${reason}`);
			tripTime *= tier.boosts.ivandis;
		}

		const maxTripLength = msg.author.maxTripLength(Activity.Trekking);

		if (quantity === null) {
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
			type: Activity.Plunder,
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
