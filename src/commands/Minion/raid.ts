import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { EquipmentSlot } from 'oldschooljs/dist/meta/types';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Emoji, Tasks, Time } from '../../lib/constants';
import { GearTypes } from '../../lib/gear';
import resolveGearTypeSetting from '../../lib/gear/functions/resolveGearTypeSetting';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { MakePartyOptions } from '../../lib/types';
import { RaidsActivityTaskOptions } from '../../lib/types/minions';
import { rand } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import getOSItem from '../../lib/util/getOSItem';
import itemID from '../../lib/util/itemID';

const meleeGearBonus = [
	{
		itemID: itemID('Neitiznot faceguard'),
		itemPoint: 5
	},
	{
		itemID: itemID('Serpentine helm'),
		itemPoint: 4
	},
	{
		itemID: itemID('Helm of neitiznot'),
		itemPoint: 3
	},
	{
		itemID: itemID('Void melee helm'),
		itemPoint: 2
	},
	{
		itemID: itemID('Amulet of torture'),
		itemPoint: 5
	},
	{
		itemID: itemID('Amulet of fury'),
		itemPoint: 4
	},
	{
		itemID: itemID('Amulet of glory'),
		itemPoint: 3
	},
	{
		itemID: itemID('Infernal cape'),
		itemPoint: 5
	},
	{
		itemID: itemID('Fire cape'),
		itemPoint: 4
	},
	{
		itemID: itemID('Bandos chestplate'),
		itemPoint: 5
	},
	{
		itemID: itemID('Fighter torso'),
		itemPoint: 4
	},
	{
		itemID: itemID('Void knight top'),
		itemPoint: 3
	},
	{
		itemID: itemID('Bandos tassets'),
		itemPoint: 5
	},
	{
		itemID: itemID('Void knight robe'),
		itemPoint: 3
	},
	{
		itemID: itemID('Scythe of vitur'),
		itemPoint: 5
	},
	{
		itemID: itemID('Dragon hunter lance'),
		itemPoint: 4
	},
	{
		itemID: itemID('Zamorakian hasta'),
		itemPoint: 3
	},
	{
		itemID: itemID('Abyssal tentacle'),
		itemPoint: 2
	},
	{
		itemID: itemID('Abyssal whip'),
		itemPoint: 1
	},
	{
		itemID: itemID('Avernic defender'),
		itemPoint: 5
	},
	{
		itemID: itemID('Dragon defender'),
		itemPoint: 4
	},
	{
		itemID: itemID('Ferocious gloves'),
		itemPoint: 5
	},
	{
		itemID: itemID('Barrows gloves'),
		itemPoint: 4
	},
	{
		itemID: itemID('Void knight gloves'),
		itemPoint: 3
	},
	{
		itemID: itemID('Primordial boots'),
		itemPoint: 5
	},
	{
		itemID: itemID('Dragon boots'),
		itemPoint: 4
	},
	{
		itemID: itemID('Berserker ring (i)'),
		itemPoint: 5
	},
	{
		itemID: itemID('Brimstone ring'),
		itemPoint: 4
	}
];

const rangeGearBonus = [
	{
		itemID: itemID('Armadyl helmet'),
		itemPoint: 5
	},
	{
		itemID: itemID('Void ranger helm'),
		itemPoint: 3
	},
	{
		itemID: itemID('Necklace of anguish'),
		itemPoint: 5
	},
	{
		itemID: itemID('Amulet of fury'),
		itemPoint: 4
	},
	{
		itemID: itemID('Amulet of glory'),
		itemPoint: 3
	},
	{
		itemID: itemID("Ava's assembler"),
		itemPoint: 5
	},
	{
		itemID: itemID("Ava's accumulator"),
		itemPoint: 4
	},
	{
		itemID: itemID('Armadyl chestplate'),
		itemPoint: 5
	},
	{
		itemID: itemID('Void knight top'),
		itemPoint: 3
	},
	{
		itemID: itemID('Armadyl chainskirt'),
		itemPoint: 5
	},
	{
		itemID: itemID('Void knight robe'),
		itemPoint: 3
	},
	{
		itemID: itemID('Twisted bow'),
		itemPoint: 9
	},
	{
		itemID: itemID('Dragon hunter crossbow'),
		itemPoint: 4
	},
	{
		itemID: itemID('Armadyl crossbow'),
		itemPoint: 3
	},
	{
		itemID: itemID('Dragon crossbow'),
		itemPoint: 2
	},
	{
		itemID: itemID('Rune crossbow'),
		itemPoint: 1
	},
	{
		itemID: itemID('Twisted buckler'),
		itemPoint: 5
	},
	{
		itemID: itemID('Book of law'),
		itemPoint: 4
	},
	{
		itemID: itemID('Dragon arrow'),
		itemPoint: 5
	},
	{
		itemID: itemID('Amethyst arrow'),
		itemPoint: 5
	},
	{
		itemID: itemID('Ruby dragon bolts (e)'),
		itemPoint: 4
	},
	{
		itemID: itemID('Ruby bolts (e)'),
		itemPoint: 3
	},
	{
		itemID: itemID('Barrows gloves'),
		itemPoint: 5
	},
	{
		itemID: itemID('Void knight gloves'),
		itemPoint: 4
	},
	{
		itemID: itemID('Pegasian boots'),
		itemPoint: 5
	}
];

