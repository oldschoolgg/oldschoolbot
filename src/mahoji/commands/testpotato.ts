import { Prisma } from '@prisma/client';
import { uniqueArr } from 'e';
import { KlasaUser } from 'klasa';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank, Items } from 'oldschooljs';
import { EquipmentSlot } from 'oldschooljs/dist/meta/types';
import { convertLVLtoXP, itemID } from 'oldschooljs/dist/util';

import { client } from '../..';
import { production } from '../../config';
import { BitField, MAX_QP } from '../../lib/constants';
import { TOBMaxMageGear, TOBMaxMeleeGear, TOBMaxRangeGear } from '../../lib/data/tob';
import { effectiveMonsters } from '../../lib/minions/data/killableMonsters';
import { allOpenables } from '../../lib/openables';
import { Minigames } from '../../lib/settings/minigames';
import { prisma } from '../../lib/settings/prisma';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Skills from '../../lib/skilling/skills';
import { Gear } from '../../lib/structures/Gear';
import { stringMatches } from '../../lib/util';
import getOSItem from '../../lib/util/getOSItem';
import { logError } from '../../lib/util/logError';
import { parseStringBank } from '../../lib/util/parseStringBank';
import { tiers } from '../../tasks/patreon';
import { OSBMahojiCommand } from '../lib/util';
import { mahojiUserSettingsUpdate, mahojiUsersSettingsFetch } from '../mahojiSettings';

async function giveMaxStats(user: KlasaUser, level = 99, qp = MAX_QP) {
	const paths = Object.values(Skills).map(sk => `skills.${sk.id}`);
	await user.settings.update(paths.map(path => [path, convertLVLtoXP(level)]));
	await user.settings.update(UserSettings.QP, MAX_QP);

	return `Gave you level ${level} in all stats, and ${qp} QP.`;
}

async function givePatronLevel(user: KlasaUser, tier: number) {
	const tierToGive = tiers[tier];
	const currentBitfield = user.settings.get(UserSettings.BitField);
	if (!tier || !tierToGive) {
		await mahojiUserSettingsUpdate(client, user, {
			bitfield: currentBitfield.filter(i => !tiers.map(t => t[1]).includes(i))
		});
		return 'Removed patron perks.';
	}
	const newBitField: BitField[] = [...currentBitfield, tierToGive[1]];
	await mahojiUserSettingsUpdate(client, user, {
		bitfield: uniqueArr(newBitField)
	});
	return `Gave you tier ${tierToGive[1] - 1} patron.`;
}

async function giveGear(user: KlasaUser) {
	const loot = new Bank()
		.add('Saradomin brew(4)', 10_000)
		.add('Super restore(4)', 5000)
		.add('Stamina potion(4)', 1000)
		.add('Super combat potion(4)', 100)
		.add('Cooked karambwan', 1000)
		.add('Ranging potion(4)', 1000)
		.add('Death rune', 10_000)
		.add('Blood rune', 100_000)
		.add('Water rune', 10_000)
		.add('Coins', 5_000_000)
		.add('Shark', 5000)
		.add('Vial of blood', 10_000)
		.add('Rune pouch', 1)
		.add('Zamorakian spear')
		.add('Dragon warhammer')
		.add('Bandos godsword')
		.add('Toxic blowpipe');
	await user.addItemsToBank({ items: loot, collectionLog: false });
	await user.settings.update(UserSettings.Blowpipe, {
		scales: 100_000,
		dartQuantity: 100_000,
		dartID: itemID('Rune dart')
	});
	await user.settings.update(UserSettings.Gear.Melee, TOBMaxMeleeGear);
	await user.settings.update(UserSettings.Gear.Range, TOBMaxRangeGear);
	await user.settings.update(UserSettings.Gear.Mage, TOBMaxMageGear);
	await user.settings.update(UserSettings.TentacleCharges, 10_000);
	await user.settings.update(UserSettings.GP, 1_000_000_000);
	await user.settings.update(UserSettings.Slayer.SlayerPoints, 100_000);

	await user.getPOH();
	await prisma.playerOwnedHouse.update({
		where: {
			user_id: user.id
		},
		data: {
			pool: 29_241
		}
	});
	return `Gave you ${loot}, all BIS setups, 10k tentacle charges, slayer points, 1b GP, blowpipe, gear, supplies.`;
}

