import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import {
	stringMatches,
	formatDuration,
	rand,
	roll,
	itemNameFromID,
	removeItemFromBank,
	bankHasItem
} from '../../lib/util';
import { Time, Activity, Tasks, Events } from '../../lib/constants';
import { SmeltingActivityTaskOptions } from '../../lib/types/minions';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { UserSettings } from '../../lib/settings/types/UserSettings';
//import { SkillsEnum } from '../../lib/skilling/types';
import { ItemBank } from '../../lib/types';
import itemID from '../../lib/util/itemID';
import resolveItems from '../../lib/util/resolveItems';
import { requiresMinion, minionNotBusy } from '../../lib/minions/decorators';

const Armours = [
	{
	name: 'bronze',
	timeToFinish: Time.Second * 6,
	tokens: 5,
	breakChance1: 4,
	breakChance2: 36,
	breakChance3: 1000
	},
	{
	name: 'iron',
	timeToFinish: Time.Second * 10,
	tokens: 10,
	breakChance1: 10
	},
	{
	name: 'steel',
	timeToFinish: Time.Second * 19,
	tokens: 15,
	breakChance1: 10
	},
	{
	name: 'black',
	timeToFinish: Time.Minute * 0.6,
	tokens: 20,
	},
	{
	name: 'mithril',
	timeToFinish: Time.Minute * 0.833,
	tokens: 25
	},
	{
	name: 'adamant',
	timeToFinish: Time.Minute * 1.125,
	tokens: 30
	},
	{
	name: 'rune',
	timeToFinish: Time.Minute * 1.714,
	tokens: 40
	},
];

const weaponCombination = [
	{
	weapon1: 'longsword',
	weapon2: 'warhammer'
	},
	{
	weapon1: 'mace',
	weapon2: 'battleaxe'
	}
];


