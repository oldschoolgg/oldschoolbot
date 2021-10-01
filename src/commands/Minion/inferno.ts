import { MessageAttachment } from 'discord.js';
import { calcPercentOfNum, randInt, sumArr, Time } from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import fetch from 'node-fetch';
import { Bank } from 'oldschooljs';
import { TzKalZuk } from 'oldschooljs/dist/simulation/monsters/special/TzKalZuk';
import { table } from 'table';

import { Activity, BitField, projectiles, ProjectileType } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { PercentCounter } from '../../lib/structures/PercentCounter';
import { Skills } from '../../lib/types';
import { InfernoOptions } from '../../lib/types/minions';
import { formatDuration, itemNameFromID, percentChance, randomVariation, updateBankSetting } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import chatHeadImage from '../../lib/util/chatHeadImage';
import getOSItem from '../../lib/util/getOSItem';
import itemID from '../../lib/util/itemID';
import { blowpipeDarts } from './blowpipe';

const minimumRangeItems = [
	'Amulet of fury',
	"Ancient d'hide body",
	'Ancient chaps',
	'Dragon crossbow',
	'Barrows gloves',
	"Ava's assembler",
	'Snakeskin boots'
].map(getOSItem);

export const minimumRangeAttackStat = sumArr(minimumRangeItems.map(i => i.equipment!.attack_ranged));

const minimumMageItems = [
	'Amulet of fury',
	'Saradomin cape',
	"Ahrim's robetop",
	"Ahrim's robeskirt",
	'Barrows gloves',
	'Splitbark boots',
	'Ancient staff'
].map(getOSItem);

export const minimumMageAttackStat = sumArr(minimumMageItems.map(i => i.equipment!.attack_magic));

