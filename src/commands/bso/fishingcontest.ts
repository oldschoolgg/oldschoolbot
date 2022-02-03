import { Time } from '@sapphire/time-utilities';
import { MessageAttachment } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { production } from '../../config';
import { GLOBAL_BSO_XP_MULTIPLIER } from '../../lib/constants';
import {
	catchFishAtLocation,
	fishingLocations,
	getCurrentFishType,
	getTopDailyFishingCatch,
	getUsersFishingContestDetails,
	getValidLocationsForFishType
} from '../../lib/fishingContest';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { getMinigameScore } from '../../lib/settings/minigames';
import { prisma, trackLoot } from '../../lib/settings/prisma';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { FishingContestOptions } from '../../lib/types/minions';
import { formatDuration, stringMatches, updateBankSetting } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { calculateFishingContestXP } from '../../tasks/minions/bso/fishingContestActivity';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			altProtection: true,
			categoryFlags: ['minion', 'minigame'],
			description: 'Sends your minion to do the Fishing Contest minigame.',
			examples: ['=fishingcontest [fish]'],
			subcommands: true,
			usage: '[fish] [input:...string]',
			usageDelim: ' '
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage) {
		const currentFishType = getCurrentFishType();
		const [userDetails, topCatches, minigameScore] = await Promise.all([
			getUsersFishingContestDetails(msg.author),
			getTopDailyFishingCatch(),
			getMinigameScore(msg.author.id, 'fishing_contest')
		]);
		const validLocs = getValidLocationsForFishType(currentFishType);
		return msg.channel.send(
			`**Fishing Contest**

You can participate using \`${msg.cmdPrefix}fishingcontest fish [location]\`

**Todays Catch:** A fish from a ${currentFishType.temperature} ${currentFishType.water} (${validLocs
				.map(i => i.name)
				.join(', ')})
**Todays Catches:** ${userDetails.catchesFromToday
				.sort((a, b) => b.length_cm - a.length_cm)
				.map(i => `${i.name}(${i.length_cm / 100}m)`)
				.join(', ')}
**Total Daily Contests:** ${minigameScore}
**All-time catches:** ${userDetails.catchesAllTime}
**Total Unique Catches:** ${userDetails.totalUniqueCatches}
**Total Length of Fish:** ${userDetails.totalLength / 100}m
**Daily Catch Leaderboard:** ${topCatches.map(i => `${i.name}(${i.length_cm / 100}m)`).join(', ')}`
		);
	}

	@minionNotBusy
	@requiresMinion
	async fish(msg: KlasaMessage, [input = '']: [string | undefined]) {
		const fishingLocation = fishingLocations.find(i => stringMatches(i.name, input));
		if (!fishingLocation) {
			return msg.channel.send(
				`That's not a valid location to fish at, you can fish at these locations: ${fishingLocations
					.map(i => `${i.name}(${i.temperature} ${i.water})`)
					.join(', ')}.`
			);
		}
		const currentFishType = getCurrentFishType();
		const validLocs = getValidLocationsForFishType(currentFishType);
		if (!validLocs.includes(fishingLocation)) {
			return msg.channel.send(
				`This Fishing Location isn't valid for todays catch! These ones are: ${validLocs
					.map(i => i.name)
					.join(', ')}`
			);
		}

		if (!['Contest rod', "Beginner's tackle box"].every(i => msg.author.hasItemEquippedOrInBank(i))) {
			return msg.channel.send(
				'You need to buy a Contest rod and a tackle box to compete in the Fishing contest.'
			);
		}

		if (!production && msg.flagArgs.reset) {
			await prisma.fishingContestCatch.deleteMany({
				where: {
					user_id: BigInt(msg.author.id)
				}
			});
			await msg.author.settings.reset(UserSettings.CollectionLogBank);
			return msg.channel.send('Deleted all your caught fish and reset your CL.');
		}

		if (!production && msg.flagArgs.debugtime) {
			let str = 'Rotations\n\n';
			let counter = {
				cold: 0,
				warm: 0,
				ocean: 0,
				river: 0,
				lake: 0
			};
			for (let i = 0; i < 50; i++) {
				let d = new Date(Date.now() + i * (Time.Hour * 24));
				const rotation = getCurrentFishType(d);
				counter[rotation.temperature]++;
				counter[rotation.water]++;
				str += `${d.toDateString()} ${rotation.temperature} ${rotation.water}\n`;
			}
			return msg.channel.send({
				content: JSON.stringify(counter, null, 2),
				files: [new MessageAttachment(Buffer.from(str, 'utf-8'), 'text.txt')]
			});
		}

		if (!production && msg.flagArgs.xphr) {
			let str = 'Fishing XP Based On Level at Fishing Contest\n\n\n';
			for (const lvl of [1, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120]) {
				const low = (
					calculateFishingContestXP({ fishingLevel: lvl, fishSizeCM: 10 }) * GLOBAL_BSO_XP_MULTIPLIER
				).toLocaleString();
				const high = (
					calculateFishingContestXP({ fishingLevel: lvl, fishSizeCM: 180 }) * GLOBAL_BSO_XP_MULTIPLIER
				).toLocaleString();
				str += `Level ${lvl}: Roughly Between ${low} and ${high}\n`;
			}
			return msg.channel.send({
				files: [new MessageAttachment(Buffer.from(str, 'utf-8'), 'text.txt')]
			});
		}

		if (!production && msg.flagArgs.debug) {
			let arr = [];
			for (let i = 0; i < 1000; i++) {
				arr.push(await catchFishAtLocation({ user: msg.author, location: fishingLocation }));
			}
			return msg.channel.send({
				files: [
					new MessageAttachment(
						Buffer.from(
							arr
								.sort((a, b) => b.lengthCentimetres - a.lengthCentimetres)
								.map(i => i.lengthCentimetres)
								.join('\n'),
							'utf-8'
						),
						'text.txt'
					)
				]
			});
		}

		let quantity = 1;
		let duration = Math.floor(quantity * Time.Minute * 1.69);
		let quantityBoosts = [];

		const tackleBoxes = [
			"Champion's tackle box",
			'Professional tackle box',
			'Standard tackle box',
			'Basic tackle box'
		];
		for (let i = 0; i < tackleBoxes.length; i++) {
			if (msg.author.hasItemEquippedOrInBank(tackleBoxes[i])) {
				let num = tackleBoxes.length - i;
				quantityBoosts.push(`${num} for ${tackleBoxes[i]}`);
				quantity += num;
				break;
			}
		}

		if (msg.author.hasItemEquippedOrInBank('Crystal fishing rod')) {
			quantity++;
			quantityBoosts.push('1 for Crystal fishing rod');
		}

		const result = await getUsersFishingContestDetails(msg.author);
		if (result.catchesFromToday.length > 0) {
			return msg.channel.send(
				`You already participated in the Fishing Contest today. You caught: ${result.catchesFromToday
					.map(i => `${i.name}(${i.length_cm / 100}m)`)
					.join(', ')}.`
			);
		}

		const cost = new Bank().add(fishingLocation.bait.id, quantity);
		if (!msg.author.owns(cost)) {
			return msg.channel.send(`You need ${cost} to bait fish at ${fishingLocation.name}.`);
		}
		await msg.author.removeItemsFromBank(cost);
		await updateBankSetting(this.client, ClientSettings.EconomyStats.FishingContestCost, cost);

		await addSubTaskToActivityTask<FishingContestOptions>({
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: 'FishingContest',
			minigameID: 'fishing_contest',
			location: fishingLocation.id
		});

		await trackLoot({
			cost,
			id: 'fishing_contest',
			type: 'Minigame',
			changeType: 'cost'
		});

		return msg.channel.send({
			content: `${msg.author.minionName} is now off to catch ${quantity === 1 ? 'a' : quantity} fish at ${
				fishingLocation.name
			}, they will return in ${formatDuration(duration)}. Removed ${cost} from your bank.${
				quantity > 1
					? `
You're fishing ${quantity - 1} extra fish: ${quantityBoosts.join(', ')}`
					: ''
			}`
		});
	}
}
