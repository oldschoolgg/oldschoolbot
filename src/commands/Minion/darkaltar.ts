import { increaseNumByPercent, Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { Activity } from '../../lib/constants';
import { KourendKebosDiary, userhasDiaryTier } from '../../lib/diaries';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { Skills } from '../../lib/types';
import { DarkAltarOptions } from '../../lib/types/minions';
import { formatDuration, reduceNumByPercent } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import getOSItem from '../../lib/util/getOSItem';

const skillReqs: Skills = {
	mining: 38,
	crafting: 38
};

export const darkAltarRunes = {
	soul: {
		item: getOSItem('Soul rune'),
		baseTime: Time.Second * 2.2,
		xp: 19.6,
		level: 90,
		petChance: 782_999
	},
	blood: {
		item: getOSItem('Blood rune'),
		baseTime: Time.Second * 2.2,
		xp: 17.2,
		level: 77,
		petChance: 804_984
	}
} as const;

const gracefulPenalty = 20;
const agilityPenalty = 35;
const mediumDiaryBoost = 20;

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			description: 'Sends your minion to runecraft at the dark altar.',
			examples: ['+darkaltar soul', 'darkaltar blood'],
			categoryFlags: ['skilling', 'minion'],
			usage: '[blood|soul]',
			aliases: ['da']
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [rune = 'blood']: ['soul' | 'blood']) {
		const [hasSkillReqs, neededReqs] = msg.author.hasSkillReqs(skillReqs);
		if (!hasSkillReqs) {
			return msg.channel.send(
				`You can't craft Blood runes at the Dark Altar, because you don't have these required stats: ${neededReqs}.`
			);
		}

		const runeData = darkAltarRunes[rune];

		if (msg.author.skillLevel(SkillsEnum.Runecraft) < runeData.level) {
			return msg.channel.send(`You need level ${runeData.level} Runecraft to craft ${runeData.item.name}'s.`);
		}

		let timePerRune = runeData.baseTime;

		const boosts = [];
		const [hasEliteDiary] = await userhasDiaryTier(msg.author, KourendKebosDiary.elite);
		if (hasEliteDiary) {
			boosts.push('10% additional runes for Kourend/Kebos elite diary');
		}

		const [hasMediumDiary] = await userhasDiaryTier(msg.author, KourendKebosDiary.medium);
		if (hasMediumDiary) {
			boosts.push(`${mediumDiaryBoost}% faster essence mining for Kourend/Kebos medium diary`);
			timePerRune = reduceNumByPercent(timePerRune, mediumDiaryBoost);
		}

		if (msg.author.hasGlobetrotterEquipped()) {
			boosts.push(`${gracefulPenalty}% faster for having the Globetrotter Outfit`);
			timePerRune = reduceNumByPercent(timePerRune, gracefulPenalty);
		} else if (!msg.author.hasGracefulEquipped()) {
			boosts.push(`${gracefulPenalty}% slower for no Graceful`);
			timePerRune = increaseNumByPercent(timePerRune, gracefulPenalty);
		}

		if (msg.author.skillLevel(SkillsEnum.Agility) < 73) {
			boosts.push(`${agilityPenalty}% slower for less than level 73 Agility`);
			timePerRune = increaseNumByPercent(timePerRune, agilityPenalty);
		}

		const maxTripLength = msg.author.maxTripLength(Activity.DarkAltar);
		const quantity = Math.floor(maxTripLength / timePerRune);
		await addSubTaskToActivityTask<DarkAltarOptions>({
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration: maxTripLength,
			type: Activity.DarkAltar,
			hasElite: hasEliteDiary,
			rune
		});

		let response = `${msg.author.minionName} is now going to Runecraft ${runeData.item.name}'s for ${formatDuration(
			maxTripLength
		)} at the Dark altar.`;

		if (boosts.length > 0) {
			response += `\n\n**Boosts:** ${boosts.join(', ')}.`;
		}

		return msg.channel.send(response);
	}
}
