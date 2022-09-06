import { calcPercentOfNum, percentChance, randInt, roll, sumArr, Time } from 'e';
import { KlasaUser } from 'klasa';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { Bank, Monsters } from 'oldschooljs';
import { itemID } from 'oldschooljs/dist/util';

import { BitField, Emoji, projectiles, ProjectileType } from '../../../lib/constants';
import { getSimilarItems } from '../../../lib/data/similarItems';
import { blowpipeDarts } from '../../../lib/minions/functions/blowpipeCommand';
import { prisma } from '../../../lib/settings/prisma';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { getUsersCurrentSlayerInfo } from '../../../lib/slayer/slayerUtil';
import { PercentCounter } from '../../../lib/structures/PercentCounter';
import { Skills } from '../../../lib/types';
import { InfernoOptions } from '../../../lib/types/minions';
import { formatDuration, itemNameFromID, randomVariation, updateBankSetting } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { newChatHeadImage } from '../../../lib/util/chatHeadImage';
import getOSItem from '../../../lib/util/getOSItem';

const minimumRangeItems = [
	'Amulet of fury',
	"Karil's leathertop",
	"Karil's leatherskirt",
	'Barrows gloves',
	'Twisted bow',
	"Ava's assembler",
	'Snakeskin boots'
].map(getOSItem);

const minimumRangeAttackStat = sumArr(minimumRangeItems.map(i => i.equipment!.attack_ranged));
const minimumRangeMagicDefenceStat = sumArr(minimumRangeItems.map(i => i.equipment!.defence_magic)) - 10;

const minimumMageItems = [
	'Amulet of fury',
	'Imbued guthix cape',
	"Ahrim's robetop",
	"Ahrim's robeskirt",
	'Barrows gloves',
	'Splitbark boots',
	'Ancient staff'
].map(getOSItem);

const minimumMageAttackStat = sumArr(minimumMageItems.map(i => i.equipment!.attack_magic));
const minimumMageMagicDefenceStat = sumArr(minimumMageItems.map(i => i.equipment!.defence_magic)) - 10;

const itemRequirements = new Bank().add('Rune pouch');

function consumableCost({
	projectile,
	dart,
	fakeDuration,
	hasKodai
}: {
	projectile: number;
	dart: number;
	fakeDuration: number;
	hasKodai: boolean;
}) {
	const projectilesPerHour = 150;
	const dartsPerHour = 300;
	const bloodBarragePerHour = 200;
	const iceBarragePerHour = 100;

	const hours = fakeDuration / Time.Hour;
	const cost = new Bank();

	cost.add(projectile, Math.ceil(projectilesPerHour * hours));
	cost.add(dart, Math.ceil(dartsPerHour * hours));

	const iceBarrageRunes = new Bank().add('Death rune', 4).add('Blood rune', 2);
	const bloodBarrageRunes = new Bank().add('Death rune', 4).add('Blood rune', 4).add('Soul rune');

	if (!hasKodai) {
		iceBarrageRunes.add('Water rune', 6);
		bloodBarrageRunes.add('Soul rune');
	}

	cost.add(bloodBarrageRunes.multiply(Math.floor(bloodBarragePerHour * hours)));
	cost.add(iceBarrageRunes.multiply(Math.floor(iceBarragePerHour * hours)));

	cost.add('Saradomin brew(4)', 8);
	cost.add('Super restore(4)', 12);
	cost.add('Ranging potion(4)');
	cost.add('Stamina potion(4)');

	for (const [item, quantity] of cost.items()) {
		if (!Number.isInteger(quantity)) {
			throw new Error(`${quantity}x ${item.name}`);
		}
	}

	return cost;
}

function basePreZukDeathChance(_attempts: number) {
	const attempts = Math.max(1, _attempts);
	let chance = Math.floor(100 - (Math.log(attempts) / Math.log(Math.sqrt(45))) * 47);
	if (attempts < 30) chance += 30 - attempts;

	return Math.max(Math.min(chance, 99), 5);
}

function baseZukDeathChance(_attempts: number) {
	const attempts = Math.max(1, _attempts);
	if (attempts < 25) return 99.9999 - attempts / 7.5;
	const chance = Math.floor(150 - (Math.log(attempts) / Math.log(Math.sqrt(25))) * 39);
	return Math.max(Math.min(chance, 99), 15);
}

function baseDuration(_attempts: number) {
	const attempts = Math.max(1, Math.min(250, _attempts));
	let chance = Math.floor(150 - (Math.log(attempts) / Math.log(Math.sqrt(65))) * 45);
	if (attempts < 20) chance += 20 - attempts;
	return Math.min(Time.Hour * 2.5, Math.max(Time.Minute * 40, chance * (Time.Minute * 2.9)));
}

