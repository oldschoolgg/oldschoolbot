import { MessageAttachment } from 'discord.js';
import {
	calcWhatPercent,
	increaseNumByPercent,
	objectKeys,
	reduceNumByPercent,
	round,
	Time
} from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Bank, Monsters } from 'oldschooljs';
import { MonsterAttribute } from 'oldschooljs/dist/meta/monsterData';

import { Activity } from '../../lib/constants';
import {
	boostCannon,
	boostCannonMulti,
	boostIceBarrage,
	boostIceBurst,
	cannonMultiConsumables,
	cannonSingleConsumables,
	CombatCannonItemBank,
	CombatOptionsEnum,
	iceBarrageConsumables,
	iceBurstConsumables,
	SlayerActivityConstants
} from '../../lib/minions/data/combatConstants';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { AttackStyles, resolveAttackStyles } from '../../lib/minions/functions';
import calculateMonsterFood from '../../lib/minions/functions/calculateMonsterFood';
import reducedTimeFromKC from '../../lib/minions/functions/reducedTimeFromKC';
import removeFoodFromUser from '../../lib/minions/functions/removeFoodFromUser';
import { Consumable } from '../../lib/minions/types';
import { calcPOHBoosts } from '../../lib/poh';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { SlayerTaskUnlocksEnum } from '../../lib/slayer/slayerUnlocks';
import { determineBoostChoice, getUsersCurrentSlayerInfo } from '../../lib/slayer/slayerUtil';
import { BotCommand } from '../../lib/structures/BotCommand';
import { MonsterActivityTaskOptions } from '../../lib/types/minions';
import {
	addArrayOfNumbers,
	formatDuration,
	isWeekend,
	itemID,
	itemNameFromID,
	randomVariation,
	removeDuplicatesFromArray,
	updateBankSetting
} from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { findMonster } from '../../lib/util/findMonster';

const validMonsters = killableMonsters.map(mon => mon.name).join(`\n`);
const invalidMonsterMsg = (prefix: string) =>
	`That isn't a valid monster.\n\nFor example, \`${prefix}minion kill 5 zulrah\`` +
	`\n\nTry: \`${prefix}k --monsters\` for a list of killable monsters.`;

const { floor } = Math;

