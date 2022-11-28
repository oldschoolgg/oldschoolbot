import { randInt } from 'e';
import { Bank } from 'oldschooljs';

import { trackLoot } from '../../../lib/lootTrack';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { SkillsEnum } from '../../../lib/skilling/types';
import { GiantsFoundryActivityTaskOptions } from '../../../lib/types/minions';
import { randomVariation } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';
import { giantsFoundryAlloys } from './../../../mahoji/lib/abstracted_commands/giantsFoundryCommand';

const tipMoulds: string[] = [
	'Saw Tip',
	'Gladius Point',
	"Serpent's Fang",
	"Medusa's Head",
	'Chopper Tip',
	'People Poker Point',
	'Corrupted Point',
	"Defender's Tip",
	'Serrated Tip',
	'Needle Point',
	'The Point!'
];

const bladeMoulds: string[] = [
	'Gladius Edge',
	'Stiletto Blade',
	'Medusa Blade',
	'Fish Blade',
	"Defender's Edge",
	'Saw Blade',
	'Flamberge Blade',
	'Serpent Blade',
	'Claymore Blade',
	'Fleur de Blade',
	'Choppa!'
];

const forteMoulds: string[] = [
	'Serrated Forte',
	'Serpent Ricasso',
	'Medusa Ricasso',
	'Disarming Forte',
	'Gladius Ricasso',
	'Chopper Forte',
	'Stiletto Forte',
	"Defender's Base",
	"Juggernaut's Forte",
	'Chopper Forte +1',
	'Spiker!'
];

export const TOTAL_WEAPONS = tipMoulds.length * bladeMoulds.length * forteMoulds.length;

export const giantsFoundryTask: MinionTask = {
	type: 'GiantsFoundry',
	async run(data: GiantsFoundryActivityTaskOptions) {
		const { quantity, userID, channelID, duration, metalScore, alloyID } = data;
		const user = await mUserFetch(userID);
		const alloy = giantsFoundryAlloys.find(i => i.id === alloyID);
		if (!alloy) {
			return 'A issue occured trying to find a alloy using the alloy ID.';
		}
		const userSmithingLevel = user.skillLevel(SkillsEnum.Smithing);
		const boosts = [];
		let avgMouldBonus = 37.667;
		if (userSmithingLevel > 79) {
			avgMouldBonus = 58.25;
			boosts.push(`${58.25} average mould score for 80+ Smithing`);
		}
		let reputationReceived = 0;
		let xpReceived = 0;
		let weaponName = '';
		for (let i = 0; i < quantity; i++) {
			let quality = Math.min(Math.floor(randomVariation(metalScore - 5 + avgMouldBonus, 10)), 199);
			xpReceived += (Math.pow(quality, 2) / 73 + 1.5 * quality + 1) * 30;
			reputationReceived += quality;

			//Increse and save down Giant Weapons Made
			const tipID = randInt(1, tipMoulds.length);
			const bladeMouldID = randInt(1, bladeMoulds.length);
			const forteMouldID = randInt(1, forteMoulds.length);
			const weaponID = tipID.toString() + bladeMouldID.toString() + forteMouldID.toString();
			weaponName = tipMoulds[tipID - 1] + ' ' + bladeMoulds[bladeMouldID - 1] + ' ' + forteMoulds[forteMouldID - 1];
			await user.incrementGiantsWeaponsMade(parseInt(weaponID));
		}
		xpReceived = Math.floor(xpReceived);
		reputationReceived = Math.floor(reputationReceived);

		const xpRes = await user.addXP({
			skillName: SkillsEnum.Smithing,
			amount: xpReceived,
			duration
		});

		const currentUserReputation = user.user.foundry_reputation;

		await user.update({
			foundry_reputation: currentUserReputation + reputationReceived
		});

		await incrementMinigameScore(userID, 'giants_foundry', quantity);

		const loot = new Bank().add('Coins', 2 * xpReceived);

		let str = `${user}, ${
			user.minionName
		} finished creating ${quantity}x giant weapons in the Giants' Foundry minigame. **Boosts:** ${boosts.join(
			', '
		)}.\n${xpRes}\nKovac gave you **${reputationReceived.toLocaleString()}** Foundry Reputation ${
			loot.length > 0 ? `and ${loot}.` : ''
		}\nThe most prestigious weapon created by your minion was a **${weaponName}}**.`;

		const { itemsAdded } = await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		updateBankSetting('gf_loot', loot);
		await trackLoot({
			id: 'giants_foundry',
			type: 'Minigame',
			duration,
			kc: quantity,
			totalLoot: loot,
			changeType: 'loot',
			users: [
				{
					id: user.id,
					loot,
					duration
				}
			]
		});

		handleTripFinish(user, channelID, str, undefined, data, itemsAdded);
	}
};