const itemRequirements = new Bank().add('Rune pouch');

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			altProtection: true,
			requiredPermissions: ['ATTACH_FILES'],
			description:
				'Sends your minion to complete the fight caves - it will start off bad but get better with more attempts. Requires range gear, prayer pots, brews and restores.',
			examples: ['+inferno'],
			categoryFlags: ['minion', 'minigame'],
			aliases: ['i'],
			subcommands: true,
			usage: '[start]'
		});
	}

	consumableCost({
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

	basePreZukDeathChance(_attempts: number) {
		const attempts = Math.max(1, _attempts);
		const chance = Math.floor(100 - (Math.log(attempts) / Math.log(Math.sqrt(45))) * 47);
		return Math.max(Math.min(chance, 99), 5);
	}

	baseZukDeathChance(_attempts: number) {
		const attempts = Math.max(1, _attempts);
		if (attempts < 20) return 99.9999 - attempts / 7.5;
		const chance = Math.floor(150 - (Math.log(attempts) / Math.log(Math.sqrt(25))) * 39);
		return Math.max(Math.min(chance, 99), 15);
	}

	baseDuration(_attempts: number) {
		const attempts = Math.max(1, _attempts);
		const chance = Math.floor(150 - (Math.log(attempts) / Math.log(Math.sqrt(25))) * 39);
		return Math.max(Time.Minute * 40, Math.max(Math.min(chance, 99), 15) * Time.Minute);
	}

	async baseDeathChances(user: KlasaUser) {
		let preZuk = [];
		let zuk = [];
		let basePreZuk = [];
		let baseZuk = [];
		let duration = [];
		for (let i = 0; i < 250; i++) {
			const res = this.infernoRun({ user, kc: 0, attempts: i });
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

	simulate(msg: KlasaMessage) {
		let kc = 0;
		for (let i = 0; i < 10_000; i++) {
			const res = this.infernoRun({ user: msg.author, kc, attempts: i });
			if (typeof res === 'string') return res;
			if (!res.deathTime) {
				return `You finished the inferno after ${i} attempts. ${res.duration.messages.join(', ')}`;
			}
		}
		return "After 10,000 attempts, you still didn't finish.";
	}

	infernoRun({ user, attempts }: { user: KlasaUser; kc: number; attempts: number }) {
		const userBank = user.bank();

		const duration = new PercentCounter(this.baseDuration(attempts), 'time');
		const zukDeathChance = new PercentCounter(this.baseZukDeathChance(attempts), 'percent');
		const preZukDeathChance = new PercentCounter(this.basePreZukDeathChance(attempts), 'percent');

		if (!user.settings.get(UserSettings.SacrificedBank)[itemID('Fire cape')]) {
			return 'To do the Inferno, you must have sacrificed a fire cape.';
		}

		const skillReqs: Skills = {
			defence: 92,
			magic: 92,
			hitpoints: 92,
			ranged: 92
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

		preZukDeathChance.add(
			rangeGear.hasEquipped('Elysian spirit shield') || mageGear.hasEquipped('Elysian spirit shield'),
			-5,
			'Ely'
		);

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
		duration.add(true, percent, `${dartItem.name} in blowpipe`);

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
			if (!weapon || !Object.keys(weapons).map(itemID).includes(weapon.id)) {
				return `You need one of these weapons in your ${name} setup: ${Object.keys(weapons).join(', ')}.`;
			}
		}

		zukDeathChance.add(rangeGear.equippedWeapon() === getOSItem('Armadyl crossbow'), 7.5, 'Zuk with ACB');
		duration.add(rangeGear.equippedWeapon() === getOSItem('Armadyl crossbow'), -4.5, 'ACB');

		zukDeathChance.add(rangeGear.equippedWeapon() === getOSItem('Twisted bow'), -1.5, 'Zuk with TBow');
		duration.add(rangeGear.equippedWeapon() === getOSItem('Twisted bow'), 6.5, 'TBow');

		/**
		 *
		 *
		 * Other
		 *
		 *
		 */
		duration.add(user.bitfield.includes(BitField.HasDexScroll), 4, 'Dex. Prayer scroll');
		duration.add(user.bitfield.includes(BitField.HasArcaneScroll), 4, 'Arc. Prayer scroll');

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

		const diedPreZuk = percentChance(preZukDeathChance.value);
		const diedZuk = percentChance(zukDeathChance.value);
		let deathTime: number | null = null;
		if (diedPreZuk) {
			deathTime = randInt(Time.Minute, calcPercentOfNum(90, duration.value));
		} else if (diedZuk) {
			deathTime = randInt(calcPercentOfNum(90, duration.value), duration.value);
		}

		const realDuration = deathTime ?? duration.value;

		const cost = this.consumableCost({
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

	async run(msg: KlasaMessage) {
		const attempts = msg.author.settings.get(UserSettings.Stats.InfernoAttempts);
		const zukKC = msg.author.getKC(TzKalZuk.id);

		let str = 'You have never attempted the Inferno, I recommend you stay that way.';
		if (attempts && !zukKC) {
			str = `You have tried the Inferno ${attempts} times, but never succeeded. Leave while you can.`;
		} else if (attempts && zukKC) {
			str = `You have completed the Inferno ${zukKC} times, out of ${attempts} attempts.`;
		}

		return msg.channel.send({
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
	async start(msg: KlasaMessage) {
		if (msg.flagArgs.sim) {
			msg.channel.send({ files: [...(await this.baseDeathChances(msg.author))] });
			return msg.channel.send(this.simulate(msg));
		}

		const attempts = msg.author.settings.get(UserSettings.Stats.InfernoAttempts);
		const usersRangeStats = msg.author.getGear('range').stats;
		const zukKC = msg.author.getKC(TzKalZuk.id);

		const res = this.infernoRun({ user: msg.author, kc: zukKC, attempts });

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
			realDuration
		} = res;

		try {
			await msg.author.specialRemoveItems(cost);
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
			type: Activity.Inferno,
			zukDeathChance: zukDeathChance.value,
			preZukDeathChance: preZukDeathChance.value,
			deathTime,
			fakeDuration,
			diedPreZuk,
			diedZuk,
			cost: cost.bank
		});

		updateBankSetting(this.client, ClientSettings.EconomyStats.InfernoCost, cost);

		return msg.channel.send({
			content: `
**KC:** ${zukKC}
**Attempts:** ${attempts}

**Duration:** ${formatDuration(duration.value)} (${(duration.value / 1000 / 60).toFixed(2)} minutes)
**Boosts:** ${duration.messages.join(', ')} *(You didn't get these: ||${duration.missed.join(', ')}||)*
**Range Attack Bonus:** ${usersRangeStats.attack_ranged}
**Pre-Zuk Death Chance:** ${preZukDeathChance.value.toFixed(1)}% ${preZukDeathChance.messages.join(
				', '
			)} *(You didn't get these: ||${preZukDeathChance.missed.join(', ')}||)*
**Zuk Death Chance:** ${zukDeathChance.value.toFixed(1)}% ${zukDeathChance.messages.join(
				', '
			)} *(You didn't get these: ||${zukDeathChance.missed.join(', ')}||)*

**Removed from your bank:** ${cost}`,
			files: [
				await chatHeadImage({
					content: "You're on your own now JalYt, you face certain death... prepare to fight for your life.",
					head: 'ketKeh'
				})
			]
		});
	}
}

// if (isOnTask && msg.author.hasItemEquippedOrInBank('Black mask (i)')) {
// 		duration *= 0.85;
// 		debugStr += ', 15% on Task with Black mask (i)';
// 	}

// const usersTask = await getUsersCurrentSlayerInfo(msg.author.id);
// const isOnTask =
// 	usersTask.currentTask !== null &&
// 	usersTask.currentTask!.monsterID === Monsters.TzKalZuk.id &&
// 	usersTask.currentTask!.quantityRemaining === usersTask.currentTask!.quantity;
// determineDuration(user: KlasaUser): [number, string] {
// 	let baseTime = Time.Hour * 2;
// 	const gear = user.getGear('range');
// 	let debugStr = '';
