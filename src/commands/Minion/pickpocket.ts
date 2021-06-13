import { Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { Activity } from '../../lib/constants';
import { ArdougneDiary, userhasDiaryTier } from '../../lib/diaries';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import removeFoodFromUser from '../../lib/minions/functions/removeFoodFromUser';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { Pickpocketables } from '../../lib/skilling/skills/thieving/stealables';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { PickpocketActivityTaskOptions } from '../../lib/types/minions';
import {
	addBanks,
	bankHasAllItemsFromBank,
	formatDuration,
	itemID,
	rogueOutfitPercentBonus,
	round,
	stringMatches
} from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { calcLootXPPickpocketing } from '../../tasks/minions/pickpocketActivity';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[quantity:int{1}|name:...string] [name:...string]',
			usageDelim: ' '
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage, [quantity, name = '']: [null | number | string, string]) {
		if (msg.flagArgs.xphr) {
			let str = 'Approximate XP/Hr and Food usage rates (varies based on RNG)\n\n';
			for (let i = 1; i < 100; i += 5) {
				str += `\n---- Level ${i} ----`;
				let results: [string, number, number][] = [];
				for (const npc of Pickpocketables) {
					if (i < npc.level) continue;
					const [, damageTaken, xpReceived] = calcLootXPPickpocketing(
						i,
						npc,
						5 * (Time.Hour / ((npc.customTickRate ?? 2) * 600)),
						false,
						(await userhasDiaryTier(msg.author, ArdougneDiary.hard))[0],
						false
					);
					results.push([npc.name, round(xpReceived, 2) / 5, damageTaken / 5]);
				}
				for (const [name, xp, damageTaken] of results.sort((a, b) => a[1] - b[1])) {
					str += `\n${name} ${xp.toLocaleString()} XP/HR and ${
						damageTaken / 20
					} Sharks/hr`;
				}
				str += '\n\n\n';
			}
			return msg.channel.sendFile(Buffer.from(str), 'output.txt');
		}

		if (typeof quantity === 'string') {
			name = quantity;
			quantity = null;
		}

		const pickpocketable = Pickpocketables.find(npc => stringMatches(npc.name, name));

		if (!pickpocketable) {
			return msg.send(
				`That is not a valid NPC to pickpocket, try pickpocketing one of the following: ${Pickpocketables.map(
					npc => npc.name
				).join(', ')}.`
			);
		}

		if (
			pickpocketable.qpRequired &&
			msg.author.settings.get(UserSettings.QP) < pickpocketable.qpRequired
		) {
			return msg.send(
				`You need atleast **${pickpocketable.qpRequired}** QP to pickpocket a ${pickpocketable.name}.`
			);
		}

		if (
			pickpocketable.itemsRequired &&
			!bankHasAllItemsFromBank(msg.author.allItemsOwned().bank, pickpocketable.itemsRequired)
		) {
			return msg.send(
				`You need these items to pickpocket this NPC: ${new Bank(
					pickpocketable.itemsRequired
				)}.`
			);
		}

		if (msg.author.skillLevel(SkillsEnum.Thieving) < pickpocketable.level) {
			return msg.send(
				`${msg.author.minionName} needs ${pickpocketable.level} Thieving to pickpocket a ${pickpocketable.name}.`
			);
		}

		let timeToPickpocket = (pickpocketable.customTickRate ?? 2) * 600;

		if (msg.author.hasItemEquippedAnywhere(itemID('Thieving master cape'))) {
			timeToPickpocket *= 0.7;
		}

		const maxTripLength = msg.author.maxTripLength(Activity.Pickpocket);

		// If no quantity provided, set it to the max the player can make by either the items in bank or max time.
		if (quantity === null) {
			quantity = Math.floor(maxTripLength / timeToPickpocket);
		}

		const hasWilvus = msg.author.equippedPet() === itemID('Wilvus');
		if (hasWilvus) {
			timeToPickpocket /= 2;
		}
		const duration = quantity * timeToPickpocket;

		if (duration > maxTripLength) {
			return msg.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					maxTripLength
				)}, try a lower quantity. The highest amount of times you can pickpocket a ${
					pickpocketable.name
				} is ${Math.floor(maxTripLength / timeToPickpocket)}.`
			);
		}

		const boosts = [];

		const [hasArdyHard] = await userhasDiaryTier(msg.author, ArdougneDiary.hard);
		if (hasArdyHard) {
			boosts.push(`+10% chance of success from Ardougne Hard diary`);
		}

		const [successfulQuantity, damageTaken, xpReceived] = calcLootXPPickpocketing(
			msg.author.skillLevel(SkillsEnum.Thieving),
			pickpocketable,
			quantity,
			msg.author.hasItemEquippedAnywhere(itemID('Thieving cape')) ||
				msg.author.hasItemEquippedAnywhere(itemID('Thieving cape(t)')) ||
				msg.author.hasItemEquippedAnywhere(itemID('Thieving master cape')),
			hasArdyHard,
			msg.author.hasItemEquippedOrInBank("Thieves' armband")
		);

		const [foodString, foodRemoved] = await removeFoodFromUser({
			client: this.client,
			user: msg.author,
			totalHealingNeeded: damageTaken,
			healPerAction: Math.ceil(damageTaken / quantity),
			activityName: 'Pickpocketing',
			attackStylesUsed: []
		});

		if (rogueOutfitPercentBonus(msg.author) > 0) {
			boosts.push(
				`${rogueOutfitPercentBonus(
					msg.author
				)}% chance of x2 loot due to rogue outfit equipped`
			);
		}

		await this.client.settings.update(
			ClientSettings.EconomyStats.ThievingCost,
			addBanks([
				this.client.settings.get(ClientSettings.EconomyStats.ThievingCost),
				foodRemoved
			])
		);

		await addSubTaskToActivityTask<PickpocketActivityTaskOptions>(this.client, {
			monsterID: pickpocketable.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Pickpocket,
			damageTaken,
			successfulQuantity,
			xpReceived
		});

		let str = `${msg.author.minionName} is now going to pickpocket a ${
			pickpocketable.name
		} ${quantity}x times, it'll take around ${formatDuration(
			duration
		)} to finish. Removed ${foodString}`;

		if (hasWilvus) {
			str += `\n<:wilvus:787320791011164201> 2x Speed boost from Wilvus`;
		}
		if (boosts.length > 0) {
			str += `\n\n**Boosts:** ${boosts.join(', ')}.`;
		}

		if (msg.author.hasItemEquippedAnywhere(itemID('Thieving master cape'))) {
			str += `\n30% faster pickpocketing for skill mastery`;
		}

		return msg.send(str);
	}
}
