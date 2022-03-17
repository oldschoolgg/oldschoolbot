import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Clothing: DisassemblySourceGroup = {
	name: 'Clothing',
	items: [
		{ item: i('Bedsheet'), lvl: 1, partQuantity: 1 },
		{ item: i('Black santa hat'), lvl: 1, partQuantity: 1 },
		{
			item: i('Black beret'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{
			item: i('Black boater'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{
			item: i('Black cavalier'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{ item: i('Black desert robe'), lvl: 1, partQuantity: 1 },
		{ item: i('Black desert shirt'), lvl: 1, partQuantity: 1 },
		{
			item: i('Black dragon mask'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{
			item: i('Black elegant legs'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{
			item: i('Black elegant shirt'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{ item: i('Black goblin mail'), lvl: 1, partQuantity: 1 },
		{
			item: i('Black headband'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{ item: i('Black naval shirt'), lvl: 1, partQuantity: 1 },
		{ item: i('Black navy slacks'), lvl: 1, partQuantity: 1 },
		{ item: i('Black satchel'), lvl: 1, partQuantity: 1 },
		{ item: i('Black tricorn hat'), lvl: 1, partQuantity: 1 },
		{
			item: i('Black unicorn mask'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{
			item: i('Blue beret'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{
			item: i('Blue boater'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{ item: i('Blue boots'), lvl: 1, partQuantity: 1 },
		{
			item: i('Blue dragon mask'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{
			item: i('Blue elegant blouse'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{
			item: i('Blue elegant legs'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{
			item: i('Blue elegant shirt'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{
			item: i('Blue elegant skirt'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{ item: i('Blue goblin mail'), lvl: 1, partQuantity: 1 },
		{ item: i('Blue hat'), lvl: 1, partQuantity: 1 },
		{ item: i('Blue naval shirt'), lvl: 1, partQuantity: 1 },
		{ item: i('Blue navy slacks'), lvl: 1, partQuantity: 1 },
		{ item: i('Blue robe bottoms'), lvl: 1, partQuantity: 1 },
		{ item: i('Blue robe top'), lvl: 1, partQuantity: 1 },
		{ item: i('Blue tricorn hat'), lvl: 1, partQuantity: 1 },
		{ item: i('Bomber cap'), lvl: 1, partQuantity: 1 },
		{ item: i('Bomber jacket'), lvl: 1, partQuantity: 1 },
		{ item: i('Bonesack'), lvl: 1, partQuantity: 1 },
		{ item: i("Book of 'h.a.m'"), lvl: 1, partQuantity: 1 },
		{ item: i('Book of portraiture'), lvl: 1, partQuantity: 1 },
		{ item: i('Bow-sword'), lvl: 1, partQuantity: 1 },
		{
			item: i('Bronze dragon mask'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{ item: i('Brown apron'), lvl: 1, partQuantity: 1 },
		{
			item: i('Brown headband'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{ item: i('Brown naval shirt'), lvl: 1, partQuantity: 1 },
		{ item: i('Brown navy slacks'), lvl: 1, partQuantity: 1 },
		{ item: i('Brown tricorn hat'), lvl: 1, partQuantity: 1 },
		{ item: i("Builder's boots"), lvl: 1, partQuantity: 1 },
		{ item: i("Builder's shirt"), lvl: 1, partQuantity: 1 },
		{ item: i("Builder's trousers"), lvl: 1, partQuantity: 1 },
		{ item: i('Camo bottoms'), lvl: 1, partQuantity: 1 },
		{ item: i('Camo helmet'), lvl: 1, partQuantity: 1 },
		{ item: i('Camo top'), lvl: 1, partQuantity: 1 },
		{ item: i('Cap and goggles'), lvl: 1, partQuantity: 1 },
		{
			item: i('Cat mask'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{ item: i("Chef's hat"), lvl: 1, partQuantity: 1 },
		{ item: i('Citizen shoes'), lvl: 1, partQuantity: 1 },
		{ item: i('Citizen top'), lvl: 1, partQuantity: 1 },
		{ item: i('Citizen trousers'), lvl: 1, partQuantity: 1 },
		{ item: i('Clockwork suit'), lvl: 1, partQuantity: 1 },
		{ item: i('Crab claw'), lvl: 1, partQuantity: 1 },
		{ item: i('Crab helmet'), lvl: 1, partQuantity: 1 },
		{ item: i('Cream boots'), lvl: 1, partQuantity: 1 },
		{ item: i('Cream hat'), lvl: 1, partQuantity: 1 },
		{ item: i('Cream robe bottoms'), lvl: 1, partQuantity: 1 },
		{ item: i('Cream robe top'), lvl: 1, partQuantity: 1 },
		{ item: i('Crystal saw'), lvl: 1, partQuantity: 1 },
		{
			item: i('Dark cavalier'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{ item: i('Defensive shield'), lvl: 1, partQuantity: 1 },
		{ item: i('Desert boots'), lvl: 1, partQuantity: 1 },
		{ item: i('Desert disguise'), lvl: 1, partQuantity: 1 },
		{ item: i('Desert legs'), lvl: 1, partQuantity: 1 },
		{ item: i('Desert robe'), lvl: 1, partQuantity: 1 },
		{ item: i('Desert robes'), lvl: 1, partQuantity: 1 },
		{ item: i('Desert shirt'), lvl: 1, partQuantity: 1 },
		{ item: i('Desert top'), lvl: 1, partQuantity: 1 },
		{ item: i("Doctor's hat"), lvl: 1, partQuantity: 1 },
		{ item: i("Druid's robe top"), lvl: 1, partQuantity: 1 },
		{ item: i('Eagle cape'), lvl: 1, partQuantity: 1 },
		{ item: i("Elvarg's head"), lvl: 1, partQuantity: 1 },
		{ item: i('Enchanted lyre'), lvl: 1, partQuantity: 1 },
		{ item: i('Fake beak'), lvl: 1, partQuantity: 1 },
		{ item: i('Fez'), lvl: 1, partQuantity: 1 },
		{ item: i('Fish food'), lvl: 1, partQuantity: 1 },
		{ item: i('Fishbowl helmet'), lvl: 1, partQuantity: 1 },
		{
			item: i('Flared trousers'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{ item: i('Flippers'), lvl: 1, partQuantity: 1 },
		{ item: i('Fremennik boots'), lvl: 1, partQuantity: 1 },
		{ item: i('Fremennik hat'), lvl: 1, partQuantity: 1 },
		{ item: i('Fremennik robe'), lvl: 1, partQuantity: 1 },
		{ item: i('Fremennik skirt'), lvl: 1, partQuantity: 1 },
		{ item: i('Frog mask'), lvl: 1, partQuantity: 1 },
		{ item: i('Gardening boots'), lvl: 1, partQuantity: 1 },
		{ item: i('Gas mask'), lvl: 1, partQuantity: 1 },
		{ item: i('Ghostly boots'), lvl: 1, partQuantity: 1 },
		{ item: i('Ghostly cloak'), lvl: 1, partQuantity: 1 },
		{ item: i('Ghostly gloves'), lvl: 1, partQuantity: 1 },
		{ item: i('Ghostly hood'), lvl: 1, partQuantity: 1 },
		{ item: i('Gnome goggles'), lvl: 1, partQuantity: 1 },
		{ item: i('Gnomeball'), lvl: 1, partQuantity: 1 },
		{ item: i('Goblin mail'), lvl: 1, partQuantity: 1 },
		{ item: i('Gold helmet'), lvl: 1, partQuantity: 1 },
		{ item: i('Gold satchel'), lvl: 1, partQuantity: 1 },
		{ item: i('Gorilla greegree'), lvl: 1, partQuantity: 1 },
		{ item: i('Granite (5kg)'), lvl: 1, partQuantity: 1 },
		{
			item: i('Green boater'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{ item: i('Green boots'), lvl: 1, partQuantity: 1 },
		{
			item: i('Green dragon mask'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{
			item: i('Green elegant blouse'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{
			item: i('Green elegant legs'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{
			item: i('Green elegant shirt'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{
			item: i('Green elegant skirt'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{ item: i('Green goblin mail'), lvl: 1, partQuantity: 1 },
		{ item: i('Green hat'), lvl: 1, partQuantity: 1 },
		{ item: i('Green naval shirt'), lvl: 1, partQuantity: 1 },
		{ item: i('Green navy slacks'), lvl: 1, partQuantity: 1 },
		{ item: i('Green robe bottoms'), lvl: 1, partQuantity: 1 },
		{ item: i('Green robe top'), lvl: 1, partQuantity: 1 },
		{ item: i('Green satchel'), lvl: 1, partQuantity: 1 },
		{ item: i('Green tricorn hat'), lvl: 1, partQuantity: 1 },
		{ item: i('Grey naval shirt'), lvl: 1, partQuantity: 1 },
		{ item: i('Grey navy slacks'), lvl: 1, partQuantity: 1 },
		{ item: i('Grey tricorn hat'), lvl: 1, partQuantity: 1 },
		{ item: i('Ham boots'), lvl: 1, partQuantity: 1 },
		{ item: i('Ham cloak'), lvl: 1, partQuantity: 1 },
		{ item: i('Ham gloves'), lvl: 1, partQuantity: 1 },
		{ item: i('Ham hood'), lvl: 1, partQuantity: 1 },
		{ item: i('Ham robe'), lvl: 1, partQuantity: 1 },
		{ item: i('Ham shirt'), lvl: 1, partQuantity: 1 },
		{ item: i('Hard hat'), lvl: 1, partQuantity: 1 },
		{
			item: i('Highwayman mask'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{ item: i('Infused wand'), lvl: 1, partQuantity: 1 },
		{
			item: i('Iron dragon mask'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{ item: i('Karambwan vessel'), lvl: 1, partQuantity: 1 },
		{ item: i('Lederhosen hat'), lvl: 1, partQuantity: 1 },
		{ item: i('Lederhosen shorts'), lvl: 1, partQuantity: 1 },
		{ item: i('Lederhosen top'), lvl: 1, partQuantity: 1 },
		{ item: i('Left eye patch'), lvl: 1, partQuantity: 1 },
		{ item: i('Lyre'), lvl: 1, partQuantity: 1 },
		{ item: i('Magic ogre potion'), lvl: 1, partQuantity: 1 },
		{ item: i('Mime boots'), lvl: 1, partQuantity: 1 },
		{ item: i('Mime gloves'), lvl: 1, partQuantity: 1 },
		{ item: i('Mime legs'), lvl: 1, partQuantity: 1 },
		{ item: i('Mime mask'), lvl: 1, partQuantity: 1 },
		{ item: i('Mime top'), lvl: 1, partQuantity: 1 },
		{ item: i('Mining helmet'), lvl: 1, partQuantity: 1 },
		{
			item: i('Mithril dragon mask'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{ item: i("Monk's robe top"), lvl: 1, partQuantity: 1 },
		{ item: i('Moonclan armour'), lvl: 1, partQuantity: 1 },
		{ item: i('Moonclan boots'), lvl: 1, partQuantity: 1 },
		{ item: i('Moonclan cape'), lvl: 1, partQuantity: 1 },
		{ item: i('Moonclan gloves'), lvl: 1, partQuantity: 1 },
		{ item: i('Moonclan hat'), lvl: 1, partQuantity: 1 },
		{ item: i('Moonclan helm'), lvl: 1, partQuantity: 1 },
		{ item: i('Moonclan skirt'), lvl: 1, partQuantity: 1 },
		{ item: i('Mourner boots'), lvl: 1, partQuantity: 1 },
		{ item: i('Mourner cloak'), lvl: 1, partQuantity: 1 },
		{ item: i('Mourner gloves'), lvl: 1, partQuantity: 1 },
		{ item: i('Mourner top'), lvl: 1, partQuantity: 1 },
		{ item: i('Mourner trousers'), lvl: 1, partQuantity: 1 },
		{ item: i('Mud'), lvl: 1, partQuantity: 1 },
		{ item: i('Mudskipper hat'), lvl: 1, partQuantity: 1 },
		{ item: i('Necromancy book'), lvl: 1, partQuantity: 1 },
		{ item: i('Ninja monkey greegree'), lvl: 1, partQuantity: 1 },
		{ item: i('Nurse hat'), lvl: 1, partQuantity: 1 },
		{
			item: i('Orange boater'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{ item: i('Orange goblin mail'), lvl: 1, partQuantity: 1 },
		{ item: i('Oyster pearl'), lvl: 1, partQuantity: 1 },
		{ item: i('Oyster pearls'), lvl: 1, partQuantity: 1 },
		{
			item: i('Pantaloons'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{
			item: i('Penguin mask'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{ item: i('Pet rock'), lvl: 1, partQuantity: 1 },
		{ item: i('Pink boots'), lvl: 1, partQuantity: 1 },
		{ item: i('Pink goblin mail'), lvl: 1, partQuantity: 1 },
		{ item: i('Pink hat'), lvl: 1, partQuantity: 1 },
		{ item: i('Pink robe bottoms'), lvl: 1, partQuantity: 1 },
		{ item: i('Pink robe top'), lvl: 1, partQuantity: 1 },
		{ item: i('Pink skirt'), lvl: 1, partQuantity: 1 },
		{ item: i('Pirate boots'), lvl: 1, partQuantity: 1 },
		{
			item: i("Pirate's hat"),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{
			item: i('Pith helmet'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{ item: i('Plain satchel'), lvl: 1, partQuantity: 1 },
		{ item: i('Polar camo legs'), lvl: 1, partQuantity: 1 },
		{ item: i('Polar camo top'), lvl: 1, partQuantity: 1 },
		{ item: i('Prince leggings'), lvl: 1, partQuantity: 1 },
		{ item: i('Prince tunic'), lvl: 1, partQuantity: 1 },
		{ item: i('Princess blouse'), lvl: 1, partQuantity: 1 },
		{ item: i('Princess skirt'), lvl: 1, partQuantity: 1 },
		{
			item: i('Purple elegant blouse'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{
			item: i('Purple elegant legs'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{
			item: i('Purple elegant shirt'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{
			item: i('Purple elegant skirt'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{ item: i('Purple goblin mail'), lvl: 1, partQuantity: 1 },
		{ item: i('Purple naval shirt'), lvl: 1, partQuantity: 1 },
		{ item: i('Purple navy slacks'), lvl: 1, partQuantity: 1 },
		{ item: i('Purple tricorn hat'), lvl: 1, partQuantity: 1 },
		{ item: i("Queen's secateurs"), lvl: 1, partQuantity: 1 },
		{
			item: i('Red boater'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{
			item: i('Red dragon mask'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{
			item: i('Red elegant blouse'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{
			item: i('Red elegant legs'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{
			item: i('Red elegant shirt'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{
			item: i('Red elegant skirt'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{ item: i('Red goblin mail'), lvl: 1, partQuantity: 1 },
		{
			item: i('Red headband'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{ item: i('Red naval shirt'), lvl: 1, partQuantity: 1 },
		{ item: i('Red navy slacks'), lvl: 1, partQuantity: 1 },
		{ item: i('Red satchel'), lvl: 1, partQuantity: 1 },
		{ item: i('Red tricorn hat'), lvl: 1, partQuantity: 1 },
		{ item: i('Rock hammer'), lvl: 1, partQuantity: 1 },
		{ item: i('Rock pick'), lvl: 1, partQuantity: 1 },
		{ item: i('Rogue boots'), lvl: 1, partQuantity: 1 },
		{ item: i('Rogue gloves'), lvl: 1, partQuantity: 1 },
		{ item: i('Rogue mask'), lvl: 1, partQuantity: 1 },
		{ item: i('Rogue top'), lvl: 1, partQuantity: 1 },
		{ item: i('Rogue trousers'), lvl: 1, partQuantity: 1 },
		{ item: i('Rose tinted lens'), lvl: 1, partQuantity: 1 },
		{ item: i('Royal crown'), lvl: 1, partQuantity: 1 },
		{
			item: i('Rune dragon mask'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{ item: i('Rune satchel'), lvl: 1, partQuantity: 1 },
		{
			item: i('Samurai kasa'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{ item: i('Sandbag'), lvl: 1, partQuantity: 1 },
		{ item: i('Saw'), lvl: 1, partQuantity: 1 },
		{ item: i('Secateurs'), lvl: 1, partQuantity: 1 },
		{ item: i('Selected iron'), lvl: 1, partQuantity: 1 },
		{ item: i('Shade robe top'), lvl: 1, partQuantity: 1 },
		{ item: i('Shrink-me-quick'), lvl: 1, partQuantity: 1 },
		{ item: i('Silly jester boots'), lvl: 1, partQuantity: 1 },
		{ item: i('Silly jester hat'), lvl: 1, partQuantity: 1 },
		{ item: i('Silly jester tights'), lvl: 1, partQuantity: 1 },
		{ item: i('Silly jester top'), lvl: 1, partQuantity: 1 },
		{ item: i('Slave boots'), lvl: 1, partQuantity: 1 },
		{ item: i('Slave robe'), lvl: 1, partQuantity: 1 },
		{ item: i('Slave shirt'), lvl: 1, partQuantity: 1 },
		{ item: i('Sled'), lvl: 1, partQuantity: 1 },
		{
			item: i('Sleeping cap'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{ item: i('Snake charm'), lvl: 1, partQuantity: 1 },
		{ item: i('Stake'), lvl: 1, partQuantity: 1 },
		{
			item: i('Steel dragon mask'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{ item: i('Stethoscope'), lvl: 1, partQuantity: 1 },
		{ item: i('Stone bowl'), lvl: 1, partQuantity: 1 },
		{
			item: i('Tan cavalier'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{ item: i('Thatch spar dense'), lvl: 1, partQuantity: 1 },
		{ item: i('Thatch spar light'), lvl: 1, partQuantity: 1 },
		{ item: i('Tiara'), lvl: 1, partQuantity: 1 },
		{
			item: i('Top hat'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{ item: i('Turquoise boots'), lvl: 1, partQuantity: 1 },
		{ item: i('Turquoise hat'), lvl: 1, partQuantity: 1 },
		{ item: i('Turquoise robe bottoms'), lvl: 1, partQuantity: 1 },
		{ item: i('Turquoise robe top'), lvl: 1, partQuantity: 1 },
		{ item: i('Unstrung lyre'), lvl: 1, partQuantity: 1 },
		{ item: i('Vyrewatch legs'), lvl: 1, partQuantity: 1 },
		{ item: i('Vyrewatch shoes'), lvl: 1, partQuantity: 1 },
		{ item: i('Vyrewatch top'), lvl: 1, partQuantity: 1 },
		{ item: i('Wax'), lvl: 1, partQuantity: 1 },
		{ item: i('White apron'), lvl: 1, partQuantity: 1 },
		{
			item: i('White beret'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{
			item: i('White elegant blouse'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{
			item: i('White elegant skirt'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{
			item: i('White unicorn mask'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{
			item: i('Wolf mask'),
			lvl: 1,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{ item: i('Wood camo legs'), lvl: 1, partQuantity: 1 },
		{ item: i('Wood camo top'), lvl: 1, partQuantity: 1 },
		{ item: i('Yellow goblin mail'), lvl: 1, partQuantity: 1 },
		{ item: i('Zombie boots'), lvl: 1, partQuantity: 1 },
		{ item: i('Zombie gloves'), lvl: 1, partQuantity: 1 },
		{ item: i('Zombie mask'), lvl: 1, partQuantity: 1 },
		{ item: i('Zombie monkey greegree'), lvl: 1, partQuantity: 1 },
		{ item: i('Zombie shirt'), lvl: 1, partQuantity: 1 },
		{ item: i('Zombie trousers'), lvl: 1, partQuantity: 1 },
		{ item: i('Jungle camo legs'), lvl: 4, partQuantity: 1 },
		{ item: i('Jungle camo top'), lvl: 4, partQuantity: 1 },
		{ item: i('Desert camo legs'), lvl: 10, partQuantity: 1 },
		{ item: i('Desert camo top'), lvl: 10, partQuantity: 1 },
		{ item: i('Facemask'), lvl: 10, partQuantity: 1 },
		{ item: i('Earmuffs'), lvl: 15, partQuantity: 1 },
		{
			item: i('Guthix robe legs'),
			lvl: 20,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{
			item: i('Guthix robe top'),
			lvl: 20,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{
			item: i('Saradomin robe legs'),
			lvl: 20,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{
			item: i('Saradomin robe top'),
			lvl: 20,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{
			item: i('Zamorak robe legs'),
			lvl: 20,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{
			item: i('Zamorak robe top'),
			lvl: 20,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{ item: i('Larupia hat'), lvl: 28, partQuantity: 1 },
		{ item: i('Larupia legs'), lvl: 28, partQuantity: 1 },
		{ item: i('Larupia top'), lvl: 28, partQuantity: 1 },
		{ item: i('Lit bug lantern'), lvl: 33, partQuantity: 1 },
		{ item: i('Unlit bug lantern'), lvl: 33, partQuantity: 1 },
		{ item: i('Graahk headdress'), lvl: 38, partQuantity: 1 },
		{ item: i('Graahk legs'), lvl: 38, partQuantity: 1 },
		{ item: i('Graahk top'), lvl: 38, partQuantity: 1 },
		{
			item: i('Guthix cloak'),
			lvl: 40,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{
			item: i('Saradomin cloak'),
			lvl: 40,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{ item: i('Spotted cape'), lvl: 40, partQuantity: 1 },
		{
			item: i('Zamorak cloak'),
			lvl: 40,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{ item: i('Slayer gloves'), lvl: 42, partQuantity: 1 },
		{ item: i('Lumberjack boots'), lvl: 44, partQuantity: 1 },
		{ item: i('Lumberjack hat'), lvl: 44, partQuantity: 1 },
		{ item: i('Lumberjack legs'), lvl: 44, partQuantity: 1 },
		{ item: i('Lumberjack top'), lvl: 44, partQuantity: 1 },
		{ item: i('Kyatt hat'), lvl: 52, partQuantity: 1 },
		{ item: i('Kyatt legs'), lvl: 52, partQuantity: 1 },
		{ item: i('Kyatt top'), lvl: 52, partQuantity: 1 },
		{ item: i('Gloves of silence'), lvl: 54, partQuantity: 1 },
		{
			item: i('Armadyl stole'),
			lvl: 60,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{
			item: i('Bandos stole'),
			lvl: 60,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{
			item: i('Guthix stole'),
			lvl: 60,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{ item: i('Nose peg'), lvl: 60, partQuantity: 1 },
		{
			item: i('Saradomin stole'),
			lvl: 60,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{
			item: i('Zamorak stole'),
			lvl: 60,
			partQuantity: 1,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 1 }] }
		},
		{ item: i('Spottier cape'), lvl: 66, partQuantity: 1 }
	],
	parts: { simple: 35, padded: 29, cover: 35, variable: 1 }
};

export default Clothing;
