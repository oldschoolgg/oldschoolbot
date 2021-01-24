import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Emoji } from '../../lib/constants';
import { hasGracefulEquipped } from '../../lib/gear/functions/hasGracefulEquipped';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import birdhouses from '../../lib/skilling/skills/hunter/birdHouseTrapping';
import { SkillsEnum } from '../../lib/skilling/types';
import { formatDuration, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { BirdhouseActivityTaskOptions } from './../../lib/types/minions';

const birdhouseSeedReq = new Bank()
	.add('Hammerstone seed', 10)
	.add('Asgarnian seed', 10)
	.add('Marrentill seed', 10)
	.add('Barley seed', 10)
	.add('Guam seed', 10)
	.add('Yanillian seed', 10)
	.add('Krandorian seed', 10)
	.add('Tarromin seed', 10)
	.add('Irit seed', 5)
	.add('Wildblood seed', 5)
	.add('Jute seed', 10)
	.add('Harralander seed', 10)
	.add('Dwarf weed seed', 5)
	.add('Kwuarm seed', 5)
	.add('Cadantine seed', 5)
	.add('Lantadyme seed', 5)
	.add('Avantoe seed', 5)
	.add('Toadflax seed', 5)
	.add('Ranarr seed', 5)
	.add('Snapdragon seed', 5)
	.add('Torstol seed', 5);

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
			description: `Allows a player to set up, replace, collect and check birdhouses.`,
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
		const userBank = msg.author.bank();
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
			return msg.send(
				`Please come back when your birdhouses are full in ${formatDuration(
					lastPlacedTime + prevBirdhouse.waitTime - currentDate
				)}!`
			);
		}

		let duration: number = timeBirdHouseRun;

		// Reduce time if user has graceful equipped
		if (hasGracefulEquipped(msg.author.settings.get(UserSettings.Gear.Skilling))) {
			boostStr.push('10% time for Graceful');
			duration *= 0.9;
		}

		let removeBank = new Bank();
		let gotCraft = false;
		if (!prevBirdhouse || msg.flagArgs.nocraft) {
			for (const [item, quantity] of birdhouse.houseItemReq.items()) {
				if (userBank.amount(item.name) < quantity * 4) {
					return msg.send(`You don't have enough ${item.name}s.`);
				}
				removeBank.add(item.id, quantity * 4);
			}
		} else {
			if (msg.author.skillLevel(SkillsEnum.Crafting) < birdhouse.craftLvl) {
				return msg.send(
					`${msg.author.minionName} needs ${birdhouse.craftLvl} Crafting to make ${birdhouse.name} during the run or write \`${msg.cmdPrefix}birdhouse run ${type} --nocraft\`.`
				);
			}
			gotCraft = true;
			for (const [item, quantity] of birdhouse.craftItemReq.items()) {
				if (userBank.amount(item.name) < quantity * 4) {
					return msg.send(`You don't have enough ${item.name}.`);
				}
				removeBank.add(item.id, quantity * 4);
			}
		}

		let canPay = false;
		for (const [paymentID, qty] of birdhouseSeedReq.items()) {
			if (userBank.amount(paymentID.name) >= qty * 4) {
				infoStr.push(`You baited the birdhouses with ${qty * 4}x ${paymentID.name} .`);
				removeBank.add(paymentID.name, qty * 4);
				canPay = true;
				break;
			}
		}

		if (!canPay) {
			return msg.send(`You don't have enough seeds to bait the birdhouses.`);
		}

		await msg.author.removeItemsFromBank(removeBank.bank);

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

		if (!prevBirdhouse) {
			return msg.send(
				`There is no birdhouses available to collect from, try set up some birdhouses, \`${msg.cmdPrefix}birdhouse run normal\`.`
			);
		}

		const lastPlacedTime: number = previousBirdhouseTraps.birdhouseTime;
		const difference = currentDate - lastPlacedTime;
		/* Initiate a cooldown feature for the birdhouses.
			Allows for a run of birdhouses to only be possible after the
			previous run's birdhouses have been filled.*/
		if (difference < prevBirdhouse.waitTime) {
			return msg.send(
				`Please come back when your birdhouses are full in ${formatDuration(
					lastPlacedTime + prevBirdhouse.waitTime - currentDate
				)}!`
			);
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
				contentStr = `Your ${birdhouse.name}s is ready to be collected!\n`;
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
