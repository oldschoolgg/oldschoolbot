import { calcWhatPercent, percentChance, reduceNumByPercent, Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { ZALCANO_ID } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import removeFoodFromUser from '../../lib/minions/functions/removeFoodFromUser';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { Skills } from '../../lib/types';
import { ZalcanoActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, itemID } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export const soteSkillRequirements: Skills = {
	mining: 70,
	smithing: 70,
	farming: 70,
	woodcutting: 70,
	agility: 70,
	herblore: 70,
	construction: 70,
	hunter: 70
};

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			altProtection: true,
			requiredPermissionsForBot: ['ADD_REACTIONS', 'ATTACH_FILES'],
			categoryFlags: ['minion', 'skilling', 'minigame'],
			description: 'Sends your minion to fight Zalcano. Requires food and 150 QP.',
			examples: ['+zalcano']
		});
	}

	calcPerformance(kcLearned: number, skillPercentage: number) {
		let basePerformance = 50;

		// Up to +25% performance for KC
		basePerformance += Math.floor(kcLearned / 4);

		// Up to +20% Performance for Skill Levels
		basePerformance += Math.floor(skillPercentage / 10);

		return Math.min(100, basePerformance);
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage) {
		const [hasSkillReqs, reason] = msg.author.hasSkillReqs(soteSkillRequirements);
		if (!hasSkillReqs) {
			return msg.channel.send(`To fight Zalcano, you need: ${reason}.`);
		}
		if (msg.author.settings.get(UserSettings.QP) < 150) {
			return msg.channel.send('To fight Zalcano, you need 150 QP.');
		}

		const kc = msg.author.getKC(ZALCANO_ID);
		const kcLearned = Math.min(100, calcWhatPercent(kc, 100));

		const boosts = [];
		let baseTime = Time.Minute * 6;
		baseTime = reduceNumByPercent(baseTime, kcLearned / 6);
		boosts.push(`${(kcLearned / 6).toFixed(2)}% boost for experience`);

		const skillPercentage = msg.author.skillLevel(SkillsEnum.Mining) + msg.author.skillLevel(SkillsEnum.Smithing);

		baseTime = reduceNumByPercent(baseTime, skillPercentage / 40);
		boosts.push(`${skillPercentage / 40}% boost for levels`);

		if (msg.author.equippedPet() === itemID('Obis')) {
			baseTime /= 2;
			boosts.push('2x boost for Obis');
		}

		if (!msg.author.hasGracefulEquipped()) {
			baseTime *= 1.15;
			boosts.push('-15% time penalty for not having graceful equipped');
		}

		let healAmountNeeded = 7 * 12;
		if (kc > 100) healAmountNeeded = 1 * 12;
		else if (kc > 50) healAmountNeeded = 3 * 12;
		else if (kc > 20) healAmountNeeded = 5 * 12;

		const quantity = Math.floor(msg.author.maxTripLength('Zalcano') / baseTime);
		const duration = quantity * baseTime;

		const { foodRemoved } = await removeFoodFromUser({
			client: this.client,
			user: msg.author,
			totalHealingNeeded: healAmountNeeded * quantity,
			healPerAction: Math.ceil(healAmountNeeded / quantity),
			activityName: 'Zalcano',
			attackStylesUsed: []
		});

		await addSubTaskToActivityTask<ZalcanoActivityTaskOptions>({
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: 'Zalcano',
			performance: this.calcPerformance(kcLearned, skillPercentage),
			isMVP: percentChance(80)
		});

		return msg.channel.send(
			`${
				msg.author.minionName
			} is now off to kill Zalcano ${quantity}x times, their trip will take ${formatDuration(
				duration
			)}. (${formatDuration(baseTime)} per kill). Removed ${foodRemoved}.\n\n**Boosts:** ${boosts.join(', ')}.`
		);
	}
}