const mageGearBonus = [
	{
		itemID: itemID('Ancestral hat'),
		itemPoint: 5
	},
	{
		itemID: itemID("Ahrim's hood"),
		itemPoint: 4
	},
	{
		itemID: itemID('Void mage helm'),
		itemPoint: 3
	},
	{
		itemID: itemID('Occult necklace'),
		itemPoint: 5
	},
	{
		itemID: itemID('Amulet of fury'),
		itemPoint: 4
	},
	{
		itemID: itemID('Amulet of glory'),
		itemPoint: 3
	},
	{
		itemID: itemID('Imbued saradomin cape'),
		itemPoint: 5
	},
	{
		itemID: itemID('Saradomin cape'),
		itemPoint: 4
	},
	{
		itemID: itemID('Ancestral robe top'),
		itemPoint: 5
	},
	{
		itemID: itemID("Ahrim's robetop"),
		itemPoint: 4
	},
	{
		itemID: itemID('Void knight top'),
		itemPoint: 3
	},
	{
		itemID: itemID('Ancestral robe bottom'),
		itemPoint: 5
	},
	{
		itemID: itemID('Ancestral robe bottom'),
		itemPoint: 5
	},
	{
		itemID: itemID("Ahrim's robeskirt"),
		itemPoint: 4
	},
	{
		itemID: itemID('Void knight robe'),
		itemPoint: 3
	},
	{
		itemID: itemID('Harmonised nightmare staff'),
		itemPoint: 5
	},
	{
		itemID: itemID('Sanguinesti staff'),
		itemPoint: 4
	},
	{
		itemID: itemID('Trident of the swamp'),
		itemPoint: 3
	},
	{
		itemID: itemID('Trident of the seas'),
		itemPoint: 2
	},
	{
		itemID: itemID('Arcane spirit shield'),
		itemPoint: 5
	},
	{
		itemID: itemID('Book of darkness'),
		itemPoint: 4
	},
	{
		itemID: itemID('Tormented bracelet'),
		itemPoint: 5
	},
	{
		itemID: itemID('Barrows gloves'),
		itemPoint: 4
	},
	{
		itemID: itemID('Void knight gloves'),
		itemPoint: 3
	}
];

