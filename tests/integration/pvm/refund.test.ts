import { Bank, Items, itemID } from 'oldschooljs/dist/meta/types';
import { describe, expect, test } from 'vitest';
import { COXMaxMageGear, COXMaxRangeGear } from '../../../src/lib/data/cox';
import { TOBMaxMeleeGear } from '../../../src/lib/data/tob';
import { WildernessDiary } from '../../../src/lib/diaries';
import { GearStat } from '../../../src/lib/gear/types';
import { CombatOptionsEnum } from '../../../src/lib/minions/data/combatConstants';
import killableMonsters, { effectiveMonsters } from '../../../src/lib/minions/data/killableMonsters';
import { quests } from '../../../src/lib/minions/data/quests';
import { stringMatches } from '../../../src/lib/util';
import { minionKCommand } from '../../../src/mahoji/commands/k';
import { cancelTaskCommand } from '../../../src/mahoji/lib/abstracted_commands/cancelTaskCommand';
import { userStatsUpdate } from '../../../src/mahoji/mahojiSettings';
import { mockClient } from './../util';

describe('Refund trips should fully refund PvM', async () => {
	const client = await mockClient();

	const userBank = new Bank();
	Items.array().map(item => userBank.set(item.name, 1000));

	const user = await client.mockUser({
		bank: userBank,
		QP: 300,
		maxed: true
	});

	//finish wildy easy

	async function doDiary(collectionLogReqs?: number[], monsterScores?: Record<string, number>) {
		if (collectionLogReqs) {
			for (const items of collectionLogReqs) {
				await user.transactItems({ itemsToAdd: new Bank().add(items), collectionLog: true });
			}
		}
		if (monsterScores) {
			for (const monsterKC of Object.entries(monsterScores)) {
				const stats = await user.fetchStats({ monster_scores: true });
				const monster = effectiveMonsters.find(m => stringMatches(m.name, monsterKC[0]));
				await userStatsUpdate(
					user.id,
					{
						monster_scores: {
							...(stats.monster_scores as Record<string, unknown>),
							[monster!.id]: monsterKC[1]
						}
					},
					{}
				);
			}
		}
	}

	await doDiary(WildernessDiary.easy.collectionLogReqs, WildernessDiary.easy.monsterScores);
	await doDiary(WildernessDiary.medium.collectionLogReqs, WildernessDiary.medium.monsterScores);

	await user.update({
		tentacle_charges: 10_000,
		sang_charges: 10_000,
		trident_charges: 10_000,
		serp_helm_charges: 10_000,
		blood_fury_charges: 10_000,
		tum_shadow_charges: 10_000,
		blood_essence_charges: 10_000,
		ash_sanctifier_charges: 10_000,
		celestial_ring_charges: 10_000,
		scythe_of_vitur_charges: 10_000,
		venator_bow_charges: 10_000,
		gear_mage: COXMaxMageGear.raw() as any,
		gear_melee: TOBMaxMeleeGear.raw() as any,
		gear_range: {
			...(COXMaxRangeGear.raw() as any)
		},
		gear_wildy: {
			...(COXMaxRangeGear.raw() as any)
		},
		finished_quest_ids: quests.map(q => q.id),
		combat_options: [CombatOptionsEnum.AlwaysCannon, CombatOptionsEnum.AlwaysIceBarrage],
		blowpipe: {
			scales: 10_000,
			dartQuantity: 10_000,
			dartID: itemID('Dragon dart')
		}
	});

	const currentBank = user.bank.clone().freeze();

	for (const monster of killableMonsters.filter(m => m.itemCost || m.degradeableItemUsage || m.projectileUsage)) {
		test(`${monster.name}`, async () => {
			if (monster.minimumGearRequirements?.wildy) {
				if (Object.keys(monster.minimumGearRequirements.wildy).includes(GearStat.AttackCrush)) {
					await user.equip('wildy', [
						itemID('Elder maul'),
						itemID('Masori body (f)'),
						itemID("Inquisitor's plateskirt"),
						itemID('Justiciar faceguard')
					]);
				}
			} else if (monster.minimumGearRequirements?.wildy) {
				if (Object.keys(monster.minimumGearRequirements.wildy).includes(GearStat.AttackRanged)) {
					await user.equip('wildy', [
						itemID('Twisted bow'),
						itemID('Masori body (f)'),
						itemID('Justiciar faceguard')
					]);
				}
			}

			if (monster.slayerOnly) await user.giveSlayerTask(monster.id);

			const ammo = monster.name === 'Rabbit' ? 'Ruby dragon bolts (e)' : 'Dragon arrow';

			await user.update({
				gear_range: {
					...(COXMaxRangeGear.raw() as any),
					ammo: {
						item: itemID(ammo),
						quantity: 10_000
					}
				}
			});

			const killRes = await user.runCommand(
				minionKCommand,
				{ name: monster.name, wilderness: monster.canBePked, quantity: 1 },
				true
			);
			expect(killRes).toContain('now killing');
			const refundRes = await cancelTaskCommand(
				user,
				'111111111',
				{
					channelId: '1',
					deferReply: () => Promise.resolve(),
					editReply: () => Promise.resolve(),
					followUp: () => Promise.resolve()
				} as any,
				true
			);

			expect(refundRes).toContain('is returning from');
			await user.processActivities(client);

			if (user.bank.amount(ammo) > 1000) {
				await user.update({
					gear_range: {
						...(COXMaxRangeGear.raw() as any),
						ammo: {
							item: itemID(ammo),
							quantity: user.bank.amount(ammo) + user.gearBank.gear.range.ammo!.quantity - 1000
						}
					}
				});
				await user.removeItemsFromBank(new Bank().add(ammo, user.bank.amount(ammo) - 1000));
			}

			if (user.bank.amount('Dragon Dart') > 1000) {
				await user.update({
					blowpipe: {
						scales: user.blowpipe.scales + user.bank.amount("Zulrah's Scales") - 1000,
						dartQuantity: user.blowpipe.dartQuantity + user.bank.amount('Dragon dart') - 1000,
						dartID: itemID('Dragon dart')
					}
				});
				await user.removeItemsFromBank(
					new Bank().add("Zulrah's Scales", user.bank.amount("Zulrah's Scales") - 1000)
				);
				await user.removeItemsFromBank(new Bank().add('Dragon dart', user.bank.amount('Dragon dart') - 1000));
			}

			for (const item of currentBank.items()) {
				expect([item[0].name, currentBank.amount(item[0])]).toEqual([item[0].name, user.bank.amount(item[0])]);
			}
			expect(user.gearBank.gear.range.ammo!.quantity).toEqual(10_000);
			expect(user.user.scythe_of_vitur_charges).toEqual(10_000);
			expect(user.user.tum_shadow_charges).toEqual(10_000);
			expect(user.blowpipe.dartQuantity).toEqual(10_000);
			expect(user.blowpipe.scales).toEqual(10_000);
		});
	}
});
