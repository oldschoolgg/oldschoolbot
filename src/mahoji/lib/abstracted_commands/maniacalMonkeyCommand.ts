import { ManiacalMonkeyTaskOptions } from './../../../lib/types/minions';

import { PvMMethod } from './../../../lib/constants';
import { Skills } from '../../../lib/types';
import { formatDuration, hasSkillReqs } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import { resolveAttackStyles } from '../../../lib/minions/functions';
import { Time } from 'e';


export async function maniacalMonkeyCommand(user: MUser, channelID: string, quantity: number | undefined, method: PvMMethod | undefined) {
	const { minionName } = user;

	const skillReqs: Skills = {
		hitpoints: 74,
		prayer: 74
	};
	
	const [hasReqs] = hasSkillReqs(user, skillReqs);
	if (!hasReqs) {
		return `You not meet skill requirements, you need ${Object.entries(skillReqs)
			.map(([name, lvl]) => `${lvl} ${name}`)
			.join(', ')}.`;
	}
	const magicLevel = user.skillLevel('magic');
	const rangedLevel = user.skillLevel('ranged');
	if (method === "burst" || method === "barrage" && magicLevel < 62) {
		return 'You need atleast 62 magic to train magic on Maniacal Monkeys.';
	}
	else if (method === 'chinning' || method === 'cannon' && rangedLevel < 60) {
		return 'You need atleast 60 ranged to train ranged on Maniacal Monkeys.';
	}

	const myCBOpts = user.combatOptions;
	
	const [, , attackStyles] = resolveAttackStyles(user, {
		monsterID: -1
	});

	let timeToFinish = Time.Minute;

	const messages:string[] = [];

	const maxTripLength = calcMaxTripLength(user, 'ManiacalMonkey');
	// If no quantity provided, set it to the max.
	if (!quantity) {
		quantity = Math.floor(maxTripLength / timeToFinish);
	}
	quantity = Math.max(1, quantity);
	let duration = timeToFinish * quantity;

	if (duration > maxTripLength) {
		return `${minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount you can do for Maniacal Monkey is ${Math.floor(
			maxTripLength / timeToFinish
		)}.`;
	}

	await addSubTaskToActivityTask<ManiacalMonkeyTaskOptions>({
		userID: user.id,
		channelID: channelID.toString(),
		quantity,
		duration,
		type: 'ManiacalMonkey',
		method
	});

	let response = `${minionName} is now killing ${quantity}x Maniacal Monkey, it'll take around ${formatDuration(
		duration
	)} to finish. Attack styles used: ${attackStyles.join(', ')}.`;

	if (pvmCost) {
		response += ` Removed ${lootToRemove}.`;
	}

	if (boosts.length > 0) {
		response += `\n**Boosts:** ${boosts.join(', ')}.`;
	}

	if (messages.length > 0) {
		response += `\n**Messages:** ${messages.join(', ')}.`;
	}

	return response;
}
