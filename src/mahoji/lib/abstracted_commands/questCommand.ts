import type { Quest } from '@/lib/minions/data/questExtras';
import { questExtras } from '@/lib/minions/data/questExtras';
import type { SpecificQuestOptions } from '@/lib/types/minions';
import addSubTaskToActivityTask from '@/lib/util/addSubTaskToActivityTask';
import { formatList, hasSkillReqs } from '@/lib/util/smallUtils';
import { deepMerge, formatDuration, randomVariation } from '@oldschoolgg/toolkit/util';
import { Time } from 'e';
import { Quests, itemID } from 'oldschooljs';
import { Bank } from 'oldschooljs';
import { userHasGracefulEquipped } from '../../../mahoji/mahojiSettings';

function estimateQuestTime(difficulty: string, length: string): number {
	const difficultyMultipliers: Record<string, number> = {
		novice: 0.5,
		intermediate: 0.75,
		experienced: 1,
		master: 1.25,
		grandmaster: 1.5,
		special: 2 // RFD
	};
	const lengthMultipliers: Record<string, number> = {
		'very short': 0.25,
		short: 0.5,
		medium: 1,
		long: 2,
		'very long': 3
	};
	const base = Time.Hour;
	const d = difficultyMultipliers[difficulty.toLowerCase()] ?? 1;
	const l = lengthMultipliers[length.toLowerCase()] ?? 1;
	return Math.round(base * d * l);
}

function extractItemName(name: string): string | null {
	for (const candidate of generateCleanedItemNameCandidates(name)) {
		try {
			const id = itemID(candidate);
			if (id && id !== -1) return candidate;
		} catch {
			// ignore
		}
	}
	return null;
}

function generateCleanedItemNameCandidates(name: string): string[] {
	const candidates = new Set<string>();
	const allPrefixes = [
		'the',
		'a',
		'an',
		'unnoted',
		'normal',
		'finished',
		'any',
		'regular',
		'cut',
		'cooked',
		'cleaned',
		'non-degraded'
	];
	let cleaned = name.trim();
	for (const prefix of allPrefixes) {
		const regex = new RegExp(`^${prefix}\\s+`, 'i');
		cleaned = cleaned.replace(regex, '');
	}
	candidates.add(cleaned);

	const swaps: [string, string][] = [
		['potion', 'potion(4)'],
		['s', ''],
		['es', ''],
		['ies', 'y'],
		['ves', 'f'],
		['ves', 'ff'],
		['ves', 'fe']
	];

	const finalCandidates = new Set<string>();
	for (const candidate of candidates) {
		const words = candidate.split(/\s+/).slice(0, 5);
		for (let i = words.length; i > 0; i--) {
			const base = words
				.slice(0, i)
				.join(' ')
				.replace(/[.,:;–-]+$/, '');
			finalCandidates.add(base);
			for (const [a, b] of swaps) {
				if (a === '') {
					finalCandidates.add(base + b);
				} else if (base.endsWith(a)) {
					finalCandidates.add(base.slice(0, -a.length) + b);
				}
				if (b !== a) {
					if (b === '') {
						finalCandidates.add(base + a);
					} else if (base.endsWith(b)) {
						finalCandidates.add(base.slice(0, -b.length) + a);
					}
				}
			}
		}
	}

	const genericTools = ['pickaxe', 'axe', 'sword', 'nails', 'arrow'];
	const lowerCleaned = cleaned.trim().toLowerCase();
	for (const tool of genericTools) {
		if (lowerCleaned.startsWith(tool)) {
			finalCandidates.add(`Bronze ${tool}`);
		}
	}

	if (lowerCleaned.startsWith('cat')) {
		finalCandidates.add('pet cat');
	}

	return Array.from(finalCandidates).filter(Boolean);
}

