import { MessageAttachment } from 'discord.js';
import { calcWhatPercent, deepClone, percentChance, randInt, reduceNumByPercent, Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank, Monsters } from 'oldschooljs';

import { Emoji } from '../../lib/constants';
import { maxOffenceStats } from '../../lib/gear';
import { generateGearImage } from '../../lib/gear/functions/generateGearImage';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { KillableMonster } from '../../lib/minions/types';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { Gear } from '../../lib/structures/Gear';
import { RevenantOptions } from '../../lib/types/minions';
import { formatDuration, stringMatches, updateBankSetting } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import calculateGearLostOnDeathWilderness from '../../lib/util/calculateGearLostOnDeathWilderness';
import combatAmmoUsage from '../../lib/util/combatAmmoUsage';
import getOSItem from '../../lib/util/getOSItem';

export const revenantMonsters: KillableMonster[] = [
	{
		id: Monsters.RevenantCyclops.id,
		name: Monsters.RevenantCyclops.name,
		aliases: Monsters.RevenantCyclops.aliases,
		timeToFinish: Time.Second * 50,
		table: Monsters.RevenantCyclops,
		wildy: true,
		difficultyRating: 9,
		qpRequired: 0
	},
	{
		id: Monsters.RevenantDarkBeast.id,
		name: Monsters.RevenantDarkBeast.name,
		aliases: Monsters.RevenantDarkBeast.aliases,
		timeToFinish: Time.Second * 70,
		table: Monsters.RevenantDarkBeast,
		wildy: true,
		difficultyRating: 9,
		qpRequired: 0
	},
	{
		id: Monsters.RevenantDemon.id,
		name: Monsters.RevenantDemon.name,
		aliases: Monsters.RevenantDemon.aliases,
		timeToFinish: Time.Second * 50,
		table: Monsters.RevenantDemon,
		wildy: true,
		difficultyRating: 9,
		qpRequired: 0
	},
	{
		id: Monsters.RevenantDragon.id,
		name: Monsters.RevenantDragon.name,
		aliases: Monsters.RevenantDragon.aliases,
		timeToFinish: Time.Second * 90,
		table: Monsters.RevenantDragon,
		wildy: true,
		difficultyRating: 9,
		qpRequired: 0
	},
	{
		id: Monsters.RevenantGoblin.id,
		name: Monsters.RevenantGoblin.name,
		aliases: Monsters.RevenantGoblin.aliases,
		timeToFinish: Time.Second * 25,
		table: Monsters.RevenantGoblin,
		wildy: true,
		difficultyRating: 9,
		qpRequired: 0
	},
	{
		id: Monsters.RevenantHellhound.id,
		name: Monsters.RevenantHellhound.name,
		aliases: Monsters.RevenantHellhound.aliases,
		timeToFinish: Time.Second * 55,
		table: Monsters.RevenantHellhound,
		wildy: true,
		difficultyRating: 9,
		qpRequired: 0
	},
	{
		id: Monsters.RevenantHobgoblin.id,
		name: Monsters.RevenantHobgoblin.name,
		aliases: Monsters.RevenantHobgoblin.aliases,
		timeToFinish: Time.Second * 45,
		table: Monsters.RevenantHobgoblin,
		wildy: true,
		difficultyRating: 9,
		qpRequired: 0
	},
	{
		id: Monsters.RevenantImp.id,
		name: Monsters.RevenantImp.name,
		aliases: Monsters.RevenantImp.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.RevenantImp,
		wildy: true,
		difficultyRating: 9,
		qpRequired: 0
	},
	{
		id: Monsters.RevenantKnight.id,
		name: Monsters.RevenantKnight.name,
		aliases: Monsters.RevenantKnight.aliases,
		timeToFinish: Time.Second * 75,
		table: Monsters.RevenantKnight,
		wildy: true,
		difficultyRating: 9,
		qpRequired: 0
	},
	{
		id: Monsters.RevenantOrk.id,
		name: Monsters.RevenantOrk.name,
		aliases: Monsters.RevenantOrk.aliases,
		timeToFinish: Time.Second * 65,
		table: Monsters.RevenantOrk,
		wildy: true,
		difficultyRating: 9,
		qpRequired: 0
	},
	{
		id: Monsters.RevenantPyrefiend.id,
		name: Monsters.RevenantPyrefiend.name,
		aliases: Monsters.RevenantPyrefiend.aliases,
		timeToFinish: Time.Second * 40,
		table: Monsters.RevenantPyrefiend,
		wildy: true,
		difficultyRating: 9,
		qpRequired: 0
	}
];

