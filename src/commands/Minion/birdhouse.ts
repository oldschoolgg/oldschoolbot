import { CommandStore, KlasaMessage } from 'klasa';
import { resolveNameBank } from 'oldschooljs/dist/util';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Emoji } from '../../lib/constants';
import { hasGracefulEquipped } from '../../lib/gear/functions/hasGracefulEquipped';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import birdhouses from '../../lib/skilling/skills/hunter/birdhouseTrapping';
import { SkillsEnum } from '../../lib/skilling/types';
import {
	bankHasItem,
	formatDuration,
	itemNameFromID,
	removeItemFromBank,
	stringMatches
} from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { BirdhouseActivityTaskOptions } from './../../lib/types/minions';

const birdhouseSeedReq = resolveNameBank({
	'Hammerstone seed': 10,
	'Asgarnian seed': 10,
	'Marrentill seed': 10,
	'Barley seed': 10,
	'Guam seed': 10,
	'Yanillian seed': 10,
	'Krandorian seed': 10,
	'Tarromin seed': 10,
	'Irit seed': 5,
	'Wildblood seed': 5,
	'Jute seed': 10,
	'Harralander seed': 10,
	'Dwarf weed seed': 5,
	'Kwuarm seed': 5,
	'Cadantine seed': 5,
	'Lantadyme seed': 5,
	'Avantoe seed': 5,
	'Toadflax seed': 5,
	'Ranarr seed': 5,
	'Snapdragon seed': 5,
	'Torstol seed': 5
});

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[run|collect|check] [type:...string]',
			aliases: ['bhr', 'bh'],
			usageDelim: ' ',
			subcommands: true,
			description: `Allows a player to set up a bird house or collect and retrap new house for hunter.`,
			examples: [
				'+birdhouse run yew',
				'+birdhouse',
				'+birdhouse check',
				'+birdhouse collect'
			],
			categoryFlags: ['minion', 'skilling']
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [type = '']: [string]) {
		await msg.author.settings.sync(true);
		const userBank = msg.author.settings.get(UserSettings.Bank);
		const questPoints = msg.author.settings.get(UserSettings.QP);
		const currentDate = new Date().getTime();
		const infoStr: string[] = [];
		const boostStr: string[] = [];

		const birdhouse = birdhouses.find(_birdhouse =>
			_birdhouse.aliases.some(
				alias => stringMatches(alias, type) || stringMatches(alias.split(' ')[0], type)
			)
		);

		if (!birdhouse) {
			return msg.send(
				`That's not a valid birdhouse. Valid bird houses are ${birdhouses
					.map(_birdhouse => _birdhouse.name)
					.join(', ')}.`
			);
		}

		if (msg.author.skillLevel(SkillsEnum.Hunter) < birdhouse.huntLvl) {
			return msg.send(
				`${msg.author.minionName} needs ${birdhouse.huntLvl} Hunter to place ${birdhouse.name}.`
			);
		}

		if (questPoints < birdhouse.qpRequired) {
			return msg.send(
				`${msg.author.minionName} needs ${birdhouse.qpRequired} QP to do Birdhouse runs.`
			);
		}

		const previousBirdhouseTraps = msg.author.settings.get(UserSettings.Minion.BirdhouseTraps);

		const timeBirdHouseRun = birdhouse.runTime;

		const storePreviousBirdhouse = previousBirdhouseTraps.lastPlaced;

		const prevBirdhouse = storePreviousBirdhouse
			? birdhouses.find(
					_birdhouse =>
						stringMatches(_birdhouse.name, storePreviousBirdhouse) ||
						stringMatches(_birdhouse.name.split(' ')[0], storePreviousBirdhouse)
			  )
			: null;

		const lastPlacedTime: number = previousBirdhouseTraps.birdhouseTime;
		const difference = currentDate - lastPlacedTime;
		/* Initiate a cooldown feature for the birdhouses.
			Allows for a run of birdhouses to only be possible after the
			previous run's birdhouses have been filled.*/
		if (prevBirdhouse && difference < prevBirdhouse.waitTime) {
			throw `Please come back when your birdhouses are full in ${formatDuration(
				lastPlacedTime + prevBirdhouse.waitTime - currentDate
			)}!`;
		}

		let duration: number = timeBirdHouseRun;

		// Reduce time if user has graceful equipped
		if (hasGracefulEquipped(msg.author.settings.get(UserSettings.Gear.Skilling))) {
			boostStr.push('10% time for Graceful');
			duration *= 0.9;
		}

		let newBank = { ...userBank };
		let gotCraft = false;
		if (!prevBirdhouse || msg.flagArgs.nocraft) {
			const requiredHouse: [string, number][] = Object.entries(birdhouse.houseItemReq);
			for (const [houseID, qty] of requiredHouse) {
				if (!bankHasItem(userBank, parseInt(houseID), qty * 4)) {
					return msg.send(`You don't have enough ${itemNameFromID(parseInt(houseID))}s.`);
				}
				newBank = removeItemFromBank(newBank, parseInt(houseID), qty * 4);
			}
		} else {
			if (msg.author.skillLevel(SkillsEnum.Crafting) < birdhouse.craftLvl) {
				return msg.send(
					`${msg.author.minionName} needs ${birdhouse.craftLvl} Crafting to make ${birdhouse.name} during the run or write \`${msg.cmdPrefix}birdhouse run ${type} --nocraft\`.`
				);
			}
			gotCraft = true;
			const requiredLogs: [string, number][] = Object.entries(birdhouse.craftItemReq);
			for (const [craftID, qty] of requiredLogs) {
				if (!bankHasItem(userBank, parseInt(craftID), qty * 4)) {
					return msg.send(`You don't have enough ${itemNameFromID(parseInt(craftID))}.`);
				}
				newBank = removeItemFromBank(newBank, parseInt(craftID), qty * 4);
			}
		}

		let canPay = false;
		const requiredSeeds: [string, number][] = Object.entries(birdhouseSeedReq);
		for (const [paymentID, qty] of requiredSeeds) {
			if (bankHasItem(userBank, parseInt(paymentID), qty * 4)) {
				infoStr.push(
					`You baited the birdhouses with ${qty * 4}x ${itemNameFromID(
						parseInt(paymentID)
					)} .`
				);
				newBank = removeItemFromBank(newBank, parseInt(paymentID), qty * 4);
				canPay = true;
				break;
			}
		}

		if (!canPay) {
			return msg.send(`You don't have enough seeds to bait the birdhouses.`);
		}

		await msg.author.settings.update(UserSettings.Bank, newBank);

		// If user does not have something already placed, just place the new birdhouses.
		if (!previousBirdhouseTraps.birdhousePlaced) {
			infoStr.unshift(`${msg.author.minionName} is now placing 4x ${birdhouse.name}.`);
		} else {
			infoStr.unshift(
				`${msg.author.minionName} is now collecting 4x ${storePreviousBirdhouse}, and then placing 4x ${birdhouse.name}.`
			);
		}

		await addSubTaskToActivityTask<BirdhouseActivityTaskOptions>(this.client, {
			birdhouseName: birdhouse.name,
			birdhouseData: previousBirdhouseTraps,
			userID: msg.author.id,
			channelID: msg.channel.id,
			duration,
			placing: true,
			gotCraft,
			currentDate,
			type: Activity.Birdhouse
		});

		return msg.send(
			`${infoStr.join(' ')}\n\nIt'll take around ${formatDuration(duration)} to finish.\n\n${
				boostStr.length > 0 ? `**Boosts**: ` : ``
			}${boostStr.join(', ')}`
		);
	}

	@minionNotBusy
	@requiresMinion
	async collect(msg: KlasaMessage) {
		await msg.author.settings.sync(true);
		const currentDate = new Date().getTime();
		let returnMessageStr = '';
		const boostStr = [];

		const previousBirdhouseTraps = msg.author.settings.get(UserSettings.Minion.BirdhouseTraps);

		const storePreviousBirdhouse = previousBirdhouseTraps.lastPlaced;

		const prevBirdhouse = storePreviousBirdhouse
			? birdhouses.find(
					_birdhouse =>
						stringMatches(_birdhouse.name, storePreviousBirdhouse) ||
						stringMatches(_birdhouse.name.split(' ')[0], storePreviousBirdhouse)
			  )
			: null;

		if (!prevBirdhouse || prevBirdhouse === null) {
			return msg.send(
				`There is no birdhouses available to collect from, try set up some birdhouses, \`${msg.cmdPrefix}birdhouse run normal\`.`
			);
		}

		const lastPlacedTime: number = previousBirdhouseTraps.birdhouseTime;
		const difference = currentDate - lastPlacedTime;
		/* Initiate a cooldown feature for the birdhouses.
			Allows for a run of birdhouses to only be possible after the
			previous run's birdhouses have been filled.*/
		if (prevBirdhouse && difference < prevBirdhouse.waitTime) {
			throw `Please come back when your birdhouses are full in ${formatDuration(
				lastPlacedTime + prevBirdhouse.waitTime - currentDate
			)}!`;
		}

		const timeBirdHouseRun = prevBirdhouse.runTime;
		let duration: number = timeBirdHouseRun;

		// Reduce time if user has graceful equipped
		if (hasGracefulEquipped(msg.author.settings.get(UserSettings.Gear.Skilling))) {
			boostStr.push('10% time for Graceful');
			duration *= 0.9;
		}

		// If user does not have something already placed.
		if (!previousBirdhouseTraps.birdhousePlaced) {
			return msg.send`There is no placed birdhouses to collect from!`;
		}
		returnMessageStr = `${
			msg.author.minionName
		} is now collecting 4x ${storePreviousBirdhouse}.\nIt'll take around ${formatDuration(
			duration
		)} to finish.\n\n${boostStr.length > 0 ? `**Boosts**: ` : ``}${boostStr.join(', ')}`;

		await addSubTaskToActivityTask<BirdhouseActivityTaskOptions>(this.client, {
			birdhouseName: previousBirdhouseTraps.lastPlaced,
			birdhouseData: previousBirdhouseTraps,
			userID: msg.author.id,
			channelID: msg.channel.id,
			duration,
			placing: false,
			gotCraft: false,
			currentDate,
			type: Activity.Birdhouse
		});

		return msg.send(returnMessageStr);
	}

	@requiresMinion
	async check(msg: KlasaMessage) {
		await msg.author.settings.sync(true);
		const currentDate = new Date().getTime();

		let baseStr = '';
		let emojiStr = '';
		let contentStr = '';
		let finalStr = '';
		let nothingPlaced = false;

		const currentBirdHouses = msg.author.settings.get(UserSettings.Minion.BirdhouseTraps);

		if (currentBirdHouses.lastPlaced) {
			const { lastPlaced } = currentBirdHouses;
			const birdhouse = birdhouses.find(_birdhouse =>
				_birdhouse.aliases.some(
					alias =>
						stringMatches(alias, lastPlaced) ||
						stringMatches(alias.split(' ')[0], lastPlaced)
				)
			);

			if (!birdhouse) {
				this.client.wtf(
					new Error(
						`${msg.author.sanitizedName}'s birdhouse traps had no birdhouse found in it.`
					)
				);
				return;
			}
			const lastPlaceTime: number = currentBirdHouses.birdhouseTime;
			const difference = currentDate - lastPlaceTime;
			if (difference < birdhouse.waitTime) {
				emojiStr = `${Emoji.Timer} `;
				contentStr = `Your ${birdhouse.name}s will be ready to collect in ${formatDuration(
					lastPlaceTime + birdhouse.waitTime - currentDate
				)}!\n`;
			} else {
				emojiStr = `${Emoji.Tick} `;
				contentStr = `Your 4x ${birdhouse.name} is ready to be collected!\n`;
			}

			finalStr += emojiStr + baseStr + contentStr;
		} else {
			nothingPlaced = true;
		}

		if (nothingPlaced) {
			finalStr += `${Emoji.RedX} You don't have any birdhouses placed!`;
		}

		return msg.send(finalStr);
	}
}
