import { MessageAttachment } from 'discord.js';
import { round, Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { ArdougneDiary, userhasDiaryTier } from '../../lib/diaries';
import { Favours, gotFavour } from '../../lib/minions/data/kourendFavour';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import removeFoodFromUser from '../../lib/minions/functions/removeFoodFromUser';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { Pickpocketables, Stalls } from '../../lib/skilling/skills/thieving/stealables';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { PickpocketActivityTaskOptions } from '../../lib/types/minions';
import {
	bankHasAllItemsFromBank,
	formatDuration,
	rand,
	rogueOutfitPercentBonus,
	stringMatches,
	updateBankSetting
} from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { calcLootXPPickpocketing } from '../../tasks/minions/pickpocketActivity';
import { Pickpockable, Stall } from './../../lib/skilling/skills/thieving/stealables';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
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
						false,
						(await userhasDiaryTier(msg.author, ArdougneDiary.hard))[0]
					);
					results.push([npc.name, round(xpReceived, 2) / 5, damageTaken / 5]);
				}
				for (const [name, xp, damageTaken] of results.sort((a, b) => a[1] - b[1])) {
					str += `\n${name} ${xp.toLocaleString()} XP/HR and ${damageTaken / 20} Sharks/hr`;
				}
				str += '\n\n\n';
			}
			return msg.channel.send({ files: [new MessageAttachment(Buffer.from(str), 'output.txt')] });
		}

		if (typeof quantity === 'string') {
			name = quantity;
			quantity = null;
		}

		const stealable: Pickpockable | Stall | undefined = Pickpocketables.find(
			npc => stringMatches(npc.name, name) || npc.alias?.some(alias => stringMatches(alias, name))
		)
			? Pickpocketables.find(
					npc => stringMatches(npc.name, name) || npc.alias?.some(alias => stringMatches(alias, name))
			  )
			: Stalls.find(
					stall => stringMatches(stall.name, name) || stall.alias?.some(alias => stringMatches(alias, name))
			  );

		if (!stealable) {
			return msg.channel.send(
				`That is not a valid NPC/Stall to pickpocket or steal from, try pickpocketing or stealing from one of the following: ${Pickpocketables.map(
					npc => npc.name
				).join(', ')}, ${Stalls.map(stall => stall.name).join(', ')}.`
			);
		}

		const isPickpockable: boolean = (<Pickpockable>stealable).slope ? true : false;

		const maxTripLength = msg.author.maxTripLength('Pickpocket');

		if (stealable.qpRequired && msg.author.settings.get(UserSettings.QP) < stealable.qpRequired) {
			return msg.channel.send(
				`You need atleast **${stealable.qpRequired}** QP to ${isPickpockable ? 'pickpocket' : 'steal from'} a ${
					stealable.name
				}.`
			);
		}

		if (
			stealable.itemsRequired &&
			!bankHasAllItemsFromBank(msg.author.allItemsOwned().bank, stealable.itemsRequired)
		) {
			return msg.channel.send(
				`You need these items to ${
					isPickpockable ? 'pickpocket this NPC' : 'steal from this stall'
				}: ${new Bank(stealable.itemsRequired)}.`
			);
		}

		if (msg.author.skillLevel(SkillsEnum.Thieving) < stealable.level) {
			return msg.channel.send(
				`${msg.author.minionName} needs ${stealable.level} Thieving to ${
					isPickpockable ? 'pickpocket' : 'steal from'
				} a ${stealable.name}.`
			);
		}

		const [hasFavour, requiredPoints] = gotFavour(msg.author, Favours.Hosidius, 15);
		if (!hasFavour && stealable.name === 'Fruit stall') {
			return msg.channel.send(
				`${msg.author.minionName} needs ${requiredPoints}% Hosidius Favour to steal fruit from the Fruit stalls!`
			);
		}

		const timeToTheft = isPickpockable
			? ((<Pickpockable>stealable).customTickRate ?? 2) * 600
			: (<Stall>stealable).respawnTime;

		// If no quantity provided, set it to the max the player can make by either the items in bank or max time.
		if (quantity === null) {
			quantity = Math.floor(maxTripLength / timeToTheft);
		}

		const duration = quantity * timeToTheft;

		if (duration > maxTripLength) {
			return msg.channel.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					maxTripLength
				)}, try a lower quantity. The highest amount of times you can ${
					isPickpockable ? 'pickpocket' : 'steal from'
				} a ${stealable.name} is ${Math.floor(maxTripLength / timeToTheft)}.`
			);
		}

		const boosts = [];
		let successfulQuantity = 0;
		let xpReceived = 0;
		let damageTaken = 0;

		let str = `${msg.author.minionName} is now going to ${isPickpockable ? 'pickpocket' : 'steal from'} a ${
			stealable.name
		} ${quantity}x times, it'll take around ${formatDuration(duration)} to finish.`;

		if (isPickpockable) {
			const [hasArdyHard] = await userhasDiaryTier(msg.author, ArdougneDiary.hard);
			if (hasArdyHard) {
				boosts.push('+10% chance of success from Ardougne Hard diary');
			}

			[successfulQuantity, damageTaken, xpReceived] = calcLootXPPickpocketing(
				msg.author.skillLevel(SkillsEnum.Thieving),
				<Pickpockable>stealable,
				quantity,
				msg.author.hasItemEquippedAnywhere(['Thieving cape', 'Thieving cape(t)']),
				hasArdyHard
			);

			const { foodRemoved } = await removeFoodFromUser({
				client: this.client,
				user: msg.author,
				totalHealingNeeded: damageTaken,
				healPerAction: Math.ceil(damageTaken / quantity),
				activityName: 'Pickpocketing',
				attackStylesUsed: []
			});

			if (rogueOutfitPercentBonus(msg.author) > 0) {
				boosts.push(`${rogueOutfitPercentBonus(msg.author)}% chance of x2 loot due to rogue outfit equipped`);
			}

			updateBankSetting(this.client, ClientSettings.EconomyStats.ThievingCost, foodRemoved);
			str += ` Removed ${foodRemoved}.`;
		} else {
			// Up to 5% fail chance, random
			successfulQuantity = Math.floor((quantity * rand(95, 100)) / 100);
			xpReceived = successfulQuantity * stealable.xp;
		}

		await addSubTaskToActivityTask<PickpocketActivityTaskOptions>({
			monsterID: stealable.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: 'Pickpocket',
			damageTaken,
			successfulQuantity,
			xpReceived
		});

		if (boosts.length > 0) {
			str += `\n\n**Boosts:** ${boosts.join(', ')}.`;
		}

		return msg.channel.send(str);
	}
}