export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[minigame:string] [quantity:int{1}] [action:...string]',
			usageDelim: ' ',
			aliases: ['wg', 'warriorguild']
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [minigame = '', quantity = null, action = '']: [string, null | number, string]) {
		minigame = minigame.toLowerCase();
		action = action.toLowerCase();
		await msg.author.settings.sync(true);
		const userBank = msg.author.settings.get(UserSettings.Bank);

		if (minigame === 'animation') {
			const armour = Armours.find(armour =>
				stringMatches(armour.name, action)
			);
			if (armour) {
				const fullhelm = armour.name.concat(' full helm');
				const platelegs = armour.name.concat(' platelegs');
				const platebody = armour.name.concat(' platebody');
				const requiredArmour = resolveItems([fullhelm, platelegs, platebody]);
				for (const piece of requiredArmour) {
					if (!bankHasItem(userBank, piece, 1)) {
						throw `You don't have the required items to kill animated ${action} armour! You are missing atleast ${itemNameFromID(piece)}. Fullhelm, platelegs and platebody is required.`;
					}
				}

				// If no quantity provided, set it to the max.
				if (quantity === null) {
					quantity = Math.floor(msg.author.maxTripLength / armour.timeToFinish);
				}

				const duration = armour.timeToFinish * quantity;

				if (duration > msg.author.maxTripLength) {
					throw `${msg.author.minionName} can't go on trips longer than ${formatDuration(
						msg.author.maxTripLength
					)}, try a lower quantity. The highest amount of animated ${
						armour.name
					} armour you can kill is ${Math.floor(msg.author.maxTripLength / armour.timeToFinish)}.`;
				}

				const data: AnimatedArmourActivityTaskOptions = {
					ArmourID: armour.name,
					userID: msg.author.id,
					channelID: msg.channel.id,
					quantity,
					duration,
					type: Activity.AnimatedArmour,
					id: rand(1, 10_000_000),
					finishDate: Date.now() + duration
				};

				await addSubTaskToActivityTask(this.client, Tasks.MinigameTicker, data);

				let response = `${msg.author.minionName} is now killing ${quantity}x animated ${
					armour.name
				} armour, it'll take around ${formatDuration(duration)} to finish.`;

				return msg.send(response);
			}
			throw `That isn't a valid animated armour tier to kill, the available tiers are: ${Armours
				.map(tier => tier.name)
				.join(', ')}. For example, \`${msg.cmdPrefix}warriorsguild animation 5 bronze\``;
		}

		if (minigame === 'dummy') {
			let armour = Armours[1];
			for (const tier of Armours) {
				armour = tier;
				const longsword = tier.name.concat(' longsword');
				const warhammer = tier.name.concat(' warhammer');
				const mace = tier.name.concat(' mace');
				const battleaxe = tier.name.concat(' battleaxe');
				const requiredWeapons1 = resolveItems([longsword, warhammer]);
				const requiredWeapons2 = resolveItems([mace, battleaxe]);

				for (const weapon1 of requiredWeapons1) {
					if (!bankHasItem(userBank, weapon1, 1)) {
						for (const weapon2 of requiredWeapons2) {
							if (!bankHasItem(userBank, weapon2, 1)) {
								throw `You don't have the required weapon combination to enter the dummy room! You require either ${tier.name} longsword + warhammer or mace + battleaxe.`;
							}
						}
					}
				}
			}

			// If no quantity provided, set it to the max.
			if (quantity === null) {
				quantity = Math.floor(msg.author.maxTripLength / (Time.Second * 7));
			}

			const duration = Time.Second * 7 * quantity;

			if (duration > msg.author.maxTripLength) {
				throw `${msg.author.minionName} can't go on trips longer than ${formatDuration(
					msg.author.maxTripLength
				)}, try a lower quantity. The highest amount of dummies you can whack is ${Math.floor(msg.author.maxTripLength / (Time.Second * 7))}.`;
			}

			const data: DummyRoomActivityTaskOptions = {
				tierID: armour.name,
				userID: msg.author.id,
				channelID: msg.channel.id,
				quantity,
				duration,
				type: Activity.DummyRoom,
				id: rand(1, 10_000_000),
				finishDate: Date.now() + duration
			};

			await addSubTaskToActivityTask(this.client, Tasks.MinigameTicker, data);

			let response = `${msg.author.minionName} is now whacking ${quantity}x dummies, it'll take around ${formatDuration(duration)} to finish.`;

			return msg.send(response);
		}

		if (minigame === 'catapult') {
			// If no quantity provided, set it to the max.
			if (quantity === null) {
				quantity = Math.floor(msg.author.maxTripLength / (Time.Second * 4.5));
			}

			const duration = Time.Second * 4.5 * quantity;

			if (duration > msg.author.maxTripLength) {
				throw `${msg.author.minionName} can't go on trips longer than ${formatDuration(
					msg.author.maxTripLength
				)}, try a lower quantity. The highest amount of catapult shots that can be blocked is ${Math.floor(msg.author.maxTripLength / (Time.Second * 4.5))}.`;
			}

			const data: CatapultRoomActivityTaskOptions = {
				catapultID: 'catapult',
				userID: msg.author.id,
				channelID: msg.channel.id,
				quantity,
				duration,
				type: Activity.CatapultRoom,
				id: rand(1, 10_000_000),
				finishDate: Date.now() + duration
			};

			await addSubTaskToActivityTask(this.client, Tasks.MinigameTicker, data);

			let response = `${msg.author.minionName} is now blocking ${quantity}x catapult shots, it'll take around ${formatDuration(duration)} to finish.`;

			return msg.send(response);
		}

		if (minigame === 'shotput') {
			if (action !== 'light' && action !== 'heavy') {
				throw `That isn't a valid option. The options are either light or heavy. For example, \`${msg.cmdPrefix}warriorsguild shotput 5 light\``;
			}
			// If no quantity provided, set it to the max.
			if (quantity === null) {
				quantity = Math.floor(msg.author.maxTripLength / (Time.Second * 36));
			}

			const duration = Time.Second * 36 * quantity;

			if (duration > msg.author.maxTripLength) {
				throw `${msg.author.minionName} can't go on trips longer than ${formatDuration(
					msg.author.maxTripLength
				)}, try a lower quantity. The highest amount of shot puts that can be thrown is ${Math.floor(msg.author.maxTripLength / (Time.Second * 36))}.`;
			}

			const data: ShotPutRoomActivityTaskOptions = {
				shotputID: action,
				userID: msg.author.id,
				channelID: msg.channel.id,
				quantity,
				duration,
				type: Activity.ShotPutRoom,
				id: rand(1, 10_000_000),
				finishDate: Date.now() + duration
			};

			await addSubTaskToActivityTask(this.client, Tasks.MinigameTicker, data);

			let response = `${msg.author.minionName} is now throwing ${quantity}x shot puts, it'll take around ${formatDuration(duration)} to finish.`;

			return msg.send(response);
		}

		if (minigame === 'jimmy') {
			// If no quantity provided, set it to the max.
			if (quantity === null) {
				quantity = Math.floor(msg.author.maxTripLength / (Time.Second * 7));
			}

			const duration = Time.Second * 7 * quantity;

			if (duration > msg.author.maxTripLength) {
				throw `${msg.author.minionName} can't go on trips longer than ${formatDuration(
					msg.author.maxTripLength
				)}, try a lower quantity. The highest amount of kegs that can be balanced is ${Math.floor(msg.author.maxTripLength / (Time.Second * 7))}.`;
			}

			const data: JimmyChallengeActivityTaskOptions = {
				jimmyID: 'keg',
				userID: msg.author.id,
				channelID: msg.channel.id,
				quantity,
				duration,
				type: Activity.JimmyChallenge,
				id: rand(1, 10_000_000),
				finishDate: Date.now() + duration
			};

			await addSubTaskToActivityTask(this.client, Tasks.MinigameTicker, data);

			let response = `${msg.author.minionName} is now off to balance ${quantity}x kegs on their head, it'll take around ${formatDuration(duration)} to finish.`;

			return msg.send(response);
		}

		if (minigame === 'cyclops') {
			//Check if either 100 warrior guild tokens or attack cape
			if (!bankHasItem(userBank, 8851, 100) && !bankHasItem(userBank, 9747, 1)) {
				throw `You don't have enough Warrior guild tokens to enter the cyclopes room! You need atleast 100 Warrior guild tokens.`;
			};

			// If no quantity provided, set it to the max.
			if (quantity === null) {
				quantity = Math.floor(msg.author.maxTripLength / (Time.Second * 7));
			}

			const duration = Time.Second * 7 * quantity;

			if (duration > msg.author.maxTripLength) {
				throw `${msg.author.minionName} can't go on trips longer than ${formatDuration(
					msg.author.maxTripLength
				)}, try a lower quantity. The highest amount of kegs that can be balanced is ${Math.floor(msg.author.maxTripLength / (Time.Second * 7))}.`;
			}


		}
	}




