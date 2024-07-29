import { deepClone, randArrItem, removeFromArr } from 'e';
import { omit } from 'lodash';
import { Bank } from 'oldschooljs';
import type { ItemBank } from 'oldschooljs/dist/meta/types';
import { Events } from '../../lib/constants';
import { allCLItemsFiltered } from '../../lib/data/Collections';
import { RelicID } from '../../lib/relics';
import type { SkillNameType } from '../../lib/skilling/types';
import { cryptoRand, toKMB } from '../../lib/util';
import { handleMahojiConfirmation } from '../../lib/util/handleMahojiConfirmation';
import type { OSBMahojiCommand } from '../lib/util';

export const gambleCommand: OSBMahojiCommand = {
	name: 'gamble',
	description: 'Use your Relic of gambling.',
	options: [],
	run: async ({ interaction, userID }) => {
		const user = await mUserFetch(userID);
		if (!user.hasRelic(RelicID.Gambling)) {
			return 'You need the Relic of Gambling to use this command.';
		}

		if (user.cl.length < 50) {
			return 'You need at least 50 items in your collection log to use this command.';
		}

		await handleMahojiConfirmation(interaction, 'Are you sure?');
		if (cryptoRand(0, 1) === 0) {
			let i = 0;
			const itemsToRemove = new Bank();
			while (itemsToRemove.length < 50) {
				const item = user.cl.random();
				if (!item) {
					return 'Something went very wrong...';
				}
				if (!itemsToRemove.has(item.id)) {
					itemsToRemove.add(item.id);
				}
				if (i++ > 200) {
					return 'Something went wrong...';
				}
			}
			let newCL: ItemBank = deepClone(user.user.collectionLogBank as ItemBank);
			newCL = omit(
				newCL,
				itemsToRemove.items().map(i => i[0].id)
			);
			let newBank: ItemBank = deepClone(user.user.bank as ItemBank);
			newBank = omit(
				newBank,
				itemsToRemove.items().map(i => i[0].id)
			);
			const highestSkill = Object.entries(user.skillsAsXP).sort((a, b) => b[1] - a[1])[0][0];
			const currentHighestXP = user.skillsAsXP[highestSkill as SkillNameType];
			await user.update({
				bank: newBank,
				collectionLogBank: newCL,
				[`skills_${highestSkill}`]: currentHighestXP / 2,
				relics: removeFromArr(user.user.relics, RelicID.Gambling)
			});

			globalClient.emit(
				Events.ServerNotification,
				`${user} just lost 50 items from their collection log and ${toKMB(currentHighestXP / 2)} ${highestSkill} XP.`
			);
			return `You lost 50 items from your collection log and ${toKMB(currentHighestXP / 2)} ${highestSkill} XP.`;
		}

		/**
		 * Won
		 */
		const itemsToAddToCL = new Bank();
		while (itemsToAddToCL.length < 50) {
			const itemToAdd = randArrItem(allCLItemsFiltered);
			if (!itemsToAddToCL.has(itemToAdd) && !user.cl.has(itemToAdd)) {
				itemsToAddToCL.add(itemToAdd);
			}
		}
		const newCL: ItemBank = deepClone(user.user.collectionLogBank as ItemBank);
		for (const [{ id }, _] of itemsToAddToCL.items()) {
			newCL[id] = 1;
		}
		const lowestSkill = Object.entries(user.skillsAsXP).sort((a, b) => a[1] - b[1])[0][0];
		const currentLowestXP = user.skillsAsXP[lowestSkill as SkillNameType];
		await user.update({
			collectionLogBank: newCL,
			[`skills_${lowestSkill}`]: currentLowestXP * 2,
			relics: removeFromArr(user.user.relics, RelicID.Gambling)
		});

		globalClient.emit(
			Events.ServerNotification,
			`${user} just won 50 items added to their collection log and ${toKMB(currentLowestXP * 2)} ${lowestSkill} XP.`
		);
		return `You lost 50 items from your collection log and ${toKMB(currentLowestXP * 2)} ${lowestSkill} XP.`;
	}
};
