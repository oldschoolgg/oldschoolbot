import { randInt, roll } from '@oldschoolgg/rng';
import { Events, Time } from '@oldschoolgg/toolkit';
import { Bank, ECreature, EquipmentSlot, itemID } from 'oldschooljs';

import { MAX_LEVEL } from '@/lib/constants.js';
import { hasWildyHuntGearEquipped } from '@/lib/gear/functions/hasWildyHuntGearEquipped.js';
import { trackLoot } from '@/lib/lootTrack.js';
import { calcLootXPHunting, generateHerbiTable } from '@/lib/skilling/functions/calcsHunter.js';
import Hunter from '@/lib/skilling/skills/hunter/hunter.js';
import type { PrismaCompatibleJsonObject } from '@/lib/types/index.js';
import type { HunterActivityTaskOptions } from '@/lib/types/minions.js';
import { PeakTier } from '@/lib/util/peaks.js';
import { skillingPetDropRate } from '@/lib/util.js';

const riskDeathNumbers = [
	{
		peakTier: PeakTier.High,
		extraChance: -80
	},
	{
		peakTier: PeakTier.Medium,
		extraChance: -20
	},
	{
		peakTier: PeakTier.Low,
		extraChance: 80
	}
];

export const hunterTask: MinionTask = {
	type: 'Hunter',
	async run(data: HunterActivityTaskOptions, { user, handleTripFinish }) {
		const { creatureID, quantity, channelID, usingHuntPotion, wildyPeak, duration, usingStaminaPotion } = data;
		const userBank = user.bank;
		const currentLevel = user.skillsAsLevels.hunter;
		const currentHerbLevel = user.skillsAsLevels.herblore;
		let gotPked = false;
		let died = false;
		let diedStr = '';
		let pkStr = '';
		let pkedQuantity = 0;

		const creature = Hunter.Creatures.find(c => c.id === creatureID);

		if (!creature) {
			Logging.logError(`Invalid creature ID provided: ${creatureID}`);
			return;
		}

		const crystalImpling = creature.name === 'Crystal impling';

		const graceful = user.hasGracefulEquipped();

		const experienceScore = await user.getCreatureScore(creature.id);

		let [successfulQuantity, xpReceived] = calcLootXPHunting(
			Math.min(Math.floor(currentLevel + (usingHuntPotion ? 2 : 0)), MAX_LEVEL),
			creature,
			quantity,
			usingStaminaPotion,
			graceful,
			experienceScore
		);

		if (crystalImpling) {
			// Limit it to a max of 22 crystal implings per hour
			successfulQuantity = Math.min(successfulQuantity, Math.round((21 / 60) * duration) + 1);
		}

		if (creature.wildy) {
			let riskPkChance = creature.id === ECreature.BLACK_CHINCHOMPA ? 100 : 200;
			riskPkChance +=
				riskDeathNumbers.find(_peaktier => _peaktier.peakTier === wildyPeak?.peakTier)?.extraChance ?? 0;
			let riskDeathChance = 20;
			// The more experienced the less chance of death.
			riskDeathChance += Math.min(Math.floor(((await user.getCreatureScore(creature.id)) ?? 1) / 100), 200);

			// Gives lower death chance depending on what the user got equipped in wildy.
			const [, , score] = hasWildyHuntGearEquipped(user.gear.wildy);
			riskDeathChance += score;
			for (let i = 0; i < duration / Time.Minute; i++) {
				if (roll(riskPkChance)) {
					gotPked = true;
					break;
				}
			}
			if (gotPked && roll(riskDeathChance)) {
				died = true;
				const cost = new Bank().add('Saradomin brew(4)', 10).add('Super restore(4)', 5);
				if (userBank.has(cost)) {
					await user.transactItems({ itemsToRemove: cost });
				}
				const newGear = { ...user.gear.wildy.raw() };
				newGear[EquipmentSlot.Body] = null;
				newGear[EquipmentSlot.Legs] = null;
				await user.update({
					gear_wildy: newGear as PrismaCompatibleJsonObject
				});
				pkedQuantity = 0.5 * successfulQuantity;
				xpReceived *= 0.8;
				diedStr =
					'Your minion got killed during the activity and lost gear, catch quantity, 10x Saradomin brew and 5x Super restore.';
			}
			if (gotPked && !died) {
				if (userBank.amount('Saradomin brew(4)') >= 10 && userBank.amount('Super restore(4)') >= 5) {
					const lostBrew = randInt(1, 10);
					const lostRestore = randInt(1, 5);
					const cost = new Bank().add('Saradomin brew(4)', lostBrew).add('Super restore(4)', lostRestore);
					await user.transactItems({ itemsToRemove: cost });

					pkStr = `Your minion got attacked during the activity, escaped and lost some catch quantity, and ${cost}.`;
					pkedQuantity = 0.1 * successfulQuantity;
					xpReceived *= 0.9;
				}
			}
		}

		let babyChinChance = 0;
		if (creature.name.toLowerCase().includes('chinchompa')) {
			babyChinChance =
				creature.name === 'Chinchompa' ? 131_395 : creature.name === 'Carnivorous chinchompa' ? 98_373 : 82_758;
		}
		const { petDropRate } = skillingPetDropRate(user, 'hunter', babyChinChance);

		let creatureTable = creature.table;
		let magicSecStr = '';
		let herbXP = 0;
		let xpStr = '';
		if (creature.id === ECreature.HERBIBOAR) {
			creatureTable = generateHerbiTable(
				user.skillLevel('herblore'),
				user.hasEquippedOrInBank('Magic secateurs')
			);
			if (user.hasEquippedOrInBank('Magic secateurs')) {
				magicSecStr = ' Extra herbs for Magic secateurs';
			}
			// TODO: Check wiki in future for herblore xp from herbiboar
			if (currentHerbLevel >= 31) {
				herbXP += quantity * randInt(25, 75);
				xpStr = await user.addXP({
					skillName: 'herblore',
					amount: herbXP,
					duration
				});
			}
		}

		const loot = new Bank();
		for (let i = 0; i < successfulQuantity - pkedQuantity; i++) {
			loot.add(creatureTable.roll());
			if (roll(petDropRate) && creature.name.toLowerCase().includes('chinchompa')) {
				loot.add(itemID('Baby chinchompa'));
			}
		}

		const scoreToAdd = Math.floor(successfulQuantity);
		if (scoreToAdd > 0) {
			await user.incrementCreatureScore(creature.id);
		}

		await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});
		xpStr += await user.addXP({
			skillName: 'hunter',
			amount: xpReceived,
			duration
		});

		let str = `${user}, ${user.minionName} finished hunting ${creature.name}${
			crystalImpling
				? '. '
				: ` ${quantity}x times, due to clever creatures you missed out on ${
						quantity - successfulQuantity
					}x catches. `
		}${xpStr}\n\nYou received: ${loot}.${magicSecStr.length > 1 ? magicSecStr : ''}`;

		if (gotPked && !died) {
			str += `\n${pkStr}`;
		}

		if (died) {
			str += `\n${diedStr}`;
		}

		if (loot.amount('Baby chinchompa') > 0 || loot.amount('Herbi') > 0) {
			globalClient.emit(
				Events.ServerNotification,
				`**${user.usernameOrMention}'s** minion, ${user.minionName}, just received a ${
					loot.amount('Baby chinchompa') > 0
						? '**Baby chinchompa** <:Baby_chinchompa_red:324127375539306497>'
						: '**Herbi** <:Herbi:357773175318249472>'
				} while hunting a ${creature.name}, their Hunter level is ${currentLevel}!`
			);
		}

		await ClientSettings.updateBankSetting('hunter_loot', loot);
		await trackLoot({
			id: creature.name,
			changeType: 'loot',
			duration,
			kc: quantity,
			totalLoot: loot,
			type: 'Skilling',
			users: [
				{
					id: user.id,
					duration,
					loot
				}
			]
		});

		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