async function timesMadeToZuk(userID: string) {
	const timesMadeToZuk = Number(
		(
			await prisma.$queryRawUnsafe<any>(`SELECT COUNT(*)
FROM activity
WHERE type = 'Inferno'
AND user_id = ${userID}
AND completed = true
AND (data->>'diedPreZuk')::boolean = false;`)
		)[0].count
	);
	return timesMadeToZuk;
}

async function infernoRun({
	user,
	attempts,
	timesMadeToZuk
}: {
	user: KlasaUser;
	attempts: number;
	timesMadeToZuk: number;
}) {
	const userBank = user.bank();

	const duration = new PercentCounter(baseDuration(attempts), 'time');
	const zukDeathChance = new PercentCounter(baseZukDeathChance(attempts), 'percent');
	const preZukDeathChance = new PercentCounter(basePreZukDeathChance(attempts), 'percent');

	if (!user.settings.get(UserSettings.SacrificedBank)[itemID('Fire cape')]) {
		return 'To do the Inferno, you must have sacrificed a fire cape.';
	}

	const skillReqs: Skills = {
		defence: 92,
		magic: 94,
		hitpoints: 92,
		ranged: 92,
		prayer: 77
	};
	const [hasSkillReqs] = user.hasSkillReqs(skillReqs);
	if (!hasSkillReqs) {
		return `You not meet skill requirements, you need ${Object.entries(skillReqs)
			.map(([name, lvl]) => `${lvl} ${name}`)
			.join(', ')}.`;
	}
	/**
	 *
	 * Item Requirements
	 *
	 */
	if (!user.owns(itemRequirements)) {
		return `To do the Inferno, you need these items: ${itemRequirements}.`;
	}

	/**
	 *
	 *
	 * Gear
	 *
	 *
	 */
	const rangeGear = user.getGear('range');
	const mageGear = user.getGear('mage');

	for (const key of ['feet', 'body', 'hands', 'cape', 'ring', 'neck', 'legs', 'head'] as const) {
		for (const [gear, name] of [
			[rangeGear, 'range'],
			[mageGear, 'mage']
		] as const) {
			if (!gear[key]) {
				return `You have nothing in your ${key} slot in your ${name} setup.. are you crazy?`;
			}
		}
	}

	if (
		mageGear.stats.attack_magic < minimumMageAttackStat ||
		mageGear.stats.defence_magic < minimumMageMagicDefenceStat
	) {
		return 'Your mage gear is too bad! You die quickly.';
	}

	if (
		rangeGear.stats.attack_ranged < minimumRangeAttackStat ||
		rangeGear.stats.defence_magic < minimumRangeMagicDefenceStat
	) {
		return 'Your range gear is too bad! You die quickly.';
	}

	duration.add(
		rangeGear.hasEquipped('Armadyl chestplate') && rangeGear.hasEquipped('Armadyl chainskirt'),
		-3,
		'Armadyl'
	);

	duration.add(
		mageGear.hasEquipped('Ancestral robe top') && mageGear.hasEquipped('Ancestral robe bottom'),
		-4,
		'Ancestral'
	);

	preZukDeathChance.add(
		rangeGear.hasEquipped('Elysian spirit shield') || mageGear.hasEquipped('Elysian spirit shield'),
		-5,
		'Ely'
	);

	preZukDeathChance.add(rangeGear.hasEquipped('Justiciar faceguard'), -5, 'Just. faceguard');

	const hasSuffering =
		rangeGear.hasEquipped('Ring of suffering (i)') || mageGear.hasEquipped('Ring of suffering (i)');
	preZukDeathChance.add(hasSuffering, -4, 'Ring of Suffering (i)');
	zukDeathChance.add(hasSuffering, -4, 'Ring of Suffering (i)');

	const blowpipeData = user.settings.get(UserSettings.Blowpipe);
	if (!userBank.has('Toxic blowpipe') || !blowpipeData.scales || !blowpipeData.dartID || !blowpipeData.dartQuantity) {
		return 'You need a Toxic blowpipe (with darts and scales equipped) to do the Inferno. You also need Darts and Scales equipped in it.';
	}

	const darts = blowpipeData.dartID;
	const dartItem = getOSItem(darts);
	const dartIndex = blowpipeDarts.indexOf(dartItem);
	const percent = dartIndex >= 3 ? dartIndex * 0.9 : -(4 * (4 - dartIndex));
	if (dartIndex < 5) {
		return 'Your darts are simply too weak, to work in the Inferno!';
	}
	duration.add(true, -percent, `${dartItem.name} in blowpipe`);

	const mageWeapons = {
		'Ancient staff': 1,
		'Master wand': 1,
		'Nightmare staff': 5,
		'Eldritch nightmare staff': 9,
		'Kodai wand': 10
	};
	const rangeWeapons = { 'Armadyl crossbow': 1, 'Twisted bow': 12 };
	for (const [name, setup, weapons] of [
		['mage', mageGear, mageWeapons],
		['range', rangeGear, rangeWeapons]
	] as const) {
		const weapon = setup.equippedWeapon();
		const validWeapons = Object.keys(weapons)
			.map(itemID)
			.map(id => [...getSimilarItems(id), id])
			.flat();
		if (!weapon || !validWeapons.includes(weapon.id)) {
			return `You need one of these weapons in your ${name} setup: ${Object.keys(weapons).join(', ')}.`;
		}
	}

	zukDeathChance.add(
		getSimilarItems(itemID('Armadyl crossbow')).includes(rangeGear.equippedWeapon()!.id),
		7.5,
		'Zuk with ACB'
	);
	duration.add(getSimilarItems(itemID('Armadyl crossbow')).includes(rangeGear.equippedWeapon()!.id), 4.5, 'ACB');

	zukDeathChance.add(
		[...getSimilarItems(itemID('Twisted bow')), itemID('Twisted bow')].includes(rangeGear.equippedWeapon()!.id),
		1.5,
		'Zuk with TBow'
	);
	duration.add(
		[...getSimilarItems(itemID('Twisted bow')), itemID('Twisted bow')].includes(rangeGear.equippedWeapon()!.id),
		-7.5,
		'TBow'
	);

	/**
	 *
	 *
	 * Other
	 *
	 *
	 */
	duration.add(user.bitfield.includes(BitField.HasDexScroll), -4, 'Dex. Prayer scroll');
	duration.add(user.bitfield.includes(BitField.HasArcaneScroll), -4, 'Arc. Prayer scroll');

	// Slayer
	const score = await user.getMinigameScore('inferno');
	const usersTask = await getUsersCurrentSlayerInfo(user.id);
	const isOnTask =
		usersTask.currentTask !== null &&
		usersTask.currentTask !== undefined &&
		usersTask.currentTask!.monster_id === Monsters.TzHaarKet.id &&
		score > 0 &&
		usersTask.currentTask!.quantity_remaining === usersTask.currentTask!.quantity;

	duration.add(isOnTask && user.hasItemEquippedOrInBank('Black mask (i)'), -9, `${Emoji.Slayer} Slayer Task`);

	if (timesMadeToZuk > 0) {
		zukDeathChance.add(
			timesMadeToZuk > 0,
			0 - 5 * Math.min(6, timesMadeToZuk),
			`Made it to Zuk ${timesMadeToZuk} times`
		);
	} else {
		zukDeathChance.add(timesMadeToZuk === 0, 40, 'Never made it to Zuk');
	}

	/**
	 *
	 *
	 * Consumables / Cost
	 *
	 *
	 */
	const projectile = rangeGear.ammo;
	if (!projectile) {
		return 'You have no projectiles equipped in your range setup.';
	}
	const projectileType: ProjectileType = rangeGear.equippedWeapon()!.name === 'Twisted bow' ? 'arrow' : 'bolt';
	const projectilesForTheirType = projectiles[projectileType];
	if (!projectilesForTheirType.includes(projectile.item)) {
		return `You're using incorrect projectiles, you're using a ${
			rangeGear.equippedWeapon()!.name
		}, which uses ${projectileType}s, so you should be using one of these: ${projectilesForTheirType
			.map(itemNameFromID)
			.join(', ')}.`;
	}

	duration.value = randomVariation(duration.value, (randInt(1, 10) + randInt(1, 10) + randInt(1, 10)) / 3);

	const fakeDuration = Math.floor(duration.value);

	if (attempts < 8) {
		zukDeathChance.value = 100;
	} else if (attempts < 20) {
		zukDeathChance.value += 20 - attempts;
	}
	if (attempts < 15) {
		preZukDeathChance.value += 15 - attempts;
	}

	preZukDeathChance.value = Math.min(preZukDeathChance.value, 100);
	zukDeathChance.value = Math.min(zukDeathChance.value, 100);

	const diedPreZuk = percentChance(preZukDeathChance.value);
	const diedZuk = percentChance(zukDeathChance.value);
	let deathTime: number | null = null;
	if (diedPreZuk) {
		deathTime = randInt(Time.Minute, calcPercentOfNum(90, duration.value));
	} else if (diedZuk) {
		deathTime = randInt(calcPercentOfNum(90, duration.value), duration.value);
	}

	const realDuration = deathTime ?? duration.value;

	const cost = consumableCost({
		projectile: projectile.item,
		dart: blowpipeData.dartID,
		fakeDuration,
		hasKodai: mageGear.hasEquipped('Kodai wand')
	});

	return {
		deathTime,
		fakeDuration,
		zukDeathChance,
		duration,
		diedZuk,
		diedPreZuk,
		preZukDeathChance,
		realDuration,
		cost
	};
}

