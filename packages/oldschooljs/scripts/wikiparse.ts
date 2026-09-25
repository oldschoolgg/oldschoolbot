import { EquipmentSlot } from '@oldschoolgg/gear';

import type { Item, ItemEquipment } from '@/meta/item.js';

interface WikiInfoboxValue {
	text?: string;
	number?: number;
}

type WikiInfobox = Record<string, WikiInfoboxValue | undefined>;

interface WikiItemJSON {
	title: string;
	sections: Array<{
		title: string;
		infoboxes?: WikiInfobox[];
		templates?: Array<{
			template?: string;
			list?: string[];
			speed?: string;
			attackrange?: string;
		}>;
	}>;
}

function convertYesNoToBoolean(value: string | undefined): boolean | undefined {
	if (!value) return undefined;
	return value.toLowerCase() === 'yes';
}

function mapSlotToEquipmentSlot(slot: string): EquipmentSlot {
	const slotMap: Record<string, EquipmentSlot> = {
		weapon: EquipmentSlot.Weapon,
		'2h_sword': EquipmentSlot.TwoHanded,
		'2h': EquipmentSlot.TwoHanded,
		ammo: EquipmentSlot.Ammo,
		body: EquipmentSlot.Body,
		cape: EquipmentSlot.Cape,
		feet: EquipmentSlot.Feet,
		hands: EquipmentSlot.Hands,
		head: EquipmentSlot.Head,
		legs: EquipmentSlot.Legs,
		neck: EquipmentSlot.Neck,
		ring: EquipmentSlot.Ring,
		shield: EquipmentSlot.Shield
	};

	return slotMap[slot.toLowerCase()];
}

function extractCombatStatsInfobox(sections: WikiItemJSON['sections']) {
	for (const section of sections) {
		if (section.title === 'Combat stats' && section.infoboxes) {
			return section.infoboxes[0];
		}
		// Also check infoboxes that have combat stats in the main section
		if (section.infoboxes) {
			for (const infobox of section.infoboxes) {
				if (infobox.astab !== undefined || infobox.slot !== undefined) {
					return infobox;
				}
			}
		}
	}
	return null;
}

function extractMainInfobox(sections: WikiItemJSON['sections']) {
	for (const section of sections) {
		if (section.infoboxes) {
			for (const infobox of section.infoboxes) {
				if (infobox.name || infobox.id || infobox.id1 || infobox.name1) {
					return infobox;
				}
			}
		}
	}
	return null;
}

function getInfoboxVariant(mainInfobox: WikiInfobox, itemID?: number): { id: number; suffix: string } | null {
	if (itemID !== undefined) {
		if (mainInfobox.id?.number === itemID) return { id: itemID, suffix: '' };

		for (const [key, value] of Object.entries(mainInfobox)) {
			const match = /^id(\d+)$/.exec(key);
			if (match && value?.number === itemID) return { id: itemID, suffix: match[1]! };
		}

		if (mainInfobox.id?.text?.split(/\D+/).includes(String(itemID))) return { id: itemID, suffix: '' };
		return null;
	}

	if (Number.isSafeInteger(mainInfobox.id?.number)) return { id: mainInfobox.id!.number!, suffix: '' };
	for (const [key, value] of Object.entries(mainInfobox)) {
		const match = /^id(\d+)$/.exec(key);
		if (match && Number.isSafeInteger(value?.number)) return { id: value!.number!, suffix: match[1]! };
	}
	return null;
}

function getInfoboxValue(infobox: WikiInfobox, key: string, suffix: string): WikiInfoboxValue | undefined {
	return infobox[`${key}${suffix}`] ?? infobox[key];
}

