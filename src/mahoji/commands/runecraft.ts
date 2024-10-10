import { toTitleCase } from '@oldschoolgg/toolkit/util';
import type { CommandRunOptions } from '@oldschoolgg/toolkit/util';
import { ApplicationCommandOptionType } from 'discord.js';
import { Time } from 'e';
import { Bank } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import { darkAltarCommand } from '../../lib/minions/functions/darkAltarCommand';
import { sinsOfTheFatherSkillRequirements } from '../../lib/skilling/functions/questRequirements';
import Runecraft from '../../lib/skilling/skills/runecraft';
import type { RunecraftActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, formatSkillRequirements, itemID, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import { determineRunes } from '../../lib/util/determineRunes';
import { updateBankSetting } from '../../lib/util/updateBankSetting';
import { ouraniaAltarStartCommand } from '../lib/abstracted_commands/ouraniaAltarCommand';
import { tiaraRunecraftCommand } from '../lib/abstracted_commands/tiaraRunecraftCommand';
import type { OSBMahojiCommand } from '../lib/util';
import { calcMaxRCQuantity, userHasGracefulEquipped } from '../mahojiSettings';

export const runecraftCommand: OSBMahojiCommand = {
	name: 'runecraft',
	description: 'Sends your minion to craft runes with essence, or craft tiaras.',
	attributes: {
		requiresMinion: true,
		requiresMinionNotBusy: true,
		categoryFlags: ['minion', 'skilling'],
		examples: ['/runecraft']
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'rune',
			description: 'The Rune/Tiara you want to craft.',
			required: true,
			autocomplete: async value => {
				return [
					...Runecraft.Runes.map(i => i.name),
					'ourania altar',
					'blood rune (zeah)',
					'soul rune (zeah)',
					...Runecraft.Tiaras.map(i => i.name)
				]
					.filter(name => (!value ? true : name.toLowerCase().includes(value.toLowerCase())))
					.map(i => ({
						name: toTitleCase(i),
						value: i
					}));
			}
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'quantity',
			description: 'The amount of runes/tiaras you want to craft.',
			required: false,
			min_value: 1,
			max_value: 1_000_000_000
		},
		{
			type: ApplicationCommandOptionType.Boolean,
			name: 'usestams',
			description: 'Set this to false to not use stamina potions (default true)',
			required: false
		},
		{
			type: ApplicationCommandOptionType.Boolean,
			name: 'daeyalt_essence',
			description: 'Set this to true to use daeyalt essence (default false)',
			required: false
		}
	],
	run: async ({
		userID,
		options,
		channelID
	}: CommandRunOptions<{ rune: string; quantity?: number; usestams?: boolean; daeyalt_essence?: boolean }>) => {
		const user = await mUserFetch(userID.toString());
		let { rune, quantity, usestams, daeyalt_essence } = options;

		rune = rune.toLowerCase().replace('rune', '').trim();

		if (rune !== 'chaos' && rune.endsWith('s')) {
			rune = rune.slice(0, rune.length - 1);
		}

		const tiaraObj = Runecraft.Tiaras.find(_tiara => stringMatches(_tiara.name, rune));

		if (tiaraObj) {
			return tiaraRunecraftCommand({ user, channelID, name: rune, quantity });
		}

		if (rune.includes('ourania')) {
			return ouraniaAltarStartCommand({ user, channelID, quantity, usestams, daeyalt_essence });
		}

		if (rune.includes('(zeah)')) {
			return darkAltarCommand({ user, channelID, name: rune });
		}

		const runeObj = Runecraft.Runes.find(
			_rune => stringMatches(_rune.name, rune) || stringMatches(_rune.name.split(' ')[0], rune)
		);
		if (!runeObj) {
			return `That's not a valid rune. Valid rune are ${Runecraft.Runes.map(_rune => _rune.name).join(', ')}.`;
		}

		if (usestams === undefined) {
			usestams = true;
		}

		if (!usestams && !runeObj.stams) {
			usestams = true;
		}

		const quantityPerEssence = calcMaxRCQuantity(runeObj, user);

		if (quantityPerEssence === 0) {
			return `${user.minionName} needs ${runeObj.levels[0][0]} Runecraft to create ${runeObj.name}s.`;
		}

		if (runeObj.qpRequired && user.user.QP < runeObj.qpRequired) {
			return `You need ${runeObj.qpRequired} QP to craft this rune.`;
		}

		const { bank } = user;
		const numEssenceOwned = bank.amount('Pure essence');
		const daeyaltEssenceOwned = bank.amount('Daeyalt essence');

		let { tripLength } = runeObj;
		const boosts = [];
		if (userHasGracefulEquipped(user)) {
			tripLength -= tripLength * 0.1;
			boosts.push('10% for Graceful');
		}

		if (user.skillLevel(SkillsEnum.Agility) >= 90) {
			tripLength *= 0.9;
			boosts.push('10% for 90+ Agility');
		} else if (user.skillLevel(SkillsEnum.Agility) >= 60) {
			tripLength *= 0.95;
			boosts.push('5% for 60+ Agility');
		}

		if (!usestams) {
			tripLength *= 3;
			boosts.push('**3x slower** for no Stamina potion(4)s');
		} else if (user.hasEquippedOrInBank(['Ring of endurance'])) {
			tripLength *= 0.99;
			const ringStr = '1% boost for Ring of endurance';
			boosts.push(ringStr);
		}

		let inventorySize = 28;

		// For each pouch the user has, increase their inventory size.
		for (const pouch of Runecraft.pouches) {
			if (user.skillLevel(SkillsEnum.Runecraft) < pouch.level) continue;
			if (bank.has(pouch.id)) inventorySize += pouch.capacity - 1;
			if (bank.has(pouch.id) && pouch.id === itemID('Colossal pouch')) break;
		}

		if (inventorySize > 28) boosts.push(`+${inventorySize - 28} inv spaces from pouches`);

		if (
			user.skillLevel(SkillsEnum.Runecraft) >= 99 &&
			user.hasEquippedOrInBank('Runecraft cape') &&
			inventorySize > 28
		) {
			tripLength *= 0.97;
			boosts.push('3% for Runecraft cape');
		}

		const maxTripLength = calcMaxTripLength(user, 'Runecraft');

		const maxCanDo = Math.floor(maxTripLength / tripLength) * inventorySize;

		// If no quantity provided, set it to the max.
		if (daeyalt_essence) {
			if (!quantity) quantity = Math.min(daeyaltEssenceOwned, maxCanDo);
			if (daeyaltEssenceOwned === 0 || quantity === 0 || daeyaltEssenceOwned < quantity) {
				return "You don't have enough Daeyalt Essence to craft these runes. You can acquire Daeyalt Shards through Mining, and then exchange for essence with the `/create` command.";
			}
		} else {
			if (!quantity) quantity = Math.min(numEssenceOwned, maxCanDo);

			if (numEssenceOwned === 0 || quantity === 0 || numEssenceOwned < quantity) {
				return "You don't have enough Pure Essence to craft these runes. You can acquire some through Mining, or purchasing from other players.";
			}
		}

		const numberOfInventories = Math.max(Math.ceil(quantity / inventorySize), 1);
		let duration = numberOfInventories * tripLength;

		if (duration > maxTripLength) {
			return `${user.minionName} can't go on trips longer than ${formatDuration(
				maxTripLength
			)}, try a lower quantity. The highest amount of ${runeObj.name} you can craft is ${Math.floor(maxCanDo)}.`;
		}

		if (rune === 'blood') {
			const hasBloodReqs = user.hasSkillReqs(sinsOfTheFatherSkillRequirements);
			if (!hasBloodReqs) {
				return `To runecraft ${rune}, you need ${formatSkillRequirements(sinsOfTheFatherSkillRequirements)}.`;
			}
		}

		const totalCost = new Bank();

		let imbueCasts = 0;
		let teleportReduction = 1;
		const removeTalismanAndOrRunes = new Bank();
		let hasRingOfTheElements = false;
		if (runeObj.inputTalisman) {
			const tomeOfFire = user.hasEquipped(['Tome of fire', 'Tome of fire (empty)']) ? 0 : 7;
			const tomeOfWater = user.hasEquipped(['Tome of water', 'Tome of water (empty)']) ? 0 : 7;
			const magicImbueRuneCost = determineRunes(
				user,
				new Bank({ 'Astral rune': 2, 'Fire rune': tomeOfFire, 'Water rune': tomeOfWater })
					.clone()
					.multiply(numberOfInventories)
			);
			if (user.skillLevel(SkillsEnum.Magic) >= 82 && bank.has(magicImbueRuneCost)) {
				removeTalismanAndOrRunes.add(magicImbueRuneCost);
				imbueCasts = numberOfInventories;
			} else {
				removeTalismanAndOrRunes.add(runeObj.inputTalisman.clone().multiply(numberOfInventories));
				if (!bank.has(removeTalismanAndOrRunes)) {
					return `You need enough Magic Imbue runes and 82 Magic, *or* Talismans to craft this rune. You don't have enough talismans for this trip. You need ${runeObj.inputTalisman
						.clone()
						.multiply(numberOfInventories)}.`;
				}
			}
			removeTalismanAndOrRunes.add(runeObj.inputRune?.clone().multiply(quantity));
			if (!user.owns(removeTalismanAndOrRunes)) {
				return `You don't have enough runes for this trip. You need ${runeObj.inputRune
					?.clone()
					.multiply(quantity)}.`;
			}
			removeTalismanAndOrRunes.add(
				'Binding necklace',
				Math.max(Math.floor(numberOfInventories / (16 / Math.ceil(inventorySize / 28))), 1)
			);
			if (!user.owns(removeTalismanAndOrRunes)) {
				return `You don't have enough Binding necklaces for this trip. You need ${Math.max(
					Math.floor(numberOfInventories / (16 / Math.ceil(inventorySize / 28))),
					1
				)}x Binding necklace.`;
			}
			if (user.skillLevel(SkillsEnum.Crafting) >= 99 && user.hasEquippedOrInBank('Crafting cape')) {
				teleportReduction = 2;
			}
			const ringOfTheElementsRuneCost = determineRunes(
				user,
				new Bank({ 'Law rune': 1, 'Fire rune': 1, 'Water rune': 1, 'Earth rune': 1, 'Air rune': 1 })
					.clone()
					.multiply(numberOfInventories)
			);
			if (user.hasEquippedOrInBank('Ring of the elements') && bank.has(ringOfTheElementsRuneCost)) {
				hasRingOfTheElements = true;
				duration *= 0.97;
				boosts.push('3% for Ring of the elements');
				removeTalismanAndOrRunes.add(ringOfTheElementsRuneCost);
				// if no crafting cape still consume ring of dueling charge
				if (teleportReduction !== 2) {
					removeTalismanAndOrRunes.add('Ring of dueling(8)', Math.ceil(numberOfInventories / 8));
				}
			} else {
				removeTalismanAndOrRunes.add(
					'Ring of dueling(8)',
					Math.ceil(numberOfInventories / (4 * teleportReduction))
				);
			}
			if (!user.owns(removeTalismanAndOrRunes)) {
				return `You don't have enough Ring of dueling(8) for this trip. You need ${Math.ceil(
					numberOfInventories / (4 * teleportReduction)
				)}x Ring of dueling(8).`;
			}
			if (usestams) {
				removeTalismanAndOrRunes.add('Stamina potion(4)', Math.max(Math.ceil(duration / (Time.Minute * 8)), 1));
				if (!user.owns(removeTalismanAndOrRunes)) {
					return `You don't have enough Stamina potion(4) for this trip. You need ${Math.max(
						Math.ceil(duration / (Time.Minute * 8)),
						1
					)}x Stamina potion(4).`;
				}
			}
			totalCost.add(removeTalismanAndOrRunes);
		}

		if (daeyalt_essence) {
			totalCost.add('Daeyalt essence', quantity);
			if (!user.owns(totalCost)) return `You don't own: ${totalCost}.`;
		} else {
			totalCost.add('Pure essence', quantity);
		}
		if (!user.owns(totalCost)) return `You don't own: ${totalCost}.`;

		await user.removeItemsFromBank(totalCost);
		updateBankSetting('runecraft_cost', totalCost);

		await addSubTaskToActivityTask<RunecraftActivityTaskOptions>({
			runeID: runeObj.id,
			userID: user.id,
			channelID: channelID.toString(),
			essenceQuantity: quantity,
			useStaminas: usestams,
			daeyaltEssence: daeyalt_essence,
			duration,
			imbueCasts,
			type: 'Runecraft'
		});

		let response = `${user.minionName} is now turning ${quantity}x`;

		if (daeyalt_essence) {
			response += ' Daeyalt ';
		} else {
			response += ' Pure ';
		}

		response += `Essence into ${runeObj.name}, it'll take around ${formatDuration(
			duration
		)} to finish, this will take ${numberOfInventories}x trips to the altar. You'll get ${
			quantityPerEssence * quantity
		}x runes due to the multiplier.\n\n**Boosts:** ${boosts.join(', ')}`;

		if (!runeObj.stams) {
			response += `\nNote: You are unable to use Stamina Potion's when crafting ${runeObj.name}s.`;
		}

		if (runeObj.inputRune) {
			response += `\nYour minion also consumed ${removeTalismanAndOrRunes}${
				teleportReduction > 1 && !hasRingOfTheElements
					? ', 50% less ring of dueling charges due to Crafting cape'
					: ''
			}.`;
		}

		return response;
	}
};