function applySkillBoost(
	user: KlasaUser,
	duration: number,
	styles: AttackStyles[]
): [number, string] {
	const skillTotal = addArrayOfNumbers(styles.map(s => user.skillLevel(s)));

	let newDuration = duration;
	let str = '';
	let percent = round(calcWhatPercent(skillTotal, styles.length * 99), 2);

	if (percent < 50) {
		percent = 50 - percent;
		newDuration = increaseNumByPercent(newDuration, percent);
		str = `-${percent.toFixed(2)}% for low stats`;
	} else {
		percent = Math.min(15, percent / 6.5);
		newDuration = reduceNumByPercent(newDuration, percent);
		str = `${percent.toFixed(2)}% for stats`;
	}

	return [newDuration, str];
}

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[quantity:int{1}|name:...string] [name:...string] [cannon|burst|barrage|none]',
			usageDelim: ' ',
			description: 'Sends your minion to kill monsters.'
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(
		msg: KlasaMessage,
		[quantity, name = '', method = '']: [null | number | string, string, string]
	) {
		const { minionName } = msg.author;

		const boosts = [];
		let messages: string[] = [];

		if (typeof quantity === 'string') {
			name = quantity;
			quantity = null;
		}

		if (msg.flagArgs.monsters) {
			return msg.channel.send(
				new MessageAttachment(Buffer.from(validMonsters), 'validMonsters.txt')
			);
		}
		if (!name) return msg.channel.send(invalidMonsterMsg(msg.cmdPrefix));
		const monster = findMonster(name);
		if (!monster) return msg.channel.send(invalidMonsterMsg(msg.cmdPrefix));

		const usersTask = await getUsersCurrentSlayerInfo(msg.author.id);
		const isOnTask =
			usersTask.assignedTask !== null &&
			usersTask.currentTask !== null &&
			usersTask.assignedTask.monsters.includes(monster.id);

		if (monster.slayerOnly && !isOnTask) {
			return msg.channel.send(
				`You can't kill ${monster.name}, because you're not on a slayer task.`
			);
		}

		if (monster.id === 696969) {
			throw `You would be foolish to try to face King Goldemar in a solo fight.`;
		}

		if (msg.author.usingPet('Ishi') && monster.name !== 'Ogress Warrior') {
			this.run(msg, [null, 'Ogress Warrior', '']);
			return msg.channel.send(`Let's kill some ogress warriors instead? 🥰 🐳`);
		}

		// Check requirements
		const [hasReqs, reason] = msg.author.hasMonsterRequirements(monster);
		if (!hasReqs) throw reason;

		let [timeToFinish, percentReduced] = reducedTimeFromKC(
			monster,
			msg.author.getKC(monster.id)
		);

		const [, osjsMon, attackStyles] = resolveAttackStyles(msg.author, monster.id);
		const [newTime, skillBoostMsg] = applySkillBoost(msg.author, timeToFinish, attackStyles);

		timeToFinish = newTime;
		boosts.push(skillBoostMsg);

		timeToFinish /= 2;
		boosts.push(`2x BSO Boost`);

		if (percentReduced >= 1) boosts.push(`${percentReduced}% for KC`);

		if (monster.pohBoosts) {
			const [boostPercent, messages] = calcPOHBoosts(
				await msg.author.getPOH(),
				monster.pohBoosts
			);
			if (boostPercent > 0) {
				timeToFinish = reduceNumByPercent(timeToFinish, boostPercent);
				boosts.push(messages.join(' + '));
			}
		}

		for (const [itemID, boostAmount] of Object.entries(
			msg.author.resolveAvailableItemBoosts(monster)
		)) {
			timeToFinish *= (100 - boostAmount) / 100;
			boosts.push(`${boostAmount}% for ${itemNameFromID(parseInt(itemID))}`);
		}
		if (msg.author.hasItemEquippedAnywhere(itemID('Dwarven warhammer'))) {
			timeToFinish *= 0.6;
			boosts.push(`40% boost for Dwarven warhammer`);
		}
		// Removed vorkath because he has a special boost.
		if (
			monster.name.toLowerCase() !== 'vorkath' &&
			osjsMon?.data?.attributes?.includes(MonsterAttribute.Dragon)
		) {
			if (
				msg.author.hasItemEquippedOrInBank('Dragon hunter lance') &&
				!attackStyles.includes(SkillsEnum.Ranged) &&
				!attackStyles.includes(SkillsEnum.Magic)
			) {
				timeToFinish = reduceNumByPercent(timeToFinish, 15);
				boosts.push('15% for Dragon hunter lance');
			} else if (
				msg.author.hasItemEquippedOrInBank('Dragon hunter crossbow') &&
				attackStyles.includes(SkillsEnum.Ranged)
			) {
				timeToFinish = reduceNumByPercent(timeToFinish, 15);
				boosts.push('15% for Dragon hunter crossbow');
			}
		}
		// Add 15% slayer boost on task if they have black mask or similar
		if (attackStyles.includes(SkillsEnum.Ranged) || attackStyles.includes(SkillsEnum.Magic)) {
			if (isOnTask && msg.author.hasItemEquippedOrInBank(itemID('Black mask (i)'))) {
				timeToFinish = reduceNumByPercent(timeToFinish, 15);
				boosts.push('15% for Black mask (i) on non-melee task');
			}
		} else if (isOnTask && msg.author.hasItemEquippedOrInBank(itemID('Black mask'))) {
			timeToFinish = reduceNumByPercent(timeToFinish, 15);
			boosts.push('15% for Black mask on melee task');
		}

		// Initialize consumable costs before any are calculated.
		const consumableCosts: Consumable[] = [];

		// Set chosen boost based on priority:
		const myCBOpts = msg.author.settings.get(UserSettings.CombatOptions);
		const boostChoice = determineBoostChoice(
			myCBOpts as CombatOptionsEnum[],
			attackStyles,
			msg,
			monster,
			method ?? 'none'
		);

		// Calculate Cannon and Barrage boosts + costs:
		let usingCannon = false;
		let cannonMulti = false;
		let burstOrBarrage = 0;
		const hasCannon = msg.author.owns(CombatCannonItemBank);
		if ((msg.flagArgs.burst || msg.flagArgs.barrage) && !monster!.canBarrage) {
			return msg.send(`${monster!.name} cannot be barraged or bursted.`);
		}
		if (
			(msg.flagArgs.burst || msg.flagArgs.barrage) &&
			!attackStyles.includes(SkillsEnum.Magic)
		) {
			return msg.send(`You can only barrage/burst when you're using magic!`);
		}
		if (msg.flagArgs.cannon && !hasCannon) {
			return msg.send(`You don't own a Dwarf multicannon, so how could you use one?`);
		}
		if (msg.flagArgs.cannon && !monster!.canCannon) {
			return msg.send(`${monster!.name} cannot be killed with a cannon.`);
		}

		if (
			boostChoice === 'barrage' &&
			attackStyles.includes(SkillsEnum.Magic) &&
			monster!.canBarrage
		) {
			consumableCosts.push(iceBarrageConsumables);
			timeToFinish = reduceNumByPercent(timeToFinish, boostIceBarrage);
			boosts.push(`${boostIceBarrage}% for Ice Barrage`);
			burstOrBarrage = SlayerActivityConstants.IceBarrage;
		} else if (
			boostChoice === 'burst' &&
			attackStyles.includes(SkillsEnum.Magic) &&
			monster!.canBarrage
		) {
			consumableCosts.push(iceBurstConsumables);
			timeToFinish = reduceNumByPercent(timeToFinish, boostIceBurst);
			boosts.push(`${boostIceBurst}% for Ice Burst`);
			burstOrBarrage = SlayerActivityConstants.IceBurst;
		} else if (boostChoice === 'cannon' && hasCannon && monster!.cannonMulti) {
			usingCannon = true;
			cannonMulti = true;
			consumableCosts.push(cannonMultiConsumables);
			timeToFinish = reduceNumByPercent(timeToFinish, boostCannonMulti);
			boosts.push(`${boostCannonMulti}% for Cannon in multi`);
		} else if (boostChoice === 'cannon' && hasCannon && monster!.canCannon) {
			usingCannon = true;
			consumableCosts.push(cannonSingleConsumables);
			timeToFinish = reduceNumByPercent(timeToFinish, boostCannon);
			boosts.push(`${boostCannon}% for Cannon in singles`);
		}

		const maxTripLength = msg.author.maxTripLength(Activity.MonsterKilling);

		const hasBlessing = msg.author.hasItemEquippedAnywhere('Dwarven blessing');
		const hasZealotsAmulet = msg.author.hasItemEquippedAnywhere('Amulet of zealots');
		if (hasZealotsAmulet && hasBlessing) {
			timeToFinish *= 0.75;
			boosts.push(`25% for Dwarven blessing & Amulet of zealots`);
		} else if (hasBlessing) {
			timeToFinish *= 0.8;
			boosts.push(`20% for Dwarven blessing`);
		}
		if (monster.wildy && hasZealotsAmulet) {
			timeToFinish *= 0.95;
			boosts.push(`5% for Amulet of zealots`);
		}

		// If no quantity provided, set it to the max.
		if (quantity === null) {
			quantity = floor(maxTripLength / timeToFinish);
		}
		if (typeof quantity !== 'number') quantity = parseInt(quantity);
		if (isOnTask) {
			let effectiveQtyRemaining = usersTask.currentTask!.quantityRemaining;
			if (
				monster.id === Monsters.KrilTsutsaroth.id &&
				usersTask.currentTask!.monsterID !== Monsters.KrilTsutsaroth.id
			) {
				effectiveQtyRemaining = Math.ceil(effectiveQtyRemaining / 2);
			} else if (
				monster.id === Monsters.Kreearra.id &&
				usersTask.currentTask!.monsterID !== Monsters.Kreearra.id
			) {
				effectiveQtyRemaining = Math.ceil(effectiveQtyRemaining / 4);
			} else if (
				monster.id === Monsters.GrotesqueGuardians.id &&
				msg.author.settings
					.get(UserSettings.Slayer.SlayerUnlocks)
					.includes(SlayerTaskUnlocksEnum.DoubleTrouble)
			) {
				effectiveQtyRemaining = Math.ceil(effectiveQtyRemaining / 2);
			}
			quantity = Math.min(quantity, effectiveQtyRemaining);
		}

		let duration = timeToFinish * quantity;
		// If you have dwarven blessing, you need 1 prayer pot per 5 mins
		const prayerPots = msg.author.bank().amount('Prayer potion(4)');
		const fiveMinIncrements = Math.ceil(duration / (Time.Minute * 5));

		let prayerPotsNeeded = Math.max(1, fiveMinIncrements);
		const hasPrayerMasterCape = msg.author.hasItemEquippedAnywhere('Prayer master cape');
		if (hasPrayerMasterCape && hasBlessing) {
			boosts.push(`40% less prayer pots`);
			prayerPotsNeeded = Math.floor(0.6 * prayerPotsNeeded);
		}
		prayerPotsNeeded = Math.max(1, prayerPotsNeeded);
		if (hasBlessing) {
			if (prayerPots < prayerPotsNeeded) {
				return msg.send(
					`You don't have enough Prayer potion(4)'s to power your Dwarven blessing.`
				);
			}
		}

		quantity = Math.max(1, quantity);
		if (quantity > 1 && duration > maxTripLength) {
			return msg.send(
				`${minionName} can't go on PvM trips longer than ${formatDuration(
					maxTripLength
				)}, try a lower quantity. The highest amount you can do for ${
					monster.name
				} is ${floor(maxTripLength / timeToFinish)}.`
			);
		}

		if (['hydra', 'alchemical hydra'].includes(monster.name.toLowerCase())) {
			// Add a cost of 1 antidote++(4) per 15 minutes
			const hydraCost: Consumable = {
				itemCost: new Bank().add('Antidote++(4)', 1),
				qtyPerMinute: 0.067
			};
			consumableCosts.push(hydraCost);
		}

		// Check consumables: (hope this forEach is ok :) )
		const lootToRemove = new Bank();
		let pvmCost = false;
		consumableCosts.forEach(cc => {
			let itemMultiple = cc!.qtyPerKill ?? cc!.qtyPerMinute ?? null;

			if (itemMultiple && typeof itemMultiple === 'number') {
				// Free casts for kodai + sotd
				if (msg.author.hasItemEquippedAnywhere('Kodai wand')) {
					itemMultiple = Math.ceil(0.85 * itemMultiple);
				} else if (msg.author.hasItemEquippedAnywhere('Staff of the dead')) {
					itemMultiple = Math.ceil((6 / 7) * itemMultiple);
				}
				const itemCost = cc!.qtyPerKill
					? cc!.itemCost.clone().multiply(itemMultiple)
					: cc!.qtyPerMinute
					? cc!.itemCost
							.clone()
							.multiply(Math.ceil((duration / Time.Minute) * itemMultiple))
					: null;
				if (itemCost) {
					pvmCost = true;
					lootToRemove.add(itemCost);
				}
			}
		});

		if (msg.author.hasItemEquippedAnywhere('Staff of water')) {
			lootToRemove.remove('Water rune');
		}

		const itemCost = monster.itemCost ? monster.itemCost.clone().multiply(quantity) : null;
		if (itemCost) {
			pvmCost = true;
			lootToRemove.add(itemCost);
		}

		if (pvmCost) {
			if (!msg.author.owns(lootToRemove)) {
				return msg.channel.send(
					`You don't have the items needed to kill ${quantity}x ${monster.name}, you need: ${lootToRemove}.`
				);
			}
		}
		// Check food
		let foodStr: undefined | string = undefined;
		if (monster.healAmountNeeded && monster.attackStyleToUse && monster.attackStylesUsed) {
			const [healAmountNeeded, foodMessages] = calculateMonsterFood(monster, msg.author);
			messages = messages.concat(foodMessages);

			const [result] = await removeFoodFromUser({
				client: this.client,
				user: msg.author,
				totalHealingNeeded: healAmountNeeded * quantity,
				healPerAction: Math.ceil(healAmountNeeded / quantity),
				activityName: monster.name,
				attackStylesUsed: removeDuplicatesFromArray([
					...objectKeys(monster.minimumGearRequirements ?? {}),
					monster.attackStyleToUse
				]),
				learningPercentage: percentReduced
			});

			foodStr = result;
		}

		// Boosts that don't affect quantity:
		duration = randomVariation(duration, 3);

		if (isWeekend()) {
			boosts.push(`10% for Weekend`);
			duration *= 0.9;
		}

		updateBankSetting(this.client, ClientSettings.EconomyStats.PVMCost, lootToRemove);
		await msg.author.removeItemsFromBank(lootToRemove);

		if (
			attackStyles.includes(SkillsEnum.Ranged) &&
			msg.author.hasItemEquippedAnywhere('Ranged master cape')
		) {
			duration *= 0.85;
			boosts.push(`15% for Ranged master cape`);
		} else if (
			attackStyles.includes(SkillsEnum.Magic) &&
			msg.author.hasItemEquippedAnywhere('Magic master cape')
		) {
			duration *= 0.85;
			boosts.push(`15% for Magic master cape`);
		} else if (msg.author.hasItemEquippedAnywhere('Attack master cape')) {
			duration *= 0.85;
			boosts.push(`15% for Attack master cape`);
		}

		if (hasBlessing && prayerPotsNeeded) {
			await msg.author.removeItemFromBank(itemID('Prayer potion(4)'), prayerPotsNeeded);
		}

		const rangeSetup = { ...msg.author.getGear('range') };
		let usedDart = false;
		if (rangeSetup.weapon?.item === itemID('Deathtouched dart')) {
			duration = 1;
			rangeSetup.weapon = null;
			await msg.author.settings.update(UserSettings.Gear.Range, rangeSetup);
			if (monster.name === 'Koschei the deathless') {
				return msg.channel.send(
					`You send your minion off to fight Koschei with a Deathtouched dart, they stand a safe distance and throw the dart - Koschei immediately locks` +
						` eyes with your minion and grabs the dart mid-air, and throws it back, killing your minion instantly.`
				);
			}
			usedDart = true;
		}

		if (monster.name === 'Koschei the deathless') {
			return msg.channel.send(
				`You send your minion off to fight Koschei, before they even get close, they feel an immense, powerful fear and return back.`
			);
		}
		updateBankSetting(this.client, ClientSettings.EconomyStats.PVMCost, lootToRemove);
		await msg.author.removeItemsFromBank(lootToRemove);

		await addSubTaskToActivityTask<MonsterActivityTaskOptions>(this.client, {
			monsterID: monster.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.MonsterKilling,
			usingCannon,
			cannonMulti,
			burstOrBarrage
		});

		if (usedDart) {
			return msg.send(
				`<:deathtouched_dart:822674661967265843> ${msg.author.minionName} used a **Deathtouched dart**.`
			);
		}

		let response = `${minionName} is now killing ${quantity}x ${
			monster.name
		}, it'll take around ${formatDuration(
			duration
		)} to finish. Attack styles used: ${attackStyles.join(', ')}.`;

		if (pvmCost) {
			response += ` Removed ${lootToRemove}.`;
		}

		if (foodStr) {
			response += ` Removed ${foodStr}.\n`;
		}

		if (hasBlessing) {
			response += `\nRemoved ${prayerPotsNeeded}x Prayer potion(4) to power Dwarven blessing.`;
		}

		if (boosts.length > 0) {
			response += `\n**Boosts:** ${boosts.join(', ')}.`;
		}

		if (messages.length > 0) {
			response += `\n**Messages:** ${messages.join('\n')}.`;
		}

		return msg.send(response);
	}
}
