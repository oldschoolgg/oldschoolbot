import { Time } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import { client } from '../..';
import { darkAltarCommand } from '../../lib/minions/functions/darkAltarCommand';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Runecraft from '../../lib/skilling/skills/runecraft';
import { RunecraftActivityTaskOptions } from '../../lib/types/minions';
import { calcMaxRCQuantity, formatDuration, stringMatches, toTitleCase, updateBankSetting } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { determineRunes } from '../../lib/util/determineRunes';
import { OSBMahojiCommand } from '../lib/util';

export const runecraftCommand: OSBMahojiCommand = {
	name: 'runecraft',
	description: 'Sends your minion to craft runes with essence.',
	attributes: {
		categoryFlags: ['minion', 'skilling'],
		description: 'Sends your minion to craft runes with essence.',
		examples: ['/runecraft']
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'rune',
			description: 'The Rune you want to craft.',
			required: true,
			autocomplete: async value => {
				return [...Runecraft.Runes.map(i => i.name), 'blood rune', 'soul rune']
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
			description: 'The amount of runes you want to craft.',
			required: false,
			min_value: 1,
			max_value: 1_000_000_000
		},
		{
			type: ApplicationCommandOptionType.Boolean,
			name: 'usestams',
			description: 'Set this to false to not use stamina potions (default true)',
			required: false
		}
	],
	run: async ({
		userID,
		options,
		channelID
	}: CommandRunOptions<{ rune: string; quantity?: number; usestams?: boolean }>) => {
		const user = await client.fetchUser(userID.toString());
		let { rune, quantity, usestams } = options;
		if (usestams === undefined) usestams = true;
		rune = rune.toLowerCase().replace('rune', '').trim();

		if (rune !== 'chaos' && rune.endsWith('s')) {
			rune = rune.slice(0, rune.length - 1);
		}

		if (['blood', 'soul'].includes(rune)) {
			return darkAltarCommand({ user, channelID, name: rune });
		}
		const runeObj = Runecraft.Runes.find(
			_rune => stringMatches(_rune.name, rune) || stringMatches(_rune.name.split(' ')[0], rune)
		);

		if (!runeObj) {
			return `Thats not a valid rune. Valid rune are ${Runecraft.Runes.map(_rune => _rune.name).join(', ')}.`;
		}

		const quantityPerEssence = calcMaxRCQuantity(runeObj, user);

		if (quantityPerEssence === 0) {
			return `${user.minionName} needs ${runeObj.levels[0][0]} Runecraft to create ${runeObj.name}s.`;
		}

		if (runeObj.qpRequired && user.settings.get(UserSettings.QP) < runeObj.qpRequired) {
			return `You need ${runeObj.qpRequired} QP to craft this rune.`;
		}

		const bank = user.bank();
		const numEssenceOwned = bank.amount('Pure essence');

		let { tripLength } = runeObj;
		const boosts = [];
		if (user.hasGracefulEquipped()) {
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
		} else if (user.hasItemEquippedOrInBank('Ring of endurance')) {
			tripLength *= 0.99;
			const ringStr = '1% boost for Ring of endurance';
			boosts.push(ringStr);
		}

		let inventorySize = 28;

		// For each pouch the user has, increase their inventory size.
		for (const pouch of Runecraft.pouches) {
			if (user.skillLevel(SkillsEnum.Runecraft) < pouch.level) break;
			if (bank.has(pouch.id)) inventorySize += pouch.capacity - 1;
		}

		if (inventorySize > 28) boosts.push(`+${inventorySize - 28} inv spaces from pouches`);

		if (
			user.skillLevel(SkillsEnum.Runecraft) >= 99 &&
			user.hasItemEquippedOrInBank('Runecraft cape') &&
			inventorySize > 28
		) {
			tripLength *= 0.97;
			boosts.push('3% for Runecraft cape');
		}
		const maxTripLength = user.maxTripLength('Runecraft');

		const maxCanDo = Math.floor(maxTripLength / tripLength) * inventorySize;

		// If no quantity provided, set it to the max.
		if (!quantity) quantity = Math.min(numEssenceOwned, maxCanDo);

		if (numEssenceOwned === 0 || quantity === 0 || numEssenceOwned < quantity) {
			return "You don't have enough Pure Essence to craft these runes. You can acquire some through Mining, or purchasing from other players.";
		}

		const numberOfInventories = Math.max(Math.ceil(quantity / inventorySize), 1);
		const duration = numberOfInventories * tripLength;

		if (duration > maxTripLength) {
			return `${user.minionName} can't go on trips longer than ${formatDuration(
				maxTripLength
			)}, try a lower quantity. The highest amount of ${runeObj.name} you can craft is ${Math.floor(maxCanDo)}.`;
		}

		const totalCost = new Bank();

		let imbueCasts = 0;
		let teleportReduction = 1;
		let removeTalismanAndOrRunes = new Bank();
		if (runeObj.inputTalisman) {
			const tomeOfFire = user.hasItemEquippedAnywhere(['Tome of fire', 'Tome of fire (empty)']) ? 0 : 7;
			const tomeOfWater = user.hasItemEquippedAnywhere(['Tome of water', 'Tome of water (empty)']) ? 0 : 7;
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
				if (!bank.has(removeTalismanAndOrRunes.bank)) {
					return `You need enough Magic Imbue runes and 82 Magic, *or* Talismans to craft this rune. You don't have enough talismans for this trip. You need ${runeObj.inputTalisman
						.clone()
						.multiply(numberOfInventories)}.`;
				}
			}
			removeTalismanAndOrRunes.add(runeObj.inputRune?.clone().multiply(quantity));
			if (!user.bank().has(removeTalismanAndOrRunes.bank)) {
				return `You don't have enough runes for this trip. You need ${runeObj.inputRune
					?.clone()
					.multiply(quantity)}.`;
			}
			removeTalismanAndOrRunes.add('Binding necklace', Math.max(Math.floor(numberOfInventories / 8), 1));
			if (!user.bank().has(removeTalismanAndOrRunes.bank)) {
				return `You don't have enough Binding necklaces for this trip. You need ${Math.max(
					Math.floor(numberOfInventories / 8),
					1
				)}x Binding necklace.`;
			}
			if (user.skillLevel(SkillsEnum.Crafting) >= 99 && user.hasItemEquippedOrInBank('Crafting cape')) {
				teleportReduction = 2;
			}
			removeTalismanAndOrRunes.add(
				'Ring of dueling(8)',
				Math.ceil(numberOfInventories / (8 * teleportReduction))
			);
			if (!user.bank().has(removeTalismanAndOrRunes.bank)) {
				return `You don't have enough Ring of dueling(8) for this trip. You need ${Math.ceil(
					numberOfInventories / (8 * teleportReduction)
				)}x Ring of dueling(8).`;
			}
			if (usestams) {
				removeTalismanAndOrRunes.add('Stamina potion(4)', Math.max(Math.ceil(duration / (Time.Minute * 8)), 1));
				if (!user.bank().has(removeTalismanAndOrRunes.bank)) {
					return `You don't have enough Stamina potion(4) for this trip. You need ${Math.max(
						Math.ceil(duration / (Time.Minute * 8)),
						1
					)}x Stamina potion(4).`;
				}
			}
			totalCost.add(removeTalismanAndOrRunes);
		}

		totalCost.add('Pure essence', quantity);
		if (!user.owns(totalCost)) return `You don't own: ${totalCost}.`;

		await user.removeItemsFromBank(totalCost);
		updateBankSetting(client, ClientSettings.EconomyStats.RunecraftCost, totalCost);

		await addSubTaskToActivityTask<RunecraftActivityTaskOptions>({
			runeID: runeObj.id,
			userID: user.id,
			channelID: channelID.toString(),
			essenceQuantity: quantity,
			useStaminas: usestams,
			duration,
			imbueCasts,
			type: 'Runecraft'
		});

		let response = `${user.minionName} is now turning ${quantity}x Essence into ${
			runeObj.name
		}, it'll take around ${formatDuration(
			duration
		)} to finish, this will take ${numberOfInventories}x trips to the altar. You'll get ${
			quantityPerEssence * quantity
		}x runes due to the multiplier.\n\n**Boosts:** ${boosts.join(', ')}`;

		if (runeObj.inputRune) {
			response += `\nYour minion also consumed ${removeTalismanAndOrRunes}${
				teleportReduction > 1 ? ', 50% less ring of dueling charges due to Crafting cape' : ''
			}.`;
		}

		return response;
	}
};
