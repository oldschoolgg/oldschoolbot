import { CommandStore, KlasaMessage } from 'klasa';
import { Bank, Util } from 'oldschooljs';
import { resolveNameBank } from 'oldschooljs/dist/util';

import { BotCommand } from '../../lib/BotCommand';
import { MAX_QP } from '../../lib/constants';
import { Eatables } from '../../lib/eatables';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Skills from '../../lib/skilling/skills';
import itemID from '../../lib/util/itemID';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			oneAtTime: true
		});
		this.enabled = !this.client.production;
	}

	async run(msg: KlasaMessage) {
		// Make 100% sure this command can never be used in prod
		if (
			this.client.production ||
			!this.client.user ||
			this.client.user.id === '303730326692429825'
		) {
			return;
		}
		const paths = Object.values(Skills).map(sk => `skills.${sk.id}`);
		await msg.author.settings.update(paths.map(path => [path, 13_034_431]));
		await msg.author.settings.update(UserSettings.GP, 2_147_483_647);
		await msg.author.settings.update(UserSettings.QP, MAX_QP);
		await msg.author.settings.update(UserSettings.SacrificedValue, 10_000_000_000);
		if (!msg.author.minionIsBusy) {
			const rangeGear = {
				'2h': { item: itemID('Heavy ballista'), quantity: 1 },
				head: { item: itemID('Armadyl helmet'), quantity: 1 },
				neck: { item: itemID('Necklace of anguish'), quantity: 1 },
				body: { item: itemID('Armadyl chestplate'), quantity: 1 },
				legs: { item: itemID('Armadyl chainskirt'), quantity: 1 },
				feet: { item: itemID('Pegasian boots'), quantity: 1 },
				cape: { item: itemID("Ava's assembler"), quantity: 1 },
				shield: null,
				hands: { item: itemID('Barrows gloves'), quantity: 1 },
				ring: { item: itemID('Archers ring (i)'), quantity: 1 },
				weapon: null,
				ammo: { item: itemID('Onyx bolts (e)'), quantity: 99 }
			};
			const mageGear = {
				head: { item: itemID('Ancestral hat'), quantity: 1 },
				neck: { item: itemID('3rd age amulet'), quantity: 1 },
				body: { item: itemID('Ancestral robe top'), quantity: 1 },
				legs: { item: itemID('Ancestral robe bottom'), quantity: 1 },
				feet: { item: itemID('Eternal boots'), quantity: 1 },
				cape: { item: itemID('Imbued saradomin cape'), quantity: 1 },
				shield: { item: itemID('Arcane spirit shield'), quantity: 1 },
				hands: { item: itemID('Tormented bracelet'), quantity: 1 },
				ring: { item: itemID('Seers ring (i)'), quantity: 1 },
				weapon: { item: itemID('Kodai wand'), quantity: 1 },
				ammo: null,
				'2h': null
			};
			const meleeGear = {
				head: { item: itemID('Fighter hat'), quantity: 1 },
				neck: { item: itemID('Amulet of torture'), quantity: 1 },
				body: { item: itemID('Bandos chestplate'), quantity: 1 },
				legs: { item: itemID('Bandos tassets'), quantity: 1 },
				feet: { item: itemID('Boots of brimstone'), quantity: 1 },
				cape: { item: itemID('Ardougne cloak 4'), quantity: 1 },
				shield: { item: itemID('Avernic defender'), quantity: 1 },
				hands: { item: itemID('Ferocious gloves'), quantity: 1 },
				ring: { item: itemID('Treasonous ring (i)'), quantity: 1 },
				weapon: { item: itemID('Ghrazi rapier'), quantity: 1 },
				ammo: { item: itemID('Unholy blessing'), quantity: 1 },
				'2h': null
			};
			const skillingGear = {
				head: { item: itemID('Graceful hood'), quantity: 1 },
				neck: { item: itemID('Amulet of glory (t6)'), quantity: 1 },
				body: { item: itemID('Graceful top'), quantity: 1 },
				legs: { item: itemID('Graceful legs'), quantity: 1 },
				feet: { item: itemID('Graceful boots'), quantity: 1 },
				cape: { item: itemID('Graceful cape'), quantity: 1 },
				shield: { item: itemID('Elysian spirit shield'), quantity: 1 },
				hands: { item: itemID('Graceful gloves'), quantity: 1 },
				ring: { item: itemID('Ring of the gods'), quantity: 1 },
				weapon: { item: itemID('Crystal pickaxe'), quantity: 1 },
				ammo: null,
				'2h': null
			};
			const miscGear = {
				head: { item: itemID('Warrior helm'), quantity: 1 },
				neck: { item: itemID('Amulet of torture'), quantity: 1 },
				body: { item: itemID('Bandos chestplate'), quantity: 1 },
				legs: { item: itemID('Bandos tassets'), quantity: 1 },
				feet: { item: itemID('Primordial boots'), quantity: 1 },
				cape: { item: itemID('Infernal cape'), quantity: 1 },
				shield: null,
				hands: { item: itemID('Ferocious gloves'), quantity: 1 },
				ring: { item: itemID('Warrior ring (i)'), quantity: 1 },
				weapon: null,
				ammo: { item: itemID('Unholy blessing'), quantity: 1 },
				'2h': { item: itemID('Armadyl godsword'), quantity: 1 }
			};
			await msg.author.settings.update([
				[UserSettings.Gear.Range, rangeGear],
				[UserSettings.Gear.Mage, mageGear],
				[UserSettings.Gear.Melee, meleeGear],
				[UserSettings.Gear.Skilling, skillingGear],
				[UserSettings.Gear.Misc, miscGear]
			]);
		} else {
			await this.client.queuePromise(async () =>
				msg.channel.send(
					'As you are busy, BiS gear was not added to your gear presets. Run this again when you are not busy to have BiS gear equipped!',
					{ split: false }
				)
			);
		}
		const loot = new Bank();
		loot.add(
			resolveNameBank({
				'Zamorakian spear': 1,
				'Zamorakian hasta': 1,
				"Ahrim's robetop": 1,
				"Ahrim's robeskirt": 1,
				"Verac's brassard": 1,
				"Verac's helm": 1,
				"Verac's plateskirt": 1,
				"Verac's flail": 1,
				"Dharok's helm": 1,
				"Dharok's platebody": 1,
				"Dharok's platelegs": 1,
				"Dharok's greataxe": 1,
				"Guthan's helm": 1,
				"Guthan's platebody": 1,
				"Guthan's chainskirt": 1,
				"Guthan's warspear": 1,
				"Karil's coif": 1,
				"Karil's leathertop": 1,
				"Karil's leatherskirt": 1,
				"Karil's crossbow": 1,
				'Bandos godsword': 1,
				'Spectral spirit shield': 1,
				'Saradomin godsword': 1,
				'Dragon warhammer': 1,
				'Dragonhunter lance': 1,
				"Iban's staff": 1,
				'Dragonfire shield': 1,
				'Anti-dragon shield': 1,
				'Berserker ring': 1,
				'Warrior ring': 1,
				'Archers ring': 1,
				'Seers ring': 1,
				'Treasonous ring': 1,
				'Tyrannical ring': 1,
				'Tyrannical ring (i)': 1,
				'Ranger boots': 1,
				'Armadyl crossbow': 1,
				'Twisted buckler': 1,
				'Occult necklace': 1,
				"Inquisitor's great helm": 1,
				"Inquisitor's hauberk": 1,
				"Inquisitor's plateskirt": 1,
				"Inquisitor's mace": 1,
				'Elder maul': 1,
				'Blade of saeldor': 1,
				'3rd age axe': 1,
				'3rd age pickaxe': 1,
				'Saradomin brew(4)': 10_000,
				'Prayer potion(4)': 10_000,
				'Super restore(4)': 10_000,
				'Justiciar faceguard': 1,
				'Justiciar chestguard': 1,
				'Justiciar legguards': 1,
				'Ancient wyvern shield': 1,
				'Ring of suffering': 1,
				'Ring of suffering (i)': 1,
				'Maple blackjack(d)': 1,
				"Dinh's bulwark": 1,
				'Guardian boots': 1,
				'Crystal helm': 1,
				'3rd age vambraces': 1,
				'Crystal shield': 1,
				'Neitiznot faceguard': 1,
				'Leaf-bladed battleaxe': 1,
				'Berserker ring (i)': 1,
				'Dragon javelin': 1,
				'Black chinchompa': 1,
				'Saradomin mitre': 1,
				'Dragonbone necklace': 1,
				'Proselyte hauberk': 1,
				'Proselyte cuisse': 1,
				'Devout boots': 1,
				'Holy book': 1,
				'Holy wraps': 1,
				'Ring of the gods (i)': 1,
				'Ring of the gods': 1,
				"Rada's blessing 4": 1,
				'Saradomin crozier': 1,
				'Penance gloves': 1,
				'Spottier cape': 1,
				'Boots of lightness': 1,
				'Amulet of power': 1,
				22114: 1,
				'Amulet of fury': 1
			})
		);
		for (const item of Eatables) {
			loot.add(item.id, 1_000);
		}
		await msg.author.addItemsToBank(loot.bank);
		return msg.send(
			`Gave you 99 in all skills, ${Util.toKMB(
				2_147_483_647
			)} GP, ${MAX_QP} QP, 1k of all eatable foods, BiS gear in all slots and enough items to kill most bosses!`
		);
	}
}
