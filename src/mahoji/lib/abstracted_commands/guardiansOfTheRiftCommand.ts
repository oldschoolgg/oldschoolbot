import { randInt, Time } from 'e';
import { Bank } from 'oldschooljs';

import Runecraft from '../../../lib/skilling/skills/runecraft';
import { SkillsEnum } from '../../../lib/skilling/types';
import { formatDuration, itemID, itemNameFromID, randomVariation } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import { determineRunes } from '../../../lib/util/determineRunes';
import { pickaxes, varrockArmours } from '../../commands/mine';
import { userHasGracefulEquipped } from '../../mahojiSettings';
import { GuardiansOfTheRiftActivityTaskOptions } from './../../../lib/types/minions';

export async function guardiansOfTheRiftStartCommand(
	user: MUser,
	channelID: string,
	combinationRunes: boolean | undefined
) {
	const rcLevel = user.skillLevel('runecraft');
	if (rcLevel < 27) {
		return 'You need 27 Runecraft to access the Temple of the Eye.';
	}

	let timePerGame = Time.Minute * 10;
	let maxTripLength = calcMaxTripLength(user, 'GuardiansOfTheRift');
	const quantity = Math.floor(maxTripLength / timePerGame);
	const duration = quantity * timePerGame;
	// Being reduced with ticks
	let minedFragments = 309;
	let barrierAndGuardian = 7;
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
	boosts.push(`**${currentPickaxe.ticksBetweenRolls}** ticks between rolls for ${itemNameFromID(currentPickaxe.id)}`);

	// For each pickaxe, if they have it, give them its' bonus and break.
	for (const pickaxe of pickaxes) {
		if (!user.hasEquippedOrInBank([pickaxe.id]) || user.skillsAsLevels.mining < pickaxe.miningLvl) continue;
		currentPickaxe = pickaxe;
		boosts.pop();
		boosts.push(`**${pickaxe.ticksBetweenRolls}** ticks between rolls for ${itemNameFromID(pickaxe.id)}`);
		break;
	}
	minedFragments /= currentPickaxe.ticksBetweenRolls;

	let armourEffect = 0;
	for (const armour of varrockArmours) {
		if (!user.hasEquippedOrInBank(armour.id)) continue;
		armourEffect = 10;
		if (armourEffect !== 0) {
			boosts.push(
				`**${armourEffect}%** chance to mine an extra essence/fragment using ${itemNameFromID(armour.id)}`
			);
			minedFragments *= 1.1;
			break;
		}
	}

	if (inventorySize > 28) {
		rolls += Math.max(Math.ceil(inventorySize / 28), 1);
		boosts.push(`+${inventorySize - 28} inv spaces from pouches`);
	}

	if (userHasGracefulEquipped(user)) {
		boosts.push('More active with Graceful equipped');
		barrierAndGuardian += 2;
	}

	if (user.skillLevel('agility') < 56) {
		boosts.push('Heavily Reduced mined Fragments for not having Lvl 56 Agility short-cut');
		minedFragments *= 0.67;
		rolls -= 1;
	}

	if (
		user.skillLevel(SkillsEnum.Runecraft) >= 99 &&
		user.hasEquippedOrInBank('Runecraft cape') &&
		inventorySize > 28
	) {
		barrierAndGuardian += 2;
		boosts.push('Runecraft cape, increase points');
	} else if (user.skillLevel(SkillsEnum.Magic) >= 67) {
		const NPCContactRuneCost = determineRunes(
			user,
			new Bank({ 'Astral rune': 1, 'Cosmic rune': 1, 'Air rune': 2 }).clone().multiply(quantity)
		);
		if (bank.has(NPCContactRuneCost)) {
			boosts.push('NPC Contact');
			barrierAndGuardian += 2;
		}
	} else {
		rolls -= 1;
	}

	if (user.hasEquippedOrInBank('Abyssal lantern')) {
		const firemakingLevel = user.skillLevel('firemaking');
		boosts.push(`Abyssal lantern (${firemakingLevel} FM lvl)`);
		barrierAndGuardian += Math.floor(firemakingLevel / 30);
		rolls += 1;
	}

	let removeRunesAndNecks = new Bank();
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
			return `You need enough Magic Imbue runes and 82 Magic You don't have enough talismans for this trip. You need ${magicImbueRuneCost}`;
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
		boosts.push('Extra points for Combination runecrafting');
		await user.removeItemsFromBank(removeRunesAndNecks);
	}

	// 5.5 rolls, 120 is average mined essences, 14 is averge created guardians/barriers at max efficiency
	minedFragments = Math.round(randomVariation(minedFragments, 10));
	barrierAndGuardian = Math.round(randomVariation(barrierAndGuardian, 10));
	rolls = Math.min(Math.round(Math.max(rolls, 1)), 6);
	rolls = randInt(rolls - 1, rolls);

	await addSubTaskToActivityTask<GuardiansOfTheRiftActivityTaskOptions>({
		quantity,
		userID: user.id,
		duration,
		type: 'GuardiansOfTheRift',
		channelID: channelID.toString(),
		minigameID: 'guardians_of_the_rift',
		minedEseences: minedFragments,
		barrierAndGuardian,
		rolls,
		combinationRunes
	});

	return `${user.minionName} is now doing ${quantity}x games of Guardians Of The Rift! It will take ${formatDuration(
		duration
	)} to finish. ${boosts.length > 0 ? `\n**Boosts:** ${boosts.join(', ')}` : ''}${
		combinationRunes ? `\nYour minion also consumed ${removeRunesAndNecks}.` : ''
	}`;
}
