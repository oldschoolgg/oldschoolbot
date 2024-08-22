import { Time } from 'e';
import { Bank } from 'oldschooljs';

import { trackLoot } from '../../../lib/lootTrack';
import { pickaxes, varrockArmours } from '../../../lib/skilling/functions/miningBoosts';
import Runecraft from '../../../lib/skilling/skills/runecraft';
import { SkillsEnum } from '../../../lib/skilling/types';
import type { GuardiansOfTheRiftActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration, itemID, itemNameFromID, randomVariation } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import { determineRunes } from '../../../lib/util/determineRunes';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';
import { userHasGracefulEquipped } from '../../mahojiSettings';

export async function guardiansOfTheRiftStartCommand(
	user: MUser,
	channelID: string,
	combinationRunes: boolean | undefined
) {
	const rcLevel = user.skillLevel('runecraft');
	if (rcLevel < 27) {
		return 'You need 27 Runecraft to access the Temple of the Eye.';
	}

	const timePerGame = Time.Minute * 10;
	const maxTripLength = calcMaxTripLength(user, 'GuardiansOfTheRift');
	const quantity = Math.floor(maxTripLength / timePerGame);
	const duration = quantity * timePerGame;
	// Being reduced with ticks
	let minedFragments = 309;
	let barrierAndGuardian = 4;
	// Rolls based on points in gotr
	let rolls = 0;
	const { bank } = user;
	if (!combinationRunes) {
		combinationRunes = false;
	}
	// InventorySize depends on method within minigame, just approxing 28 inv size
	let inventorySize = 28;
	// For each pouch the user has, increase their inventory size.
	for (const pouch of Runecraft.pouches) {
		if (user.skillLevel(SkillsEnum.Runecraft) < pouch.level) continue;
		if (bank.has(pouch.id)) inventorySize += pouch.capacity - 1;
		if (bank.has(pouch.id) && pouch.id === itemID('Colossal pouch')) break;
	}
	const boosts = [];
	// Default bronze pickaxe, last in the array
	let currentPickaxe = pickaxes[pickaxes.length - 1];
	boosts.push(
		`**${currentPickaxe.ticksBetweenRolls}** ticks between rolls for ${itemNameFromID(
			currentPickaxe.id
		)} while mining fragments`
	);

	// For each pickaxe, if they have it, give them its' bonus and break.
	for (const pickaxe of pickaxes) {
		if (!user.hasEquippedOrInBank([pickaxe.id]) || user.skillsAsLevels.mining < pickaxe.miningLvl) continue;
		currentPickaxe = pickaxe;
		boosts.pop();
		boosts.push(
			`**${pickaxe.ticksBetweenRolls}** ticks between rolls for ${itemNameFromID(
				pickaxe.id
			)} while mining fragments`
		);
		break;
	}
	minedFragments /= currentPickaxe.ticksBetweenRolls;

	let armourEffect = 0;
	for (const armour of varrockArmours) {
		if (!user.hasEquippedOrInBank(armour.id)) continue;
		armourEffect = 10;
		boosts.push(`**${armourEffect}%** chance to mine an extra essence/fragment using ${itemNameFromID(armour.id)}`);
		minedFragments *= 1.1;
		break;
	}

	if (user.skillLevel(SkillsEnum.Mining) >= 99 && user.hasEquippedOrInBank('Mining cape')) {
		boosts.push('**5%** chance to mine an extra essence/fragment using Mining cape');
		minedFragments *= 1.05;
	}

	if (inventorySize > 28) {
		rolls += Math.max(Math.ceil(inventorySize / 28), 1);
		boosts.push(
			`Extra ${Math.max(Math.ceil(inventorySize / 28), 1)} rolls for +${
				inventorySize - 28
			} inv spaces from pouches`
		);
	}

	if (userHasGracefulEquipped(user)) {
		boosts.push('Extra 2 Barriers/Guardians fixed for Full Graceful equipped');
		barrierAndGuardian += 2;
	}

	if (user.skillLevel('agility') < 56) {
		boosts.push('Heavily Reduced mined fragments and -1 rolls for not having Lvl 56 Agility short-cut');
		minedFragments *= 0.67;
		rolls -= 1;
	}

	if (
		user.skillLevel(SkillsEnum.Runecraft) >= 99 &&
		user.hasEquippedOrInBank('Runecraft cape') &&
		inventorySize > 28
	) {
		barrierAndGuardian += 2;
		boosts.push('Extra 2 Barriers/Guardians fixed for Runecraft cape');
	} else if (user.skillLevel(SkillsEnum.Magic) >= 67) {
		const NPCContactRuneCost = determineRunes(
			user,
			new Bank({ 'Astral rune': 1, 'Cosmic rune': 1, 'Air rune': 2 }).clone().multiply(quantity)
		);
		if (bank.has(NPCContactRuneCost)) {
			boosts.push('Extra 2 Barriers/Guardians fixed for NPC Contact');
			barrierAndGuardian += 2;
		}
	} else {
		boosts.push('-1 rolls for not having NPC Contact/Runecraft cape');
		rolls -= 1;
	}

	if (user.hasEquippedOrInBank('Abyssal lantern')) {
		const firemakingLevel = user.skillLevel('firemaking');
		boosts.push(
			`Extra 1 rolls and ${
				2 * Math.floor(firemakingLevel / 30)
			} Barriers/Guardians fixed for Abyssal lantern (${firemakingLevel} FM lvl)`
		);
		barrierAndGuardian += 2 * Math.floor(firemakingLevel / 30);
		rolls += 1;
	}

	const removeRunesAndNecks = new Bank();
	if (combinationRunes) {
		const tomeOfFire = user.hasEquipped(['Tome of fire', 'Tome of fire (empty)']) ? 0 : 7;
		const tomeOfWater = user.hasEquipped(['Tome of water', 'Tome of water (empty)']) ? 0 : 7;
		const magicImbueRuneCost = determineRunes(
			user,
			new Bank({ 'Astral rune': 2, 'Fire rune': tomeOfFire, 'Water rune': tomeOfWater })
				.clone()
				.multiply(quantity * 5)
		);
		if (user.skillLevel(SkillsEnum.Magic) < 82 || !bank.has(magicImbueRuneCost)) {
			return `You need enough Magic Imbue runes and 82 Magic. You don't have enough runes and or Magic lvl. You need ${magicImbueRuneCost}`;
		}
		removeRunesAndNecks.add(magicImbueRuneCost);
		removeRunesAndNecks.add('Binding necklace', Math.max(quantity, 1));
		if (!user.owns(removeRunesAndNecks)) {
			return `You don't have enough Binding necklaces for this trip. You need ${Math.max(
				quantity,
				1
			)}x Binding necklace.`;
		}
		rolls += 2;
		boosts.push('Extra 2 rolls for Combination runecrafting');
		await user.removeItemsFromBank(removeRunesAndNecks);
		updateBankSetting('gotr_cost', removeRunesAndNecks);
		await trackLoot({
			id: 'guardians_of_the_rift',
			type: 'Minigame',
			totalCost: removeRunesAndNecks,
			changeType: 'cost',
			users: [
				{
					id: user.id,
					cost: removeRunesAndNecks
				}
			]
		});
	}

	// 5.5 rolls, 120 is average mined essences, 14 is averge created guardians/barriers per game at max efficiency
	minedFragments = Math.round(randomVariation(minedFragments, 10));
	barrierAndGuardian = Math.round(randomVariation(barrierAndGuardian, 10));
	rolls = Math.max(rolls, 1);

	await addSubTaskToActivityTask<GuardiansOfTheRiftActivityTaskOptions>({
		quantity,
		userID: user.id,
		duration,
		type: 'GuardiansOfTheRift',
		channelID: channelID.toString(),
		minigameID: 'guardians_of_the_rift',
		minedFragments,
		barrierAndGuardian,
		rolls,
		combinationRunes
	});

	return `${user.minionName} is now doing ${quantity}x games of Guardians Of The Rift! It will take ${formatDuration(
		duration
	)} to finish. ${boosts.length > 0 ? `\n**Boosts:** ${boosts.join(', ')}.` : ''}${
		combinationRunes ? `\nYour minion also consumed ${removeRunesAndNecks}.` : ''
	}`;
}
