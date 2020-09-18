import { CommandStore, KlasaMessage } from 'klasa';
import { Util } from 'oldschooljs';

import { BotCommand } from '../../lib/BotCommand';
import { MAX_QP } from '../../lib/constants';
import { Eatables } from '../../lib/eatables';
import { GearTypes } from '../../lib/gear';
import resolveGearTypeSetting from '../../lib/gear/functions/resolveGearTypeSetting';
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

		const paths = Skills.map(sk => `skills.${sk.id}`);
		await msg.author.settings.update(paths.map(path => [path, 13_034_431]));
		await msg.author.settings.update(UserSettings.GP, 2_147_483_647);
		await msg.author.settings.update(UserSettings.QP, MAX_QP);
		const rangeGear = {
			'2h': null,
			head: { item: itemID('Armadyl helmet'), quantity: 1 },
			neck: { item: itemID('Necklace of anguish'), quantity: 1 },
			body: { item: itemID('Armadyl chestplate'), quantity: 1 },
			legs: { item: itemID('Armadyl chainskirt'), quantity: 1 },
			feet: { item: itemID('Ranger boots'), quantity: 1 },
			cape: { item: itemID("Ava's assembler"), quantity: 1 },
			shield: { item: itemID('Twisted buckler'), quantity: 1 },
			hands: { item: itemID('Barrows gloves'), quantity: 1 },
			ring: { item: itemID('Archers ring'), quantity: 1 },
			weapon: { item: itemID('Armadyl crossbow'), quantity: 1 },
			ammo: { item: itemID('Onyx bolts (e)'), quantity: 99 }
		};
		const mageGear = {
			head: { item: itemID('Ancestral hat'), quantity: 1 },
			neck: { item: itemID('Occult necklace'), quantity: 1 },
			body: { item: itemID('Ancestral robe top'), quantity: 1 },
			legs: { item: itemID('Ancestral robe bottom'), quantity: 1 },
			feet: { item: itemID('Eternal boots'), quantity: 1 },
			cape: { item: itemID('Imbued saradomin cape'), quantity: 1 },
			shield: { item: itemID('Arcane spirit shield'), quantity: 1 },
			hands: { item: itemID('Tormented bracelet'), quantity: 1 },
			ring: { item: itemID('Seers ring'), quantity: 1 },
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
			ring: { item: itemID('Treasonous ring'), quantity: 1 },
			weapon: { item: itemID('Ghrazi rapier'), quantity: 1 },
			ammo: null,
			'2h': null
		};
		const skillingGear = {
			head: { item: itemID('Graceful hood'), quantity: 1 },
			neck: { item: itemID('Amulet of glory (t6)'), quantity: 1 },
			body: { item: itemID('Graceful top'), quantity: 1 },
			legs: { item: itemID('Graceful legs'), quantity: 1 },
			feet: { item: itemID('Graceful boots'), quantity: 1 },
			cape: { item: itemID('Graceful cape'), quantity: 1 },
			shield: null,
			hands: { item: itemID('Graceful gloves'), quantity: 1 },
			ring: { item: itemID('Ring of the gods'), quantity: 1 },
			weapon: null,
			ammo: null,
			'2h': null
		};
		await msg.author.settings.update(
			resolveGearTypeSetting(GearTypes.GearSetupTypes.Range),
			rangeGear
		);
		await msg.author.settings.update(
			resolveGearTypeSetting(GearTypes.GearSetupTypes.Mage),
			mageGear
		);
		await msg.author.settings.update(
			resolveGearTypeSetting(GearTypes.GearSetupTypes.Melee),
			meleeGear
		);
		await msg.author.settings.update(
			resolveGearTypeSetting(GearTypes.GearSetupTypes.Skilling),
			skillingGear
		);
		await msg.author.addItemsToBank({
			[itemID('Zamorakian spear')]: 1,
			[itemID("Ahrim's robetop")]: 1,
			[itemID("Ahrim's robeskirt")]: 1,
			[itemID("Verac's brassard")]: 1,
			[itemID("Verac's helm")]: 1,
			[itemID("Verac's plateskirt")]: 1,
			[itemID("Verac's flail")]: 1,
			[itemID("Dharok's helm")]: 1,
			[itemID("Dharok's platebody")]: 1,
			[itemID("Dharok's platelegs")]: 1,
			[itemID("Dharok's greataxe")]: 1,
			[itemID("Guthan's helm")]: 1,
			[itemID("Guthan's platebody")]: 1,
			[itemID("Guthan's chainskirt")]: 1,
			[itemID("Guthan's warspear")]: 1,
			[itemID("Karil's coif")]: 1,
			[itemID("Karil's leathertop")]: 1,
			[itemID("Karil's leatherskirt")]: 1,
			[itemID("Karil's crossbow")]: 1,
			[itemID('Bandos godsword')]: 1,
			[itemID('Spectral spirit shield')]: 1,
			[itemID('Saradomin godsword')]: 1,
			[itemID('Dragon warhammer')]: 1,
			[itemID('Dragonhunter lance')]: 1,
			[itemID("Iban's staff")]: 1,
			[itemID('Dragonfire shield')]: 1,
			[itemID('Anti-dragon shield')]: 1,
			[itemID('Berserker ring')]: 1,
			[itemID('Warrior ring')]: 1,
			20011: 1,
			20014: 1,
			[itemID('Saradomin brew(4)')]: 10000,
			[itemID('Prayer potion(4)')]: 10000,
			[itemID('Super restore(4)')]: 10000
		});
		const loot = {};
		for (const item of Eatables) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
			// @ts-ignore
			loot[item.id] = 1000;
		}
		await msg.author.addItemsToBank(loot);
		return msg.send(
			`Gave you 99 in all skills, ${Util.toKMB(
				2_147_483_647
			)} GP, ${MAX_QP} QP, 1k of all eatable foods, BiS gear in all slots and enough items to kill most bosses!`
		);
	}
}
