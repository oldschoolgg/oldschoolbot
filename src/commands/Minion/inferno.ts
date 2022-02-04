import { MessageAttachment } from 'discord.js';
import { calcPercentOfNum, calcWhatPercent, increaseNumByPercent, randInt, roll, sumArr, Time } from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import fetch from 'node-fetch';
import { Bank, Monsters } from 'oldschooljs';
import { table } from 'table';

import { production } from '../../config';
import { BitField, Emoji, projectiles } from '../../lib/constants';
import { gorajanArcherOutfit, gorajanOccultOutfit, gorajanWarriorOutfit } from '../../lib/data/CollectionsExport';
import { getSimilarItems } from '../../lib/data/similarItems';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { blowpipeDarts } from '../../lib/minions/functions/blowpipeCommand';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { getUsersCurrentSlayerInfo } from '../../lib/slayer/slayerUtil';
import { BotCommand } from '../../lib/structures/BotCommand';
import { Gear } from '../../lib/structures/Gear';
import { PercentCounter } from '../../lib/structures/PercentCounter';
import { Skills } from '../../lib/types';
import { InfernoOptions } from '../../lib/types/minions';
import {
	determineProjectileTypeFromGear,
	formatDuration,
	itemNameFromID,
	percentChance,
	randomVariation,
	updateBankSetting
} from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import chatHeadImage from '../../lib/util/chatHeadImage';
import getOSItem from '../../lib/util/getOSItem';
import itemID from '../../lib/util/itemID';
import resolveItems from '../../lib/util/resolveItems';
import { calculateInfernoItemRefund } from '../../tasks/minions/minigames/infernoActivity';

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

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			altProtection: true,
			requiredPermissionsForBot: ['ATTACH_FILES'],
			description: 'Sends your minion to complete the Inferno.',
			examples: ['+inferno start', '+i'],
			categoryFlags: ['minion', 'minigame'],
			aliases: ['i', 'ie'],
			subcommands: true,
			usage: '[start] [str:...str]'
		});
	}

	consumableCost({
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

	basePreZukDeathChance(_attempts: number) {
		const attempts = Math.max(1, _attempts);
		let chance = Math.floor(100 - (Math.log(attempts) / Math.log(Math.sqrt(45))) * 47);
		if (attempts < 30) chance += 30 - attempts;

		return Math.max(Math.min(chance, 99), 5);
	}

	baseZukDeathChance(_attempts: number) {
		const attempts = Math.max(1, _attempts);
		if (attempts < 25) return 99.9999 - attempts / 7.5;
		const chance = Math.floor(150 - (Math.log(attempts) / Math.log(Math.sqrt(25))) * 39);
		return Math.max(Math.min(chance, 99), 15);
	}

	baseEmergedZukDeathChance(_attempts: number) {
		const attempts = Math.max(1, _attempts);
		if (attempts < 30) return 99.9999 - attempts / 7.5;
		const chance = Math.floor(150 - (Math.log(attempts) / Math.log(Math.sqrt(25))) * 39);
		return Math.max(Math.min(chance, 20), 15);
	}

	baseDuration(_attempts: number, isEmergedZuk: boolean) {
		const attempts = Math.max(1, Math.min(250, _attempts));
		let chance = Math.floor(150 - (Math.log(attempts) / Math.log(Math.sqrt(65))) * 45);
		if (attempts < 20) chance += 20 - attempts;
		let res = Math.min(Time.Hour * 2.5, Math.max(Time.Minute * 40, chance * (Time.Minute * 2.9)));
		if (isEmergedZuk) res = increaseNumByPercent(res, 15);
		return res;
	}

	async baseDeathChances(user: KlasaUser, range = [0, 250]) {
		let preZuk = [];
		let zuk = [];
		let basePreZuk = [];
		let baseZuk = [];
		let duration = [];
		for (let i = range[0]; i < range[1]; i++) {
			const res = await this.infernoRun({
				user,
				attempts: i,
				timesMadeToZuk: 0,
				emergedAttempts: 0,
				isEmergedZuk: false
			});
			if (typeof res === 'string') return res;
			preZuk.push(res.preZukDeathChance.value);
			zuk.push(res.zukDeathChance.value);
			basePreZuk.push(this.basePreZukDeathChance(i));
			baseZuk.push(this.baseZukDeathChance(i));
			duration.push(res.duration.value);
		}
		duration = duration.map(i => i / Time.Minute);
		const options = {
			type: 'line',
			data: {
				labels: [...Array(zuk.length).keys()].map(i => `${i + 1}`),
				datasets: [
					{
						label: 'Base Pre-Zuk Death Chance',
						backgroundColor: 'rgb(255, 0, 0)',
						borderColor: 'rgb(255, 0, 0)',
						data: basePreZuk,
						fill: false,
						yAxisID: 'left'
					},
					{
						label: 'Base Zuk Death Chance',
						fill: false,
						backgroundColor: 'rgb(0, 255, 0)',
						borderColor: 'rgb(0, 255, 0)',
						data: baseZuk,
						yAxisID: 'left'
					},
					{
						label: 'Pre-Zuk Death Chance',
						backgroundColor: 'rgb(255, 99, 132)',
						borderColor: 'rgb(255, 99, 132)',
						data: preZuk,
						fill: false,
						yAxisID: 'left'
					},
					{
						label: 'Zuk Death Chance',
						fill: false,
						backgroundColor: 'rgb(54, 162, 235)',
						borderColor: 'rgb(54, 162, 235)',
						data: zuk,
						yAxisID: 'left'
					},
					{
						label: 'Duration (Hours)',
						fill: false,
						backgroundColor: 'rgb(0, 0, 0)',
						borderColor: 'rgb(0, 0, 0)',
						data: duration,
						yAxisID: 'right'
					}
				]
			},
			options: {
				stacked: false,
				title: {
					display: true,
					text: ''
				},
				scales: {
					yAxes: [
						{
							id: 'right',
							type: 'linear',
							display: true,
							position: 'right'
						},
						{
							id: 'left',
							type: 'linear',
							display: true,
							position: 'left',
							gridLines: {
								drawOnChartArea: false
							}
						}
					]
				}
			}
		};

		const imageBuffer = await fetch(
			`https://quickchart.io/chart?bkg=${encodeURIComponent('#fff')}&c=${encodeURIComponent(
				JSON.stringify(options)
			)}`
		).then(result => result.buffer());

		let arr = [['Attempts'].concat(options.data.datasets.map(i => i.label))];
		for (let i = 1; i < options.data.datasets[0].data.length; i++) {
			arr[i] = [(i - 1).toString()];
			for (const dataset of options.data.datasets) {
				arr[i].push(dataset.data[i - 1].toString());
			}
		}

		const normalTable = table(arr);
		return [imageBuffer, new MessageAttachment(Buffer.from(normalTable), 'Fletchables.txt')];
	}

	async simulate(msg: KlasaMessage) {
		let finishes = [];
		let cost = new Bank();
		let n = 1000;
		for (let i = 0; i < n; i++) {
			let timesMadeToZuk = 0;
			for (let o = 0; o < 10_000; o++) {
				const res = await this.infernoRun({
					user: msg.author,
					attempts: 100 + o,
					timesMadeToZuk: 20 + timesMadeToZuk,
					emergedAttempts: o,
					isEmergedZuk: true
				});
				if (typeof res === 'string') return res;
				cost.add(res.cost);
				if (!res.diedPreZuk) timesMadeToZuk++;
				if (!res.deathTime) {
					finishes.push(o);
					break;
				} else {
					const percentMadeItThrough = calcWhatPercent(res.deathTime, res.fakeDuration);
					cost.remove(calculateInfernoItemRefund(percentMadeItThrough, res.cost).unusedItems);
				}
			}
		}
		for (const [key, val] of Object.entries(cost.bank)) {
			cost.bank[key] = Math.floor(val / n);
		}
		return {
			str: `In ${n} Inferno simulations...
**Average Completion:** ${sumArr(finishes) / n} attempts
**Fastest Completion:** ${Math.min(...finishes)} attempts
**Longest Completion:** ${Math.max(...finishes)} attempts
`,
			bank: cost
		};
	}

	async timesMadeToZuk(userID: string) {
		const timesMadeToZuk = Number(
			(
				await this.client.query<any>(`SELECT COUNT(*)
FROM activity
WHERE type = 'Inferno'
AND user_id = ${userID}
AND completed = true
AND (data->>'diedPreZuk')::boolean = false;`)
			)[0].count
		);
		return timesMadeToZuk;
	}

	async infernoRun({
		user,
		attempts,
		timesMadeToZuk,
		emergedAttempts,
		isEmergedZuk
	}: {
		user: KlasaUser;
		attempts: number;
		timesMadeToZuk: number;
		emergedAttempts: number;
		isEmergedZuk: boolean;
	}) {
		const userBank = user.bank();
		const zukKC = await user.getMinigameScore('inferno');

		const duration = new PercentCounter(this.baseDuration(attempts, isEmergedZuk), 'time');
		const zukDeathChance = new PercentCounter(this.baseZukDeathChance(attempts), 'percent');
		const preZukDeathChance = new PercentCounter(this.basePreZukDeathChance(attempts), 'percent');
		const emergedZukDeathChance = new PercentCounter(this.baseEmergedZukDeathChance(emergedAttempts), 'percent');

		if (!user.settings.get(UserSettings.SacrificedBank)[itemID('Fire cape')]) {
			return 'To do the Inferno, you must have sacrificed a fire cape.';
		}
		if (isEmergedZuk && !user.settings.get(UserSettings.SacrificedBank)[itemID('Infernal cape')]) {
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
		const gearToCheck: [Gear, string][] = [
			[rangeGear, 'range'],
			[mageGear, 'mage']
		];
		const meleeGear = user.getGear('melee');
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
		preZukDeathChance.add(
			!hasDivine &&
				(rangeGear.hasEquipped('Elysian spirit shield') || mageGear.hasEquipped('Elysian spirit shield')),
			-5,
			'Ely'
		);

		duration.add(mageGear.hasEquipped('Virtus book', true, true), -7, 'Virtus book');

		if (isEmergedZuk) {
			duration.add(user.hasItemEquippedOrInBank('Dwarven warhammer'), -7, 'DWWH');
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

		const blowpipeData = user.settings.get(UserSettings.Blowpipe);
		if (
			!userBank.has('Toxic blowpipe') ||
			!blowpipeData.scales ||
			!blowpipeData.dartID ||
			!blowpipeData.dartQuantity
		) {
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

			const emergedKC = await user.getMinigameScore('emerged_inferno');
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
		const projectileType = determineProjectileTypeFromGear(rangeGear);
		if (!projectileType) {
			return "You aren't wearing an appropriate ranged weapon.";
		}
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
		const diedEmergedZuk = isEmergedZuk && percentChance(emergedZukDeathChance.value);
		let deathTime: number | null = null;
		if (diedPreZuk) {
			deathTime = randInt(Time.Minute, calcPercentOfNum(90, duration.value));
		} else if (diedZuk) {
			deathTime = randInt(calcPercentOfNum(90, duration.value), duration.value);
		} else if (diedEmergedZuk) {
			deathTime = randInt(calcPercentOfNum(95, duration.value), duration.value);
		}

		const realDuration = deathTime ?? duration.value;

		const cost = this.consumableCost({
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

	async run(msg: KlasaMessage) {
		const attempts = msg.author.settings.get(UserSettings.Stats.InfernoAttempts);
		const emergedAttempts = msg.author.settings.get(UserSettings.EmergedInfernoAttempts);
		const zukKC = await msg.author.getMinigameScore('inferno');
		const emergedKC = await msg.author.getMinigameScore('emerged_inferno');

		let str = 'You have never attempted the Inferno, I recommend you stay that way.';
		if (attempts && !zukKC) {
			str = `You have tried the Inferno ${attempts} times, but never succeeded. Leave while you can.`;
		} else if (attempts && zukKC) {
			str = `You have completed the Inferno ${zukKC} times, out of ${attempts} attempts.`;
		}

		const timesMadeToZuk = await this.timesMadeToZuk(msg.author.id);
		if (!zukKC) {
			if (attempts && !timesMadeToZuk) {
				str += ' You have never even made it to the final wave yet.';
			} else if (roll(1000)) {
				str += ` You made it to TzKal-Zuk ${timesMadeToZuk} times, but never killed him, maybe just buy the cape JalYt?`;
			} else {
				str += ` You made it to TzKal-Zuk ${timesMadeToZuk} times, but never killed him, sad. `;
			}
		}

		str += ` ${emergedAttempts} Emerged Zuk Inferno attempts.`;

		return msg.channel.send({
			content: `**Inferno Attempts:** ${attempts}
**Inferno KC:** ${zukKC}
**Emerged Inferno Attempts:** ${emergedAttempts}
**Emerged Inferno KC:** ${emergedKC}`,
			files: [
				await chatHeadImage({
					content: str,
					head: 'ketKeh'
				})
			]
		});
	}

	@minionNotBusy
	@requiresMinion
	async start(msg: KlasaMessage, [str]: [string | undefined]) {
		if (msg.flagArgs.sim && !production) {
			// msg.channel.send({
			// 	files: [...(await this.baseDeathChances(msg.author))]
			// });
			// msg.channel.send({ files: [...(await this.baseDeathChances(msg.author, [250, 500]))] });
			const res = await this.simulate(msg);
			if (typeof res === 'string') return msg.channel.send(res);
			const { str, bank } = res;
			return msg.channel.sendBankImage({ content: str, bank });
		}

		const attempts = msg.author.settings.get(UserSettings.Stats.InfernoAttempts);
		const rangeGear = msg.author.getGear('range');
		const usersRangeStats = rangeGear.stats;
		const zukKC = await msg.author.getMinigameScore('inferno');

		const isEmergedZuk =
			str === 'emerged' || Boolean(msg.flagArgs.emerged) || Boolean(msg.flagArgs.em) || msg.commandText === 'ie';

		const res = await this.infernoRun({
			user: msg.author,
			attempts,
			timesMadeToZuk: await this.timesMadeToZuk(msg.author.id),
			emergedAttempts: msg.author.settings.get(UserSettings.EmergedInfernoAttempts),
			isEmergedZuk
		});

		if (typeof res === 'string') {
			return msg.channel.send({
				files: [
					await chatHeadImage({
						content: res,
						head: 'ketKeh'
					})
				]
			});
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

		let realCost = new Bank();
		try {
			realCost = (await msg.author.specialRemoveItems(cost)).realCost;
		} catch (err: any) {
			return msg.channel.send({
				files: [
					await chatHeadImage({
						content: `${err.message}`,
						head: 'ketKeh'
					})
				]
			});
		}

		await addSubTaskToActivityTask<InfernoOptions>({
			userID: msg.author.id,
			channelID: msg.channel.id,
			duration: realDuration,
			type: 'Inferno',
			zukDeathChance: zukDeathChance.value,
			preZukDeathChance: preZukDeathChance.value,
			deathTime,
			fakeDuration,
			diedPreZuk,
			diedZuk,
			cost: realCost.bank,
			isEmergedZuk,
			emergedZukDeathChance: emergedZukDeathChance.value,
			diedEmergedZuk
		});

		updateBankSetting(this.client, ClientSettings.EconomyStats.InfernoCost, realCost);
		let emergedZukDeathMsg = isEmergedZuk
			? `**Emerged Zuk Death Chance:** ${emergedZukDeathChance.value.toFixed(
					1
			  )}% ${emergedZukDeathChance.messages.join(', ')} ${
					emergedZukDeathChance.missed.length === 0
						? ''
						: `*(You didn't get these: ||${emergedZukDeathChance.missed.join(', ')}||)*`
			  }`
			: '';
		return msg.channel.send({
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
				await chatHeadImage({
					content: "You're on your own now JalYt, you face certain death... prepare to fight for your life.",
					head: 'ketKeh'
				})
			]
		});
	}
}
