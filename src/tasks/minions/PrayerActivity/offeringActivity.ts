import { percentChance, randInt } from 'e';

import { zealOutfit } from '../../../lib/shadesKeys';
import Prayer from '../../../lib/skilling/skills/prayer';
import { SkillsEnum } from '../../../lib/skilling/types';
import type { OfferingActivityTaskOptions } from '../../../lib/types/minions';
import { roll } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export function zealOutfitBoost(user: MUser) {
	let zealOutfitAmount = 0;
	for (const piece of zealOutfit) {
		if (user.gear.skilling.hasEquipped([piece])) {
			zealOutfitAmount++;
		}
	}

	const zealOutfitChance = zealOutfitAmount * 1.25;

	return { zealOutfitAmount, zealOutfitChance };
}

export const offeringTask: MinionTask = {
	type: 'Offering',
	async run(data: OfferingActivityTaskOptions) {
		const { boneID, quantity, userID, channelID } = data;
		const user = await mUserFetch(userID);
		const { zealOutfitAmount, zealOutfitChance } = zealOutfitBoost(user);

		const bone = Prayer.Bones.find(bone => bone.inputId === boneID);

		const XPMod = 3.5;
		let bonesLost = 0;
		if (!bone) return;

		// make it so you can't lose more bones then you bring
		let maxPK = quantity;
		if (quantity >= 27) {
			maxPK = 27;
		}

		const trips = Math.ceil(quantity / 27);
		let deathCounter = 0;
		// roll a 10% chance to get pked per trip
		for (let i = 0; i < trips; i++) {
			if (roll(10)) {
				deathCounter++;
			}
		}
		// calc how many bones are lost
		for (let i = 0; i < deathCounter; i++) {
			bonesLost += randInt(1, maxPK);
		}
		const bonesSaved = Math.floor(quantity * (randInt(90, 110) / 100));
		let zealBonesSaved = 0;

		if (zealOutfitAmount > 0) {
			for (let i = 0; i < quantity; i++) {
				if (percentChance(zealOutfitChance)) {
					zealBonesSaved++;
				}
			}
		}

		const newQuantity = quantity - bonesLost + bonesSaved + zealBonesSaved;

		const xpReceived = newQuantity * bone.xp * XPMod;

		const xpRes = await user.addXP({
			skillName: SkillsEnum.Prayer,
			amount: xpReceived,
			duration: data.duration,
			source: 'OfferingBones'
		});

		let str = `${user}, ${user.minionName} finished offering ${newQuantity} ${bone.name}, you managed to offer ${bonesSaved} extra bones because of the effects the Chaos altar and you lost ${bonesLost} to pkers, ${xpRes}.`;

		if (zealOutfitAmount > 0) {
			str += `\nYour ${zealOutfitAmount} pieces of Zealot's robes helped you offer an extra ${zealBonesSaved} bones.`;
		}

		handleTripFinish(user, channelID, str, undefined, data, null);
	}
};
