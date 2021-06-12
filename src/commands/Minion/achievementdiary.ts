import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Bank, Monsters } from 'oldschooljs';

import { Minigames } from '../../extendables/User/Minigame';
import { diaries, DiaryTier, userhasDiaryTier } from '../../lib/diaries';
import { BotCommand } from '../../lib/structures/BotCommand';
import {
	formatSkillRequirements,
	itemNameFromID,
	stringMatches,
	toTitleCase
} from '../../lib/util';

const lampRewards = {
	Easy: 'Antique lamp 1',
	Medium: 'Antique lamp 2',
	Hard: 'Antique lamp 3',
	Elite: 'Antique lamp 4'
} as const;

async function howManyOfTierCompleted(user: KlasaUser, tiers: DiaryTier[]) {
	let completed = 0;
	for (const tier of tiers) {
		const [has] = await userhasDiaryTier(user, tier);
		if (has) completed++;
	}
	return completed;
}

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			altProtection: true,
			categoryFlags: ['minion', 'pvm', 'minigame'],
			description: 'Sends your minion to do barbarian assault, or buy rewards and gamble.',
			examples: ['+barbassault [start]'],
			subcommands: true,
			usage: '[claim] [diaryName:...str]',
			usageDelim: ' ',
			aliases: ['ad']
		});
	}

	async run(msg: KlasaMessage, [input = '']: [string | undefined]) {
		const diary = diaries.find(d => stringMatches(d.name, input));

		if (!diary) {
			return msg.channel.send(diaries.map(d => d.name));
		}

		let str = `Requirements for ${diary.name} Diary\n\n`;

		for (const tier of [diary.easy, diary.medium, diary.hard, diary.elite]) {
			let thisStr = `${tier.name}\n`;
			thisStr += formatSkillRequirements(tier.skillReqs);

			if (tier.ownedItems) {
				thisStr += `Must Own: ${tier.ownedItems.map(itemNameFromID).join(', ')}\n`;
			}

			if (tier.collectionLogReqs) {
				thisStr += `Must Have in CL: ${tier.collectionLogReqs
					.map(itemNameFromID)
					.join(', ')}\n`;
			}

			if (tier.qp) {
				thisStr += `Must Have ${tier.qp} QP\n`;
			}

			if (tier.minigameReqs) {
				const entries = Object.entries(tier.minigameReqs);
				for (const [key, neededScore] of entries) {
					const minigame = Minigames.find(m => m.key === key)!;
					thisStr += `Must Have ${neededScore} KC in ${minigame.name}`;
				}
			}

			if (tier.lapsReqs) {
				const entries = Object.entries(tier.lapsReqs);
				for (const [name, score] of entries) {
					thisStr += `Must Have ${score} Laps of ${name}`;
				}
			}

			if (tier.monsterScores) {
				const entries = Object.entries(tier.monsterScores);
				for (const [name, score] of entries) {
					const mon = Monsters.find(mon => mon.name === name)!;
					thisStr += `Must Have ${score} KC of ${mon.name}`;
				}
			}

			str += thisStr;
		}
		return msg.channel.sendFile(Buffer.from(str), `${diary.name}_requirements.txt`);
	}

	async claim(msg: KlasaMessage, [input = '']: [string | undefined]) {
		const diary = diaries.find(d => stringMatches(d.name, input));

		if (!diary) {
			return msg.channel.send(diaries.map(d => d.name));
		}

		const allItems = msg.author.allItemsOwned();
		const cl = new Bank(msg.author.collectionLog);

		for (const tier of ['easy', 'medium', 'hard', 'elite'] as const) {
			const diaryTier = diary[tier];
			const [canDo, reason] = await userhasDiaryTier(msg.author, diaryTier);
			const name = `${toTitleCase(diaryTier.name)} ${diary.name} Diary`;

			if (canDo) {
				if (allItems.has(diaryTier.item.id)) continue;
				const hasCompleted = await howManyOfTierCompleted(
					msg.author,
					diaries.map(d => d[tier])
				);
				const loot = new Bank();
				loot.add(lampRewards[diaryTier.name]);
				if (cl.amount(lampRewards[diaryTier.name]) < hasCompleted) {
					loot.add(diaryTier.item.id);
				}
				await msg.author.addItemsToBank(loot, true);

				return msg.channel.send(
					`You successfully completed the ${name} and received ${loot}.`
				);
			}

			return msg.channel.send(`You can't claim the ${name} because ${reason}.`);
		}
	}
}