async function resetAccount(user: KlasaUser) {
	await prisma.activity.deleteMany({ where: { user_id: BigInt(user.id) } });
	await prisma.commandUsage.deleteMany({ where: { user_id: user.id } });
	await prisma.gearPreset.deleteMany({ where: { user_id: user.id } });
	await prisma.giveaway.deleteMany({ where: { user_id: user.id } });
	await prisma.lastManStandingGame.deleteMany({ where: { user_id: BigInt(user.id) } });
	await prisma.minigame.deleteMany({ where: { user_id: user.id } });
	await prisma.newUser.deleteMany({ where: { id: user.id } });
	await prisma.playerOwnedHouse.deleteMany({ where: { user_id: user.id } });
	await prisma.slayerTask.deleteMany({ where: { user_id: user.id } });
	await prisma.user.deleteMany({ where: { id: user.id } });
	await user.settings.sync(true);
	return 'Reset all your data.';
}

async function setMinigameKC(user: KlasaUser, _minigame: string, kc: number) {
	const minigame = Minigames.find(m => m.column === _minigame.toLowerCase());
	if (!minigame) return 'No kc set because invalid minigame.';
	await prisma.minigame.update({
		where: {
			user_id: user.id
		},
		data: {
			[minigame.column]: kc
		}
	});
	return `Set your ${minigame.name} KC to ${kc}.`;
}

async function setXP(user: KlasaUser, skillName: string, xp: number) {
	const skill = Object.values(Skills).find(c => c.id === skillName);
	if (!skill) return 'No xp set because invalid skill.';
	await mahojiUserSettingsUpdate(client, user, {
		[`skills_${skill.id}`]: xp
	});
	return `Set ${skill.name} XP to ${xp}.`;
}
const openablesBank = new Bank();
for (const i of allOpenables.values()) {
	openablesBank.add(i.id, 100);
}
const spawnPresets = [
	['openables', openablesBank],
	['random', new Bank()]
] as const;

const nexSupplies = new Bank()
	.add('Shark', 10_000)
	.add('Saradomin brew(4)', 100)
	.add('Super restore(4)', 100)
	.add('Ranging potion(4)', 100);