function processQuestItems(
	items: [string, number][],
	userBank?: Bank
): { processed: [string, number][]; failed: string[] } {
	const failed: string[] = [];
	const validLightSources = [
		'Candle',
		'Lit candle',
		'Torch',
		'Bullseye lantern',
		'Lantern',
		'Mining helmet',
		'Bruma torch',
		'Firemaking cape',
		'Firemaking cape(t)',
		'Seers headband 1',
		'Seers headband 2',
		'Seers headband 3',
		'Seers headband 4'
	];

	const processed: [string, number][] = items.map(([itemName, qty]) => {
		let foundItemName = itemName;
		if (itemName.toLowerCase().includes('light source')) {
			let found = false;
			if (userBank) {
				for (const light of validLightSources) {
					if (userBank.has(light)) {
						foundItemName = light;
						found = true;
						break;
					}
				}
			}
			if (!found) {
				return [itemName, qty];
			}
		}
		try {
			itemID(foundItemName);
		} catch {
			const extracted = extractItemName(foundItemName);
			if (extracted) {
				foundItemName = extracted;
			} else {
				failed.push(`${qty}x ${itemName}`);
			}
		}
		return [foundItemName, qty];
	});
	return { processed, failed };
}

function buildBankFromQuestItems(items: [string, number][], userBank?: Bank): { bank: Bank; failed: string[] } {
	const { processed, failed } = processQuestItems(items);
	const bank = new Bank();
	for (const [itemName, qty] of processed) {
		try {
			if (!userBank || userBank.amount(itemName) < qty) {
				const id = itemID(itemName);
				bank.add(id, qty);
			}
		} catch {}
	}
	return { bank, failed };
}

export function getQuestRequiredItemsBank(quest: Quest, userBank?: Bank): { bank: Bank; failed: string[] } {
	if (!quest.itemsRequired) return { bank: new Bank(), failed: [] };
	const items: [string, number][] = Object.entries(quest.itemsRequired);
	return buildBankFromQuestItems(items, userBank);
}

export function getQuestRewardItemsBank(quest: Quest): { bank: Bank; failed: string[] } {
	if (!quest.itemRewards) return { bank: new Bank(), failed: [] };
	const items: [string, number][] = Object.entries(quest.itemRewards);
	return buildBankFromQuestItems(items);
}

function hasRequirements(user: MUser, quest: Quest): string | null {
	if (user.hasCompletedQuest(quest.id)) {
		return `You've already completed ${quest.name}.`;
	}

	if (quest.qpReq) {
		if (user.QP < quest.qpReq) {
			return `You need ${quest.qpReq} QP to do ${quest.name}, you have ${user.QP}.`;
		}
	}

	if (quest.kudosReq) {
		if (user.kudos < quest.kudosReq) {
			return `You need ${quest.kudosReq} Kudos to do ${quest.name}, you have ${user.kudos}.`;
		}
	}

	if (quest.prerequisiteQuests) {
		for (const prerequisiteName of quest.prerequisiteQuests) {
			const prereqQuest = Quests.find(q => q.name.toLowerCase() === prerequisiteName.toLowerCase());
			if (prereqQuest && !user.hasCompletedQuest(prereqQuest.id)) {
				return `You need to complete "${prereqQuest.name}" before starting ${quest.name}.`;
			}
		}
	}

	if (quest.skillReqs) {
		const [hasReqs, reason] = hasSkillReqs(user, quest.skillReqs);
		if (!hasReqs) {
			return `To complete ${quest.name}, you need: ${reason}.`;
		}
	}

	const { bank: requiredBank } = getQuestRequiredItemsBank(quest, user.bank);
	if (!user.owns(requiredBank)) {
		return `To complete ${quest.name}, you need these items in your bank: ${requiredBank.toString()}.`;
	}

	return null;
}

