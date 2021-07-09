import { Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { Activity } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Prayer from '../../lib/skilling/skills/prayer';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { BuryingActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '<quantity:int{1}|name:...string> [name:...string]',
			usageDelim: ' ',
			categoryFlags: ['minion', 'skilling'],
			examples: ['+bury dragon bones', '+bury 10 bones'],
			description: 'Burys bones from your bank to train prayer.'
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage, [quantity, boneName = '']: [null | number | string, string]) {
		const speedMod = 1;

		if (typeof quantity === 'string') {
			boneName = quantity;
			quantity = null;
		}

		const bone = Prayer.Bones.find(
			bone => stringMatches(bone.name, boneName) || stringMatches(bone.name.split(' ')[0], boneName)
		);

		if (!bone) {
			return msg.channel.send(
				`That's not a valid bone to bury. Valid bones are ${Prayer.Bones.map(bone => bone.name).join(', ')}.`
			);
		}

		if (msg.author.skillLevel(SkillsEnum.Prayer) < bone.level) {
			return msg.channel.send(`${msg.author.minionName} needs ${bone.level} Prayer to bury ${bone.name}.`);
		}

		const timeToBuryABone = speedMod * (Time.Second * 1.2 + Time.Second / 4);

		const maxTripLength = msg.author.maxTripLength(Activity.Burying);

		const quantitySpecified = quantity !== null;
		// If no quantity provided, set it to the max.
		if (quantity === null) {
			const amountOfBonesOwned = msg.author.settings.get(UserSettings.Bank)[bone.inputId];
			if (!amountOfBonesOwned) return msg.channel.send(`You have no ${bone.name}.`);
			quantity = Math.min(Math.floor(maxTripLength / timeToBuryABone), amountOfBonesOwned);
		}

		const cost = new Bank({ [bone.inputId]: quantity });

		if (!msg.author.owns(cost)) {
			return msg.channel.send(`You dont have ${cost}.`);
		}

		const duration = quantity * timeToBuryABone;

		if (duration > maxTripLength) {
			return msg.channel.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					maxTripLength
				)}, try a lower quantity. The highest amount of ${bone.name}s you can bury is ${Math.floor(
					maxTripLength / timeToBuryABone
				)}.`
			);
		}

		await msg.author.removeItemsFromBank(cost);

		await addSubTaskToActivityTask<BuryingActivityTaskOptions>({
			boneID: bone.inputId,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Burying,
			quantitySpecified
		});

		return msg.channel.send(
			`${msg.author.minionName} is now burying ${cost}, it'll take around ${formatDuration(duration)} to finish.`
		);
	}
}
