import { MessageAttachment } from 'discord.js';
import { Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { Activity } from '../../lib/constants';
import { hasWildyHuntGearEquipped } from '../../lib/gear/functions/hasWildyHuntGearEquipped';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { calcLootXPHunting } from '../../lib/skilling/functions/calcsHunter';
import Hunter from '../../lib/skilling/skills/hunter/hunter';
import { HunterTechniqueEnum, SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { HunterActivityTaskOptions } from '../../lib/types/minions';
import { bankHasItem, formatDuration, stringMatches, updateBankSetting } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import itemID from '../../lib/util/itemID';
import { HERBIBOAR_ID, RAZOR_KEBBIT_ID } from './../../lib/constants';
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
			description: 'Allows a player to hunt different creatures for hunter.',
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
								(creature.huntTechnique === HunterTechniqueEnum.Tracking ? 0.8 : 0.9) *
								(creature.id === HERBIBOAR_ID ? 0.8 : 1) *
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
			return msg.channel.send({ files: [new MessageAttachment(Buffer.from(str), 'hunterXPHR.txt')] });
		}

		if (msg.flagArgs.creatures) {
			return msg.channel.send({
				files: [
					new MessageAttachment(
						Buffer.from(
							Hunter.Creatures.map(creature => `${creature.name} - lvl required: ${creature.level}`).join(
								'\n'
							)
						),
						'Available Creatures.txt'
					)
				]
			});
		}

		await msg.author.settings.sync(true);
		const userBank = msg.author.bank();
		const userQP = msg.author.settings.get(UserSettings.QP);
		const boosts = [];
		let traps = 1;
		let usingHuntPotion = false;
		let wildyScore = 0;

		if (msg.flagArgs.pot || msg.flagArgs.potion || msg.flagArgs.huntpotion || msg.flagArgs.hunterpotion) {
			usingHuntPotion = true;
		}

		if (typeof quantity === 'string') {
			creatureName = quantity;
			quantity = null;
		}

		const creature = Hunter.Creatures.find(creature =>
			creature.aliases.some(
				alias => stringMatches(alias, creatureName) || stringMatches(alias.split(' ')[0], creatureName)
			)
		);

		if (!creature) {
			return msg.channel.send(
				`That's not a valid creature to hunt. Valid creatures are ${Hunter.Creatures.map(
					creature => creature.name
				).join(', ')}. *For more information about creatures write \`${msg.cmdPrefix}hunt --creatures\`.*`
			);
		}

		if (
			creature.id === 3251 &&
			(msg.author.skillLevel(SkillsEnum.Hunter) < 120 ||
				msg.author.skillLevel(SkillsEnum.Agility) < 99 ||
				msg.author.skillLevel(SkillsEnum.Fishing) < 99)
		) {
			return msg.channel.send("You need level 120 Hunter, 99 Agility, 99 Fishing to hunt Sand Gecko's.");
		}

		if (msg.author.skillLevel(SkillsEnum.Hunter) + (usingHuntPotion ? 2 : 0) < creature.level) {
			return msg.channel.send(
				`${msg.author.minionName} needs ${creature.level} Hunter to hunt ${creature.name}.`
			);
		}

		if (creature.qpRequired && userQP < creature.qpRequired) {
			return msg.channel.send(
				`${msg.author.minionName} needs ${creature.qpRequired} QP to hunt ${creature.name}.`
			);
		}

		if (creature.prayerLvl && msg.author.skillLevel(SkillsEnum.Prayer) < creature.prayerLvl) {
			return msg.channel.send(
				`${msg.author.minionName} needs ${creature.prayerLvl} Prayer to hunt ${creature.name}.`
			);
		}

		if (creature.herbloreLvl && msg.author.skillLevel(SkillsEnum.Herblore) < creature.herbloreLvl) {
			return msg.channel.send(
				`${msg.author.minionName} needs ${creature.herbloreLvl} Herblore to hunt ${creature.name}.`
			);
		}

		if (creature.multiTraps) {
			traps +=
				Math.min(Math.floor((msg.author.skillLevel(SkillsEnum.Hunter) + (usingHuntPotion ? 2 : 0)) / 20), 5) +
				(creature.wildy ? 1 : 0);
		}

		if (creature.itemsRequired) {
			for (const [item, quantity] of creature.itemsRequired.items()) {
				if (userBank.amount(item.name) < quantity * traps) {
					return msg.channel.send(
						`You don't have ${traps}x ${item.name}, hunter tools can be bought using \`${msg.cmdPrefix}buy\`.`
					);
				}
			}
		}

		// Reduce time if user is experienced hunting the creature, every hour become 1% better to a cap of 10% or 20% if tracking technique.
		let [percentReduced, catchTime] = [
			Math.min(
				Math.floor(
					(msg.author.getCreatureScore(creature) ?? 1) /
						(Time.Hour / ((creature.catchTime * Time.Second) / traps))
				),
				creature.huntTechnique === HunterTechniqueEnum.Tracking ? 20 : 10
			),
			creature.catchTime
		];

		catchTime *= (100 - percentReduced) / 100;

		if (percentReduced >= 1) boosts.push(`${percentReduced}% for being experienced hunting this creature`);

		// Reduce time by 5% if user has graceful equipped
		if (!creature.wildy) {
			if (msg.author.hasGlobetrotterEquipped()) {
				boosts.push('10% boost for using Globetrotter Outfit');
				catchTime *= 0.9;
			} else if (msg.author.hasGracefulEquipped()) {
				boosts.push('5% boost for using Graceful');
				catchTime *= 0.95;
			}
		}

		// Reduce time by 5% if user has graceful equipped
		if (msg.author.hasItemEquippedAnywhere(itemID('Hunter master cape'))) {
			boosts.push('2x boost for being a master hunter');
			catchTime *= 0.5;
		}

		if (creature.wildy) {
			const [bol, reason, score] = hasWildyHuntGearEquipped(msg.author.getGear('misc'));
			wildyScore = score;
			if (!bol) {
				return msg.channel.send(
					`To hunt ${creature.name} in the wilderness you need to meet the following requirment: ${reason} To check current equipped gear in misc write \`${msg.cmdPrefix}gear misc\`.`
				);
			}
			if (userBank.amount(itemID('Saradomin brew(4)')) < 10 || userBank.amount(itemID('Super restore(4)')) < 5) {
				return msg.channel.send(
					`To hunt ${creature.name} in the wilderness you need to have 10x Saradomin brew(4) and 5x Super restore(4) for safety.`
				);
			}
		}

		const maxTripLength = msg.author.maxTripLength(Activity.Hunter);

		// If no quantity provided, set it to the max.
		if (quantity === null) {
			quantity = Math.floor(maxTripLength / ((catchTime * Time.Second) / traps));
		}

		let duration = Math.floor(((quantity * catchTime) / traps) * Time.Second);

		if (duration > maxTripLength) {
			return msg.channel.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					maxTripLength
				)}, try a lower quantity. The highest amount of ${creature.name} you can hunt is ${Math.floor(
					maxTripLength / ((catchTime * Time.Second) / traps)
				)}.`
			);
		}

		let removeBank = new Bank();

		if (creature.itemsConsumed) {
			for (const [item, qty] of creature.itemsConsumed.items()) {
				if (userBank.amount(item.id) < qty * quantity) {
					if (userBank.amount(item.id) > qty) {
						quantity = Math.floor(userBank.amount(item.id) / qty);
						duration = Math.floor(((quantity * catchTime) / traps) * Time.Second);
					} else {
						return msg.channel.send(`You don't have enough ${item.name}s.`);
					}
				}
				removeBank.add(item.id, qty * quantity);
			}
		}

		// If creatures Herbiboar or Razor-backed kebbit use Stamina potion(4)
		if (creature.id === HERBIBOAR_ID || creature.id === RAZOR_KEBBIT_ID) {
			let staminaPotionQuantity =
				creature.id === HERBIBOAR_ID
					? Math.round(duration / (9 * Time.Minute))
					: Math.round(duration / (18 * Time.Minute));

			if (!msg.flagArgs.ns && bankHasItem(userBank.bank, itemID('Stamina potion(4)'), staminaPotionQuantity)) {
				removeBank.add(itemID('Stamina potion(4)'), staminaPotionQuantity);
				boosts.push(`20% boost for using ${staminaPotionQuantity}x Stamina potion(4)`);
				duration *= 0.8;
			}
		}

		if (usingHuntPotion) {
			const hunterPotionQuantity = Math.round(duration / (8 * Time.Minute));
			if (!bankHasItem(userBank.bank, itemID('Hunter potion(4)'), hunterPotionQuantity)) {
				return msg.channel.send(
					`You need ${hunterPotionQuantity}x Hunter potion(4) to boost your level for the whole trip, try a lower quantity or make/buy more potions.`
				);
			}
			removeBank.add(itemID('Hunter potion(4)'), hunterPotionQuantity);
			boosts.push(`+2 hunter level for using ${hunterPotionQuantity}x Hunter potion(4) every 2nd minute.`);
		}

		updateBankSetting(this.client, ClientSettings.EconomyStats.HunterCost, removeBank);
		await msg.author.removeItemsFromBank(removeBank.bank);

		let wildyPeak = null;
		let wildyStr = '';

		if (creature.wildy) {
			const date = new Date().getTime();
			const cachedPeakInterval: Peak[] = this.client._peakIntervalCache;
			for (const peak of cachedPeakInterval) {
				if (peak.startTime < date && peak.finishTime > date) {
					wildyPeak = peak;
					break;
				}
			}
			wildyStr = `You are hunting ${creature.name} in the Wilderness during ${
				wildyPeak!.peakTier
			} peak time and potentially risking your equipped body and legs in the misc setup with a score ${wildyScore} and also risking Saradomin brews and Super restore potions. If you feel unsure \`${
				msg.cmdPrefix
			}cancel\` the activity.`;
		}

		await addSubTaskToActivityTask<HunterActivityTaskOptions>({
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

		return msg.channel.send(response);
	}
}
