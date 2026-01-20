import { bold } from '@oldschoolgg/discord';
import { randInt } from '@oldschoolgg/rng';
import { formatDuration, stringMatches, Time } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import { quests } from '@/lib/minions/data/quests.js';
import removeFoodFromUser from '@/lib/minions/functions/removeFoodFromUser.js';
import { Thieving } from '@/lib/skilling/skills/thieving/index.js';
import { type Stealable, stealables } from '@/lib/skilling/skills/thieving/stealables.js';
import type { PickpocketActivityTaskOptions } from '@/lib/types/minions.js';
import { calcLootXPPickpocketing } from '@/tasks/minions/pickpocketActivity.js';

export const stealCommand = defineCommand({
	name: 'steal',
	description: 'Sends your minion to steal to train Thieving.',
	attributes: {
		requiresMinion: true,
		requiresMinionNotBusy: true,
		examples: ['/steal name:Man']
	},
	options: [
		{
			type: 'String',
			name: 'name',
			description: 'The object you try to steal from.',
			required: true,
			autocomplete: async ({ value, user }: StringAutoComplete) => {
				const conLevel = user.skillLevel('thieving');
				return Thieving.stealables
					.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
					.filter(c => c.level <= conLevel)
					.map(i => ({
						name: i.name,
						value: i.name
					}));
			}
		},
		{
			type: 'Integer',
			name: 'quantity',
			description: 'The quantity (defaults to max).',
			required: false,
			min_value: 1
		}
	],
	run: async ({ options, user, channelId }) => {
		const stealable: Stealable | undefined = stealables.find(
			obj =>
				stringMatches(obj.name, options.name) ||
				stringMatches(obj.id.toString(), options.name) ||
				obj.aliases?.some(alias => stringMatches(alias, options.name))
		);

		if (!stealable) {
			return `That is not a valid NPC/Stall to pickpocket or steal from, try pickpocketing or stealing from one of the following: ${stealables
				.map(obj => obj.name)
				.join(', ')}.`;
		}

		if (stealable.qpRequired && user.QP < stealable.qpRequired) {
			return `You need at least **${stealable.qpRequired}** QP to ${
				stealable.type === 'pickpockable' ? 'pickpocket' : 'steal from'
			} a ${stealable.name}.`;
		}

		if (stealable.requiredQuests) {
			const incompleteQuest = stealable.requiredQuests.find(
				quest => !user.user.finished_quest_ids.includes(quest)
			);
			if (incompleteQuest) {
				return `You need to have completed the ${bold(
					quests.find(i => i.id === incompleteQuest)!.name
				)} quest to steal from ${stealable.name}.`;
			}
		}

		if (stealable.fireCapeRequired) {
			if (user.cl.amount('Fire cape') === 0) {
				return `In order to ${
					stealable.type === 'pickpockable' ? 'pickpocket this NPC' : 'steal from this stall'
				}, you need a fire cape in your collection log.`;
			}
		}

		if (user.skillsAsLevels.thieving < stealable.level) {
			return `${user.minionName} needs ${stealable.level} Thieving to ${
				stealable.type === 'pickpockable' ? 'pickpocket' : 'steal from'
			} a ${stealable.name}.`;
		}

		if (stealable.prayerLevelRequired && user.skillsAsLevels.prayer < stealable.prayerLevelRequired) {
			return `${user.minionName} needs ${stealable.prayerLevelRequired} Prayer to ${
				stealable.type === 'pickpockable' ? 'pickpocket' : 'steal from'
			} a ${stealable.name}.`;
		}

		const timeToTheft =
			stealable.type === 'pickpockable' ? (stealable.customTickRate ?? 2) * 600 : stealable.respawnTime;

		if (!timeToTheft) {
			Logging.logError(new Error('respawnTime missing from stealable object.'), {
				userID: user.id,
				stealable: stealable.name
			});
			return 'This NPC/Stall is missing variable respawnTime.';
		}

		const maxTripLength =
			(stealable.name === 'Wealthy Citizen' ? 2 : 1) * (await user.calcMaxTripLength('Pickpocket'));

		let { quantity } = options;
		if (!quantity) quantity = Math.floor(maxTripLength / timeToTheft);

		const duration = quantity * timeToTheft;

		if (duration > maxTripLength) {
			return `${user.minionName} can't go on trips longer than ${formatDuration(
				maxTripLength
			)}, try a lower quantity. The highest amount of times you can ${
				stealable.type === 'pickpockable' ? 'pickpocket' : 'steal from'
			} a ${stealable.name} is ${Math.floor(maxTripLength / timeToTheft)}.`;
		}

		const boosts = [];
		let successfulQuantity = 0;
		let xpReceived = 0;
		let damageTaken = 0;

		let str = `${user.minionName} is now going to ${
			stealable.type === 'pickpockable' ? 'pickpocket' : 'steal from'
		} a ${stealable.name} ${quantity}x times, it'll take around ${formatDuration(duration)} to finish.`;

		const isRoguesCastleChest = stealable.name === "Rogues' Castle chest";
		const potionsToRemove = new Bank();

		if (stealable.type === 'pickpockable') {
			const hasArdyHard = user.hasDiary('ardougne.hard');
			if (hasArdyHard) {
				boosts.push('+10% chance of success from Ardougne Hard diary');
			}

			[successfulQuantity, damageTaken, xpReceived] = calcLootXPPickpocketing(
				user.skillsAsLevels.thieving,
				stealable,
				quantity,
				user.hasEquipped(['Thieving cape', 'Thieving cape(t)']),
				hasArdyHard
			);

			if (user.hasEquipped(['Thieving cape', 'Thieving cape(t)'])) {
				boosts.push('+10% chance of success from Thieving cape');
			}

			if (Thieving.rogueOutfitPercentBonus(user) > 0) {
				boosts.push(
					`${Thieving.rogueOutfitPercentBonus(user)}% chance of x2 loot due to rogue outfit equipped`
				);
			}

			const { foodRemoved } = await removeFoodFromUser({
				user,
				totalHealingNeeded: damageTaken,
				healPerAction: Math.ceil(damageTaken / quantity),
				activityName: 'Pickpocketing',
				attackStylesUsed: []
			});

			await ClientSettings.updateBankSetting('economyStats_thievingCost', foodRemoved);
			str += ` Removed ${foodRemoved}.`;
		} else {
			// Up to 5% fail chance, random
			successfulQuantity = Math.floor((quantity * randInt(95, 100)) / 100);
			xpReceived = successfulQuantity * stealable.xp;

			if (isRoguesCastleChest) {
				const hasMediumDiary = user.hasDiary('wilderness.medium');
				const hasHardDiary = user.hasDiary('wilderness.hard');
				const hourlyPotionRate = randInt(5, 10);
				const potionsRequired = Math.max(1, Math.ceil((duration / Time.Hour) * hourlyPotionRate));

				if (user.bank.amount('Prayer potion(4)') < potionsRequired) {
					return `You need at least ${potionsRequired}x Prayer potion(4) to keep Protect from Melee active while stealing from ${stealable.name}.`;
				}

				potionsToRemove.add('Prayer potion(4)', potionsRequired);

				if (!hasMediumDiary) {
					boosts.push('-25% loot without Wilderness medium diary');
				} else if (hasHardDiary) {
					boosts.push('+25% loot with Wilderness hard diary');
				} else {
					boosts.push('Standard loot with Wilderness medium diary');
				}

				if (user.hasEquipped('Ring of wealth (i)')) {
					boosts.push('Ring of wealth (i) increases hard clue chance');
				}
			}
		}

		if (potionsToRemove.length > 0) {
			await user.removeItemsFromBank(potionsToRemove);
			str += ` Removed ${potionsToRemove}.`;
		}

		await ActivityManager.startTrip<PickpocketActivityTaskOptions>({
			monsterID: stealable.id,
			userID: user.id,
			channelId,
			quantity,
			duration,
			type: 'Pickpocket',
			damageTaken,
			successfulQuantity,
			xpReceived
		});

		if (boosts.length > 0) {
			str += `\n\n**Boosts:** ${boosts.join(', ')}.`;
		}

		return str;
	}
});
