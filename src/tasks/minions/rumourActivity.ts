import { randInt } from 'e';
import { Bank, LootTable } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';
import { Events, HERBIBOAR_ID } from '../../lib/constants';
import { trackLoot } from '../../lib/lootTrack';
import { calcLootXPHunting, generateHerbiTable } from '../../lib/skilling/functions/calcsHunter';
import { HunterTechniqueEnum } from '../../lib/skilling/types';
import type { RumourActivityTaskOptions } from '../../lib/types/minions';
import { itemID, roll, skillingPetDropRate } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { updateBankSetting } from '../../lib/util/updateBankSetting';
import { RumourOptions } from '../../lib/skilling/skills/hunter/rumours/util';
import { userStatsUpdate } from '../../mahoji/mahojiSettings';

export const rumourTask: MinionTask = {
	type: 'Rumour',
	async run(data: RumourActivityTaskOptions) {
		const { tier, quantity, rumours, userID, channelID, duration } = data;
		const user = await mUserFetch(userID);
		const currentLevel = user.skillLevel(SkillsEnum.Hunter);
		const currentHerbLevel = user.skillLevel(SkillsEnum.Herblore);

		let str = `${user}, ${user.minionName} finished completing ${quantity} ${tier} rumours.\nThey caught: `;
		let xpStr = '';
		let chinPetSource = '';

		let herbXP = 0;
		let huntXP = 0;

		const totalLoot = new Bank();

		for (const rumour of rumours) {
			const [, xpReceived] = calcLootXPHunting(
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

			if (rumour.creature.id === HERBIBOAR_ID) {
				creatureTable = generateHerbiTable(
					user.skillLevel('herblore'),
					user.hasEquippedOrInBank('Magic secateurs')
				);
				// TODO: Check wiki in future for herblore xp from herbiboar
				if (currentHerbLevel >= 31) {
					herbXP += rumour.quantity * randInt(25, 75);
				}
			}

			const loot = new Bank();

			if (rumour.creature.huntTechnique !== HunterTechniqueEnum.ButterflyNetting) {
				for (let i = 0; i < rumour.quantity; i++) {
					loot.add(creatureTable.roll());
					if (roll(petDropRate) && rumour.creature.name.toLowerCase().includes('chinchompa')) {
						loot.add(itemID('Baby chinchompa'));
						chinPetSource = rumour.creature.name;
					}
				}
			}

			await user.incrementCreatureScore(rumour.creature.id, Math.floor(rumour.quantity));

			huntXP += xpReceived;

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

		const { rumours: rumoursCompleted } = await user.fetchStats({ rumours: true });
		const oldTotalrumours = rumoursCompleted.reduce((a, b) => a + b);

		rumoursCompleted[RumourOptions.indexOf(tier)] += quantity;
		await userStatsUpdate(user.id, { "rumours": rumoursCompleted }, {});

		const newTotalrumours = rumoursCompleted.reduce((a, b) => a + b);

		if(oldTotalrumours < 10 && newTotalrumours >= 10) totalLoot.add('Basic quetzal whistle blueprint');
		if(oldTotalrumours < 100 && newTotalrumours >= 100) totalLoot.add('Torn enhanced quetzal whistle blueprint');
		if(oldTotalrumours < 250 && newTotalrumours >= 250) totalLoot.add('Torn perfected quetzal whistle blueprint');

		huntXP += ((user.skillsAsLevels.hunter + 5) * (tier === 'master' ? 60 : tier === 'expert' ? 55 : 50) * quantity);
		xpStr = await user.addXP({
			skillName: SkillsEnum.Hunter,
			amount: huntXP,
			duration
		});

		xpStr += await user.addXP({
			skillName: SkillsEnum.Herblore,
			amount: herbXP,
			duration
		});

		const { previousCL, itemsAdded } = await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: totalLoot
		});

		str += `\n${xpStr}`;

		str += `\nYour minion has now completed a total of ${rumoursCompleted[RumourOptions.indexOf(tier)]} ${tier} rumours.`

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

		const image = await makeBankImage({
			bank: itemsAdded,
			title: `Loot from ${quantity}x ${tier} hunter rumours.`,
			user,
			previousCL
		});

		handleTripFinish(user, channelID, str, image.file.attachment, data, totalLoot);
	}
};
