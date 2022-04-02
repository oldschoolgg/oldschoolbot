import { User } from '@prisma/client';
import { calcWhatPercent, randInt, reduceNumByPercent, Time } from 'e';
import { KlasaUser } from 'klasa';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';
import { Bank } from 'oldschooljs';

import { Emoji } from '../../../lib/constants';
import { maxDefenceStats, maxOffenceStats } from '../../../lib/gear';
import { revenantMonsters } from '../../../lib/minions/data/killableMonsters/revs';
import { convertAttackStylesToSetup } from '../../../lib/minions/functions';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { SkillsEnum } from '../../../lib/skilling/types';
import { RevenantOptions } from '../../../lib/types/minions';
import { formatDuration, percentChance, stringMatches, updateBankSetting } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import getOSItem from '../../../lib/util/getOSItem';
import { getUserGear, handleMahojiConfirmation } from '../../mahojiSettings';

const specialWeapons = {
	melee: getOSItem("Viggora's chainmace"),
	range: getOSItem("Craw's bow"),
	mage: getOSItem("Thammaron's sceptre")
} as const;

export async function revsCommand(
	user: KlasaUser,
	mUser: User,
	channelID: bigint,
	interaction: SlashCommandInteraction | null,
	name: string
): CommandResponse {
	const style = convertAttackStylesToSetup(mUser.attack_style);
	const userGear = getUserGear(mUser).wildy;

	const boosts = [];
	const monster = revenantMonsters.find(
		m =>
			stringMatches(m.name, name) ||
			m.aliases.some(a => stringMatches(a, name)) ||
			m.name.split(' ').some(a => stringMatches(a, name))
	);
	if (!monster || !name) {
		return `That's not a valid revenant. The valid revenants are: ${revenantMonsters.map(m => m.name).join(', ')}.`;
	}

	const key = ({ melee: 'attack_crush', mage: 'attack_magic', range: 'attack_ranged' } as const)[style];
	const gearStat = userGear.getStats()[key];
	const gearPercent = Math.max(0, calcWhatPercent(gearStat, maxOffenceStats[key]));

	const weapon = userGear.equippedWeapon();
	if (!weapon) {
		return 'You have no weapon equipped in your wildy outfit.';
	}

	if (weapon.equipment![key] < 10) {
		return `Your weapon is terrible, you can't kill revenants. You should have ${style} gear equipped in your wildy outfit, as this is what you're currently training. You can change this using \`+m train\``;
	}

	let timePerMonster = monster.timeToFinish;
	timePerMonster = reduceNumByPercent(timePerMonster, gearPercent / 4);
	boosts.push(`${(gearPercent / 4).toFixed(2)}% (out of a possible 25%) for ${key}`);

	const specialWeapon = specialWeapons[style];
	if (userGear.hasEquipped(specialWeapon.name)) {
		timePerMonster = reduceNumByPercent(timePerMonster, 35);
		boosts.push(`${35}% for ${specialWeapon.name}`);
	}

	const quantity = Math.floor(user.maxTripLength('Revenants') / timePerMonster);
	let duration = quantity * timePerMonster;

	const cost = new Bank();

	let hasPrayerPots = true;
	if (user.bank().amount('Prayer potion(4)') < 5) {
		hasPrayerPots = false;
		if (interaction) {
			await handleMahojiConfirmation(
				interaction,
				'Are you sure you want to kill revenants without prayer potions? You should bring at least 5 Prayer potion(4).'
			);
		}
	} else {
		cost.add('Prayer potion(4)', 5);
	}

	updateBankSetting(user.client, ClientSettings.EconomyStats.PVMCost, cost);
	await user.removeItemsFromBank(cost);

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

	const died = percentChance(deathChance);

	await addSubTaskToActivityTask<RevenantOptions>({
		monsterID: monster.id,
		userID: user.id,
		channelID: channelID.toString(),
		quantity,
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