/*
				//Move this to AnimationActivity
				if (armour.breakChance1) {
					let killsBeforeBreak = 0;
					for (let i = 0; i < kills; i++) {
						if(roll(armour.breakChance1)) {
							break;
						}
						killsBeforeBreak++;
					}
					let str = `You killed ${killsBeforeBreak} before a armour piece broke and recieved ${killsBeforeBreak * armour.tokens}x Warrior guild token.`;

					str += `\nRemoved the following broken armour: `;
					if (armour.name === 'bronze') {
						str += platebody;
						await msg.author.removeItemFromBank(itemID(platebody), 1);
					}
					if (armour.name === 'iron') {
						str += platelegs;
						await msg.author.removeItemFromBank(itemID(platelegs), 1);
					}
					if (armour.name === 'steel') {
						str += fullhelm;
						await msg.author.removeItemFromBank(itemID(fullhelm), 1);
					}
					if (armour.breakChance3) {
						if(roll(armour.breakChance3)) {
							str += `, ` + fullhelm;
							await msg.author.removeItemFromBank(itemID(fullhelm), 1);
						}
						if (roll(armour.breakChance2)) {
							str += `, ` + platelegs;
							await msg.author.removeItemFromBank(itemID(platelegs), 1);
						}
					}
				}
*/
	}
}
