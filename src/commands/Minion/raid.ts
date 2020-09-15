import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { rand } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { Tasks, Time, Activity, Emoji } from '../../lib/constants';
import { RaidsActivityTaskOptions } from '../../lib/types/minions';
import { MakePartyOptions } from '../../lib/types';
import itemID from '../../lib/util/itemID';
import { GearTypes } from '../../lib/gear';
import resolveGearTypeSetting from '../../lib/gear/functions/resolveGearTypeSetting';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';

const meleeGearBonus = [
	{
		itemID: itemID('Neitiznot faceguard'),
		itemPoint: 5,
		head: true
	},
	{
		itemID: itemID('Serpentine helm'),
		itemPoint: 4,
		head: true
	},
	{
		itemID: itemID('Helm of neitiznot'),
		itemPoint: 3,
		head: true
	},
	{
		itemID: itemID('Void melee helm'),
		itemPoint: 2,
		head: true
	},
	{
		itemID: itemID('Amulet of torture'),
		itemPoint: 5,
		neck: true
	},
	{
		itemID: itemID('Amulet of fury'),
		itemPoint: 4,
		neck: true
	},
	{
		itemID: itemID('Amulet of glory'),
		itemPoint: 3,
		neck: true
	},
	{
		itemID: itemID('Infernal cape'),
		itemPoint: 5,
		cape: true
	},
	{
		itemID: itemID('Fire cape'),
		itemPoint: 4,
		cape: true
	},
	{
		itemID: itemID('Bandos chestplate'),
		itemPoint: 5,
		chest: true
	},
	{
		itemID: itemID('Fighter torso'),
		itemPoint: 4,
		chest: true
	},
	{
		itemID: itemID('Void knight top'),
		itemPoint: 3,
		chest: true
	},
	{
		itemID: itemID('Bandos tassets'),
		itemPoint: 5,
		legs: true
	},
	{
		itemID: itemID('Void knight robe'),
		itemPoint: 3,
		legs: true
	},
	{
		itemID: itemID('Scythe of vitur'),
		itemPoint: 5,
		weapon: true
	},
	{
		itemID: itemID('Dragon hunter lance'),
		itemPoint: 4,
		weapon: true
	},
	{
		itemID: itemID('Zamorakian hasta'),
		itemPoint: 3,
		weapon: true
	},
	{
		itemID: itemID('Abyssal tentacle'),
		itemPoint: 2,
		weapon: true
	},
	{
		itemID: itemID('Abyssal whip'),
		itemPoint: 1,
		weapon: true
	},
	{
		itemID: itemID('Avernic defender'),
		itemPoint: 5,
		shield: true
	},
	{
		itemID: itemID('Dragon defender'),
		itemPoint: 4,
		shield: true
	},
	{
		itemID: itemID('Ferocious gloves'),
		itemPoint: 5,
		gloves: true
	},
	{
		itemID: itemID('Barrows gloves'),
		itemPoint: 4,
		gloves: true
	},
	{
		itemID: itemID('Void knight gloves'),
		itemPoint: 3,
		gloves: true
	},
	{
		itemID: itemID('Primordial boots'),
		itemPoint: 5,
		boots: true
	},
	{
		itemID: itemID('Dragon boots'),
		itemPoint: 4,
		boots: true
	},
	{
		itemID: itemID('Berserker ring (i)'),
		itemPoint: 5,
		ring: true
	},
	{
		itemID: itemID('Brimstone ring'),
		itemPoint: 4,
		ring: true
	}
];

const rangeGearBonus = [
	{
		itemID: itemID('Armadyl helmet'),
		itemPoint: 5,
		head: true
	},
	{
		itemID: itemID('Void ranger helm'),
		itemPoint: 3,
		head: true
	},
	{
		itemID: itemID('Necklace of anguish'),
		itemPoint: 5,
		neck: true
	},
	{
		itemID: itemID('Amulet of fury'),
		itemPoint: 4,
		neck: true
	},
	{
		itemID: itemID('Amulet of glory'),
		itemPoint: 3,
		neck: true
	},
	{
		itemID: itemID("Ava's assembler"),
		itemPoint: 5,
		cape: true
	},
	{
		itemID: itemID("Ava's accumulator"),
		itemPoint: 4,
		cape: true
	},
	{
		itemID: itemID('Armadyl chestplate'),
		itemPoint: 5,
		chest: true
	},
	{
		itemID: itemID('Void knight top'),
		itemPoint: 3,
		chest: true
	},
	{
		itemID: itemID('Armadyl chainskirt'),
		itemPoint: 5,
		legs: true
	},
	{
		itemID: itemID('Void knight robe'),
		itemPoint: 3,
		legs: true
	},
	{
		itemID: itemID('Twisted bow'),
		itemPoint: 9,
		weapon: true
	},
	{
		itemID: itemID('Dragon hunter crossbow'),
		itemPoint: 4,
		weapon: true
	},
	{
		itemID: itemID('Armadyl crossbow'),
		itemPoint: 3,
		weapon: true
	},
	{
		itemID: itemID('Dragon crossbow'),
		itemPoint: 2,
		weapon: true
	},
	{
		itemID: itemID('Rune crossbow'),
		itemPoint: 1,
		weapon: true
	},
	{
		itemID: itemID('Twisted buckler'),
		itemPoint: 5,
		shield: true
	},
	{
		itemID: itemID('Book of law'),
		itemPoint: 4,
		shield: true
	},
	{
		itemID: itemID('Dragon arrow'),
		itemPoint: 5,
		ammo: true
	},
	{
		itemID: itemID('Amethyst arrow'),
		itemPoint: 5,
		ammo: true
	},
	{
		itemID: itemID('Ruby dragon bolts (e)'),
		itemPoint: 4,
		ammo: true
	},
	{
		itemID: itemID('Ruby bolts (e)'),
		itemPoint: 3,
		ammo: true
	},
	{
		itemID: itemID('Barrows gloves'),
		itemPoint: 5,
		gloves: true
	},
	{
		itemID: itemID('Void knight gloves'),
		itemPoint: 4,
		gloves: true
	},
	{
		itemID: itemID('Pegasian boots'),
		itemPoint: 5,
		boots: true
	}
];