export async function doQuest(user: MUser, channelID: string, name?: string) {
	if (!user.user.minion_hasBought) {
		return 'You need a minion to do a questing trip';
	}
	if (user.minionIsBusy) {
		return 'Your minion must not be busy to do a questing trip';
	}

	if (user.hasCompletedAllQuests) {
		return 'You have completed all quests, there are no more quests to do.';
	}

	let quest: Quest | undefined;
	if (name) {
		quest = Quests.find(q => q.name.toLowerCase() === name.toLowerCase());
		if (!quest) {
			return `That's not a valid quest.`;
		}
	} else {
		// Pick a random quest the user has requirements for and hasn't completed
		const availableQuests = Quests.filter(q => !user.hasCompletedQuest(q.id) && !hasRequirements(user, q));
		if (availableQuests.length === 0) {
			return 'There are no quests you can currently do.';
		}
		quest = availableQuests[Math.floor(Math.random() * availableQuests.length)];
	}

	const extra = questExtras.find(q => q.id === quest.id);
	const mergedQuest = extra ? deepMerge(quest, extra) : quest;

	const reqResult = hasRequirements(user, mergedQuest);
	if (reqResult) return reqResult;

	const baseDuration = estimateQuestTime(
		mergedQuest.details?.difficulty ?? 'novice',
		mergedQuest.details?.length ?? 'medium'
	);
	let duration = Math.round(randomVariation(baseDuration, 10));
	let boostMsg = '';

	if (userHasGracefulEquipped(user)) {
		boostMsg = ' \n\n**Boosts:** 10% for Graceful.';
		duration = Math.floor(duration * 0.9);
	}

	await addSubTaskToActivityTask<SpecificQuestOptions>({
		type: 'SpecificQuest',
		duration,
		userID: user.id,
		channelID,
		questID: mergedQuest.id,
		iName: mergedQuest.name
	});

	return `${user.minionName} is now completing **${mergedQuest.name}**, they'll finish in around ${formatDuration(duration)}.${boostMsg}`;
}

export function getQuestInfo(user: MUser, name: string): string {
	const quest = Quests.find(q => q.name.toLowerCase() === name.toLowerCase());
	if (!quest) {
		return `No quest found with the name "${name}".`;
	}

	const extra = questExtras.find(q => q.id === quest.id);
	const mergedQuest = extra ? deepMerge(quest, extra) : quest;

	let info = `**${mergedQuest.name}**`;

	if (user) {
		const completed = user.hasCompletedQuest(mergedQuest.id as any);
		info += completed ? ' (completed)\n' : ' (not completed)\n';
	} else {
		info += '\n';
	}

	if (mergedQuest.details?.difficulty) {
		info += `**Difficulty:** ${mergedQuest.details.difficulty}\n`;
	}
	if (mergedQuest.details?.length) {
		info += `**Length:** ${mergedQuest.details.length}\n`;
	}
	if (mergedQuest.qp) {
		info += `**Quest Points:** ${mergedQuest.qp}\n`;
	}
	if (mergedQuest.kudos) {
		info += `**Kudos:** ${mergedQuest.kudos}\n`;
	}
	if (mergedQuest.qpReq) {
		info += `**QP Required:** ${mergedQuest.qpReq}\n`;
	}
	if (mergedQuest.kudosReq) {
		info += `**Kudos Required:** ${mergedQuest.kudosReq}\n`;
	}
	if (mergedQuest.prerequisiteQuests && mergedQuest.prerequisiteQuests.length > 0) {
		const prereqs = formatList(
			mergedQuest.prerequisiteQuests
				.map(name => {
					const q = Quests.find(q => q.name.toLowerCase() === name.toLowerCase());
					return q ? q.name : null;
				})
				.filter(Boolean)
		);
		if (prereqs.length > 0) {
			info += `**Prerequisite Quests:** ${prereqs}\n`;
		}
	}
	if (mergedQuest.skillReqs && Object.keys(mergedQuest.skillReqs).length > 0) {
		const skills = Object.entries(mergedQuest.skillReqs)
			.map(([skill, lvl]) => `${lvl} ${skill.charAt(0).toUpperCase() + skill.slice(1)}`)
			.join(', ');
		info += `**Skill Requirements:** ${skills}\n`;
	}
	const reqBank = getQuestRequiredItemsBank(mergedQuest).bank;
	if (reqBank.length > 0) {
		info += `**Item Requirements:** ${reqBank.toString()}\n`;
	}
	const rewardBank = getQuestRewardItemsBank(mergedQuest).bank;
	if (rewardBank.length > 0) {
		info += `**Item Rewards:** ${rewardBank.toString()}\n`;
	}
	if (mergedQuest.skillsRewards && Object.keys(mergedQuest.skillsRewards).length > 0) {
		const xpRewards = Object.entries(mergedQuest.skillsRewards)
			.map(([skill, xp]) => `${xp} XP in ${skill}`)
			.join(', ');
		info += `**XP Rewards:** ${xpRewards}\n`;
	}

	return info;
}
