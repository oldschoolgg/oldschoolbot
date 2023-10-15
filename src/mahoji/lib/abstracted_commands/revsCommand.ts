import { ChatInputCommandInteraction } from 'discord.js';
import { calcWhatPercent, randInt, reduceNumByPercent, Time } from 'e';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { Bank } from 'oldschooljs';

import { Emoji } from '../../../lib/constants';
import { trackLoot } from '../../../lib/lootTrack';
import { revenantMonsters } from '../../../lib/minions/data/killableMonsters/revs';
import { convertAttackStylesToSetup } from '../../../lib/minions/functions';
import { SkillsEnum } from '../../../lib/skilling/types';
import { maxDefenceStats, maxOffenceStats } from '../../../lib/structures/Gear';
import { RevenantOptions } from '../../../lib/types/minions';
import { formatDuration, percentChance, stringMatches } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import { getWildEvasionPercent, increaseWildEvasionXp } from '../../../lib/util/calcWildyPkChance';
import getOSItem from '../../../lib/util/getOSItem';
import { handleMahojiConfirmation } from '../../../lib/util/handleMahojiConfirmation';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';

export const revsSpecialWeapons = {
	melee: getOSItem("Viggora's chainmace"),
	range: getOSItem("Craw's bow"),
	mage: getOSItem("Thammaron's sceptre")
} as const;

export async function revsCommand(
	user: MUser,
	channelID: string,
	interaction: ChatInputCommandInteraction | null,
	name: string,
	quantity: number | undefined
): CommandResponse {
	const style = convertAttackStylesToSetup(user.user.attack_style);
	const userGear = user.gear.wildy;

	const boosts = [];
	const monster = revenantMonsters.find(
		m =>
			stringMatches(m.name, name) ||
			m.aliases.some(a => stringMatches(a, name)) ||
			m.name.split(' ').some(a => stringMatches(a, name))
	);
	if (!monster || !name) {
		return `That's not a valid Revenant. The valid Revenants are: ${revenantMonsters.map(m => m.name).join(', ')}.`;
	}

	const key = ({ melee: 'attack_crush', mage: 'attack_magic', range: 'attack_ranged' } as const)[style];
	const gearStat = userGear.getStats()[key];
	const gearPercent = Math.max(0, calcWhatPercent(gearStat, maxOffenceStats[key]));

	const weapon = userGear.equippedWeapon();
	if (!weapon) {
		return 'You have no weapon equipped in your Wildy outfit.';
	}

	if (weapon.equipment![key] < 10) {
		return `Your weapon is terrible, you can't kill Revenants. You should have ${style} gear equipped in your wildy outfit, as this is what you're currently training. You can change this using \`/minion train\``;
	}

	let timePerMonster = monster.timeToFinish;
	timePerMonster = reduceNumByPercent(timePerMonster, gearPercent / 4);
	boosts.push(`${(gearPercent / 4).toFixed(2)}% (out of a possible 25%) for ${key}`);

	const specialWeapon = revsSpecialWeapons[style];
	if (userGear.hasEquipped(specialWeapon.name)) {
		timePerMonster = reduceNumByPercent(timePerMonster, 35);
		boosts.push(`${35}% for ${specialWeapon.name}`);
	}

	const maxTripLength = Math.floor(calcMaxTripLength(user, 'Revenants'));
	if (!quantity) {
		quantity = Math.max(1, Math.floor(maxTripLength / timePerMonster));
	}
	let duration = quantity * timePerMonster;

	const cost = new Bank();

	let hasPrayerPots = true;

	const initialPrayerPots = 1; // At least 1 prayer potion
	const millisecondsPer8Minutes = 480_000; // 8 minutes in milliseconds
	const additionalPrayerPots = Math.round(duration / millisecondsPer8Minutes);
	const totalPrayerPots = initialPrayerPots + additionalPrayerPots;

	if (user.bank.amount('Prayer potion(4)') < totalPrayerPots) {
		hasPrayerPots = false;
		if (interaction) {
			await handleMahojiConfirmation(
				interaction,
				`Are you sure you want to kill revenants without enough prayer potions? You should bring at least ${totalPrayerPots} Prayer potion(4).`
			);
		}
	} else {
		cost.add('Prayer potion(4)', totalPrayerPots);
	}

	updateBankSetting('economyStats_PVMCost', cost);
	await transactItems({ userID: user.id, itemsToRemove: cost });
	if (cost.length > 0) {
		await trackLoot({
			id: monster.name,
			totalCost: cost,
			type: 'Monster',
			changeType: 'cost',
			users: [
				{
					id: user.id,
					cost
				}
			]
		});
	}

	let deathChance = 5;
	let defLvl = user.skillLevel(SkillsEnum.Defence);
	let deathChanceFromDefenceLevel = (100 - (defLvl === 99 ? 100 : defLvl)) / 4;
	deathChance += deathChanceFromDefenceLevel;

	const defensiveGearPercent = Math.max(
		0,
		calcWhatPercent(userGear.getStats().defence_magic, maxDefenceStats['defence_magic'])
	);
	let deathChanceFromGear = Math.max(20, 100 - defensiveGearPercent) / 4;
	deathChance += deathChanceFromGear;

	const evasionDeathReduction = await getWildEvasionPercent(user);
	deathChance = reduceNumByPercent(deathChance, evasionDeathReduction);

	const died = percentChance(deathChance);

	await increaseWildEvasionXp(user, duration);

	await addSubTaskToActivityTask<RevenantOptions>({
		monsterID: monster.id,
		userID: user.id,
		channelID: channelID.toString(),
		quantity,
		fakeDuration: duration,
		duration: died ? randInt(Math.min(Time.Minute * 3, duration), duration) : duration,
		type: 'Revenants',
		died,
		skulled: true,
		style,
		usingPrayerPots: hasPrayerPots
	});

	let response = `${user.minionName} is now killing ${quantity}x ${monster.name}, it'll take around ${formatDuration(
		duration
	)} to finish.
${Emoji.OSRSSkull} Skulled
**Death Chance:** ${deathChance.toFixed(2)}% (${deathChanceFromGear.toFixed(2)}% from magic def${
		deathChanceFromDefenceLevel > 0 ? `, ${deathChanceFromDefenceLevel.toFixed(2)}% from defence level` : ''
	} + 5% as default chance).${cost.length > 0 ? `\nRemoved from bank: ${cost}` : ''}${
		boosts.length > 0 ? `\nBoosts: ${boosts.join(', ')}` : ''
	}`;

	return response;
}
