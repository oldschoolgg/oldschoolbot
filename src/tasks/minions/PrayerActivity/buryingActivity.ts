import { Bank } from 'oldschooljs';

import Prayer from '@/lib/skilling/skills/prayer.js';
import type { BuryingActivityTaskOptions } from '@/lib/types/minions.js';
import { handleTripFinish } from '@/lib/util/handleTripFinish.js';
import { percentChance } from '@/lib/util/rng.js';
import { zealOutfitBoost } from './offeringActivity.js';

export const buryingTask: MinionTask = {
	type: 'Burying',
	async run(data: BuryingActivityTaskOptions) {
		const { boneID, quantity, userID, channelID } = data;
		const user = await mUserFetch(userID);
		const { zealOutfitAmount, zealOutfitChance } = zealOutfitBoost(user);

		const bone = Prayer.Bones.find(bone => bone.inputId === boneID);

		if (!bone) return;

		let zealBonesSaved = 0;

		if (zealOutfitAmount > 0) {
			for (let i = 0; i < quantity; i++) {
				if (percentChance(zealOutfitChance)) {
					zealBonesSaved++;
				}
			}
		}

		const newQuantity = quantity + zealBonesSaved;
		const XPMod = 1;
		const xpReceived = newQuantity * bone.xp * XPMod;

		const xpRes = await user.addXP({ skillName: 'prayer', amount: xpReceived, duration: data.duration });
		await user.addXP({ skillName: 'prayer', amount: xpReceived, source: 'BuryingBones' });

		let str = `${user}, ${user.minionName} finished burying ${quantity} ${bone.name}, ${xpRes}.`;

		if (zealOutfitAmount > 0) {
			str += `\nYour ${zealOutfitAmount} pieces of Zealot's robes helped you bury an extra ${zealBonesSaved} ${bone.name}.`;
		}

		if (
			user.hasEquipped(['Iron dagger', 'Bronze arrow', 'Iron med helm'], true) &&
			!user.hasEquippedOrInBank(['Clue hunter garb'])
		) {
			await user.transactItems({
				itemsToAdd: new Bank({ 'Clue hunter garb': 1, 'Clue hunter trousers': 1 }),
				collectionLog: true
			});
			str += '\n\nWhile digging a hole to bury bones in, you find a garb and pair of trousers.';
		}

		handleTripFinish(user, channelID, str, undefined, data, null);
	}
};
