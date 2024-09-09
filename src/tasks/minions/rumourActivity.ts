import { randInt } from 'e';
import { Bank, LootTable } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';
import { Events, HERBIBOAR_ID } from '../../lib/constants';
import { trackLoot } from '../../lib/lootTrack';
import { calcLootXPHunting, generateHerbiTable } from '../../lib/skilling/functions/calcsHunter';
import type { RumourActivityTaskOptions } from '../../lib/types/minions';
import { itemID, roll, skillingPetDropRate } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { updateBankSetting } from '../../lib/util/updateBankSetting';
import { HunterTechniqueEnum } from '../../lib/skilling/types';

export const rumourTask: MinionTask = {
	type: 'Rumour',
	async run(data: RumourActivityTaskOptions) {
		const { tier, quantity, rumours, userID, channelID, duration } = data;
		const user = await mUserFetch(userID);
		const currentLevel = user.skillLevel(SkillsEnum.Hunter);
		const currentHerbLevel = user.skillLevel(SkillsEnum.Herblore);

		let str = `${user}, ${user.minionName} finished completing ${quantity} ${tier} rumours.\nThey caught: `;
		let chinPetSource = ''
		let totalLoot = new Bank();

		for (const rumour of rumours) {
			const [a, xpReceived] = calcLootXPHunting(
				currentLevel,
				rumour.creature,
				rumour.quantity,
				false,
				false,
				0,
				100 //Used to force success for every creature
			);

			let babyChinChance = 0;
			if (rumour.creature.name.toLowerCase().includes('chinchompa')) {
				babyChinChance =
					rumour.creature.name === 'Chinchompa'
						? 131_395
						: rumour.creature.name === 'Carnivorous chinchompa'
							? 98_373
							: 82_758;
			}
			const { petDropRate } = skillingPetDropRate(user, SkillsEnum.Hunter, babyChinChance);

			if (!(rumour.creature.table instanceof LootTable)) {
				rumour.creature.table = Object.assign(new LootTable(), rumour.creature.table);
			}

			let creatureTable = rumour.creature.table;

			let herbXP = 0;
			let xpStr = '';
			if (rumour.creature.id === HERBIBOAR_ID) {
				creatureTable = generateHerbiTable(
					user.skillLevel('herblore'),
					user.hasEquippedOrInBank('Magic secateurs')
				);
				// TODO: Check wiki in future for herblore xp from herbiboar
				if (currentHerbLevel >= 31) {
					herbXP += rumour.quantity * randInt(25, 75);
					xpStr = await user.addXP({
						skillName: SkillsEnum.Herblore,
						amount: herbXP,
						duration
					});
				}
			}

			const loot = new Bank();

			if(rumour.creature.huntTechnique != HunterTechniqueEnum.ButterflyNetting) {
				for (let i = 0; i < rumour.quantity; i++) {
					loot.add(creatureTable.roll());
					if (roll(petDropRate) && rumour.creature.name.toLowerCase().includes('chinchompa')) {
						loot.add(itemID('Baby chinchompa'));
						chinPetSource = rumour.creature.name;
					}
				}
			}

			await user.incrementCreatureScore(rumour.creature.id, Math.floor(rumour.quantity));

			await transactItems({
				userID: user.id,
				collectionLog: true,
				itemsToAdd: loot
			});
			xpStr += await user.addXP({
				skillName: SkillsEnum.Hunter,
				amount: xpReceived,
				duration
			});

			updateBankSetting('hunter_loot', loot);
			await trackLoot({
				id: rumour.creature.name,
				changeType: 'loot',
				duration,
				kc: rumour.quantity,
				totalLoot: loot,
				type: 'Skilling',
				users: [
					{
						id: user.id,
						duration,
						loot
					}
				]
			});

			str += `${rumour.quantity}x ${rumour.creature.name} `;

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

		str += `\n\nAnd received: ${totalLoot}.`;

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

		handleTripFinish(user, channelID, str, undefined, data, totalLoot);
	}
};