export async function infernoStatsCommand(user: KlasaUser): CommandResponse {
	const attempts = user.settings.get(UserSettings.Stats.InfernoAttempts);
	const zukKC = await user.getMinigameScore('inferno');

	let str = 'You have never attempted the Inferno, I recommend you stay that way.';
	if (attempts && !zukKC) {
		str = `You have tried the Inferno ${attempts} times, but never succeeded. Leave while you can.`;
	} else if (attempts && zukKC) {
		str = `You have completed the Inferno ${zukKC} times, out of ${attempts} attempts.`;
	}

	const numTimesMadeToZuk = await timesMadeToZuk(user.id);
	if (!zukKC) {
		if (attempts && !numTimesMadeToZuk) {
			str += ' You have never even made it to the final wave yet.';
		} else if (roll(1000)) {
			str += ` You made it to TzKal-Zuk ${numTimesMadeToZuk} times, but never killed him, maybe just buy the cape JalYt?`;
		} else {
			str += ` You made it to TzKal-Zuk ${numTimesMadeToZuk} times, but never killed him, sad. `;
		}
	}

	return {
		attachments: [
			{
				fileName: 'image.jpg',
				buffer: await newChatHeadImage({
					content: str,
					head: 'ketKeh'
				})
			}
		]
	};
}

