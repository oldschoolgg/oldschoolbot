import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Time } from '../../lib/constants';
import { hasGracefulEquipped } from '../../lib/gear/functions/hasGracefulEquipped';
import { hasWildyHuntGearEquipped } from '../../lib/gear/functions/hasWildyHuntGearEquipped';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { calcLootXPHunting } from '../../lib/skilling/functions/calcsHunter';
import Hunter from '../../lib/skilling/skills/hunter/hunter';
import { SkillsEnum } from '../../lib/skilling/types';
import { HunterActivityTaskOptions } from '../../lib/types/minions';
import {
	bankHasItem,
	formatDuration,
	itemNameFromID,
	removeItemFromBank,
	stringMatches
} from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import itemID from '../../lib/util/itemID';
import { Peak } from './../../tasks/WildernessPeakInterval';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[quantity:int{1}|name:...string] [creatureName:...string]',
			aliases: ['catch', 'trap'],
			usageDelim: ' ',
			description: `Allows a player to hunt different creatures for hunter.`,
			examples: ['+hunt 5 herbiboar'],
			categoryFlags: ['minion', 'skilling']
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage, [quantity, creatureName = '']: [null | number | string, string]) {
		if (msg.flagArgs.xphr) {
			let str = 'Approximate XP/Hr (varies based on RNG)\n\n';
			for (let i = 1; i < 100; i++) {
				str += `\n---- Level ${i} ----`;
				let results: [string, number, number][] = [];
				for (const creature of Hunter.Creatures) {
					if (i < creature.level) continue;
					let traps = 1;
					if (creature.multiTraps) {
						traps += Math.floor(i / 20) + (creature.wildy ? 1 : 0);
					}
					const [, xpReceived] = calcLootXPHunting(
						i,
						creature,
						90_000 /
							((creature.catchTime *
								(creature.huntTechnique === 'tracking' ? 0.8 : 0.9) *
								(creature.name === 'Herbiboar' ? 0.8 : 1) *
								(creature.wildy ? 1 : 0.95)) /
								traps)
					);
					results.push([creature.name, Math.round(xpReceived / 25), traps]);
				}
				for (const [name, xp, traps] of results.sort((a, b) => a[1] - b[1])) {
					str += `\n${name} ${xp.toLocaleString()} XP/HR, amount of traps ${traps}.`;
				}
				str += '\n\n\n';
			}
			return msg.channel.sendFile(Buffer.from(str), 'hunterXPHR.txt');
		}

		if (msg.flagArgs.creatures) {
			return msg.channel.sendFile(
				Buffer.from(
					Hunter.Creatures.map(
						creature => `${creature.name} - lvl required: ${creature.level}`
					).join('\n')
				),
				`Available Creatures.txt`
			);
		}

		await msg.author.settings.sync(true);
		const userBank = msg.author.settings.get(UserSettings.Bank);
		const userQP = msg.author.settings.get(UserSettings.QP);
		const boosts = [];
		let traps = 1;
		let usingHuntPotion = false;

		if (
			msg.flagArgs.pot ||
			msg.flagArgs.potion ||
			msg.flagArgs.huntpotion ||
			msg.flagArgs.hunterpotion
		) {
			usingHuntPotion = true;
		}

		if (typeof quantity === 'string') {
			creatureName = quantity;
			quantity = null;
		}

		const creature = Hunter.Creatures.find(creature =>
			creature.aliases.some(
				alias =>
					stringMatches(alias, creatureName) ||
					stringMatches(alias.split(' ')[0], creatureName)
			)
		);

		if (!creature) {
			return msg.send(
				`That's not a valid creature to hunt. Valid creatures are ${Hunter.Creatures.map(
					creature => creature.name
				).join(', ')}. *for more creature info write \`${msg.cmdPrefix}hunt --creatures\`.*`
			);
		}

		if (msg.author.skillLevel(SkillsEnum.Hunter) + (usingHuntPotion ? 2 : 0) < creature.level) {
			return msg.send(
				`${msg.author.minionName} needs ${creature.level} Hunter to hunt ${creature.name}.`
			);
		}

		if (creature.qpRequired && userQP < creature.qpRequired) {
			return msg.send(
				`${msg.author.minionName} needs ${creature.qpRequired} Questpoints to hunt ${creature.name}.`
			);
		}

		if (creature.prayerLvl && msg.author.skillLevel(SkillsEnum.Prayer) < creature.prayerLvl) {
			return msg.send(
				`${msg.author.minionName} needs ${creature.prayerLvl} Prayer to hunt ${creature.name}.`
			);
		}

		if (creature.multiTraps) {
			traps +=
				Math.min(
					Math.floor(
						(msg.author.skillLevel(SkillsEnum.Hunter) + (usingHuntPotion ? 2 : 0)) / 20
					),
					5
				) + (creature.wildy ? 1 : 0);
		}

		if (creature.itemsRequired) {
			const requiredItems: [string, number][] = Object.entries(creature.itemsRequired);
			for (const [itemID, qty] of requiredItems) {
				if (!bankHasItem(userBank, parseInt(itemID), qty)) {
					return msg.send(
						`You don't have ${traps}x ${itemNameFromID(
							parseInt(itemID)
						)}, hunter tools can be bought using \`${msg.cmdPrefix}buy\`.`
					);
				}
			}
		}

		let { catchTime } = creature;

		// Reduce time if user is experienced hunting the creature, every hour become 1% better to a cap of 10% or 20% if tracking technique.
		const HOUR = Time.Hour;
		const percentReduced = Math.min(
			Math.floor(
				(msg.author.settings.get(UserSettings.CreatureScores)[creature.id] ?? 1) /
					(HOUR / ((creature.catchTime * Time.Second) / traps))
			),
			creature.huntTechnique === 'tracking' ? 20 : 10
		);
		catchTime *= (100 - percentReduced) / 100;

		if (percentReduced >= 1)
			boosts.push(`${percentReduced}% for being experienced hunting this creature`);

		// Reduce time by 5% if user has graceful equipped
		if (
			!creature.wildy &&
			hasGracefulEquipped(msg.author.settings.get(UserSettings.Gear.Skilling))
		) {
			boosts.push('5% boost for using Graceful');
			catchTime *= 0.95;
		}

		if (creature.wildy) {
			if (!hasWildyHuntGearEquipped(msg.author.settings.get(UserSettings.Gear.Misc))) {
				return msg.send(
					`To hunt ${creature.name} in the wilderness you need to have Karil's leathertop/Black d'hide body and Karil's leatherskirt/Black d'hide chaps equipped in \`${msg.cmdPrefix}gear misc\`.`
				);
			}
			if (
				!bankHasItem(userBank, itemID('Saradomin brew(4)'), 10) ||
				!bankHasItem(userBank, itemID('Super restore(4)'), 5)
			) {
				return msg.send(
					`To hunt ${creature.name} in the wilderness you need to have 10x Saradomin brew(4) and 5x Super restore(4) for safety.`
				);
			}
		}

		// If no quantity provided, set it to the max.
		if (quantity === null) {
			quantity = Math.floor(msg.author.maxTripLength / ((catchTime * Time.Second) / traps));
		}

		let duration = Math.floor(((quantity * catchTime) / traps) * Time.Second);

		if (duration > msg.author.maxTripLength) {
			return msg.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					msg.author.maxTripLength
				)}, try a lower quantity. The highest amount of ${
					creature.name
				} you can hunt is ${Math.floor(
					msg.author.maxTripLength / ((catchTime * Time.Second) / traps)
				)}.`
			);
		}

		let newBank = { ...userBank };

		if (creature.itemsConsumed) {
			const consumedItems: [string, number][] = Object.entries(creature.itemsConsumed);
			for (const [itemID, qty] of consumedItems) {
				if (!bankHasItem(userBank, parseInt(itemID), qty * quantity)) {
					if (msg.author.numItemsInBankSync(parseInt(itemID)) > qty) {
						quantity = Math.floor(
							msg.author.numItemsInBankSync(parseInt(itemID)) / qty
						);
					} else {
						return msg.send(
							`You don't have enough ${itemNameFromID(parseInt(itemID))}s.`
						);
					}
				}
				newBank = removeItemFromBank(newBank, parseInt(itemID), qty * quantity);
			}
		}

		// If creatures Herbiboar or Razor-backed kebbit use Stamina potion(4)
		if (creature.name === 'Herbiboar' || creature.name === 'Razor-backed kebbit') {
			let staminaPotionQuantity =
				creature.name === 'Herbiboar'
					? Math.round(duration / (9 * Time.Minute))
					: Math.round(duration / (18 * Time.Minute));

			if (bankHasItem(userBank, itemID('Stamina potion(4)'), staminaPotionQuantity)) {
				newBank = removeItemFromBank(
					newBank,
					itemID('Stamina potion(4)'),
					staminaPotionQuantity
				);
				boosts.push(`20% boost for using ${staminaPotionQuantity}x Stamina potion(4)`);
				duration *= 0.8;
			}
		}

		if (usingHuntPotion) {
			const hunterPotionQuantity = Math.round(duration / (8 * Time.Minute));
			if (!bankHasItem(userBank, itemID('Hunter potion(4)'), hunterPotionQuantity)) {
				return msg.send(
					`You need ${hunterPotionQuantity}x Hunter potion(4) to boost your level for the whole trip, try a lower quantity or make/buy more potions.`
				);
			}
			newBank = removeItemFromBank(newBank, itemID('Hunter potion(4)'), hunterPotionQuantity);
			boosts.push(
				`+2 hunter level for using ${hunterPotionQuantity}x Hunter potion(4) every 2nd minute.`
			);
		}

		await msg.author.settings.update(UserSettings.Bank, newBank);

		let wildyPeak = null;
		let wildyStr = '';

		if (creature.wildy) {
			const date = new Date().getTime();
			const cachedPeakInterval: Peak[] = this.client._peakIntervalCache;
			// not the correct function just placeholder, real function in WildernessPeakInterval
			for (const peak of cachedPeakInterval) {
				if (peak.startTime < date && peak.finishTime > date) {
					wildyPeak = peak;
					break;
				}
			}
			wildyStr = `You are hunting ${creature.name} in the Wilderness during ${
				wildyPeak!.peakTier
			} peak time and potentially risking Black d'hide / Karil's setup and potions. If you feel unsure \`${
				msg.cmdPrefix
			}cancel\` the activity.`;
		}

		await addSubTaskToActivityTask<HunterActivityTaskOptions>(this.client, {
			creatureName: creature.name,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			usingHuntPotion,
			wildyPeak,
			type: Activity.Hunter
		});

		let response = `${msg.author.minionName} is now ${creature.huntTechnique} ${quantity}x ${
			creature.name
		}, it'll take around ${formatDuration(duration)} to finish.`;

		if (boosts.length > 0) {
			response += `\n\n**Boosts:** ${boosts.join(', ')}.`;
		}

		if (wildyStr.length > 0) {
			response += `\n\n${wildyStr}`;
		}

		return msg.send(response);
	}
}
