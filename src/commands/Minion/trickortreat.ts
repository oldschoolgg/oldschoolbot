import { MessageAttachment } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Tasks, Time } from '../../lib/constants';
import { GearRequired, hasGearEquipped } from '../../lib/gear/functions/hasGearEquipped';
import chatHeadImage from '../../lib/image/chatHeadImage';
import { MinigameIDsEnum } from '../../lib/minions/data/minigames';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { TrickTreatActivityTaskOptions } from '../../lib/types/minions';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import resolveItems from '../../lib/util/resolveItems';

const scaryItems: GearRequired = {
	head: resolveItems([
		'Skeleton mask',
		'Red halloween mask',
		'Blue halloween mask',
		'Green halloween mask'
	]),
	body: resolveItems(['Skeleton shirt']),
	legs: resolveItems(['Skeleton leggings']),
	hands: resolveItems(['Skeleton gloves']),
	feet: resolveItems(['Skeleton boots']),
	weapon: resolveItems(['Scythe'])
};

async function deathImage(str: string) {
	const image = await chatHeadImage({
		content: str,
		name: 'Death',
		head: 'death'
	});
	return new MessageAttachment(image);
}

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
		const gear = msg.author.settings.get(UserSettings.Gear.Misc);

		if (!hasGearEquipped(gear, scaryItems)) {
			return msg.send(
				await deathImage(
					`${msg.author.username}, what a pitiful halloween outfit! You won't scare anyone with that. Go kill some skeletons for a scary outfit, and create a scythe from steel and wood - and equip them in your Misc outfit.`
				)
			);
		}

		await addSubTaskToActivityTask<TrickTreatActivityTaskOptions>(
			this.client,
			Tasks.MinigameTicker,
			{
				userID: msg.author.id,
				channelID: msg.channel.id,
				type: Activity.TrickTreat,
				minigameID: MinigameIDsEnum.TrickOrTreat,
				quantity: 1,
				duration: Time.Minute * 30
			}
		);
	}
}
