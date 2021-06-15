import { increaseNumByPercent } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { Activity, Time } from '../../lib/constants';
import { KourendKebosDiary, userhasDiaryTier } from '../../lib/diaries';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { Skills } from '../../lib/types';
import { DarkAltarOptions } from '../../lib/types/minions';
import { formatDuration, reduceNumByPercent } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

const skillReqs: Skills = {
	runecraft: 77,
	mining: 38,
	crafting: 38
};

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			description: 'Sends your minion to chop logs.',
			examples: ['+chop 100 logs', '+chop magic logs'],
			categoryFlags: ['skilling', 'minion']
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage) {
		const [hasSkillReqs, neededReqs] = msg.author.hasSkillReqs(skillReqs);
		if (!hasSkillReqs) {
			return msg.send(
				`You can't craft Blood runes at the Dark Altar, because you don't have these required stats: ${neededReqs}.`
			);
		}

		let timePerRune = Time.Second * 1.3;
		const boosts = [];

		const [hasEliteDiary] = await userhasDiaryTier(msg.author, KourendKebosDiary.elite);
		if (hasEliteDiary) {
			boosts.push('10% additional runes for Kourend/Kebos elite diary');
		}

		const [hasMediumDiary] = await userhasDiaryTier(msg.author, KourendKebosDiary.medium);
		if (hasMediumDiary) {
			boosts.push('5% faster essence mining for Kourend/Kebos medium diary');
			timePerRune = reduceNumByPercent(timePerRune, 5);
		}

		if (!msg.author.hasGracefulEquipped()) {
			boosts.push('20% slower for no Graceful');
			timePerRune = increaseNumByPercent(timePerRune, 20);
		}

		if (msg.author.skillLevel(SkillsEnum.Runecraft) < 73) {
			boosts.push('20% slower for less than level 73 Agility');
			timePerRune = increaseNumByPercent(timePerRune, 20);
		}

		const maxTripLength = msg.author.maxTripLength(Activity.DarkAltar);
		const quantity = Math.floor(maxTripLength / timePerRune);
		await addSubTaskToActivityTask<DarkAltarOptions>({
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration: maxTripLength,
			type: Activity.DarkAltar,
			hasElite: hasEliteDiary
		});

		let response = `${msg.author.minionName} is now doing ${formatDuration(
			maxTripLength
		)} of Runecrafting at the Dark altar.`;

		if (boosts.length > 0) {
			response += `\n\n**Boosts:** ${boosts.join(', ')}.`;
		}

		return msg.send(response);
	}
}