const mageGearBonus = [
	{
		itemID: itemID('Ancestral hat'),
		itemPoint: 5,
		head: true
	},
	{
		itemID: itemID("Ahrim's hood"),
		itemPoint: 4,
		head: true
	},
	{
		itemID: itemID('Void mage helm'),
		itemPoint: 3,
		head: true
	},
	{
		itemID: itemID('Occult necklace'),
		itemPoint: 5,
		neck: true
	},
	{
		itemID: itemID('Amulet of fury'),
		itemPoint: 4,
		neck: true
	},
	{
		itemID: itemID('Amulet of glory'),
		itemPoint: 3,
		neck: true
	},
	{
		itemID: itemID('Imbued saradomin cape'),
		itemPoint: 5,
		cape: true
	},
	{
		itemID: itemID('Saradomin cape'),
		itemPoint: 4,
		cape: true
	},
	{
		itemID: itemID('Ancestral robe top'),
		itemPoint: 5,
		chest: true
	},
	{
		itemID: itemID("Ahrim's robetop"),
		itemPoint: 4,
		chest: true
	},
	{
		itemID: itemID('Void knight top'),
		itemPoint: 3,
		chest: true
	},
	{
		itemID: itemID('Ancestral robe bottom'),
		itemPoint: 5,
		legs: true
	},
	{
		itemID: itemID('Ancestral robe bottom'),
		itemPoint: 5,
		legs: true
	},
	{
		itemID: itemID("Ahrim's robeskirt"),
		itemPoint: 4,
		legs: true
	},
	{
		itemID: itemID('Void knight robe'),
		itemPoint: 3,
		legs: true
	},
	{
		itemID: itemID('Harmonised nightmare staff'),
		itemPoint: 5,
		weapon: true
	},
	{
		itemID: itemID('Sanguinesti staff'),
		itemPoint: 4,
		weapon: true
	},
	{
		itemID: itemID('Trident of the swamp'),
		itemPoint: 3,
		weapon: true
	},
	{
		itemID: itemID('Trident of the seas'),
		itemPoint: 2,
		weapon: true
	},
	{
		itemID: itemID('Arcane spirit shield'),
		itemPoint: 5,
		shield: true
	},
	{
		itemID: itemID('Book of darkness'),
		itemPoint: 4,
		shield: true
	},
	{
		itemID: itemID('Tormented bracelet'),
		itemPoint: 5,
		gloves: true
	},
	{
		itemID: itemID('Barrows gloves'),
		itemPoint: 4,
		gloves: true
	},
	{
		itemID: itemID('Void knight gloves'),
		itemPoint: 3,
		gloves: true
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
		meleeGearPoints +=
			meleeGearBonus.find(item => item.itemID === currentEquippedMeleeGear['2h']?.item)
				?.itemPoint ?? 0;
		meleeGearPoints +=
			meleeGearBonus.find(item => item.itemID === currentEquippedMeleeGear.body?.item)
				?.itemPoint ?? 0;
		meleeGearPoints +=
			meleeGearBonus.find(item => item.itemID === currentEquippedMeleeGear.cape?.item)
				?.itemPoint ?? 0;
		meleeGearPoints +=
			meleeGearBonus.find(item => item.itemID === currentEquippedMeleeGear.feet?.item)
				?.itemPoint ?? 0;
		meleeGearPoints +=
			meleeGearBonus.find(item => item.itemID === currentEquippedMeleeGear.hands?.item)
				?.itemPoint ?? 0;
		meleeGearPoints +=
			meleeGearBonus.find(item => item.itemID === currentEquippedMeleeGear.head?.item)
				?.itemPoint ?? 0;
		meleeGearPoints +=
			meleeGearBonus.find(item => item.itemID === currentEquippedMeleeGear.legs?.item)
				?.itemPoint ?? 0;
		meleeGearPoints +=
			meleeGearBonus.find(item => item.itemID === currentEquippedMeleeGear.neck?.item)
				?.itemPoint ?? 0;
		meleeGearPoints +=
			meleeGearBonus.find(item => item.itemID === currentEquippedMeleeGear.ring?.item)
				?.itemPoint ?? 0;
		meleeGearPoints +=
			meleeGearBonus.find(item => item.itemID === currentEquippedMeleeGear.shield?.item)
				?.itemPoint ?? 0;
		meleeGearPoints +=
			meleeGearBonus.find(item => item.itemID === currentEquippedMeleeGear.weapon?.item)
				?.itemPoint ?? 0;
		// Scores the range gear
		rangeGearPoints +=
			rangeGearBonus.find(item => item.itemID === currentEquippedRangeGear['2h']?.item)
				?.itemPoint ?? 0;
		rangeGearPoints +=
			rangeGearBonus.find(item => item.itemID === currentEquippedRangeGear.ammo?.item)
				?.itemPoint ?? 0;
		rangeGearPoints +=
			rangeGearBonus.find(item => item.itemID === currentEquippedRangeGear.body?.item)
				?.itemPoint ?? 0;
		rangeGearPoints +=
			rangeGearBonus.find(item => item.itemID === currentEquippedRangeGear.cape?.item)
				?.itemPoint ?? 0;
		rangeGearPoints +=
			rangeGearBonus.find(item => item.itemID === currentEquippedRangeGear.feet?.item)
				?.itemPoint ?? 0;
		rangeGearPoints +=
			rangeGearBonus.find(item => item.itemID === currentEquippedRangeGear.hands?.item)
				?.itemPoint ?? 0;
		rangeGearPoints +=
			rangeGearBonus.find(item => item.itemID === currentEquippedRangeGear.legs?.item)
				?.itemPoint ?? 0;
		rangeGearPoints +=
			rangeGearBonus.find(item => item.itemID === currentEquippedRangeGear.neck?.item)
				?.itemPoint ?? 0;
		rangeGearPoints +=
			rangeGearBonus.find(item => item.itemID === currentEquippedRangeGear.shield?.item)
				?.itemPoint ?? 0;
		rangeGearPoints +=
			rangeGearBonus.find(item => item.itemID === currentEquippedRangeGear.weapon?.item)
				?.itemPoint ?? 0;
		// Scores the mage gear
		mageGearPoints +=
			mageGearBonus.find(item => item.itemID === currentEquippedMageGear['2h']?.item)
				?.itemPoint ?? 0;
		mageGearPoints +=
			mageGearBonus.find(item => item.itemID === currentEquippedMageGear.body?.item)
				?.itemPoint ?? 0;
		mageGearPoints +=
			mageGearBonus.find(item => item.itemID === currentEquippedMageGear.cape?.item)
				?.itemPoint ?? 0;
		mageGearPoints +=
			mageGearBonus.find(item => item.itemID === currentEquippedMageGear.hands?.item)
				?.itemPoint ?? 0;
		mageGearPoints +=
			mageGearBonus.find(item => item.itemID === currentEquippedMageGear.head?.item)
				?.itemPoint ?? 0;
		mageGearPoints +=
			mageGearBonus.find(item => item.itemID === currentEquippedMageGear.legs?.item)
				?.itemPoint ?? 0;
		mageGearPoints +=
			mageGearBonus.find(item => item.itemID === currentEquippedMageGear.neck?.item)
				?.itemPoint ?? 0;
		mageGearPoints +=
			mageGearBonus.find(item => item.itemID === currentEquippedMageGear.shield?.item)
				?.itemPoint ?? 0;
		mageGearPoints +=
			mageGearBonus.find(item => item.itemID === currentEquippedMageGear.weapon?.item)
				?.itemPoint ?? 0;

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

		return [totalGearPoints * 100 + 15000, totalGearPoints];
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage) {
		this.checkReqs([msg.author]);

		const partyOptions: MakePartyOptions = {
			leader: msg.author,
			minSize: 2,
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

		this.checkReqs(users);

		this.checkReqs(users);

		const data: RaidsActivityTaskOptions = {
			duration,
			challengeMode: false,
			channelID: msg.channel.id,
			quantity: 1,
			partyLeaderID: msg.author.id,
			userID: msg.author.id,
			type: Activity.Raids,
			id: rand(1, 10_000_000),
			finishDate: Date.now() + duration,
			users: users.map(u => u.id),
			team: users.map(u => ({
				id: u.id,
				personalPoints: (this.gearPointCalc(u)[0] * (100 - rand(0, 20))) / 100,
				canReceiveDust: rand(1, 10) <= 7,
				canReceiveAncientTablet: u.hasItemEquippedOrInBank('Ancient tablet')
			}))
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
