import { Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { Emoji } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { calcMaxRCQuantity } from '../../lib/skilling/functions/calcMaxRCQuantity';
import Runecraft from '../../lib/skilling/skills/runecraft';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { RunecraftActivityTaskOptions } from '../../lib/types/minions';
import { bankHasItem, formatDuration, stringMatches, updateBankSetting } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { determineRunes } from '../../lib/util/determineRunes';
import itemID from '../../lib/util/itemID';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '<quantity:int{1}|name:...string> [name:...string]',
			usageDelim: ' ',
			categoryFlags: ['minion', 'skilling'],
			description: 'Sends your minion to craft runes with essence.',
			examples: ['+rc air runes']
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [quantity, name = '']: [null | number | string, string]) {
		if (typeof quantity === 'string') {
			name = quantity;
			quantity = null;
		}

		if (name.toLowerCase() !== 'chaos') {
			if (name.endsWith('s') || name.endsWith('S')) name = name.slice(0, name.length - 1);
		}
		const rune = Runecraft.Runes.find(
			_rune => stringMatches(_rune.name, name) || stringMatches(_rune.name.split(' ')[0], name)
		);

		if (!rune) {
			return msg.channel.send(
				`Thats not a valid rune. Valid rune are ${Runecraft.Runes.map(_rune => _rune.name).join(', ')}.`
			);
		}

		const quantityPerEssence = calcMaxRCQuantity(rune, msg.author);

		if (quantityPerEssence === 0) {
			return msg.channel.send(
				`${msg.author.minionName} needs ${rune.levels[0][0]} Runecraft to create ${rune.name}s.`
			);
		}

		if (rune.qpRequired && msg.author.settings.get(UserSettings.QP) < rune.qpRequired) {
			return msg.channel.send(`You need ${rune.qpRequired} QP to craft this rune.`);
		}

		if (rune.name === 'Elder rune' && !msg.author.owns('Elder talisman')) {
			return msg.channel.send("You cannot craft Elder runes because you don't own an Elder talisman.");
		}

		const numEssenceOwned = await msg.author.numberOfItemInBank(itemID('Pure essence'));

		let { tripLength } = rune;
		const boosts = [];
		if (msg.author.hasGracefulEquipped()) {
			tripLength -= tripLength * 0.1;
			boosts.push('10% for Graceful');
		}

		if (msg.author.skillLevel(SkillsEnum.Agility) >= 90) {
			tripLength *= 0.9;
			boosts.push('10% for 90+ Agility');
		} else if (msg.author.skillLevel(SkillsEnum.Agility) >= 60) {
			tripLength *= 0.95;
			boosts.push('5% for 60+ Agility');
		}
		if (msg.author.usingPet('Obis')) {
			tripLength /= 2;
			boosts.push('2x from Obis (3x more essence)');
		}

		if (msg.author.hasItemEquippedAnywhere('Runecraft master cape')) {
			tripLength /= 2;
			boosts.push(`${Emoji.RunecraftMasterCape} 2x faster`);
		}

		if (msg.flagArgs.ns) {
			tripLength *= 3;
			boosts.push('**3x slower** for no Stamina potion(4)s');
		} else if (
			msg.author.hasItemEquippedOrInBank('Ring of endurance (uncharged)') ||
			msg.author.hasItemEquippedOrInBank('Ring of endurance')
		) {
			tripLength *= 0.99;
			const ringStr = `1% boost for ${
				msg.author.hasItemEquippedOrInBank('Ring of endurance (uncharged)')
					? 'Ring of endurance (uncharged)'
					: 'Ring of endurance'
			}`;
			boosts.push(ringStr);
		}

		let inventorySize = 28;

		// For each pouch the user has, increase their inventory size.
		const bank = msg.author.settings.get(UserSettings.Bank);
		for (const pouch of Runecraft.pouches) {
			if (msg.author.skillLevel(SkillsEnum.Runecraft) < pouch.level) break;
			if (bankHasItem(bank, pouch.id)) {
				inventorySize += pouch.capacity - 1;
			}
		}

		if (inventorySize > 28) {
			boosts.push(`+${inventorySize - 28} inv spaces from pouches`);
		}

		if (
			msg.author.skillLevel(SkillsEnum.Runecraft) >= 99 &&
			msg.author.hasItemEquippedOrInBank(itemID('Runecraft cape')) &&
			inventorySize > 28
		) {
			tripLength *= 0.97;
			boosts.push('3% for Runecraft cape');
		}
		const maxTripLength = msg.author.maxTripLength('Runecraft');

		const maxCanDo = Math.floor(maxTripLength / tripLength) * inventorySize;

		// If no quantity provided, set it to the max.
		if (quantity === null) {
			quantity = Math.min(numEssenceOwned, maxCanDo);
		}

		let essenceRequired = quantity;
		if (msg.author.usingPet('Obis')) {
			essenceRequired *= 3;
		}

		if (numEssenceOwned === 0 || essenceRequired === 0 || numEssenceOwned < essenceRequired) {
			return msg.channel.send(
				`You don't have enough Pure Essence to craft these runes. You can acquire some through Mining, or purchasing from other players (\`${msg.cmdPrefix}ge\`).`
			);
		}

		const numberOfInventories = Math.max(Math.ceil(quantity / inventorySize), 1);
		const duration = numberOfInventories * tripLength;

		if (duration > maxTripLength) {
			return msg.channel.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					maxTripLength
				)}, try a lower quantity. The highest amount of ${rune.name} you can craft is ${Math.floor(maxCanDo)}.`
			);
		}

		const totalCost = new Bank();

		let imbueCasts = 0;
		let teleportReduction = 1;
		let removeTalismanAndOrRunes = new Bank();
		if (rune.inputTalisman) {
			if (msg.flagArgs.talisman) {
				removeTalismanAndOrRunes.add(rune.inputTalisman.clone().multiply(numberOfInventories));
				if (!msg.author.bank().has(removeTalismanAndOrRunes.bank)) {
					return msg.channel.send(
						`You don't have enough talismans for this trip. You need ${rune.inputTalisman
							.clone()
							.multiply(numberOfInventories)}.`
					);
				}
			} else if (msg.author.skillLevel(SkillsEnum.Magic) < 82) {
				return msg.channel.send(
					`${msg.author.minionName} needs atleast 82 Magic to cast Magic Imbue, come back with a higher magic level or write --talisman to consume elemental talismans instead.`
				);
			} else {
				const tomeOfFire = msg.author.hasItemEquippedAnywhere(['Tome of fire', 'Tome of fire (empty)']) ? 0 : 7;
				const tomeOfWater = msg.author.hasItemEquippedAnywhere(['Tome of water', 'Tome of water (empty)'])
					? 0
					: 7;
				removeTalismanAndOrRunes.add(
					determineRunes(
						msg.author,
						new Bank({ 'Astral rune': 2, 'Fire rune': tomeOfFire, 'Water rune': tomeOfWater })
							.clone()
							.multiply(numberOfInventories)
					)
				);
				if (!msg.author.bank().has(removeTalismanAndOrRunes.bank)) {
					return msg.channel.send(
						`You don't have enough Magic imbue runes for this trip. You need ${removeTalismanAndOrRunes}.`
					);
				}
				imbueCasts = numberOfInventories;
			}
			removeTalismanAndOrRunes.add(rune.inputRune?.clone().multiply(quantity));
			if (!msg.author.bank().has(removeTalismanAndOrRunes.bank)) {
				return msg.channel.send(
					`You don't have enough runes for this trip. You need ${rune.inputRune?.clone().multiply(quantity)}.`
				);
			}
			removeTalismanAndOrRunes.add('Binding necklace', Math.max(Math.floor(numberOfInventories / 8), 1));
			if (!msg.author.bank().has(removeTalismanAndOrRunes.bank)) {
				return msg.channel.send(
					`You don't have enough Binding necklaces for this trip. You need ${Math.max(
						Math.floor(numberOfInventories / 8),
						1
					)}x Binding necklace.`
				);
			}
			if (
				msg.author.skillLevel(SkillsEnum.Crafting) >= 99 &&
				msg.author.hasItemEquippedOrInBank(itemID('Crafting cape'))
			) {
				teleportReduction = 2;
			}
			removeTalismanAndOrRunes.add(
				'Ring of dueling(8)',
				Math.ceil(numberOfInventories / (8 * teleportReduction))
			);
			if (!msg.author.bank().has(removeTalismanAndOrRunes.bank)) {
				return msg.channel.send(
					`You don't have enough Ring of dueling(8) for this trip. You need ${Math.ceil(
						numberOfInventories / (8 * teleportReduction)
					)}x Ring of dueling(8).`
				);
			}
			if (!msg.flagArgs.ns) {
				removeTalismanAndOrRunes.add('Stamina potion(4)', Math.max(Math.ceil(duration / (Time.Minute * 8)), 1));
				if (!msg.author.bank().has(removeTalismanAndOrRunes.bank)) {
					return msg.channel.send(
						`You don't have enough Stamina potion(4) for this trip. You need ${Math.max(
							Math.ceil(duration / (Time.Minute * 8)),
							1
						)}x Stamina potion(4).`
					);
				}
			}
			totalCost.add(removeTalismanAndOrRunes);
		}

		totalCost.add('Pure essence', quantity);
		if (!msg.author.owns(totalCost)) {
			return msg.channel.send(`You don't own: ${totalCost}.`);
		}
		await msg.author.removeItemsFromBank(totalCost);
		updateBankSetting(this.client, ClientSettings.EconomyStats.RunecraftCost, totalCost);

		await addSubTaskToActivityTask<RunecraftActivityTaskOptions>({
			runeID: rune.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			essenceQuantity: quantity,
			duration,
			imbueCasts,
			obisEssenceQuantity: essenceRequired,
			type: 'Runecraft'
		});

		let response = `${msg.author.minionName} is now turning ${essenceRequired}x Essence into ${
			rune.name
		}, it'll take around ${formatDuration(
			duration
		)} to finish, this will take ${numberOfInventories}x trips to the altar.
		
**Boosts:** ${boosts.join(', ')}`;

		if (rune.inputRune) {
			response += `\nYour minion also consumed ${removeTalismanAndOrRunes}${
				teleportReduction > 1 ? ', 50% less ring of dueling charges due to Crafting cape' : ''
			}.`;
		}

		return msg.channel.send(response);
	}
}
