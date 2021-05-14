import { CommandStore, KlasaMessage } from 'klasa';

import { Activity, Time, xpBoost } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Prayer from '../../lib/skilling/skills/prayer';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { OfferingActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import getOSItem from '../../lib/util/getOSItem';

const specialBones = [
	{
		item: getOSItem('Long bone'),
		xp: 4500
	},
	{
		item: getOSItem('Curved bone'),
		xp: 6750
	}
];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '<quantity:int{1}|name:...string> [name:...string]',
			usageDelim: ' ',
			categoryFlags: ['minion', 'skilling'],
			description: 'Sends your minion to offer bones to the chaos altar.',
			examples: ['+offer dragon bones']
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage, [quantity, boneName = '']: [null | number | string, string]) {
		const userBank = msg.author.bank();

		if (typeof quantity === 'string') {
			boneName = quantity;
			quantity = null;
		}

		const specialBone = specialBones.find(bone => stringMatches(bone.item.name, boneName));
		if (specialBone) {
			if (msg.author.settings.get(UserSettings.QP) < 8) {
				return msg.send(`You need atleast 8 QP to offer long/curved bones for XP.`);
			}
			if (msg.author.skillLevel(SkillsEnum.Construction) < 30) {
				return msg.send(
					`You need atleast level 30 Construction to offer long/curved bones for XP.`
				);
			}
			const amountHas = userBank.amount(specialBone.item.id);
			if (quantity === null) quantity = Math.max(amountHas, 1);
			if (amountHas < quantity) {
				return msg.send(
					`You don't have ${quantity}x ${specialBone.item.name}, you have ${amountHas}.`
				);
			}
			const xp = quantity * specialBone.xp;
			await Promise.all([
				msg.author.addXP(SkillsEnum.Construction, xp),
				msg.author.removeItemFromBank(specialBone.item.id, quantity)
			]);
			return msg.send(
				`You handed over ${quantity} ${specialBone.item.name}${
					quantity > 1 ? "'s" : ''
				} to Barlak and received ${xp} Construction XP.`
			);
		}

		const speedMod = 4.8;

		const bone = Prayer.Bones.find(
			bone =>
				stringMatches(bone.name, boneName) ||
				stringMatches(bone.name.split(' ')[0], boneName)
		);

		if (!bone) {
			return msg.send(
				`That's not a valid bone to offer. Valid bones are ${Prayer.Bones.map(
					bone => bone.name
				).join(', ')}.`
			);
		}

		if (msg.author.skillLevel(SkillsEnum.Prayer) < bone.level) {
			return msg.send(
				`${msg.author.minionName} needs ${bone.level} Prayer to offer ${bone.name}.`
			);
		}

		const timeToBuryABone = speedMod * (Time.Second * 1.2 + Time.Second / 4);

		const amountOfThisBone = userBank.amount(bone.inputId);
		if (!amountOfThisBone) return msg.send(`You have no ${bone.name}.`);

		const maxTripLength = 200984200 

		// If no quantity provided, set it to the max.
		if (quantity === null) {
			quantity = Math.min(Math.floor(maxTripLength / timeToBuryABone), amountOfThisBone);
		}

		// Check the user has the required bones to bury.
		if (amountOfThisBone < quantity) {
			return msg.send(`You dont have ${quantity}x ${bone.name}.`);
		}

		const duration = quantity * timeToBuryABone * xpBoost;

		if (duration > maxTripLength) {
			return msg.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					maxTripLength
				)}, try a lower quantity. The highest amount of ${
					bone.name
				}s you can bury is ${Math.floor(maxTripLength / timeToBuryABone)}.`
			);
		}

		await msg.author.removeItemFromBank(bone.inputId, quantity);

		await addSubTaskToActivityTask<OfferingActivityTaskOptions>(this.client, {
			boneID: bone.inputId,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Offering
		});
		return msg.send(
			`${msg.author.minionName} is now offering ${quantity}x ${
				bone.name
			} at the Chaos altar, it'll take around ${formatDuration(duration)} to finish.`
		);
	}
}