export const testPotatoCommand: OSBMahojiCommand | null = production
	? null
	: {
			name: 'testpotato',
			description: 'Commands for making testing easier and faster.',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'spawn',
					description: 'Spawn stuff.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'preset',
							description: 'Choose from some preset things to spawn.',
							choices: spawnPresets.map(i => ({ name: i[0], value: i[0] }))
						},
						{
							type: ApplicationCommandOptionType.Boolean,
							name: 'collectionlog',
							description: 'Add these items to your collection log?'
						},
						{
							type: ApplicationCommandOptionType.String,
							name: 'item',
							description: 'Spawn a specific item',
							autocomplete: async value => {
								if (!value)
									return [{ name: 'Type something!', value: itemID('Twisted bow').toString() }];
								return Items.filter(item => item.name.toLowerCase().includes(value.toLowerCase())).map(
									i => ({
										name: `${i.name} (ID: ${i.id})`,
										value: i.id.toString()
									})
								);
							}
						},
						{
							type: ApplicationCommandOptionType.String,
							name: 'items',
							description: 'Spawn many items at once using a bank string.'
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'setxp',
					description: 'Set skill kc.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'skill',
							description: 'The skill.',
							required: true,
							choices: Object.values(Skills).map(s => ({ name: s.name, value: s.id }))
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: 'xp',
							description: 'The xp you want.',
							required: true,
							min_value: 1,
							max_value: 200_000_000
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'setminigamekc',
					description: 'Set minigame kc.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'minigame',
							description: 'The minigame you want to set your KC for.',
							required: true,
							autocomplete: async value => {
								return Minigames.filter(i => {
									if (!value) return true;
									return [i.name.toLowerCase(), i.aliases].some(i => i.includes(value.toLowerCase()));
								}).map(i => ({
									name: i.name,
									value: i.column
								}));
							}
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: 'kc',
							description: 'The minigame KC you want.',
							required: true,
							min_value: 0,
							max_value: 10_000
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'reset',
					description: 'Totally reset your account.'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'gear',
					description: 'Spawn food, pots, runes, coins, blowpipe, POH with a pool, and BiS gear.'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'max',
					description: 'Set all your stats to the maximum level, and get max QP.'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'patron',
					description: 'Set your patron perk level.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'tier',
							description: 'The patron tier to give yourself.',
							required: true,
							choices: [
								{
									name: 'Non-patron',
									value: '0'
								},
								{
									name: 'Tier 1',
									value: '1'
								},
								{
									name: 'Tier 2',
									value: '2'
								},
								{
									name: 'Tier 3',
									value: '3'
								},
								{
									name: 'Tier 4',
									value: '4'
								},
								{
									name: 'Tier 5',
									value: '5'
								}
							]
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'nexhax',
					description: 'Gives you everything needed for Nex.'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'badnexgear',
					description: 'Gives you bad nex gear ahahahahaha'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'setmonsterkc',
					description: 'Set monster kc.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'monster',
							description: 'The monster you want to set your KC for.',
							required: true,
							autocomplete: async value => {
								return effectiveMonsters
									.filter(i => {
										if (!value) return true;
										return [i.name.toLowerCase(), i.aliases].some(i =>
											i.includes(value.toLowerCase())
										);
									})
									.map(i => ({
										name: i.name,
										value: i.name
									}));
							}
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: 'kc',
							description: 'The monster KC you want.',
							required: true,
							min_value: 0,
							max_value: 10_000
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'irontoggle',
					description: 'Toggle being an ironman on/off.'
				}
			],
			run: async ({
				options,
				userID
			}: CommandRunOptions<{
				max?: {};
				patron?: { tier: string };
				gear?: {};
				reset?: {};
				setminigamekc?: { minigame: string; kc: number };
				setxp?: { skill: string; xp: number };
				spawn?: { preset?: string; collectionlog?: boolean; item?: string; items?: string };
				nexhax?: {};
				badnexgear?: {};
				setmonsterkc?: { monster: string; kc: string };
				irontoggle?: {};
			}>) => {
				if (production) {
					logError('Test command ran in production', { userID: userID.toString() });
					return 'This will never happen...';
				}
				const user = await client.fetchUser(userID.toString());
				const mahojiUser = await mahojiUsersSettingsFetch(user.id);
				if (options.irontoggle) {
					const current = mahojiUser.minion_ironman;
					await mahojiUserSettingsUpdate(client, user.id, {
						minion_ironman: !current
					});
					return `You now ${!current ? 'ARE' : 'ARE NOT'} an ironman.`;
				}
				if (options.max) {
					return giveMaxStats(user);
				}
				if (options.patron) {
					return givePatronLevel(user, Number(options.patron.tier));
				}
				if (options.gear) {
					return giveGear(user);
				}
				if (options.reset) {
					return resetAccount(user);
				}
				if (options.setminigamekc) {
					return setMinigameKC(user, options.setminigamekc.minigame, options.setminigamekc.kc);
				}
				if (options.setxp) {
					return setXP(user, options.setxp.skill, options.setxp.xp);
				}
				if (options.spawn) {
					const { preset, collectionlog, item, items } = options.spawn;
					const bankToGive = new Bank();
					if (preset) {
						const actualPreset = spawnPresets.find(i => i[0] === preset);
						if (!actualPreset) return 'Invalid preset';
						let b = actualPreset[1];
						if (actualPreset[0] === 'random') {
							b = new Bank();
							for (let i = 0; i < 200; i++) {
								b.add(Items.random().id);
							}
						}
						bankToGive.add(b);
					}
					if (item) {
						try {
							bankToGive.add(getOSItem(item).id);
						} catch (err) {
							return err as string;
						}
					}
					if (items) {
						for (const [i, qty] of parseStringBank(items, undefined, true)) {
							bankToGive.add(i.id, qty || 1);
						}
					}

					await user.addItemsToBank({ items: bankToGive, collectionLog: Boolean(collectionlog) });
					return `Spawned: ${bankToGive.toString().slice(0, 500)}.`;
				}
				if (options.nexhax) {
					const gear = new Gear({
						[EquipmentSlot.Weapon]: 'Zaryte crossbow',
						[EquipmentSlot.Shield]: 'Elysian spirit shield',
						[EquipmentSlot.Ammo]: 'Ruby dragon bolts(e)',
						[EquipmentSlot.Body]: 'Armadyl chestplate',
						[EquipmentSlot.Legs]: 'Armadyl chainskirt',
						[EquipmentSlot.Feet]: 'Pegasian boots',
						[EquipmentSlot.Cape]: "Ava's assembler",
						[EquipmentSlot.Neck]: 'Necklace of anguish',
						[EquipmentSlot.Hands]: 'Zaryte vambraces',
						[EquipmentSlot.Head]: 'Armadyl helmet',
						[EquipmentSlot.Ring]: 'Archers ring (i)'
					});
					gear.ammo!.quantity = 1_000_000;
					await mahojiUserSettingsUpdate(client, user.id, {
						gear_range: gear.raw() as Prisma.InputJsonObject,
						skills_ranged: convertLVLtoXP(99),
						skills_prayer: convertLVLtoXP(99),
						skills_hitpoints: convertLVLtoXP(99),
						skills_defence: convertLVLtoXP(99),
						bank: user.bank().add(nexSupplies).bank,
						GP: mahojiUser.GP + BigInt(10_000_000)
					});
					return 'Gave you range gear, gp, gear and stats for nex.';
				}
				if (options.badnexgear) {
					const gear = new Gear({
						[EquipmentSlot.Weapon]: 'Armadyl crossbow',
						// [EquipmentSlot.Shield]: nu,
						[EquipmentSlot.Ammo]: 'Ruby dragon bolts(e)',
						[EquipmentSlot.Body]: "Karil's leathertop",
						[EquipmentSlot.Legs]: "Karil's leatherskirt",
						[EquipmentSlot.Feet]: 'Snakeskin boots',
						[EquipmentSlot.Cape]: "Ava's accumulator",
						[EquipmentSlot.Neck]: 'Amulet of accuracy',
						[EquipmentSlot.Hands]: 'Barrows gloves',
						[EquipmentSlot.Head]: "Karil's coif",
						[EquipmentSlot.Ring]: 'Archers ring'
					});
					gear.ammo!.quantity = 1_000_000;
					await mahojiUserSettingsUpdate(client, user.id, {
						gear_range: gear.raw() as Prisma.InputJsonObject,
						bank: user.bank().add(nexSupplies).bank
					});
					return 'Gave you bad nex gear';
				}
				if (options.setmonsterkc) {
					const monster = effectiveMonsters.find(m =>
						stringMatches(m.name, options.setmonsterkc?.monster ?? '')
					);
					if (!monster) return 'Invalid monster';
					await mahojiUserSettingsUpdate(client, user.id, {
						monsterScores: {
							...(mahojiUser.monsterScores as Record<string, unknown>),
							[monster.id]: options.setmonsterkc.kc ?? 1
						}
					});
					return `Set your ${monster.name} KC to ${options.setmonsterkc.kc ?? 1}.`;
				}
				return 'Nothin!';
			}
	  };
