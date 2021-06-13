import { randInt } from 'e';
import { Task } from 'klasa';

import { Emoji, Events, Time } from '../../../lib/constants';
import { hasArrayOfItemsEquipped } from '../../../lib/gear';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { WintertodtCrate } from '../../../lib/simulation/wintertodt';
import Firemaking from '../../../lib/skilling/skills/firemaking';
import { SkillsEnum } from '../../../lib/skilling/types';
import { ItemBank } from '../../../lib/types';
import { WintertodtActivityTaskOptions } from '../../../lib/types/minions';
import {
	addBanks,
	bankHasItem,
	channelIsSendable,
	multiplyBank,
	noOp,
	rand,
	roll
} from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import itemID from '../../../lib/util/itemID';

export default class extends Task {
	async run(data: WintertodtActivityTaskOptions) {
		const { userID, channelID, quantity, duration } = data;
		const user = await this.client.users.fetch(userID);
		const currentLevel = user.skillLevel(SkillsEnum.Firemaking);
		const channel = await this.client.channels.fetch(channelID).catch(noOp);

		let loot: ItemBank = {};

		let totalPoints = 0;

		for (let i = 0; i < quantity; i++) {
			const points = rand(1000, 5_000);
			totalPoints += points;

			loot = addBanks([
				loot,
				WintertodtCrate.open({
					points,
					itemsOwned: addBanks([user.allItemsOwned().bank, loot]),
					skills: user.rawSkills
				})
			]);
		}

		let gotToad = false;
		if (roll(100) && duration > Time.Minute * 20) {
			gotToad = true;
			loot[itemID('Wintertoad')] = 1;
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
				}, just received a Phoenix! Their Wintertodt KC is ${
					(await user.getMinigameScore('Wintertodt')) + quantity
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
		user.addXP({ skillName: SkillsEnum.Construction, amount: conXP });

		// If they have the entire pyromancer outfit, give an extra 0.5% xp bonus
		if (
			hasArrayOfItemsEquipped(
				Object.keys(Firemaking.pyromancerItems).map(i => parseInt(i)),
				user.getGear('skilling')
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

		await user.addXP({
			skillName: SkillsEnum.Woodcutting,
			amount: wcXpToGive
		});
		await user.addXP({
			skillName: SkillsEnum.Firemaking,
			amount: fmXpToGive
		});
		const newLevel = user.skillLevel(SkillsEnum.Firemaking);

		if (user.usingPet('Flappy')) {
			loot = multiplyBank(loot, 2);
		}

		if (user.hasItemEquippedAnywhere(itemID('Firemaking master cape'))) {
			loot = multiplyBank(loot, 2);
		}

		await user.addItemsToBank(loot, true);
		user.incrementMinigameScore('Wintertodt', quantity);

		const { image } = await this.client.tasks.get('bankImage')!.generateBankImage(
			loot,
			``,
			true,
			{
				showNewCL: 1
			},
			user
		);

		if (!channelIsSendable(channel)) return;

		let output = `${user}, ${
			user.minionName
		} finished subduing Wintertodt ${quantity}x times. You got ${fmXpToGive.toLocaleString()} Firemaking XP, ${wcXpToGive.toLocaleString()} Woodcutting XP and ${conXP.toLocaleString()} Construction XP, you cut ${numberOfRoots}x Bruma roots.`;

		if (fmBonusXP > 0) {
			output += `\n\n**Firemaking Bonus XP:** ${fmBonusXP.toLocaleString()}`;
		}

		if (newLevel > currentLevel) {
			output += `\n\n${user.minionName}'s Firemaking level is now ${newLevel}!`;
		}

		if (gotToad) {
			output += `\n\n<:wintertoad:749945071230779493> A Wintertoad sneakily hops into your bank!`;
		}

		handleTripFinish(
			this.client,
			user,
			channelID,
			output,
			res => {
				user.log(`continued trip of wintertodt`);
				return this.client.commands.get('wintertodt')!.run(res, []);
			},
			image!,
			data,
			loot
		);
	}
}
