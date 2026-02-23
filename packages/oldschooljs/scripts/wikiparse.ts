import { EquipmentSlot, type Item, type ItemEquipment } from '@/index.js';

interface WikiItemJSON {
	title: string;
	sections: Array<{
		title: string;
		infoboxes?: Array<{
			// Main item properties
			name?: { text: string };
			id?: { text: string; number: number };
			value?: { text: string; number: number };
			weight?: { text: string; number: number };
			members?: { text: string };
			tradeable?: { text: string };
			stackable?: { text: string };
			equipable?: { text: string };

			// Combat stats (if present)
			astab?: { text: string; number: number };
			aslash?: { text: string; number: number };
			acrush?: { text: string; number: number };
			amagic?: { text: string; number: number };
			arange?: { text: string; number: number };
			dstab?: { text: string; number: number };
			dslash?: { text: string; number: number };
			dcrush?: { text: string; number: number };
			dmagic?: { text: string; number: number };
			drange?: { text: string; number: number };
			str?: { text: string; number: number };
			rstr?: { text: string; number: number };
			mdmg?: { text: string; number: number };
			prayer?: { text: string; number: number };
			slot?: { text: string };
			speed?: { text: string; number: number };
			attackrange?: { text: string; number: number };
			combatstyle?: { text: string };
		}>;
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
	for (const section of sections as any[]) {
		if (section.infoboxes) {
			for (const infobox of section.infoboxes) {
				if (infobox.name || infobox.id || infobox['name1']) {
					return infobox;
				}
			}
		}
	}
	return null;
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

export function convertWikiJSONToItem(wikiJson: WikiItemJSON): Item | null {
	const mainInfobox: any = extractMainInfobox(wikiJson.sections);
	const combatInfobox = extractCombatStatsInfobox(wikiJson.sections);

	if (!mainInfobox || !mainInfobox.id || !mainInfobox.name) {
		return null;
	}

	const id = mainInfobox.id?.number || mainInfobox.id1?.number || 0;
	const name = mainInfobox.name?.text || wikiJson.title;
	const cost = mainInfobox.value?.number || 0;
	const members = convertYesNoToBoolean(mainInfobox.members?.text);
	const tradeable = convertYesNoToBoolean(mainInfobox.tradeable?.text);
	const stackable = convertYesNoToBoolean(mainInfobox.stackable?.text);
	const equipable = convertYesNoToBoolean(mainInfobox.equipable?.text);

	const item: Item = {
		id,
		name,
		...(members === true && { members }),
		tradeable,
		tradeable_on_ge: tradeable,
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

	console.log({ mainInfobox, combatInfobox, equipable });
	if (combatInfobox && equipable) {
		function parseENum(
			inp:
				| {
						text: string;
						number: number;
				  }
				| undefined
		) {
			return Number(inp?.text || inp?.number || 0);
		}
		const equipment: ItemEquipment = {
			attack_stab: parseENum(combatInfobox.astab),
			attack_slash: parseENum(combatInfobox.aslash),
			attack_crush: parseENum(combatInfobox.acrush),
			attack_magic: parseENum(combatInfobox.amagic),
			attack_ranged: parseENum(combatInfobox.arange),
			defence_stab: parseENum(combatInfobox.dstab),
			defence_slash: parseENum(combatInfobox.dslash),
			defence_crush: parseENum(combatInfobox.dcrush),
			defence_magic: parseENum(combatInfobox.dmagic),
			defence_ranged: parseENum(combatInfobox.drange),
			melee_strength: parseENum(combatInfobox.str),
			ranged_strength: parseENum(combatInfobox.rstr),
			magic_damage: parseENum(combatInfobox.mdmg),
			prayer: parseENum(combatInfobox.prayer),
			// @ts-expect-error
			slot: combatInfobox.slot?.text ? mapSlotToEquipmentSlot(combatInfobox.slot.text)! : undefined,
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
