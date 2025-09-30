import { evalMathExpression, objectEntries, Time } from '@oldschoolgg/toolkit';
import { bold } from 'discord.js';
import { Bank, type ItemBank, Items } from 'oldschooljs';

import { globalConfig } from '@/lib/constants.js';
import { userhasDiaryTier } from '@/lib/diaries.js';
import { quests } from '@/lib/minions/data/quests.js';
import type { Consumable, KillableMonster } from '@/lib/minions/types.js';
import type { Rune } from '@/lib/skilling/skills/runecraft.js';
import type { GearBank } from '@/lib/structures/GearBank.js';
import { formatItemReqs, formatList, hasSkillReqs, readableStatName } from '@/lib/util/smallUtils.js';
import { getItemCostFromConsumables } from '@/mahoji/lib/abstracted_commands/minionKill/handleConsumables.js';

export function mahojiParseNumber({
	input,
	min,
	max
}: {
	input: number | string | undefined | null;
	min?: number;
	max?: number;
}): number | null {
	if (input === undefined || input === null) return null;
	const parsed = typeof input === 'number' ? input : evalMathExpression(input);
	if (parsed === null) return null;
	if (min && parsed < min) return null;
	if (max && parsed > max) return null;
	if (Number.isNaN(parsed)) return null;
	return parsed;
}

export function patronMsg(tierNeeded: number) {
	return `You need to be a Tier ${
		tierNeeded - 1
	} Patron to use this command. You can become a patron to support the bot here: <https://www.patreon.com/oldschoolbot>`;
}

function formatItemCosts(consumable: Consumable, timeToFinish: number) {
	const str = [];

	const consumables = [consumable];

	if (consumable.alternativeConsumables) {
		for (const c of consumable.alternativeConsumables) {
			consumables.push(c);
		}
	}

	for (const c of consumables) {
		const itemEntries = c.itemCost.items();
		const multiple = itemEntries.length > 1;
		const subStr = [];

		let multiply = 1;
		if (c.qtyPerKill) {
			multiply = c.qtyPerKill;
		} else if (c.qtyPerMinute) {
			multiply = c.qtyPerMinute * (timeToFinish / Time.Minute);
		}

		for (const [item, quantity] of itemEntries) {
			subStr.push(`${Number((quantity * multiply).toFixed(3))}x ${item.name}`);
		}

		if (multiple) {
			str.push(formatList(subStr));
		} else {
			str.push(subStr.join(''));
		}
	}

	if (consumables.length > 1) {
		return str.join(' OR ');
	}

	return str.join('');
}

