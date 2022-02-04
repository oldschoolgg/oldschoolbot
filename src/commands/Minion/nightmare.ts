import { reduceNumByPercent, Time } from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { BitField, Emoji, PHOSANI_NIGHTMARE_ID } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import calculateMonsterFood from '../../lib/minions/functions/calculateMonsterFood';
import hasEnoughFoodForMonster from '../../lib/minions/functions/hasEnoughFoodForMonster';
import removeFoodFromUser from '../../lib/minions/functions/removeFoodFromUser';
import { KillableMonster } from '../../lib/minions/types';
import { trackLoot } from '../../lib/settings/prisma';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { Gear } from '../../lib/structures/Gear';
import { MakePartyOptions } from '../../lib/types';
import { NightmareActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, itemID, updateBankSetting } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import calcDurQty from '../../lib/util/calcMassDurationQuantity';
import { getNightmareGearStats } from '../../lib/util/getNightmareGearStats';
import resolveItems from '../../lib/util/resolveItems';
import { ZAM_HASTA_CRUSH } from './../../lib/constants';
import { NightmareMonster } from './../../lib/minions/data/killableMonsters/index';

function soloMessage(user: KlasaUser, duration: number, quantity: number, isPhosani: boolean) {
	const name = isPhosani ? "Phosani's Nightmare" : 'The Nightmare';
	const kc = user.getKC(isPhosani ? PHOSANI_NIGHTMARE_ID : NightmareMonster.id);
	let str = `${user.minionName} is now off to kill ${name} ${quantity} times.`;
	if (kc < 5) {
		str += ` They are terrified to face ${name}, and set off to fight it with great fear.`;
	} else if (kc < 10) {
		str += ` They are scared to face ${name}, but set off with great courage.`;
	} else if (kc < 50) {
		str += ` They are confident in killing ${name}, and prepared for battle.`;
	} else {
		str += ` They are not scared of ${name} anymore, and ready to fight!`;
	}

	return `${str} The trip will take approximately ${formatDuration(duration)}.`;
}

const inquisitorItems = resolveItems([
	"Inquisitor's great helm",
	"Inquisitor's hauberk",
	"Inquisitor's plateskirt",
	"Inquisitor's mace"
]);