function extractWeaponData(sections: WikiItemJSON['sections']) {
	for (const section of sections) {
		if (section.title === 'Combat stats' && section.templates) {
			const combatStyleTemplate = section.templates.find(t => t.template === 'combatstyles');
			if (combatStyleTemplate) {
				return {
					attack_speed: combatStyleTemplate.speed ? Number.parseInt(combatStyleTemplate.speed) : null
					// stances:
					// 	combatStyleTemplate.list?.map(style => ({
					// 		combat_style: style,
					// 		attack_type: null,
					// 		attack_style: null,
					// 		experience: 'shared', // Default value
					// 		boosts: null
					// 	})) || []
				};
			}
		}
	}
	return null;
}

export function convertWikiJSONToItem(wikiJson: WikiItemJSON, itemID?: number): Item | null {
	const mainInfobox = extractMainInfobox(wikiJson.sections);
	const combatInfobox = extractCombatStatsInfobox(wikiJson.sections);

	if (!mainInfobox) return null;

	const variant = getInfoboxVariant(mainInfobox, itemID);
	if (variant === null) return null;
	const { id, suffix } = variant;

	const name = getInfoboxValue(mainInfobox, 'name', suffix)?.text || wikiJson.title;
	const cost = getInfoboxValue(mainInfobox, 'value', suffix)?.number || 0;
	const members = convertYesNoToBoolean(getInfoboxValue(mainInfobox, 'members', suffix)?.text);
	const tradeable = convertYesNoToBoolean(getInfoboxValue(mainInfobox, 'tradeable', suffix)?.text);
	const exchange = getInfoboxValue(mainInfobox, 'exchange', suffix)?.text?.toLowerCase();
	const tradeableOnGE = exchange === 'yes' || exchange === 'dmm';
	const stackable = convertYesNoToBoolean(getInfoboxValue(mainInfobox, 'stackable', suffix)?.text);
	const equipable = convertYesNoToBoolean(getInfoboxValue(mainInfobox, 'equipable', suffix)?.text);

	const item: Item = {
		id,
		name,
		...(members === true && { members }),
		tradeable,
		tradeable_on_ge: tradeableOnGE,
		// noteable: Boolean(moidData.notedId),
		equipable: equipable as true | undefined,
		cost,
		...(cost > 0
			? {
					lowalch: Math.floor(cost * 0.4),
					highalch: Math.floor(cost * 0.6)
				}
			: {}),

		// ...(geItem?.limit && { buy_limit: geItem.limit }),
		...(tradeable === true && { tradeable }),
		...(stackable === true && { stackable }),
		...(equipable && { equipable: true })
	};

	if (combatInfobox && equipable) {
		const equipmentInfobox = combatInfobox;
		function parseENum(key: string) {
			const inp = getInfoboxValue(equipmentInfobox, key, suffix);
			return Number(inp?.text || inp?.number || 0);
		}
		const equipment: ItemEquipment = {
			attack_stab: parseENum('astab'),
			attack_slash: parseENum('aslash'),
			attack_crush: parseENum('acrush'),
			attack_magic: parseENum('amagic'),
			attack_ranged: parseENum('arange'),
			defence_stab: parseENum('dstab'),
			defence_slash: parseENum('dslash'),
			defence_crush: parseENum('dcrush'),
			defence_magic: parseENum('dmagic'),
			defence_ranged: parseENum('drange'),
			melee_strength: parseENum('str'),
			ranged_strength: parseENum('rstr'),
			magic_damage: parseENum('mdmg'),
			prayer: parseENum('prayer'),
			// @ts-expect-error
			slot: getInfoboxValue(equipmentInfobox, 'slot', suffix)?.text
				? mapSlotToEquipmentSlot(getInfoboxValue(equipmentInfobox, 'slot', suffix)!.text!)
				: undefined,
			requirements: null
		};

		item.equipment = equipment;

		if (equipment.slot === EquipmentSlot.Weapon || equipment.slot === EquipmentSlot.TwoHanded) {
			item.equipable = true;

			const weaponData = extractWeaponData(wikiJson.sections);
			if (weaponData) {
				item.weapon = weaponData;
			}
		}
	}

	return item;
}
