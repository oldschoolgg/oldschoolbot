import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Tasks, Time } from '../../lib/constants';
import { MinigameIDsEnum } from '../../lib/minions/data/minigames';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import {
	AnimatedArmourActivityTaskOptions,
	CyclopsActivityTaskOptions
} from '../../lib/types/minions';
import { bankHasItem, formatDuration, itemNameFromID, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
// import { SkillsEnum } from '../../lib/skilling/types';
import resolveItems from '../../lib/util/resolveItems';

export const Armours = [
	{
		name: 'black',
		timeToFinish: Time.Minute * 0.65,
		tokens: 20
	},
	{
		name: 'mithril',
		timeToFinish: Time.Minute * 0.95,
		tokens: 25
	},
	{
		name: 'adamant',
		timeToFinish: Time.Minute * 1.15,
		tokens: 30
	},
	{
		name: 'rune',
		timeToFinish: Time.Minute * 1.2,
		tokens: 40
	}
];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[quantity:int{1}] [minigame:string] [action:string]',
			usageDelim: ' ',
			aliases: ['wg', 'warriorguild']
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(
		msg: KlasaMessage,
		[quantity = null, minigame = '', action = '']: [null | number, string, string]
	) {
		minigame = minigame.toLowerCase();
		action = action.toLowerCase();
		await msg.author.settings.sync(true);
		const userBank = msg.author.settings.get(UserSettings.Bank);

		// For future
		/*
		if (msg.author.skillLevel(SkillsEnum.Attack) !== 99 || msg.author.skillLevel(SkillsEnum.Strength) !== 99 || (msg.author.skillLevel(SkillsEnum.Attack) + msg.author.skillLevel(SkillsEnum.Strength)) < 130) {
			return msg.send(`You need 99 Attack or Strength or a combined attack and strength lvl of 130 to enter the Warriors' guild.`);
		}
		*/

		// Temp for now
		const attack = 99;
		const strength = 99;
		if (attack !== 99 || strength !== 99 || attack + strength < 130) {
			return msg.send(
				`You need 99 Attack or Strength or a combined attack and strength lvl of 130 to enter the Warriors' guild.`
			);
		}

		if (minigame === 'animated') {
			if (action === '') {
				action = 'rune';
			}
			const armour = Armours.find(armour => stringMatches(armour.name, action));
			if (armour) {
				const fullhelm = armour.name.concat(' full helm');
				const platelegs = armour.name.concat(' platelegs');
				const platebody = armour.name.concat(' platebody');
				const requiredArmour = resolveItems([fullhelm, platelegs, platebody]);
				for (const piece of requiredArmour) {
					if (!bankHasItem(userBank, piece, 1)) {
						return msg.send(
							`You don't have the required items to kill animated ${action} armour! You are missing at least a ${itemNameFromID(
								piece
							)}. A fullhelm, platelegs and platebody are required.`
						);
					}
				}

				// If no quantity provided, set it to the max.
				if (quantity === null) {
					quantity = Math.floor(msg.author.maxTripLength / armour.timeToFinish);
				}

				const duration = armour.timeToFinish * quantity;

				if (duration > msg.author.maxTripLength) {
					return msg.send(
						`${msg.author.minionName} can't go on trips longer than ${formatDuration(
							msg.author.maxTripLength
						)}, try a lower quantity. The highest amount of animated ${
							armour.name
						} armour you can kill is ${Math.floor(
							msg.author.maxTripLength / armour.timeToFinish
						)}.`
					);
				}

				await addSubTaskToActivityTask<AnimatedArmourActivityTaskOptions>(
					this.client,
					Tasks.MinigameTicker,
					{
						minigameID: MinigameIDsEnum.AnimatedArmour,
						armourID: armour.name,
						userID: msg.author.id,
						channelID: msg.channel.id,
						quantity,
						duration,
						type: Activity.AnimatedArmour
					}
				);

				const response = `${msg.author.minionName} is now killing ${quantity}x animated ${
					armour.name
				} armour, it'll take around ${formatDuration(duration)} to finish.`;

				return msg.send(response);
			}
			return msg.send(
				`That isn't a valid animated armour tier to kill, the available tiers are: ${Armours.map(
					tier => tier.name
				).join(', ')}. For example, \`${msg.cmdPrefix}warriorsguild 5 animated bronze\``
			);
		}

		if (minigame === 'cyclops') {
			// Check if either 100 warrior guild tokens or attack cape (similar items in future)
			if (!bankHasItem(userBank, 8851, 100) && !bankHasItem(userBank, 9747, 1)) {
				return msg.send(
					`You don't have enough Warrior guild tokens to enter the cyclopes room! You need atleast 100 Warrior guild tokens.`
				);
			}

			// If no quantity provided, set it to the max.
			if (quantity === null) {
				const maxTokensTripLength =
					Math.floor((msg.author.numItemsInBankSync(8851) - 10) / 10) * Time.Minute;
				quantity = Math.floor(
					(maxTokensTripLength > msg.author.maxTripLength
						? msg.author.maxTripLength
						: maxTokensTripLength) /
						(Time.Second * 30)
				);
				if (bankHasItem(userBank, 9747, 1)) {
					quantity = Math.floor(msg.author.maxTripLength / (Time.Second * 30));
				}
			}

			const duration = Time.Second * 30 * quantity;

			if (duration > msg.author.maxTripLength) {
				return msg.send(
					`${msg.author.minionName} can't go on trips longer than ${formatDuration(
						msg.author.maxTripLength
					)}, try a lower quantity. The highest amount of cyclopes that can be killed is ${Math.floor(
						msg.author.maxTripLength / (Time.Second * 30)
					)}.`
				);
			}

			if (
				!bankHasItem(userBank, 8851, Math.floor((duration / Time.Minute) * 10 + 10)) &&
				!bankHasItem(userBank, 9747, 1)
			) {
				return msg.send(
					`You don't have enough Warrior guild tokens to kill cyclopes for ${formatDuration(
						duration
					)}, try a lower quantity. You need atleast ${Math.floor(
						(duration / Time.Minute) * 10 + 10
					)}x Warrior guild tokens to kill ${quantity}x cyclopes.`
				);
			}

			await addSubTaskToActivityTask<CyclopsActivityTaskOptions>(
				this.client,
				Tasks.MinigameTicker,
				{
					minigameID: 2097,
					userID: msg.author.id,
					channelID: msg.channel.id,
					quantity,
					duration,
					type: Activity.Cyclops
				}
			);

			let response = `${
				msg.author.minionName
			} is now off to kill ${quantity}x cyclopes, it'll take around ${formatDuration(
				duration
			)} to finish.`;
			// Check if attack cape
			if (!bankHasItem(userBank, 9747, 1)) {
				response += `\n${Math.floor(
					(duration / Time.Minute) * 10 + 10
				)} Warrior guild tokens was also removed from the bank.`;
				await msg.author.removeItemFromBank(
					8851,
					Math.floor((duration / Time.Minute) * 10 + 10)
				);
			}

			return msg.send(response);
		}

		return msg.send(
			`That isn't a valid Warriors's guild minigame, the possible minigames are animated or cyclops. For example, \`${msg.cmdPrefix}warriorsguild 5 animated bronze\``
		);
	}
}