export async function hasMonsterRequirements(user: MUser, monster: KillableMonster) {
	if (monster.qpRequired && user.QP < monster.qpRequired) {
		return [
			false,
			`You need ${monster.qpRequired} QP to kill ${monster.name}. You can get Quest Points through questing with \`/activities quest\``
		];
	}

	if (monster.requiredQuests) {
		const incompleteQuest = monster.requiredQuests.find(quest => !user.user.finished_quest_ids.includes(quest));
		if (incompleteQuest) {
			return [
				false,
				`You need to have completed the ${bold(
					quests.find(i => i.id === incompleteQuest)!.name
				)} quest to kill ${monster.name}.`
			];
		}
	}

	if (monster.degradeableItemUsage) {
		for (const set of monster.degradeableItemUsage) {
			const equippedInThisSet = set.items.find(item => user.gear[set.gearSetup].hasEquipped(item.itemID));

			if (set.required && !equippedInThisSet) {
				return [
					false,
					`You need one of these items equipped in your ${set.gearSetup} setup to kill ${
						monster.name
					}: ${set.items
						.map(i => i.itemID)
						.map(i => Items.itemNameFromId(i))
						.join(', ')}.`
				];
			}
		}
	}

	if (monster.itemsRequired) {
		const itemsRequiredStr = formatItemReqs(monster.itemsRequired);
		for (const item of monster.itemsRequired) {
			if (Array.isArray(item)) {
				if (!item.some(itemReq => user.hasEquippedOrInBank(itemReq as number))) {
					return [false, `You need these items to kill ${monster.name}: ${itemsRequiredStr}`];
				}
			} else if (!user.hasEquippedOrInBank(item)) {
				return [
					false,
					`You need ${itemsRequiredStr} to kill ${monster.name}. You're missing ${Items.itemNameFromId(item)}.`
				];
			}
		}
	}

	if (monster.levelRequirements) {
		const [hasReqs, str] = hasSkillReqs(user, monster.levelRequirements);
		if (!hasReqs) {
			return [false, `You don't meet the skill requirements to kill ${monster.name}, you need: ${str}.`];
		}
	}

	if (monster.minimumGearRequirements) {
		for (const [setup, requirements] of objectEntries(monster.minimumGearRequirements)) {
			const gear = user.gear[setup];
			if (setup && requirements) {
				const [meetsRequirements, unmetKey, has] = gear.meetsStatRequirements(requirements);
				if (!meetsRequirements) {
					return [
						false,
						`You don't have the requirements to kill ${monster.name}! Your ${readableStatName(
							unmetKey!
						)} stat in your ${setup} setup is ${has}, but you need at least ${
							monster.minimumGearRequirements[setup]?.[unmetKey!]
						}.`
					];
				}
			}
		}
	}

	if (monster.diaryRequirement) {
		const [hasDiary, _, diaryGroup] = await userhasDiaryTier(user, monster.diaryRequirement);
		if (!hasDiary) {
			return [
				false,
				`${user.minionName} is missing the ${diaryGroup.name} ${monster.diaryRequirement[1]} diary to kill ${monster.name}.`
			];
		}
	}

	if (monster.itemCost) {
		const timeToFinish = monster.timeToFinish;
		const consumablesCost = getItemCostFromConsumables({
			consumableCosts: Array.isArray(monster.itemCost) ? monster.itemCost : [monster.itemCost],
			gearBank: user.gearBank,
			inputQuantity: 1,
			timeToFinish,
			maxTripLength: timeToFinish * 1.5,
			slayerKillsRemaining: null
		});
		if (consumablesCost.itemCost && !user.bank.has(consumablesCost.itemCost)) {
			const items = Array.isArray(monster.itemCost) ? monster.itemCost : [monster.itemCost];
			const messages: string[] = [];
			for (const group of items) {
				if (group.optional) continue;
				if (user.owns(consumablesCost.itemCost.filter(i => group.itemCost.has(i)))) {
					continue;
				}
				messages.push(formatItemCosts(group, timeToFinish));
			}
			return [
				false,
				`You don't have the items needed to kill ${monster.name}. This monster requires (per kill) ${formatList(messages)}.`
			];
		}
	}

	return [true];
}

export function resolveAvailableItemBoosts(gearBank: GearBank, monster: KillableMonster, isInWilderness = false): Bank {
	const boosts = new Bank();
	if (monster.itemInBankBoosts) {
		for (const boostSet of monster.itemInBankBoosts) {
			let highestBoostAmount = 0;
			let highestBoostItem = 0;

			// find the highest boost that the player has
			for (const [itemID, boostAmount] of Object.entries(boostSet)) {
				const parsedId = Number.parseInt(itemID);
				if (!gearBank.wildyGearCheck(parsedId, isInWilderness)) {
					continue;
				}
				if (boostAmount > highestBoostAmount) {
					highestBoostAmount = boostAmount;
					highestBoostItem = parsedId;
				}
			}

			if (highestBoostAmount && highestBoostItem) {
				boosts.add(highestBoostItem, highestBoostAmount);
			}
		}
	}
	return boosts;
}

export function calcMaxRCQuantity(rune: Rune, user: MUser) {
	const level = user.skillLevel('runecraft');
	for (let i = rune.levels.length; i > 0; i--) {
		const [levelReq, qty] = rune.levels[i - 1];
		if (level >= levelReq) return qty;
	}

	return 0;
}

export async function addToGPTaxBalance(user: MUser, amount: number) {
	await Promise.all([
		prisma.clientStorage.update({
			where: {
				id: globalConfig.clientID
			},
			data: {
				gp_tax_balance: {
					increment: amount
				}
			},
			select: {
				id: true
			}
		}),
		user.statsUpdate({
			total_gp_traded: {
				increment: amount
			}
		})
	]);
}

export async function addToOpenablesScores(user: MUser, kcBank: Bank) {
	const stats = await user.fetchStats({ openable_scores: true });
	const { openable_scores: newOpenableScores } = await user.statsUpdate({
		openable_scores: new Bank(stats.openable_scores as ItemBank).add(kcBank).toJSON()
	});
	return new Bank(newOpenableScores as ItemBank);
}
