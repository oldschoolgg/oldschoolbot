import { calcPercentOfNum, increaseNumByPercent, percentChance, randInt, roll, sumArr, Time } from 'e';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { Bank, Monsters } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';
import { itemID } from 'oldschooljs/dist/util';

import { BitField, Emoji, projectiles } from '../../../lib/constants';
import { gorajanArcherOutfit, gorajanOccultOutfit, gorajanWarriorOutfit } from '../../../lib/data/CollectionsExport';
import { getSimilarItems } from '../../../lib/data/similarItems';
import { blowpipeDarts } from '../../../lib/minions/functions/blowpipeCommand';
import { BlowpipeData } from '../../../lib/minions/types';
import { getMinigameEntity, getMinigameScore } from '../../../lib/settings/minigames';
import { prisma } from '../../../lib/settings/prisma';
import { SkillsEnum } from '../../../lib/skilling/types';
import { getUsersCurrentSlayerInfo } from '../../../lib/slayer/slayerUtil';
import { Gear } from '../../../lib/structures/Gear';
import { PercentCounter } from '../../../lib/structures/PercentCounter';
import { Skills } from '../../../lib/types';
import { InfernoOptions } from '../../../lib/types/minions';
import { determineProjectileTypeFromGear, formatDuration, itemNameFromID, randomVariation } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { newChatHeadImage } from '../../../lib/util/chatHeadImage';
import getOSItem from '../../../lib/util/getOSItem';
import resolveItems from '../../../lib/util/resolveItems';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';

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