export const phosaniBISGear = new Gear({
	head: "Inquisitor's great helm",
	neck: 'Amulet of torture',
	body: "Inquisitor's hauberk",
	cape: 'Infernal cape',
	hands: 'Ferocious gloves',
	legs: "Inquisitor's plateskirt",
	feet: 'Primordial boots',
	ring: 'Berserker ring(i)',
	weapon: "Inquisitor's mace",
	shield: 'Avernic defender',
	ammo: "Rada's blessing 4"
});

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<mass|solo|phosani>',
			usageDelim: ' ',
			oneAtTime: true,
			altProtection: true,
			requiredPermissionsForBot: ['ADD_REACTIONS', 'ATTACH_FILES'],
			categoryFlags: ['minion', 'pvm', 'minigame'],
			description:
				'Sends your minion to kill the nightmare. Requires food and melee gear. Your minion gets better at it over time.',
			examples: ['+nightmare mass', '+nightmare solo'],
			aliases: ['nm']
		});
	}

	checkReqs(users: KlasaUser[], monster: KillableMonster, quantity: number, isPhosani: boolean) {
		// Check if every user has the requirements for this monster.
		for (const user of users) {
			if (!user.hasMinion) {
				throw `${user.username} doesn't have a minion, so they can't join!`;
			}

			if (user.minionIsBusy) {
				throw `${user.username} is busy right now and can't join!`;
			}

			const [hasReqs, reason] = user.hasMonsterRequirements(monster);
			if (!hasReqs) {
				throw `${user.username} doesn't have the requirements for this monster: ${reason}`;
			}

			if (!hasEnoughFoodForMonster(monster, user, quantity, users.length)) {
				throw `${
					users.length === 1 ? "You don't" : `${user.username} doesn't`
				} have enough food. You need at least ${monster.healAmountNeeded! * quantity} HP in food to ${
					users.length === 1 ? 'start the mass' : 'enter the mass'
				}.`;
			}

			const cost = this.perUserCost(user, isPhosani, quantity);
			if (!user.owns(cost)) {
				throw `${user.username} doesn't own ${cost}`;
			}

			if (isPhosani) {
				const requirements = user.hasSkillReqs({
					prayer: 70,
					attack: 90,
					strength: 90,
					defence: 90,
					magic: 90,
					hitpoints: 90
				});
				if (!requirements[0]) {
					throw `${user.username} doesn't meet the requirements: ${requirements[1]}`;
				}
				if (user.getKC(NightmareMonster.id) < 50) {
					throw "You need to have killed The Nightmare atleast 50 times before you can face the Phosani's Nightmare.";
				}
			}
		}
	}

	perUserCost(_user: KlasaUser, isPhosani: boolean, quantity: number) {
		const cost = new Bank();
		if (isPhosani) {
			cost.add('Super combat potion(4)', Math.max(1, Math.floor(quantity / 2)))
				.add('Sanfew serum(4)', quantity)
				.add('Super restore(4)', quantity)
				.add('Fire rune', 11 * 100 * quantity)
				.add('Air rune', 7 * 100 * quantity)
				.add('Wrath rune', 70 * quantity);
		}
		return cost;
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage, [type]: ['mass' | 'solo' | 'phosani']) {
		let isPhosani = false;
		if (type === 'phosani') {
			isPhosani = true;
			type = 'solo';
		}

		this.checkReqs([msg.author], NightmareMonster, 2, isPhosani);

		const maximumSize = 10;

		const partyOptions: MakePartyOptions = {
			leader: msg.author,
			minSize: 2,
			maxSize: maximumSize - 1,
			ironmanAllowed: true,
			message: `${msg.author.username} is doing a ${NightmareMonster.name} mass! Anyone can click the ${Emoji.Join} reaction to join, click it again to leave. The maximum size for this mass is ${maximumSize}.`,
			customDenier: async user => {
				if (!user.hasMinion) {
					return [true, "you don't have a minion."];
				}
				if (user.minionIsBusy) {
					return [true, 'your minion is busy.'];
				}
				const [hasReqs, reason] = user.hasMonsterRequirements(NightmareMonster);
				if (!hasReqs) {
					return [true, `you don't have the requirements for this monster; ${reason}`];
				}

				if (NightmareMonster.healAmountNeeded) {
					try {
						calculateMonsterFood(NightmareMonster, user);
					} catch (err: any) {
						return [true, err];
					}

					// Ensure people have enough food for at least 2 full KC
					// This makes it so the users will always have enough food for any amount of KC
					if (!hasEnoughFoodForMonster(NightmareMonster, user, 2)) {
						return [
							true,
							`You don't have enough food. You need at least ${
								NightmareMonster.healAmountNeeded * 2
							} HP in food to enter the mass.`
						];
					}
				}

				return [false];
			}
		};

		const users = type === 'mass' ? await msg.makePartyAwaiter(partyOptions) : [msg.author];
		const soloBoosts: string[] = [];

		let effectiveTime = NightmareMonster.timeToFinish;
		for (const user of users) {
			const [data] = getNightmareGearStats(
				user,
				users.map(u => u.id),
				isPhosani
			);

			const meleeGear = user.getGear('melee');

			if (users.length === 1 && isPhosani) {
				if (user.bitfield.includes(BitField.HasSlepeyTablet)) {
					effectiveTime = reduceNumByPercent(effectiveTime, 15);
					soloBoosts.push('15% for Slepey tablet');
				}
				const numberOfBISEquipped = phosaniBISGear
					.allItems(false)
					.filter(itemID => meleeGear.hasEquipped(itemID)).length;
				if (numberOfBISEquipped > 3) {
					effectiveTime = reduceNumByPercent(effectiveTime, numberOfBISEquipped * 1.2);
					soloBoosts.push(`${(numberOfBISEquipped * 1.2).toFixed(2)}% for Melee gear`);
				}
			}

			// Special inquisitor outfit damage boost
			if (meleeGear.hasEquipped(inquisitorItems, true)) {
				effectiveTime *= users.length === 1 ? 0.9 : 0.97;
			} else {
				for (const inqItem of inquisitorItems) {
					if (meleeGear.hasEquipped([inqItem])) {
						effectiveTime *= users.length === 1 ? 0.98 : 0.995;
					}
				}
			}

			// Increase duration for each bad weapon.
			if (data.attackCrushStat < ZAM_HASTA_CRUSH) {
				effectiveTime *= 1.05;
			}

			// Increase duration for lower melee-strength gear.
			if (data.percentMeleeStrength < 40) {
				effectiveTime *= 1.06;
			} else if (data.percentMeleeStrength < 50) {
				effectiveTime *= 1.03;
			} else if (data.percentMeleeStrength < 60) {
				effectiveTime *= 1.02;
			}

			// Increase duration for lower KC.
			if (data.kc < 10) {
				effectiveTime *= 1.15;
			} else if (data.kc < 25) {
				effectiveTime *= 1.05;
			} else if (data.kc < 50) {
				effectiveTime *= 1.02;
			} else if (data.kc < 100) {
				effectiveTime *= 0.98;
			} else {
				effectiveTime *= 0.96;
			}
			if (isPhosani) {
				effectiveTime = reduceNumByPercent(effectiveTime, 31);
				if (user.owns('Dragon claws')) {
					effectiveTime = reduceNumByPercent(effectiveTime, 3);
					soloBoosts.push('3% for Dragon claws');
				}
				if (user.hasItemEquippedOrInBank('Harmonised nightmare staff')) {
					effectiveTime = reduceNumByPercent(effectiveTime, 3);
					soloBoosts.push('3% for Harmonised nightmare staff');
				}
				if (user.owns('Elder maul')) {
					effectiveTime = reduceNumByPercent(effectiveTime, 3);
					soloBoosts.push('3% for Elder maul');
				}
			}
		}

		const hasCob = msg.author.equippedPet() === itemID('Cob');
		if (hasCob && type === 'solo') {
			effectiveTime /= 2;
		}

		let [quantity, duration, perKillTime] = await calcDurQty(
			users,
			{ ...NightmareMonster, timeToFinish: effectiveTime },
			undefined,
			Time.Minute * 5,
			Time.Minute * 30
		);
		this.checkReqs(users, NightmareMonster, quantity, isPhosani);

		duration = quantity * perKillTime - NightmareMonster.respawnTime!;

		const totalCost = new Bank();
		let soloFoodUsage: Bank | null = null;
		for (const user of users) {
			const [healAmountNeeded] = calculateMonsterFood(NightmareMonster, user);
			const cost = this.perUserCost(user, isPhosani, quantity);
			if (!user.owns(cost)) {
				return msg.channel.send(`${user} doesn't own ${cost}.`);
			}
			let healingMod = isPhosani ? 1.5 : 1;
			const { foodRemoved } = await removeFoodFromUser({
				client: this.client,
				user,
				totalHealingNeeded: Math.ceil(healAmountNeeded / users.length) * quantity * healingMod,
				healPerAction: Math.ceil(healAmountNeeded / quantity) * healingMod,
				activityName: NightmareMonster.name,
				attackStylesUsed: ['melee']
			});
			const { realCost } = await user.specialRemoveItems(cost);
			soloFoodUsage = realCost.clone().add(foodRemoved);

			totalCost.add(foodRemoved).add(realCost);
		}

		await updateBankSetting(this.client, ClientSettings.EconomyStats.NightmareCost, totalCost);
		await trackLoot({
			id: 'nightmare',
			cost: totalCost,
			type: 'Monster',
			changeType: 'cost'
		});

		await addSubTaskToActivityTask<NightmareActivityTaskOptions>({
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: 'Nightmare',
			leader: msg.author.id,
			users: users.map(u => u.id),
			isPhosani
		});

		let str =
			type === 'solo'
				? `${soloMessage(msg.author, duration, quantity, isPhosani)}
${soloBoosts.length > 0 ? `**Boosts:** ${soloBoosts.join(', ')}` : ''}
Removed ${soloFoodUsage} from your bank.`
				: `${partyOptions.leader.username}'s party (${users
						.map(u => u.username)
						.join(', ')}) is now off to kill ${quantity}x Nightmare. Each kill takes ${formatDuration(
						perKillTime
				  )} instead of ${formatDuration(
						NightmareMonster.timeToFinish
				  )} - the total trip will take ${formatDuration(duration)}.`;

		if (hasCob && type === 'solo') {
			str += '\n2x Boost from Cob';
		}

		return msg.channel.send(str);
	}
}
