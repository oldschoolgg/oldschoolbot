import { randInt } from 'e';
import { Bank } from 'oldschooljs';
import SimpleTable from 'oldschooljs/dist/structures/SimpleTable';

import { Emoji, Events } from '../../../lib/constants';
import { trackLoot } from '../../../lib/lootTrack';
import { getMinigameScore, incrementMinigameScore } from '../../../lib/settings/settings';
import { WintertodtCrate } from '../../../lib/simulation/wintertodt';
import Firemaking from '../../../lib/skilling/skills/firemaking';
import { SkillsEnum } from '../../../lib/skilling/types';
import { ActivityTaskOptionsWithQuantity } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { makeBankImage } from '../../../lib/util/makeBankImage';
import { updateBankSetting } from '../../../mahoji/mahojiSettings';

const PointsTable = new SimpleTable<number>()
	.add(420)
	.add(470)
	.add(500)
	.add(505)
	.add(510)
	.add(520)
	.add(550)
	.add(560)
	.add(590)
	.add(600)
	.add(620)
	.add(650)
	.add(660)
	.add(670)
	.add(680)
	.add(700)
	.add(720)
	.add(740)
	.add(750)
	.add(780)
	.add(850);

export const wintertodtTask: MinionTask = {
	type: 'Wintertodt',
	async run(data: ActivityTaskOptionsWithQuantity) {
		const { userID, channelID, quantity } = data;
		const user = await mUserFetch(userID);
		const currentLevel = user.skillLevel(SkillsEnum.Firemaking);

		let loot = new Bank();

		let totalPoints = 0;

		for (let i = 0; i < quantity; i++) {
			const points = PointsTable.roll().item;
			totalPoints += points;

			loot.add(
				WintertodtCrate.open({
					points,
					itemsOwned: user.allItemsOwned().clone().add(loot).bank,
					skills: user.skillsAsXP
				})
			);
		}

		// Track loot in Economy Stats
		await updateBankSetting('economyStats_wintertodtLoot', loot);

		if (loot.has('Phoenix')) {
			globalClient.emit(
				Events.ServerNotification,
				`${Emoji.Phoenix} **${user.usernameOrMention}'s** minion, ${
					user.minionName
				}, just received a Phoenix! Their Wintertodt KC is ${
					(await getMinigameScore(user.id, 'wintertodt')) + quantity
				}, and their Firemaking level is ${user.skillLevel(SkillsEnum.Firemaking)}.`
			);
		}

		/**
		 * https://oldschool.runescape.wiki/w/Wintertodt#Rewards_2
		 *
		 * Adding/cutting a root gives 10pts, therefore number of roots from this trip is totalPoints/10
		 */
		const numberOfRoots = Math.floor((totalPoints - 50 * quantity) / 10);
		const fmLvl = user.skillLevel(SkillsEnum.Firemaking);
		const wcLvl = user.skillLevel(SkillsEnum.Woodcutting);
		const conLevel = user.skillLevel(SkillsEnum.Construction);

		let fmXpToGive = Math.floor(fmLvl * 100 * quantity + numberOfRoots * (fmLvl * 3));
		let fmBonusXP = 0;
		const wcXpToGive = Math.floor(numberOfRoots * (wcLvl * 0.3));
		const constructionXPPerBrazier = conLevel * 4;
		let numberOfBraziers = 0;
		for (let i = 0; i < quantity; i++) {
			numberOfBraziers += randInt(1, 7);
		}
		const conXP = numberOfBraziers * constructionXPPerBrazier;
		let xpStr = await user.addXP({ skillName: SkillsEnum.Construction, amount: conXP });

		// If they have the entire pyromancer outfit, give an extra 0.5% xp bonus
		if (
			user.gear.skilling.hasEquipped(
				Object.keys(Firemaking.pyromancerItems).map(i => parseInt(i)),
				true
			)
		) {
			const amountToAdd = Math.floor(fmXpToGive * (2.5 / 100));
			fmXpToGive += amountToAdd;
			fmBonusXP += amountToAdd;
		} else {
			// For each pyromancer item, check if they have it, give its' XP boost if so.
			for (const [itemID, bonus] of Object.entries(Firemaking.pyromancerItems)) {
				if (user.hasEquipped(parseInt(itemID))) {
					const amountToAdd = Math.floor(fmXpToGive * (bonus / 100));
					fmXpToGive += amountToAdd;
					fmBonusXP += amountToAdd;
				}
			}
		}

		xpStr += `, ${await user.addXP({ skillName: SkillsEnum.Woodcutting, amount: wcXpToGive })}`;
		xpStr += `, ${await user.addXP({ skillName: SkillsEnum.Firemaking, amount: fmXpToGive })}`;
		const newLevel = user.skillLevel(SkillsEnum.Firemaking);

		const { itemsAdded, previousCL } = await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});
		incrementMinigameScore(user.id, 'wintertodt', quantity);

		const image = await makeBankImage({
			bank: itemsAdded,
			user,
			previousCL
		});

		let output = `${user}, ${user.minionName} finished subduing Wintertodt ${quantity}x times. ${xpStr}, you cut ${numberOfRoots}x Bruma roots.`;

		if (fmBonusXP > 0) {
			output += `\n\n**Firemaking Bonus XP:** ${fmBonusXP.toLocaleString()}`;
		}

		if (newLevel > currentLevel) {
			output += `\n\n${user.minionName}'s Firemaking level is now ${newLevel}!`;
		}

		await trackLoot({
			totalLoot: itemsAdded,
			id: 'wintertodt',
			type: 'Minigame',
			changeType: 'loot',
			duration: data.duration,
			kc: quantity,
			users: [
				{
					id: user.id,
					loot: itemsAdded,
					duration: data.duration
				}
			]
		});

		handleTripFinish(user, channelID, output, image.file.attachment, data, itemsAdded);
	}
};
