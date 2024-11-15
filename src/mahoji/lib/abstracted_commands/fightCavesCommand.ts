import type { CommandResponse } from '@oldschoolgg/toolkit/util';
import { formatDuration } from '@oldschoolgg/toolkit/util';
import { Time, calcWhatPercent, percentChance, randInt, reduceNumByPercent } from 'e';
import { Bank, Monsters } from 'oldschooljs';
import { itemID } from 'oldschooljs/dist/util';

import { getMinigameScore } from '../../../lib/settings/minigames';
import { getUsersCurrentSlayerInfo } from '../../../lib/slayer/slayerUtil';
import type { FightCavesActivityTaskOptions } from '../../../lib/types/minions';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { newChatHeadImage } from '../../../lib/util/chatHeadImage';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';

export const fightCavesCost = new Bank({
	'Prayer potion(4)': 10,
	'Saradomin brew(4)': 6,
	'Super restore(4)': 4
});

async function determineDuration(user: MUser): Promise<[number, string]> {
	let baseTime = Time.Hour * 2;
	const gear = user.gear.range;
	let debugStr = '';

	// Reduce time based on KC
	const jadKC = await user.getKC(Monsters.TzTokJad.id);
	const zukKC = await getMinigameScore(user.id, 'inferno');
	const experienceKC = jadKC + zukKC * 3;
	const percentIncreaseFromKC = Math.min(50, experienceKC);
	baseTime = reduceNumByPercent(baseTime, percentIncreaseFromKC);
	debugStr += `${percentIncreaseFromKC}% from KC`;

	// Reduce time based on Gear
	const usersRangeStats = gear.stats;
	const percentIncreaseFromRangeStats = Math.floor(calcWhatPercent(usersRangeStats.attack_ranged, 236)) / 2;
	baseTime = reduceNumByPercent(baseTime, percentIncreaseFromRangeStats);

	if (user.hasEquippedOrInBank('Twisted bow')) {
		debugStr += ', 15% from Twisted bow';
		baseTime = reduceNumByPercent(baseTime, 15);
	}

	debugStr += `, ${percentIncreaseFromRangeStats}% from Gear`;

	return [baseTime, debugStr];
}

function determineChanceOfDeathPreJad(user: MUser, attempts: number, hasInfernoKC: boolean) {
	let deathChance = Math.max(14 - attempts * 2, 5);

	// If user has killed inferno, give them the lowest chance of death pre Jad.
	if (hasInfernoKC) deathChance = 5;

	// -4% Chance of dying before Jad if you have SGS.
	if (user.hasEquipped(itemID('Saradomin godsword'))) {
		deathChance -= 4;
	}

	return deathChance;
}

function determineChanceOfDeathInJad(attempts: number, hasInfernoKC: boolean) {
	let chance = Math.floor(100 - (Math.log(attempts) / Math.log(Math.sqrt(15))) * 50);

	if (hasInfernoKC) {
		chance /= 1.5;
	}

	// Chance of death cannot be 100% or <5%.
	return Math.max(Math.min(chance, 99), 5);
}

function checkGear(user: MUser): string | undefined {
	const gear = user.gear.range;
	const equippedWeapon = gear.equippedWeapon();

	const usersRangeStats = gear.stats;

	if (!equippedWeapon || !equippedWeapon.weapon || !['crossbow', 'bow'].includes(equippedWeapon.weapon.weapon_type)) {
		return 'JalYt, you not wearing ranged weapon?! TzTok-Jad stomp you to death if you get close, come back with a bow or a crossbow.';
	}

	if (usersRangeStats.attack_ranged < 160) {
		return 'JalYt, your ranged gear not strong enough! You die very quickly with your bad gear, come back with better range gear.';
	}

	if (!user.owns(fightCavesCost)) {
		return `JalYt, you need supplies to have a chance in the caves... Come back with ${fightCavesCost}.`;
	}

	if (user.skillLevel('prayer') < 43) {
		return 'JalYt, come back when you have at least 43 Prayer, TzTok-Jad annihilate you without protection from gods.';
	}
}

export async function fightCavesCommand(user: MUser, channelID: string): CommandResponse {
	const gearFailure = checkGear(user);
	if (gearFailure) {
		return {
			files: [
				{
					attachment: await newChatHeadImage({ content: gearFailure, head: 'mejJal' }),
					name: 'fightcaves.jpg'
				}
			]
		};
	}

	let [duration, debugStr] = await determineDuration(user);

	const { fight_caves_attempts: attempts } = await user.fetchStats({ fight_caves_attempts: true });

	const jadKC = await user.getKC(Monsters.TzTokJad.id);
	const zukKC = await getMinigameScore(user.id, 'inferno');
	const hasInfernoKC = zukKC > 0;

	const jadDeathChance = determineChanceOfDeathInJad(attempts, hasInfernoKC);
	const preJadDeathChance = determineChanceOfDeathPreJad(user, attempts, hasInfernoKC);

	const usersRangeStats = user.gear.range.stats;

	duration += (randInt(1, 5) * duration) / 100;

	await user.removeItemsFromBank(fightCavesCost);

	// Add slayer
	const usersTask = await getUsersCurrentSlayerInfo(user.id);
	const isOnTask =
		usersTask.currentTask !== null &&
		usersTask.currentTask !== undefined &&
		usersTask.currentTask?.monster_id === Monsters.TzHaarKet.id &&
		usersTask.currentTask?.quantity_remaining === usersTask.currentTask?.quantity;

	// 15% boost for on task
	if (isOnTask && user.hasEquippedOrInBank('Black mask (i)')) {
		duration *= 0.85;
		debugStr += ', 15% on Task with Black mask (i)';
	}

	const diedPreJad = percentChance(preJadDeathChance);
	const fakeDuration = duration;
	duration = diedPreJad ? randInt(Time.Minute * 20, duration) : duration;
	const preJadDeathTime = diedPreJad ? duration : null;

	await addSubTaskToActivityTask<FightCavesActivityTaskOptions>({
		userID: user.id,
		channelID: channelID.toString(),
		quantity: 1,
		duration,
		type: 'FightCaves',
		jadDeathChance,
		preJadDeathChance,
		preJadDeathTime,
		fakeDuration
	});

	updateBankSetting('economyStats_fightCavesCost', fightCavesCost);

	const totalDeathChance = (((100 - preJadDeathChance) * (100 - jadDeathChance)) / 100).toFixed(1);

	return {
		content: `**Duration:** ${formatDuration(fakeDuration)} (${(fakeDuration / 1000 / 60).toFixed(2)} minutes)
**Boosts:** ${debugStr}
**Range Attack Bonus:** ${usersRangeStats.attack_ranged}
**Jad KC:** ${jadKC}
**Zuk KC:** ${zukKC}
**Attempts:** ${attempts}

**Removed from your bank:** ${fightCavesCost}`,
		files: [
			{
				attachment: await newChatHeadImage({
					content: `You're on your own now JalYt, prepare to fight for your life! I think you have ${totalDeathChance}% chance of survival.`,
					head: 'mejJal'
				}),
				name: 'fightcaves.jpg'
			}
		]
	};
}