export async function infernoStartCommand(user: KlasaUser, channelID: bigint): CommandResponse {
	const attempts = user.settings.get(UserSettings.Stats.InfernoAttempts);
	const usersRangeStats = user.getGear('range').stats;
	const zukKC = await user.getMinigameScore('inferno');

	const res = await infernoRun({
		user,
		attempts,
		timesMadeToZuk: await timesMadeToZuk(user.id)
	});

	if (typeof res === 'string') {
		return {
			attachments: [
				{
					fileName: 'image.jpg',
					buffer: await newChatHeadImage({
						content: res,
						head: 'ketKeh'
					})
				}
			]
		};
	}
	const {
		deathTime,
		diedPreZuk,
		zukDeathChance,
		diedZuk,
		duration,
		fakeDuration,
		preZukDeathChance,
		cost,
		realDuration
	} = res;

	const realCost = new Bank();
	try {
		realCost.add((await user.specialRemoveItems(cost)).realCost);
	} catch (err: any) {
		return {
			attachments: [
				{
					fileName: 'image.jpg',
					buffer: await newChatHeadImage({
						content: `${err.message}`,
						head: 'ketKeh'
					})
				}
			]
		};
	}

	await addSubTaskToActivityTask<InfernoOptions>({
		userID: user.id,
		channelID: channelID.toString(),
		duration: realDuration,
		type: 'Inferno',
		zukDeathChance: zukDeathChance.value,
		preZukDeathChance: preZukDeathChance.value,
		deathTime,
		fakeDuration,
		diedPreZuk,
		diedZuk,
		cost: realCost.bank
	});

	updateBankSetting(globalClient, ClientSettings.EconomyStats.InfernoCost, realCost);

	return {
		content: `
**KC:** ${zukKC}
**Attempts:** ${attempts}

**Duration:** ${formatDuration(duration.value)}
**Boosts:** ${duration.messages.join(', ')} ${
			duration.missed.length === 0 ? '' : `*(You didn't get these: ||${duration.missed.join(', ')}||)*`
		}
**Range Attack Bonus:** ${usersRangeStats.attack_ranged}
**Pre-Zuk Death Chance:** ${preZukDeathChance.value.toFixed(1)}% ${preZukDeathChance.messages.join(', ')} ${
			preZukDeathChance.missed.length === 0
				? ''
				: `*(You didn't get these: ||${preZukDeathChance.missed.join(', ')}||)*`
		}
**Zuk Death Chance:** ${zukDeathChance.value.toFixed(1)}% ${zukDeathChance.messages.join(', ')} ${
			zukDeathChance.missed.length === 0
				? ''
				: `*(You didn't get these: ||${zukDeathChance.missed.join(', ')}||)*`
		}

**Items To Be Used:** ${realCost}`,
		attachments: [
			{
				fileName: 'image.jpg',
				buffer: await newChatHeadImage({
					content: "You're on your own now JalYt, you face certain death... prepare to fight for your life.",
					head: 'ketKeh'
				})
			}
		]
	};
}
