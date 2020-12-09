import { randArrItem } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Tasks, Time } from '../../lib/constants';
import { hasGearEquipped } from '../../lib/gear/functions/hasGearEquipped';
import { MinigameIDsEnum } from '../../lib/minions/data/minigames';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { DeliverPresentsActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, itemID } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { baseSantaOutfit, santaChat } from './santa';

const messages = [
	`You better watch out, You better not cry\nBetter not pout, I'm telling you why\n{username} is coming to town!`,
	`Don't let raccoons steal from your sack.`,
	`Don't get caught in the chimney!`,
	`Keep an eye on Rudolph, he's been known to cause trouble.`,
	`DON'T LOSE MY OUTFIT!`
];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage) {
		if (Date.now() - msg.author.createdTimestamp < Time.Year) {
			return msg.send(
				await santaChat(
					`${msg.author.username}, your account is too new to deliver presents. Your account must be atleast 1 year old.`
				)
			);
		}
		const gear = msg.author.settings.get(UserSettings.Gear.Misc);

		if (!hasGearEquipped(gear, { ...baseSantaOutfit, cape: [itemID('Sack of presents')] })) {
			return msg.send(
				await santaChat(
					`You're not wearing your santa outfit, and sack of presents! Equip them to your misc outfit.`
				)
			);
		}

		await addSubTaskToActivityTask<DeliverPresentsActivityTaskOptions>(
			this.client,
			Tasks.MinigameTicker,
			{
				userID: msg.author.id,
				channelID: msg.channel.id,
				type: Activity.DeliverPresents,
				minigameID: MinigameIDsEnum.DeliverPresents,
				quantity: 1,
				duration: Time.Minute * 30
			}
		);

		return msg.send(
			`${
				msg.author.minionName
			} is now delivering presents, this trip will take around ${formatDuration(
				Time.Minute * 30
			)} to finish.`,
			await santaChat(randArrItem(messages).replace('{username}', msg.author.username))
		);
	}
}
