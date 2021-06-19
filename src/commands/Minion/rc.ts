import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { Activity, Time } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { calcMaxRCQuantity } from '../../lib/skilling/functions/calcMaxRCQuantity';
import Runecraft from '../../lib/skilling/skills/runecraft';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { RunecraftActivityTaskOptions } from '../../lib/types/minions';
import { bankHasItem, formatDuration, round, stringMatches } from '../../lib/util';
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

		if (name.endsWith('s') || name.endsWith('S')) name = name.slice(0, name.length - 1);

		const rune = Runecraft.Runes.find(
			_rune => stringMatches(_rune.name, name) || stringMatches(_rune.name.split(' ')[0], name)
		);

		if (!rune) {
			return msg.send(
				`Thats not a valid rune. Valid rune are ${Runecraft.Runes.map(_rune => _rune.name).join(', ')}.`
			);
		}

		const quantityPerEssence = calcMaxRCQuantity(rune, msg.author);

		if (quantityPerEssence === 0) {
			return msg.send(`${msg.author.minionName} needs ${rune.levels[0][0]} Runecraft to create ${rune.name}s.`);
		}

		if (rune.qpRequired && msg.author.settings.get(UserSettings.QP) < rune.qpRequired) {
			return msg.send(`You need ${rune.qpRequired} QP to craft this rune.`);
		}

		const numEssenceOwned = await msg.author.numberOfItemInBank(itemID('Pure essence'));

		let { tripLength } = rune;
		let runners = false;
		const boosts = [];
		if (msg.author.hasGracefulEquipped()) {
			tripLength -= rune.tripLength * 0.1;
			boosts.push('10% for Graceful');
		}

		if (msg.author.skillLevel(SkillsEnum.Agility) >= 90) {
			tripLength -= rune.tripLength * 0.1;
			boosts.push('10% for 90+ Agility');
		} else if (msg.author.skillLevel(SkillsEnum.Agility) >= 60) {
			tripLength -= rune.tripLength * 0.05;
			boosts.push('5% for 60+ Agility');
		}

		if (msg.flagArgs.runners && !msg.author.isIronman) {
			runners = true;
			tripLength /= 3.2;
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
		const maxTripLength = msg.author.maxTripLength(Activity.Runecraft);

		const maxCanDo = Math.floor(maxTripLength / tripLength) * inventorySize;

		// If no quantity provided, set it to the max.
		if (quantity === null) {
			quantity = Math.min(numEssenceOwned, maxCanDo);
		}

		if (numEssenceOwned === 0 || quantity === 0 || numEssenceOwned < quantity) {
			return msg.send(
				`You don't have enough Pure Essence to craft these runes. You can acquire some through Mining, or purchasing from other players (\`${msg.cmdPrefix}ge\`).`
			);
		}

		const numberOfInventories = Math.max(Math.ceil(quantity / inventorySize), 1);
		const duration = numberOfInventories * tripLength;

		if (duration > maxTripLength) {
			return msg.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					maxTripLength
				)}, try a lower quantity. The highest amount of ${rune.name} you can craft is ${Math.floor(maxCanDo)}.`
			);
		}

		let removeTalismanAndOrRunes = new Bank();
		if (rune.inputTalisman) {
			if (msg.flagArgs.talisman) {
				removeTalismanAndOrRunes.add(rune.inputTalisman.clone().multiply(numberOfInventories));
				if (!msg.author.bank().has(removeTalismanAndOrRunes.bank)) {
					return msg.send(
						`You don't have enough talismans for this trip. You need ${rune.inputTalisman
							.clone()
							.multiply(numberOfInventories)}.`
					);
				}
			} else if (msg.author.skillLevel(SkillsEnum.Magic) < 82) {
				return msg.send(
					`${msg.author.minionName} needs atleast 82 Magic to cast Magic Imbue, come back with a higher magic level or write --talisman to consume elemental talismans instead.`
				);
			} else {
				const tomeOfFire = msg.author.hasItemEquippedAnywhere(['Tome of fire', 'Tome of fire (empty)']) ? 0 : 7;
				removeTalismanAndOrRunes.add(
					determineRunes(
						msg.author,
						new Bank({ 'Astral rune': 2, 'Fire rune': tomeOfFire, 'Water rune': 7 })
							.clone()
							.multiply(runners ? Math.floor(duration / (Time.Second * 12.6)) : numberOfInventories)
					)
				);
				if (!msg.author.bank().has(removeTalismanAndOrRunes.bank)) {
					return msg.send(
						`You don't have enough Magic imbue runes for this trip. You need ${removeTalismanAndOrRunes}.`
					);
				}
			}
			removeTalismanAndOrRunes.add(rune.inputRune?.clone().multiply(quantity));
			if (!msg.author.bank().has(removeTalismanAndOrRunes.bank)) {
				return msg.send(
					`You don't have enough runes for this trip. You need ${rune.inputRune?.clone().multiply(quantity)}.`
				);
			}
			removeTalismanAndOrRunes.add('Binding necklace', Math.max(Math.floor(numberOfInventories / 8), 1));
			if (!msg.author.bank().has(removeTalismanAndOrRunes.bank)) {
				return msg.send(
					`You don't have enough Binding necklaces for this trip. You need ${Math.max(
						Math.floor(numberOfInventories / 8),
						1
					)}x Binding necklace.`
				);
			}
			if (!runners) {
				const teleports = msg.author.skillLevel(SkillsEnum.Crafting) > 98 ? 2 : 1;
				removeTalismanAndOrRunes.add('Ring of dueling(8)', Math.ceil(numberOfInventories / (8 * teleports)));
				if (!msg.author.bank().has(removeTalismanAndOrRunes.bank)) {
					return msg.send(
						`You don't have enough Ring of dueling(8) for this trip. You need ${Math.ceil(
							numberOfInventories / (8 * teleports)
						)}x Ring of dueling(8).`
					);
				}
				removeTalismanAndOrRunes.add('Stamina potion(4)', Math.max(Math.ceil(duration / (Time.Minute * 8)), 1));
				if (!msg.author.bank().has(removeTalismanAndOrRunes.bank)) {
					return msg.send(
						`You don't have enough Stamina potion(4) for this trip. You need ${Math.max(
							Math.ceil(duration / (Time.Minute * 8)),
							1
						)}x Stamina potion(4).`
					);
				}
			} else {
				const userGP = msg.author.settings.get(UserSettings.GP);
				if (userGP < (duration / Time.Hour) * 40_000_000) {
					return msg.send(
						`You do not have enough GP to pay your runners for this trip. You need atleast ${round(
							Math.ceil((duration / Time.Hour) * 40_000_000) / 1_000_000,
							2
						)}M GP.`
					);
				}
				await msg.author.removeGP((duration / Time.Hour) * 40_000_000);
			}
			await msg.author.removeItemsFromBank(removeTalismanAndOrRunes.bank);
		}

		await msg.author.removeItemFromBank(itemID('Pure essence'), quantity);

		await addSubTaskToActivityTask<RunecraftActivityTaskOptions>({
			runeID: rune.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			essenceQuantity: quantity,
			duration,
			type: Activity.Runecraft
		});

		let response = `${msg.author.minionName} is now turning ${quantity}x Essence into ${
			rune.name
		}, it'll take around ${formatDuration(
			duration
		)} to finish, this will take ${numberOfInventories}x trips to the altar. You'll get ${
			quantityPerEssence * quantity
		}x runes due to the multiplier.\n\n**Boosts:** ${boosts.join(', ')}`;

		if (rune.inputRune) {
			response += `\nYour minion also consumed ${removeTalismanAndOrRunes}.`;
		}

		if (runners) {
			response += `\nYou paid 4x runners ${round(
				Math.ceil((duration / Time.Hour) * 40_000_000) / 1_000_000,
				2
			)}M GP to hand you supplies at the altar instead.`;
		}

		return msg.send(response);
	}
}
