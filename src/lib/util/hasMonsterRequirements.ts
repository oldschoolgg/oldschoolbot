import { bold } from '@oldschoolgg/discord';
import { objectEntries, Time } from '@oldschoolgg/toolkit';
import { Items } from 'oldschooljs';

import { quests } from '@/lib/minions/data/quests.js';
import type { Consumable, KillableMonster } from '@/lib/minions/types.js';
import { formatItemReqs, formatList, hasSkillReqs, readableStatName } from '@/lib/util/smallUtils.js';
import { getItemCostFromConsumables } from '@/mahoji/lib/abstracted_commands/minionKill/handleConsumables.js';

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

export function hasMonsterRequirements(user: MUser, monster: KillableMonster) {
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
		const hasDiary = user.hasDiary(monster.diaryRequirement);
		if (!hasDiary) {
			return [false, `${user.minionName} is missing the required achievement diaries to kill ${monster.name}.`];
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
