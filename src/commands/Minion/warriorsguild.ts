import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import {
	stringMatches,
	formatDuration,
	rand,
	itemNameFromID,
	bankHasItem
} from '../../lib/util';
import { Time, Activity, Tasks} from '../../lib/constants';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { AnimatedArmourActivityTaskOptions, DummyRoomActivityTaskOptions, CatapultRoomActivityTaskOptions, ShotputRoomActivityTaskOptions, JimmyChallengeActivityTaskOptions, CyclopsActivityTaskOptions} from '../../lib/types/minions';
import { UserSettings } from '../../lib/settings/types/UserSettings';
//import { SkillsEnum } from '../../lib/skilling/types';
import resolveItems from '../../lib/util/resolveItems';
import { requiresMinion, minionNotBusy } from '../../lib/minions/decorators';

export const Armours = [
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

		// For future
		/*
		if (msg.author.skillLevel(SkillsEnum.Attack) !== 99 || msg.author.skillLevel(SkillsEnum.Strength) !== 99 || (msg.author.skillLevel(SkillsEnum.Attack) + msg.author.skillLevel(SkillsEnum.Strength)) < 130) {
			throw `You need 99 Attack or Strength or a combined attack and strength lvl of 130 to enter the Warriors' guild.`;
		}
		*/

		//Temp for now 
		const attack = 99;
		const strength = 99;
		if (attack !== 99 || strength !== 99 || (attack + strength) < 130) {
			throw `You need 99 Attack or Strength or a combined attack and strength lvl of 130 to enter the Warriors' guild.`;
		}

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
					minigameID: 6185,
					armourID: armour.name,
					userID: msg.author.id,
					channelID: msg.channel.id,
					quantity,
					duration,
					type: Activity.AnimatedArmouring,
					id: rand(1, 10_000_000),
					finishDate: Date.now() + duration / 36000
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
			let gotCombo = false;
			for (const tier of Armours) {
				const longsword = tier.name.concat(' longsword');
				const warhammer = tier.name.concat(' warhammer');
				const mace = tier.name.concat(' mace');
				const battleaxe = tier.name.concat(' battleaxe');
				const requiredWeapons1 = resolveItems([longsword, warhammer]);
				const requiredWeapons2 = resolveItems([mace, battleaxe]);
				
				if ((bankHasItem(userBank, requiredWeapons1[0], 1) && bankHasItem(userBank, requiredWeapons1[1], 1)) || (bankHasItem(userBank, requiredWeapons2[0], 1) && bankHasItem(userBank, requiredWeapons2[1], 1))) {
					gotCombo = true;
					break;
				}	
			}
			if (!gotCombo) {
				throw `You don't have the required weapon combination to enter the dummy room! You require either a longsword + warhammer or mace + battleaxe of same metal tier. For example: bronze longsword + bronze warhammer.`;
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
				minigameID: 823,
				userID: msg.author.id,
				channelID: msg.channel.id,
				quantity,
				duration,
				type: Activity.DummyRooming,
				id: rand(1, 10_000_000),
				finishDate: Date.now() + duration / 36000
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
				minigameID: 671,
				userID: msg.author.id,
				channelID: msg.channel.id,
				quantity,
				duration,
				type: Activity.CatapultRooming,
				id: rand(1, 10_000_000),
				finishDate: Date.now() + duration / 36000
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

			const data: ShotputRoomActivityTaskOptions = {
				minigameID: 8857,
				shotputID: action,
				userID: msg.author.id,
				channelID: msg.channel.id,
				quantity,
				duration,
				type: Activity.ShotputRooming,
				id: rand(1, 10_000_000),
				finishDate: Date.now() + duration / 36000
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
				minigameID: 4286,
				userID: msg.author.id,
				channelID: msg.channel.id,
				quantity,
				duration,
				type: Activity.JimmyChallenge,
				id: rand(1, 10_000_000),
				finishDate: Date.now() + duration / 36000
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
				quantity = Math.floor(msg.author.maxTripLength / (Time.Second * 30));
			}

			const duration = Time.Second * 30 * quantity;

			if (duration > msg.author.maxTripLength) {
				throw `${msg.author.minionName} can't go on trips longer than ${formatDuration(
					msg.author.maxTripLength
				)}, try a lower quantity. The highest amount of cyclopes that can be killed is ${Math.floor(msg.author.maxTripLength / (Time.Second * 30))}.`;
			}

			if (!bankHasItem(userBank, 8851, Math.floor((duration / Time.Minute) * 10 + 10)) && !bankHasItem(userBank, 9747, 1)) {
				throw `You don't have enough Warrior guild tokens to kill cyclopes for ${formatDuration(duration)}, try a lower quantity. You need atleast ${Math.floor((duration / Time.Minute) * 10 + 10)}x Warrior guild tokens to kill ${quantity}x cyclopes.`;
			};

			const data: CyclopsActivityTaskOptions = {
				minigameID: 2097,
				userID: msg.author.id,
				channelID: msg.channel.id,
				quantity,
				duration,
				type: Activity.Cyclopes,
				id: rand(1, 10_000_000),
				finishDate: Date.now() + duration / 36000
			};

			await addSubTaskToActivityTask(this.client, Tasks.MinigameTicker, data);

			let response = `${msg.author.minionName} is now off to kill ${quantity}x cyclopes, it'll take around ${formatDuration(duration)} to finish.`;
			//Check if attack cape
			if (!bankHasItem(userBank, 9747, 1)) {
				response += `\n${Math.floor((duration / Time.Minute) * 10 + 10)} Warrior guild tokens was also removed from the bank.`;
				await msg.author.removeItemFromBank(8851, Math.floor((duration / Time.Minute) * 10 + 10));
			}

			return msg.send(response);
		}

		throw `That isn't a valid Warriors's guild minigame, the possible minigames are animation, dummy, catapult, shotput, jimmy or cyclops. For example, \`${msg.cmdPrefix}warriorsguild animation 5 bronze\``;
	}
}