const MAX_itemPoints = 55 + 54 + 40 + 15;

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			requiredPermissions: ['ADD_REACTIONS', 'ATTACH_FILES'],
			oneAtTime: true
		});
	}

	checkReqs(users: KlasaUser[]) {
		// Check if every user has the requirements for this raid.
		for (const user of users) {
			if (!user.hasMinion) {
				throw `${user.username} can't do raids, because they don't have a minion.`;
			}

			if (user.minionIsBusy) {
				throw `${user.username} is busy and can't join the raid.`;
			}
		}
	}

	gearPointCalc(user: KlasaUser) {
		// Calculates the amount of raid points based on current gear
		const currentEquippedMeleeGear = user.settings.get(
			resolveGearTypeSetting(GearTypes.GearSetupTypes.Melee)
		);
		const currentEquippedRangeGear = user.settings.get(
			resolveGearTypeSetting(GearTypes.GearSetupTypes.Range)
		);
		const currentEquippedMageGear = user.settings.get(
			resolveGearTypeSetting(GearTypes.GearSetupTypes.Mage)
		);
		let meleeGearPoints = 0;
		let rangeGearPoints = 0;
		let mageGearPoints = 0;
		// Scores the melee gear
		for (const key of Object.values(EquipmentSlot) as EquipmentSlot[]) {
			// Get the item equipped in that slot...
			const itemSlot = currentEquippedMeleeGear[key];
			if (!itemSlot) continue;
			const item = getOSItem(itemSlot.item);
			if (!item.equipment) continue;
			// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
			// @ts-ignore
			meleeGearPoints +=
				meleeGearBonus.find(_item => _item.itemID === item.id)?.itemPoint ?? 0;
		}
		// Scores the range gear
		for (const key of Object.values(EquipmentSlot) as EquipmentSlot[]) {
			// Get the item equipped in that slot...
			const itemSlot = currentEquippedRangeGear[key];
			if (!itemSlot) continue;
			const item = getOSItem(itemSlot.item);
			if (!item.equipment) continue;
			rangeGearPoints +=
				rangeGearBonus.find(_item => _item.itemID === item.id)?.itemPoint ?? 0;
		}
		// Scores the mage gear
		for (const key of Object.values(EquipmentSlot) as EquipmentSlot[]) {
			// Get the item equipped in that slot...
			const itemSlot = currentEquippedMageGear[key];
			if (!itemSlot) continue;
			const item = getOSItem(itemSlot.item);
			if (!item.equipment) continue;
			mageGearPoints += mageGearBonus.find(_item => _item.itemID === item.id)?.itemPoint ?? 0;
		}

		let totalGearPoints = meleeGearPoints + rangeGearPoints + mageGearPoints;

		// Check spec weapons
		// DWH
		if (user.hasItemEquippedOrInBank(13576)) {
			totalGearPoints += 5;
		}
		// BGS
		if (user.hasItemEquippedOrInBank(11804)) {
			totalGearPoints += 5;
		}
		// Toxic blowpipe
		if (user.hasItemEquippedOrInBank(12926)) {
			totalGearPoints += 5;
		}
		// Returns base raid points based on gear and gear score.
		return [totalGearPoints * 100 + 15000, totalGearPoints];
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage) {
		this.checkReqs([msg.author]);

		const partyOptions: MakePartyOptions = {
			leader: msg.author,
			minSize: msg.author.getMinigameScore(6969) > 200 ? 1 : 2,
			maxSize: 50,
			message: `${msg.author.username} is starting a party to defeat the Chambers of Xeric! Anyone can click the ${Emoji.Join} reaction to join, click it again to leave.`,
			customDenier: user => {
				if (!user.hasMinion) {
					return [true, "you don't have a minion."];
				}
				if (user.minionIsBusy) {
					return [true, 'your minion is busy.'];
				}
				return [false];
			}
		};

		const users = await msg.makePartyAwaiter(partyOptions);

		// Gives experienced players a small time boost to raid
		let teamKCBoost = 0;
		for (const user of users) {
			teamKCBoost += Math.floor(user.getMinigameScore(6969) / 10);
		}

		let duration;
		if (users.length <= 10) {
			duration =
				Time.Minute * 20 +
				(Time.Minute * 40 - users.length * (Time.Minute * 3)) +
				rand(Time.Minute * 2, Time.Minute * 10);
		} else if (users.length <= 20) {
			duration =
				Time.Minute * 20 +
				(Time.Minute * 35 - users.length * (Time.Minute * 2)) +
				rand(Time.Minute * 2, Time.Minute * 10);
		} else {
			duration =
				Time.Minute * 20 +
				(Time.Minute * 35 - users.length * Number(Time.Minute)) +
				rand(Time.Minute * 2, Time.Minute * 10);
		}
		// Max 25% boost for experienced raiders
		if (teamKCBoost > 25) {
			teamKCBoost = 25;
		}
		duration *= (100 - teamKCBoost) / 100;
		duration = Math.max(Time.Minute * 30, duration);
		this.checkReqs(users);

		const data: RaidsActivityTaskOptions = {
			duration,
			challengeMode: false,
			channelID: msg.channel.id,
			quantity: 1,
			partyLeaderID: msg.author.id,
			userID: msg.author.id,
			type: Activity.Raids,
			id: rand(1, 10_000_000).toString(),
			finishDate: Date.now() + duration,
			users: users.map(u => u.id),
			team: users.map(u => {
				let points = (this.gearPointCalc(u)[0] * (100 - rand(0, 20))) / 100;
				const kc = msg.author.getMinigameScore(6969);
				if (kc < 5) {
					points /= 5;
				} else if (kc < 20) {
					points /= 3;
				}
				return {
					id: u.id,
					personalPoints: points,
					canReceiveDust: rand(1, 10) <= 7,
					canReceiveAncientTablet: u.hasItemEquippedOrInBank('Ancient tablet')
				};
			})
		};

		await addSubTaskToActivityTask(this.client, Tasks.MinigameTicker, data);
		for (const user of users) user.incrementMinionDailyDuration(duration);

		return msg.channel.send(
			`The raid is starting...${teamKCBoost}% boost for team KC, the leader is ${
				msg.author.username
			}, and the party members are: ${users
				.map(
					u =>
						`${u.username}: Gear score: ${
							this.gearPointCalc(u)[1]
						} of ${MAX_itemPoints}`
				)
				.join(
					', '
				)}.\nYour personal points are mainly based off the gear you're wearing. For more information, see <https://oldschool.runescape.wiki/w/Chambers_of_Xeric/Strategies>`
		);
	}
}