const specialWeapons = [
	{ gear: 'melee', item: getOSItem("Viggora's chainmace"), boost: 35 },
	{ gear: 'range', item: getOSItem("Craw's bow"), boost: 35 },
	{ gear: 'range', item: getOSItem('Hellfire bow'), boost: 80 },
	{ gear: 'mage', item: getOSItem("Thammaron's sceptre"), boost: 35 }
] as const;

const ancientItems = [
	{
		item: getOSItem('Ancient relic'),
		price: 16_000_000
	},
	{
		item: getOSItem('Ancient effigy'),
		price: 8_000_000
	},
	{
		item: getOSItem('Ancient medallion'),
		price: 4_000_000
	},
	{
		item: getOSItem('Ancient statuette'),
		price: 2_000_000
	},
	{
		item: getOSItem('Ancient totem'),
		price: 1_000_000
	},
	{
		item: getOSItem('Ancient emblem'),
		price: 500_000
	}
];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			usage: '[style:string] [name:...string]',
			usageDelim: ' ',
			description: 'Sends your minion to kill revs. You can add --skull to your message to kill them skulled.'
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [style, name = '']: ['melee' | 'range' | 'mage' | 'sell', string]) {
		if (style === 'sell') {
			let userBank = msg.author.bank();
			let toSellBank = new Bank();
			let value = 0;
			for (const item of ancientItems) {
				const qty = userBank.amount(item.item.id);
				if (qty === 0) continue;
				value += qty * item.price;
				toSellBank.add(item.item.id, qty);
			}
			if (toSellBank.length === 0) {
				return msg.channel.send('You have no ancient items to sell.');
			}

			const loot = new Bank().add('Coins', value);

			await msg.confirm(`Do you want to sell ${toSellBank} for ${loot}?`);
			await msg.author.removeItemsFromBank(toSellBank);
			await msg.author.addItemsToBank({ items: loot });
			return msg.channel.send(`You sold ${toSellBank} for ${loot}.`);
		}

		if (!style || !['melee', 'range', 'mage'].includes(style)) {
			const prefix = msg.cmdPrefix;
			const hasPrayerLevel = msg.author.hasSkillReqs({ [SkillsEnum.Prayer]: 25 })[0];
			let skulled = Boolean(msg.flagArgs.skull);
			let smited = Boolean(msg.flagArgs.smited);
			const userGear = { ...deepClone(msg.author.settings.get(UserSettings.Gear.Wildy)!) };

			const calc = calculateGearLostOnDeathWilderness({
				gear: userGear,
				smited,
				protectItem: hasPrayerLevel,
				after20wilderness: true,
				skulled
			});
			const image = await generateGearImage(this.client, msg.author, new Gear(calc.newGear), 'wildy', null);

			return msg.channel.send({
				content: `To kill Revenants, use \`${prefix}revs melee|range|mage <name>\`. Below, you can see what you will keep in your gear if you die.
Smited: \`${smited}\` - There is a chance you'll get smited while killing Revenants. You can check what you would lose using \`--smited\`.
Skulled: \`${skulled}\` - You can choose to go skulled into the Revenants cave. Doing so, will reward you better drops but will also make you lose more items in case you die. Add \`--skull\` to go in skulled.`,
				files: [new MessageAttachment(image)]
			});
		}

		let boosts = [];
		const monster = revenantMonsters.find(
			m =>
				stringMatches(m.name, name) ||
				m.aliases.some(a => stringMatches(a, name)) ||
				m.name.split(' ').some(a => stringMatches(a, name))
		);
		if (!monster || !name) {
			return msg.channel.send(
				`That's not a valid revenant. The valid revenants are: ${revenantMonsters.map(m => m.name).join(', ')}.`
			);
		}

		const gear = msg.author.getGear('wildy');
		const key = ({ melee: 'attack_crush', mage: 'attack_magic', range: 'attack_ranged' } as const)[style];
		const gearStat = gear.getStats()[key];
		const gearPercent = Math.max(0, calcWhatPercent(gearStat, maxOffenceStats[key]));

		const weapon = gear.equippedWeapon();
		if (!weapon) {
			return msg.channel.send('You have no weapon equipped in your wildy outfit.');
		}

		if (weapon.equipment![key] < 10) {
			return msg.channel.send("Your weapon is terrible, you can't kill revenants.");
		}

		let timePerMonster = monster.timeToFinish;
		timePerMonster = reduceNumByPercent(timePerMonster, gearPercent / 4);
		boosts.push(`${(gearPercent / 4).toFixed(2)}% (out of a possible 25%) for ${key}`);

		for (const sw of specialWeapons) {
			if (sw.gear === style && gear.hasEquipped([sw.item.id])) {
				timePerMonster = reduceNumByPercent(timePerMonster, sw.boost);
				boosts.push(`${sw.boost}% for ${sw.item.name}`);
			}
		}

		let skulled = Boolean(msg.flagArgs.skull);

		const quantity = Math.floor(msg.author.maxTripLength('Revenants') / timePerMonster);
		let duration = quantity * timePerMonster;

		const cost = new Bank();

		let deathChance = 5;
		let defLvl = msg.author.skillLevel(SkillsEnum.Defence);
		let deathChanceFromDefenceLevel = (100 - (defLvl === 99 ? 100 : defLvl)) / 4;
		deathChance += deathChanceFromDefenceLevel;

		const defensiveGearPercent = Math.max(0, calcWhatPercent(gear.getStats().defence_magic, maxOffenceStats[key]));
		let deathChanceFromGear = Math.max(20, 100 - defensiveGearPercent) / 4;
		deathChance += deathChanceFromGear;

		const died = percentChance(deathChance);

		if (gear.hasEquipped(['Hellfire bow'])) {
			if (!skulled) {
				await msg.confirm(
					'Using a **Hellfire bow** will automatically make you skulled! Are you sure you want to continue?'
				);
				skulled = true;
			}
			const {
				bank: combatBankusage,
				boosts: combatBoosts,
				errors
			} = combatAmmoUsage({
				duration,
				user: msg.author,
				gearType: 'wildy'
			});
			if (errors.length > 0) return msg.channel.send(errors.join('\n'));
			if (combatBoosts.length > 0) boosts = [...boosts, ...combatBoosts];
			if (combatBankusage.length > 0) cost.add(combatBankusage);
		}

		if (died) duration = randInt(Math.min(Time.Minute * 3, duration), duration);

		let hasPrayerPots = true;
		if (msg.author.bank().amount('Prayer potion(4)') < 5) {
			hasPrayerPots = false;
			await msg.confirm(
				'Are you sure you want to kill revenants without prayer potions? You should bring at least 5 Prayer potion(4).'
			);
		} else {
			cost.add('Prayer potion(4)', 5);
		}

		updateBankSetting(this.client, ClientSettings.EconomyStats.PVMCost, cost);
		await msg.author.removeItemsFromBank(cost);

		await addSubTaskToActivityTask<RevenantOptions>({
			monsterID: monster.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration: died ? randInt(Math.min(Time.Minute * 3, duration), duration) : duration,
			type: 'Revenants',
			died,
			skulled,
			style,
			usingPrayerPots: hasPrayerPots
		});

		let response = `${msg.author.minionName} is now killing ${quantity}x ${
			monster.name
		}, it'll take around ${formatDuration(duration)} to finish.
${Emoji.OSRSSkull} ${skulled ? 'Skulled' : 'Unskulled'}
**Death Chance:** ${deathChance.toFixed(2)}% (${deathChanceFromGear.toFixed(2)}% from magic def${
			deathChanceFromDefenceLevel > 0 ? `, ${deathChanceFromDefenceLevel.toFixed(2)}% from defence level` : ''
		} + 5% as default chance).${cost.length > 0 ? `\nRemoved from bank: ${cost}` : ''}${
			boosts.length > 0 ? `\nBoosts: ${boosts.join(', ')}` : ''
		}`;

		return msg.channel.send(response);
	}
}