function consumableCost({
	projectile,
	dart,
	fakeDuration,
	hasKodai,
	isEmergedZuk
}: {
	projectile: number;
	dart: number;
	fakeDuration: number;
	hasKodai: boolean;
	isEmergedZuk: boolean;
}) {
	const projectilesPerHour = 150;
	const dartsPerHour = 300;
	const bloodBarragePerHour = 200;
	const iceBarragePerHour = 100;
	const elderBarragePerHour = 20;

	const hours = fakeDuration / Time.Hour;
	const cost = new Bank();

	cost.add(projectile, Math.ceil(projectilesPerHour * hours));
	cost.add(dart, Math.ceil(dartsPerHour * hours));

	const iceBarrageRunes = new Bank().add('Death rune', 4).add('Blood rune', 2);
	const bloodBarrageRunes = new Bank().add('Death rune', 4).add('Blood rune', 4).add('Soul rune');
	const elderBarrageRunes = new Bank().add('Elder rune', 1).add('Blood rune', 12).add('Death rune', 8);

	if (!hasKodai) {
		iceBarrageRunes.add('Water rune', 6);
		bloodBarrageRunes.add('Soul rune');
	}

	cost.add(bloodBarrageRunes.multiply(Math.floor(bloodBarragePerHour * hours)));
	cost.add(iceBarrageRunes.multiply(Math.floor(iceBarragePerHour * hours)));
	if (isEmergedZuk) {
		cost.add(elderBarrageRunes.multiply(Math.floor(elderBarragePerHour * hours)));
		cost.add('Hellfire arrow', randInt(50, 80));
		cost.add('Super combat potion(4)');
	}

	cost.add('Saradomin brew(4)', 8);
	cost.add('Super restore(4)', 12);
	if (isEmergedZuk) {
		cost.add('Heat res. brew', 7);
		cost.add('Heat res. restore', 4);
	}
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

function baseEmergedZukDeathChance(_attempts: number) {
	const attempts = Math.max(1, _attempts);
	if (attempts < 30) return 99.9999 - attempts / 7.5;
	const chance = Math.floor(150 - (Math.log(attempts) / Math.log(Math.sqrt(25))) * 39);
	return Math.max(Math.min(chance, 20), 15);
}

function baseDuration(_attempts: number, isEmergedZuk: boolean) {
	const attempts = Math.max(1, Math.min(250, _attempts));
	let chance = Math.floor(150 - (Math.log(attempts) / Math.log(Math.sqrt(65))) * 45);
	if (attempts < 20) chance += 20 - attempts;
	let res = Math.min(Time.Hour * 2.5, Math.max(Time.Minute * 40, chance * (Time.Minute * 2.9)));
	if (isEmergedZuk) res = increaseNumByPercent(res, 15);
	return res;
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
	timesMadeToZuk,
	emergedAttempts,
	isEmergedZuk
}: {
	user: MUser;
	attempts: number;
	timesMadeToZuk: number;
	emergedAttempts: number;
	isEmergedZuk: boolean;
}) {
	const userBank = user.bank;
	const zukKC = await getMinigameScore(user.id, 'inferno');
	const duration = new PercentCounter(baseDuration(attempts, isEmergedZuk), 'time');
	const zukDeathChance = new PercentCounter(baseZukDeathChance(attempts), 'percent');
	const preZukDeathChance = new PercentCounter(basePreZukDeathChance(attempts), 'percent');
	const emergedZukDeathChance = new PercentCounter(baseEmergedZukDeathChance(emergedAttempts), 'percent');

	const { sacrificed_bank: sacrificedBank } = await user.fetchStats({ sacrificed_bank: true });

	if (!(sacrificedBank as ItemBank)[itemID('Fire cape')]) {
		return 'To do the Inferno, you must have sacrificed a fire cape.';
	}

	if (isEmergedZuk && !(sacrificedBank as ItemBank)[itemID('Infernal cape')]) {
		return 'To do the Emerged Zuk Inferno, you must have sacrificed an infernal cape.';
	}

	const skillReqs: Skills = isEmergedZuk
		? {
				defence: 102,
				magic: 102,
				hitpoints: 100,
				ranged: 107,
				prayer: 105
		  }
		: {
				defence: 92,
				magic: 94,
				hitpoints: 92,
				ranged: 92,
				prayer: 77
		  };
	const hasSkillReqs = user.hasSkillReqs(skillReqs);
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
	const itemRequirements = getSimilarItems(itemID('Rune pouch'));
	if (itemRequirements.every(item => !user.owns(item))) {
		return `To do the Inferno, you need one of these items: ${itemRequirements.map(itemNameFromID).join(', ')}.`;
	}

	/**
	 *
	 *
	 * Gear
	 *
	 *
	 */
	const rangeGear = user.gear.range;
	const mageGear = user.gear.mage;
	const gearToCheck: [Gear, string][] = [
		[rangeGear, 'range'],
		[mageGear, 'mage']
	];
	const meleeGear = user.gear.melee;
	if (isEmergedZuk) gearToCheck.push([meleeGear, 'melee']);

	for (const key of ['feet', 'body', 'hands', 'cape', 'ring', 'neck', 'legs', 'head'] as const) {
		for (const [gear, name] of gearToCheck) {
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
	if (!isEmergedZuk) {
		duration.add(
			(rangeGear.hasEquipped('Armadyl chestplate') && rangeGear.hasEquipped('Armadyl chainskirt')) ||
				(rangeGear.hasEquipped('Pernix body') && rangeGear.hasEquipped('Pernix chaps')),
			-3,
			'Armadyl/Pernix'
		);
		duration.add(
			(mageGear.hasEquipped('Ancestral robe top') && mageGear.hasEquipped('Ancestral robe bottom')) ||
				(mageGear.hasEquipped('Virtus robe top') && mageGear.hasEquipped('Virtus robe legs')),
			-4,
			'Ancestral/Virtus'
		);
	}
	const hasDivine = rangeGear.hasEquipped('Divine spirit shield') || mageGear.hasEquipped('Divine spirit shield');
	preZukDeathChance.add(hasDivine, -12, 'Divine');
	emergedZukDeathChance.add(hasDivine, -9, 'Divine');

	duration.add(rangeGear.hasEquipped('Masori body (f)') && rangeGear.hasEquipped('Masori chaps (f)'), -5, 'Masori');

	if (!(rangeGear.hasEquipped('Masori body (f)') && rangeGear.hasEquipped('Masori chaps (f)'))) {
		duration.add(
			rangeGear.hasEquipped('Armadyl chestplate') && rangeGear.hasEquipped('Armadyl chainskirt'),
			-3,
			'Armadyl'
		);
	}

	duration.add(
		mageGear.hasEquipped('Ancestral robe top') && mageGear.hasEquipped('Ancestral robe bottom'),
		-4,
		'Ancestral'
	);

	preZukDeathChance.add(
		!hasDivine && (rangeGear.hasEquipped('Elysian spirit shield') || mageGear.hasEquipped('Elysian spirit shield')),
		-5,
		'Ely'
	);
	duration.add(mageGear.hasEquipped('Virtus book', true, true), -7, 'Virtus book');
	if (isEmergedZuk) {
		duration.add(user.hasEquippedOrInBank('Dwarven warhammer'), -7, 'DWWH');
	}
	const meleeGora = meleeGear.hasEquipped(gorajanWarriorOutfit, true, true);
	const rangeGora = rangeGear.hasEquipped(gorajanArcherOutfit, true, true);
	const mageGora = mageGear.hasEquipped(gorajanOccultOutfit, true, true);
	for (const [name, has] of [
		['melee', meleeGora],
		['range', rangeGora],
		['mage', mageGora]
	] as const) {
		if (name === 'melee' && !isEmergedZuk) continue;
		if (name !== 'melee') {
			preZukDeathChance.add(has, -3.5, `Gorajan ${name}`);
			zukDeathChance.add(has, -3.5, `Gorajan ${name}`);
		}
		emergedZukDeathChance.add(has, -8, `Gorajan ${name}`);
		duration.add(has, -5, `Gorajan ${name}`);
	}
	preZukDeathChance.add(rangeGear.hasEquipped('Justiciar faceguard'), -5, 'Just. faceguard');

	const hasSuffering =
		rangeGear.hasEquipped('Ring of suffering (i)') || mageGear.hasEquipped('Ring of suffering (i)');
	preZukDeathChance.add(hasSuffering, -4, 'Ring of Suffering (i)');
	zukDeathChance.add(hasSuffering, -4, 'Ring of Suffering (i)');

	const blowpipeData = user.user.blowpipe as any as BlowpipeData;
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
	if (isEmergedZuk) {
		if (!['Dragon dart', 'Rune dart', 'Amethyst dart'].includes(dartItem.name)) {
			return 'Your darts too weak to hurt Emerged Zuk.';
		}
		if (dartItem.name === 'Dragon dart') {
			duration.add(true, -3, 'Dragon dart');
		}
	} else {
		duration.add(true, -percent, `${dartItem.name} in blowpipe`);
	}

	const mageWeapons = {
		'Ancient staff': 1,
		'Master wand': 1,
		'Nightmare staff': 5,
		'Eldritch nightmare staff': 9,
		'Kodai wand': 10,
		'Virtus wand': 12
	};
	const rangeWeapons = { 'Armadyl crossbow': 1, 'Twisted bow': 12, 'Zaryte bow': 13, 'Hellfire bow': 13 };
	for (const [name, setup, weapons] of [
		['mage', mageGear, mageWeapons],
		['range', rangeGear, rangeWeapons]
	] as const) {
		const weapon = setup.equippedWeapon();
		if (
			!weapon ||
			!Object.keys(weapons)
				.map(itemID)
				.map(i => [i, ...getSimilarItems(i)])
				.flat(2)
				.includes(weapon.id)
		) {
			return `You need one of these weapons in your ${name} setup: ${Object.keys(weapons).join(', ')}.`;
		}
	}

	const allMeleeGearItems = meleeGear.allItems(true);
	const allRangeGearItems = rangeGear.allItems(true);
	const allMageGearItems = mageGear.allItems(true);
	const allItems = [...allMeleeGearItems, ...allRangeGearItems, ...allMageGearItems];
	if (isEmergedZuk) {
		const amountOfDrygoreEquipped = resolveItems([
			'Drygore rapier',
			'Drygore longsword',
			'Drygore mace',
			'Offhand drygore rapier',
			'Offhand drygore longsword',
			'Offhand drygore mace'
		]).filter(i => allMeleeGearItems.includes(i)).length;
		if (amountOfDrygoreEquipped < 2) {
			return 'You need strong kalphite weapons to pierce TzKal-Zuk skin!';
		}
		if (
			!resolveItems(['Torva platebody', 'Torva platelegs', 'Torva boots', 'Torva gloves']).every(i =>
				allMeleeGearItems.includes(i)
			)
		) {
			return 'You need stronger melee armor! TzKal-Zuk will crush you. Try getting Torva or Gorajan.';
		}
		const hasTzkalCape = [meleeGear, rangeGear, mageGear].some(s => s.hasEquipped('Tzkal cape'));
		duration.add(hasTzkalCape, -5, 'TzKal cape');
		preZukDeathChance.add(hasTzkalCape, -5, 'TzKal cape');
		zukDeathChance.add(hasTzkalCape, -5, 'TzKal cape');
		emergedZukDeathChance.add(hasTzkalCape, -10, 'TzKal cape');
		duration.add(allItems.includes(itemID('Ignis ring(i)')), -5, 'Ignis ring(i)');
		emergedZukDeathChance.add(user.skillLevel(SkillsEnum.Defence) === 120, -10, '120 Defence');
		const emergedKC = await getMinigameScore(user.id, 'emerged_inferno');
		if (emergedKC > 0) {
			const effectiveKC = Math.min(emergedKC, 3);
			emergedZukDeathChance.add(true, 0 - effectiveKC * 7.5, `${effectiveKC} Emerged KC`);
		}
	}
	if (!isEmergedZuk) {
		zukDeathChance.add(rangeGear.equippedWeapon() === getOSItem('Armadyl crossbow'), 7.5, 'Zuk with ACB');
		duration.add(rangeGear.equippedWeapon() === getOSItem('Armadyl crossbow'), 4.5, 'ACB');
	}
	const usingTbow =
		rangeGear.hasEquipped('Twisted bow', true, true) || rangeGear.hasEquipped('Hellfire bow', true, true);
	zukDeathChance.add(usingTbow, 1.5, `Zuk with ${usingTbow ? rangeGear.equippedWeapon()?.name : 'Twisted bow'}`);
	duration.add(usingTbow, -7.5, `${usingTbow ? rangeGear.equippedWeapon()?.name : 'Twisted bow'}`);
	/**
	 * Emerged
	 */
	if (isEmergedZuk && zukKC < 20) {
		return 'You not worthy to fight TzKal-Zuk in his full form, you need defeat his first form 20 times first.';
	}
	if (
		isEmergedZuk &&
		[
			'Hellfire bow',
			'Dragon arrow',
			'Farsight snapshot necklace',
			'Pernix cowl',
			'Pernix body',
			'Pernix chaps',
			'Pernix boots',
			'Pernix gloves'
		].some(i => !rangeGear.hasEquipped(i, true, true))
	) {
		return 'You not worthy to fight TzKal-Zuk in his full form, you need better range gear and dragon arrows.';
	}
	if (
		isEmergedZuk &&
		[
			'Virtus wand',
			'Arcane blast necklace',
			'Virtus mask',
			'Virtus robe top',
			'Virtus robe legs',
			'Virtus boots',
			'Virtus gloves'
		].some(i => !mageGear.hasEquipped(i, true, true))
	) {
		return 'You not worthy to fight TzKal-Zuk in his full form, you need better mage gear.';
	}

	/**
	 *
	 *
	 * Other
	 *
	 *
	 */
	duration.add(user.user.bitfield.includes(BitField.HasDexScroll), -4, 'Dex. Prayer scroll');
	duration.add(user.user.bitfield.includes(BitField.HasArcaneScroll), -4, 'Arc. Prayer scroll');

	// Slayer
	const score = await getMinigameScore(user.id, 'inferno');
	const usersTask = await getUsersCurrentSlayerInfo(user.id);
	const isOnTask =
		usersTask.currentTask !== null &&
		usersTask.currentTask !== undefined &&
		usersTask.currentTask!.monster_id === Monsters.TzHaarKet.id &&
		score > 0 &&
		usersTask.currentTask!.quantity_remaining === usersTask.currentTask!.quantity;

	duration.add(isOnTask && user.hasEquippedOrInBank('Black mask (i)'), -9, `${Emoji.Slayer} Slayer Task`);

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
	const projectileType = determineProjectileTypeFromGear(rangeGear);
	if (!projectileType) {
		return "You aren't wearing an appropriate ranged weapon.";
	}
	const projectilesForTheirType = projectiles[projectileType].items;
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
	if (emergedAttempts < 4) {
		emergedZukDeathChance.value = 100;
	} else if (emergedAttempts < 8) {
		emergedZukDeathChance.value = 100 - emergedAttempts / 2;
	} else if (emergedAttempts < 15) {
		emergedZukDeathChance.value += 15 - emergedAttempts;
	}

	preZukDeathChance.value = Math.min(preZukDeathChance.value, 100);
	zukDeathChance.value = Math.min(zukDeathChance.value, 100);
	emergedZukDeathChance.value = Math.min(emergedZukDeathChance.value, 100);

	const diedPreZuk = percentChance(preZukDeathChance.value);
	const diedZuk = percentChance(zukDeathChance.value);
	emergedZukDeathChance.value = Math.min(emergedZukDeathChance.value, 100);

	let deathTime: number | null = null;
	const diedEmergedZuk = isEmergedZuk && percentChance(emergedZukDeathChance.value);
	if (diedPreZuk) {
		deathTime = randInt(Time.Minute, calcPercentOfNum(90, duration.value));
	} else if (diedZuk) {
		deathTime = randInt(calcPercentOfNum(90, duration.value), duration.value);
	} else if (diedEmergedZuk) {
		deathTime = randInt(calcPercentOfNum(95, duration.value), duration.value);
	}

	const realDuration = deathTime ?? duration.value;

	const cost = consumableCost({
		projectile: projectile.item,
		dart: blowpipeData.dartID,
		fakeDuration,
		hasKodai: mageGear.hasEquipped('Kodai wand', true, true),
		isEmergedZuk
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
		cost,
		emergedZukDeathChance,
		diedEmergedZuk
	};
}

export async function infernoStatsCommand(user: MUser): CommandResponse {
	const [minigames, { inferno_attempts: attempts }] = await Promise.all([
		getMinigameEntity(user.id),
		user.fetchStats({ inferno_attempts: true })
	]);

	const zukKC = minigames.inferno;
	const emergedAttempts = user.user.emerged_inferno_attempts;
	const emergedKC = minigames.emerged_inferno;

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

	str += ` ${emergedAttempts} Emerged Zuk Inferno attempts.`;

	return {
		content: `**Inferno Attempts:** ${attempts}
**Inferno KC:** ${zukKC}
**Emerged Inferno Attempts:** ${emergedAttempts}
**Emerged Inferno KC:** ${emergedKC}`,
		files: [
			{
				name: 'image.jpg',
				attachment: await newChatHeadImage({
					content: str,
					head: 'ketKeh'
				})
			}
		]
	};
}

export async function infernoStartCommand(user: MUser, channelID: string, emerged: boolean): CommandResponse {
	const usersRangeStats = user.gear.range.stats;
	const [zukKC, { inferno_attempts: attempts }] = await Promise.all([
		getMinigameScore(user.id, 'inferno'),
		user.fetchStats({ inferno_attempts: true })
	]);

	const res = await infernoRun({
		user,
		attempts,
		timesMadeToZuk: await timesMadeToZuk(user.id),
		emergedAttempts: user.user.emerged_inferno_attempts,
		isEmergedZuk: emerged
	});

	if (typeof res === 'string') {
		return {
			files: [
				{
					name: 'image.jpg',
					attachment: await newChatHeadImage({
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
		realDuration,
		emergedZukDeathChance,
		diedEmergedZuk
	} = res;

	const realCost = new Bank();
	try {
		realCost.add((await user.specialRemoveItems(cost)).realCost);
	} catch (err: any) {
		return {
			files: [
				{
					name: 'image.jpg',
					attachment: await newChatHeadImage({
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
		cost: realCost.bank,
		isEmergedZuk: emerged,
		emergedZukDeathChance: emergedZukDeathChance.value,
		diedEmergedZuk
	});

	updateBankSetting('inferno_cost', realCost);
	let emergedZukDeathMsg = emerged
		? `**Emerged Zuk Death Chance:** ${emergedZukDeathChance.value.toFixed(
				1
		  )}% ${emergedZukDeathChance.messages.join(', ')} ${
				emergedZukDeathChance.missed.length === 0
					? ''
					: `*(You didn't get these: ||${emergedZukDeathChance.missed.join(', ')}||)*`
		  }`
		: '';
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
${emergedZukDeathMsg}
**Items To Be Used:** ${realCost}`,
		files: [
			{
				name: 'image.jpg',
				attachment: await newChatHeadImage({
					content: "You're on your own now JalYt, you face certain death... prepare to fight for your life.",
					head: 'ketKeh'
				})
			}
		]
	};
}
