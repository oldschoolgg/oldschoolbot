import { Task } from 'klasa';
import SimpleTable from 'oldschooljs/dist/structures/SimpleTable';
import { MessageAttachment } from 'discord.js';

import { WintertodtActivityTaskOptions } from '../../../lib/types/minions';
import { channelIsSendable } from '../../../lib/util/channelIsSendable';
import { addBanks, bankHasItem, noOp } from '../../../lib/util';
import { WintertodtCrate } from '../../../lib/simulation/wintertodt';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../../lib/skilling/types';
import itemID from '../../../lib/util/itemID';
import { Emoji, Events } from '../../../lib/constants';
import { ItemBank } from '../../../lib/types';
import { MinigameIDsEnum } from '../../../lib/minions/data/minigames';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import Firemaking from '../../../lib/skilling/skills/firemaking';
import hasArrayOfItemsEquipped from '../../../lib/gear/functions/hasArrayOfItemsEquipped';

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

export default class extends Task {
	async run({ userID, channelID, quantity, duration }: WintertodtActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const currentLevel = user.skillLevel(SkillsEnum.Firemaking);
		const channel = await this.client.channels.fetch(channelID).catch(noOp);

		const bank = user.settings.get(UserSettings.Bank);
		let loot: ItemBank = {};

		let totalPoints = 0;

		for (let i = 0; i < quantity; i++) {
			const points = PointsTable.roll().item;
			totalPoints += points;

			loot = addBanks([
				loot,
				WintertodtCrate.open({
					points,
					itemsOwned: addBanks([bank, loot]),
					skills: user.rawSkills
				})
			]);
		}

		// Track this food cost in Economy Stats
		await this.client.settings.update(
			ClientSettings.EconomyStats.WintertodtLoot,
			addBanks([this.client.settings.get(ClientSettings.EconomyStats.WintertodtLoot), loot])
		);

		if (bankHasItem(loot, itemID('Phoenix'))) {
			this.client.emit(
				Events.ServerNotification,
				`${Emoji.Phoenix} **${user.username}'s** minion, ${
					user.minionName
				}, just received a Phoenix! Their Wintertodt KC is ${user.getMinigameScore(
					MinigameIDsEnum.Wintertodt
				) + quantity}, and their Firemaking level is ${user.skillLevel(
					SkillsEnum.Firemaking
				)}.`
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

		let fmXpToGive = Math.floor(fmLvl * 100 * quantity + numberOfRoots * (fmLvl * 3));
		let fmBonusXP = 0;
		const wcXpToGive = Math.floor(numberOfRoots * (wcLvl * 0.3));

		// If they have the entire pyromancer outfit, give an extra 0.5% xp bonus
		if (
			hasArrayOfItemsEquipped(
				Object.keys(Firemaking.pyromancerItems).map(i => parseInt(i)),
				user.settings.get(UserSettings.Gear.Skilling)
			)
		) {
			const amountToAdd = Math.floor(fmXpToGive * (2.5 / 100));
			fmXpToGive += amountToAdd;
			fmBonusXP += amountToAdd;
		} else {
			// For each pyromancer item, check if they have it, give its' XP boost if so.
			for (const [itemID, bonus] of Object.entries(Firemaking.pyromancerItems)) {
				if (user.hasItemEquippedAnywhere(parseInt(itemID))) {
					const amountToAdd = Math.floor(fmXpToGive * (bonus / 100));
					fmXpToGive += amountToAdd;
					fmBonusXP += amountToAdd;
				}
			}
		}

		await user.addXP(SkillsEnum.Woodcutting, wcXpToGive);
		await user.addXP(SkillsEnum.Firemaking, fmXpToGive);
		const newLevel = user.skillLevel(SkillsEnum.Firemaking);

		await user.addItemsToBank(loot, true);
		user.incrementMinigameScore(MinigameIDsEnum.Wintertodt, quantity);

		const image = await this.client.tasks.get('bankImage')!.generateBankImage(
			loot,
			``,
			true,
			{
				showNewCL: 1
			},
			user
		);

		if (!channelIsSendable(channel)) return;

		let output = `${user} ${
			user.minionName
		} finished subdueing Wintertodt ${quantity}x times. You got ${fmXpToGive.toLocaleString()} Firemaking XP and ${wcXpToGive.toLocaleString()} Woodcutting XP, you cut ${numberOfRoots}x Bruma roots.`;

		if (fmBonusXP > 0) {
			output += `\n\n**Firemaking Bonus XP:** ${fmBonusXP.toLocaleString()}`;
		}

		if (newLevel > currentLevel) {
			output += `\n\n${user.minionName}'s Firemaking level is now ${newLevel}!`;
		}

		return channel.send(output, new MessageAttachment(image));
	}
}
