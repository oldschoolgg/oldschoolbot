import { Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Tasks } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import removeFoodFromUser from '../../lib/minions/functions/removeFoodFromUser';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { Pickpocketables, Stalls } from '../../lib/skilling/skills/thieving/stealables';
import { SkillsEnum } from '../../lib/skilling/types';
import { PickpocketActivityTaskOptions } from '../../lib/types/minions';
import {
	addBanks,
	bankHasAllItemsFromBank,
	formatDuration,
	itemID,
	rand,
	round,
	stringMatches
} from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import { calcLootXPPickpocketing } from '../../tasks/minions/pickpocketActivity';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[quantity:int{1}|name:...string] [name:...string]',
			usageDelim: ' ',
			aliases: ['steal']
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

		const stallable = Stalls.find(stall => stringMatches(stall.name, name));

		if (!pickpocketable && !stallable) {
			return msg.send(
				`That is not a valid NPC/Stall to pickpocket or steal from, try one of the following: ${Pickpocketables.map(
					npc => npc.name
				).join(', ')}, ${Stalls.map(stall => stall.name).join(', ')}.`
			);
		}

		if (pickpocketable) {
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
				!bankHasAllItemsFromBank(msg.author.allItemsOwned(), pickpocketable.itemsRequired)
			) {
				return msg.send(
					`You need these items to pickpocket this NPC: ${await createReadableItemListFromBank(
						this.client,
						pickpocketable.itemsRequired
					)}.`
				);
			}

			if (msg.author.skillLevel(SkillsEnum.Thieving) < pickpocketable.level) {
				return msg.send(
					`${msg.author.minionName} needs ${pickpocketable.level} Thieving to pickpocket a ${pickpocketable.name}.`
				);
			}

			const timeToPickpocket = (pickpocketable.customTickRate ?? 2) * 600;

			// If no quantity provided, set it to the max the player can make by either the items in bank or max time.
			if (quantity === null) {
				quantity = Math.floor(msg.author.maxTripLength / timeToPickpocket);
			}

			const duration = quantity * timeToPickpocket;

			if (duration > msg.author.maxTripLength) {
				return msg.send(
					`${msg.author.minionName} can't go on trips longer than ${formatDuration(
						msg.author.maxTripLength
					)}, try a lower quantity. The highest amount of times you can pickpocket a ${
						pickpocketable.name
					} is ${Math.floor(msg.author.maxTripLength / timeToPickpocket)}.`
				);
			}

			const [successfulQuantity, damageTaken, xpReceived] = calcLootXPPickpocketing(
				msg.author.skillLevel(SkillsEnum.Thieving),
				pickpocketable,
				quantity,
				msg.author.hasItemEquippedAnywhere(itemID('Thieving cape')) ||
					msg.author.hasItemEquippedAnywhere(itemID('Thieving cape(t)'))
			);

			const [foodString, foodRemoved] = await removeFoodFromUser({
				client: this.client,
				user: msg.author,
				totalHealingNeeded: damageTaken,
				healPerAction: Math.ceil(damageTaken / quantity),
				activityName: 'Pickpocketing',
				attackStylesUsed: []
			});

			await this.client.settings.update(
				ClientSettings.EconomyStats.ThievingCost,
				addBanks([
					this.client.settings.get(ClientSettings.EconomyStats.ThievingCost),
					foodRemoved
				])
			);

			await addSubTaskToActivityTask<PickpocketActivityTaskOptions>(
				this.client,
				Tasks.SkillingTicker,
				{
					monsterID: pickpocketable.id,
					userID: msg.author.id,
					channelID: msg.channel.id,
					quantity,
					duration,
					type: Activity.Pickpocket,
					damageTaken,
					successfulQuantity,
					xpReceived
				}
			);

			return msg.send(
				`${msg.author.minionName} is now going to pickpocket a ${
					pickpocketable.name
				} ${quantity}x times, it'll take around ${formatDuration(
					duration
				)} to finish. Removed ${foodString}`
			);
		}

		if (stallable) {
			if (
				stallable.qpRequired &&
				msg.author.settings.get(UserSettings.QP) < stallable.qpRequired
			) {
				return msg.send(
					`You need atleast **${stallable.qpRequired}** QP to steal from ${stallable.name}.`
				);
			}

			if (
				stallable.itemsRequired &&
				!bankHasAllItemsFromBank(msg.author.allItemsOwned(), stallable.itemsRequired)
			) {
				return msg.send(
					`You need these items to steal from this stall: ${await createReadableItemListFromBank(
						this.client,
						stallable.itemsRequired
					)}.`
				);
			}

			if (msg.author.skillLevel(SkillsEnum.Thieving) < stallable.level) {
				return msg.send(
					`${msg.author.minionName} needs ${stallable.level} Thieving to steal from ${stallable.name}.`
				);
			}

			const timeToSteal = stallable.respawnTime;

			// If no quantity provided, set it to the max the player can make by either the items in bank or max time.
			if (quantity === null) {
				quantity = Math.floor(msg.author.maxTripLength / timeToSteal);
			}

			const duration = quantity * timeToSteal;

			if (duration > msg.author.maxTripLength) {
				return msg.send(
					`${msg.author.minionName} can't go on trips longer than ${formatDuration(
						msg.author.maxTripLength
					)}, try a lower quantity. The highest amount of times you can steal from ${
						stallable.name
					} is ${Math.floor(msg.author.maxTripLength / timeToSteal)}.`
				);
			}

			const damageTaken = 0;
			// Up to 5% fail chance, random
			const successfulQuantity = (quantity * rand(95, 100)) / 100;
			const xpReceived = quantity * stallable.xp;
			await addSubTaskToActivityTask<PickpocketActivityTaskOptions>(
				this.client,
				Tasks.SkillingTicker,
				{
					monsterID: stallable.id,
					userID: msg.author.id,
					channelID: msg.channel.id,
					quantity,
					duration,
					type: Activity.Pickpocket,
					damageTaken,
					successfulQuantity,
					xpReceived
				}
			);

			return msg.send(
				`${msg.author.minionName} is now going to steal from ${
					stallable.name
				} ${quantity}x times, it'll take around ${formatDuration(duration)} to finish.`
			);
		}
	}
}
