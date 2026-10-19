import { Events, Time } from '@oldschoolgg/toolkit';
import { Bank, ECreature, toKMB } from 'oldschooljs';

import { trackLoot } from '@/lib/lootTrack.js';
import { generateHerbiTable } from '@/lib/skilling/functions/calcsHunter.js';
import creatures from '@/lib/skilling/skills/hunter/creatures/index.js';
import { getRumourHunter, type RumourOption } from '@/lib/skilling/skills/hunter/rumours/util.js';
import { HunterTechniqueEnum } from '@/lib/skilling/types.js';
import { RumourTierBank } from '@/lib/structures/Bank.js';
import type { RumourActivityTaskOptions } from '@/lib/types/minions.js';
import { skillingPetDropRate } from '@/lib/util.js';

export const rumourTask: MinionTask = {
	type: 'Rumour',
	async run(data: RumourActivityTaskOptions, { user, handleTripFinish, rng }) {
		const { tier, quantity, rumours, channelId, duration } = data;
		const currentLevel = user.skillLevel('hunter');
		const currentHerbLevel = user.skillLevel('herblore');
		const hunterLabel = data.hunter ? getRumourHunter(data.hunter).label : tier;

		let str = `${user}, ${user.minionName} finished completing ${quantity} ${hunterLabel} rumours.\nThey caught: `;
		let xpStr = '';
		let chinPetSource = '';

		let herbXP = 0;
		let huntXP = 0;

		const totalLoot = new Bank();

		for (const rumour of rumours) {
			const creature = creatures.find(c => c.id === rumour.creatureID);
			if (!creature) throw new Error('Invalid rumour creature ID: ' + rumour.creatureID);
			const xpReceived =
				rumour.quantity *
				(creature.hunterXP + (creature.id === ECreature.HERBIBOAR ? 27 * (currentLevel - 80) : 0));

			let babyChinChance = 0;
			if (creature.name.toLowerCase().includes('chinchompa')) {
				babyChinChance =
					creature.name === 'Chinchompa'
						? 131_395
						: creature.name === 'Carnivorous chinchompa'
							? 98_373
							: 82_758;
			}
			const { petDropRate } = skillingPetDropRate(user, 'hunter', babyChinChance);

			let creatureTable = creature.table;

			if (creature.id === ECreature.HERBIBOAR) {
				creatureTable = generateHerbiTable(
					user.skillLevel('herblore'),
					user.hasEquippedOrInBank('Magic secateurs')
				);
				// TODO: Check wiki in future for herblore xp from herbiboar
				if (currentHerbLevel >= 31) {
					herbXP += rumour.quantity * rng.randInt(25, 75);
				}
			}

			const loot = new Bank();

			if (creature.huntTechnique !== HunterTechniqueEnum.ButterflyNetting) {
				for (let i = 0; i < rumour.quantity; i++) {
					loot.add(creatureTable.roll());
					if (creature.name.toLowerCase().includes('chinchompa') && rng.roll(petDropRate)) {
						loot.add('Baby chinchompa');
						chinPetSource = creature.name;
					}
				}
			}

			await user.incrementCreatureScore(creature.id, Math.floor(rumour.quantity));

			huntXP += xpReceived;

			await ClientSettings.updateBankSetting('hunter_loot', loot);
			await trackLoot({
				id: creature.name,
				changeType: 'loot',
				duration: rumour.duration,
				kc: rumour.quantity,
				totalLoot: loot,
				type: 'Skilling',
				users: [
					{
						id: user.id,
						duration: rumour.duration,
						loot
					}
				]
			});

			str += `${rumour.quantity}x ${creature.name} `;

			totalLoot.add(loot);
		}

		switch (tier) {
			case 'novice':
				totalLoot.add(29_242, quantity);
				break;
			case 'adept':
				totalLoot.add(29_244, quantity);
				break;
			case 'expert':
				totalLoot.add(29_246, quantity);
				break;
			case 'master':
				totalLoot.add(29_248, quantity);
				break;
		}

		const { rumours: rumourCounts } = await user.fetchStats();
		const rumoursCompleted = new RumourTierBank(rumourCounts as Record<RumourOption, number>);
		const oldTotalRumours = rumoursCompleted.total;

		rumoursCompleted.add(tier, quantity);
		await user.statsUpdate({ rumours: rumoursCompleted.toJSON() });

		const newTotalRumours = rumoursCompleted.total;

		if (oldTotalRumours < 10 && newTotalRumours >= 10) totalLoot.add('Basic quetzal whistle blueprint');
		if (oldTotalRumours < 100 && newTotalRumours >= 100) totalLoot.add('Torn enhanced quetzal whistle blueprint');
		if (oldTotalRumours < 250 && newTotalRumours >= 250) totalLoot.add('Torn perfected quetzal whistle blueprint');

		huntXP += (user.skillsAsLevels.hunter + 5) * (tier === 'master' ? 60 : tier === 'expert' ? 55 : 50) * quantity;
		xpStr = await user.addXP({
			skillName: 'hunter',
			amount: huntXP,
			duration
		});
		// The XP helper omits its message at the XP cap, but rumours still earn tracked XP.
		if (!xpStr) {
			const xpPerHour = duration > 0 ? Math.floor((huntXP * Time.Hour) / duration / 1000) * 1000 : 0;
			xpStr = `You earned ${Math.floor(huntXP).toLocaleString()} Hunter XP (${toKMB(xpPerHour)} XP/h).`;
		}

		const herbloreXPMessage = await user.addXP({
			skillName: 'herblore',
			amount: herbXP,
			duration
		});
		if (herbloreXPMessage) xpStr += `\n${herbloreXPMessage}`;

		await user.transactItems({
			collectionLog: true,
			itemsToAdd: totalLoot
		});

		str += `\n${xpStr}`;

		str += `\nYour minion has now completed a total of ${rumoursCompleted.amount(tier)} ${tier} rumours.`;

		if (totalLoot.amount('Baby chinchompa') > 0 || totalLoot.amount('Herbi') > 0) {
			str += "\n\n**You have a funny feeling like you're being followed....**";
			globalClient.emit(
				Events.ServerNotification,
				`**${user.usernameOrMention}'s** minion, ${user.minionName}, just received a ${
					totalLoot.amount('Baby chinchompa') > 0
						? '**Baby chinchompa** <:Baby_chinchompa_red:324127375539306497>'
						: '**Herbi** <:Herbi:357773175318249472>'
				} while hunting a ${chinPetSource}, their Hunter level is ${currentLevel}!`
			);
		}

		handleTripFinish({ user, channelId, message: str, data, loot: totalLoot });
	}
};
