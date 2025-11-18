import { globalConfig } from '@/lib/constants.js';

export const skillEmoji = {
	runecraft: '<:runecraft:630911040435257364>',
	firemaking: '<:firemaking:630911040175210518>',
	thieving: '<:thieving:630910829352452123>',
	mining: '<:mining:630911040128811010>',
	ranged: '<:ranged:630911040258834473>',
	construction: '<:construction:630911040493715476>',
	smithing: '<:smithing:630911040452034590>',
	herblore: '<:herblore:630911040535658496>',
	attack: '<:attack:630911039969427467>',
	strength: '<:strength:630911040481263617>',
	defence: '<:defence:630911040393052180>',
	fishing: '<:fishing:630911040091193356>',
	hitpoints: '<:hitpoints:630911040460292108>',
	total: '<:xp:630911040510623745>',
	overall: '<:xp:630911040510623745>',
	magic: '<:magic:630911040334331917>',
	crafting: '<:crafting:630911040460161047>',
	agility: '<:agility:630911040355565568>',
	fletching: '<:fletching:630911040544309258>',
	cooking: '<:cooking:630911040426868756>',
	farming: '<:farming:630911040355565599>',
	slayer: '<:slayer:630911040560824330>',
	prayer: '<:prayer:630911040426868746>',
	woodcutting: '<:woodcutting:630911040099450892>',
	hunter: '<:hunter:630911040166559784>',
	cml: '<:CrystalMathLabs:364657225249062912>',
	clock: '<:ehpclock:352323705210142721>',
	combat: '<:combat:802136963956080650>',
	dungeoneering: '<:dungeoneering:828683755198873623>',
	invention: '<:Invention:936219232146980874>',
	divination: '<:Divination:1187656347345494116>'
};

export const EmojiId = {
	ClueScroll: '365003979840552960',
	Farming: '630911040355565599',
	Casket: '365003978678730772',
	Seedpack: '977410792754413668',
	Slayer: '630911040560824330',
	MoneyBag: '493286312854683654',
	BirdsNest: '692946556399124520',
	Leagues: '660333438016028723',
	Gear: '835314891950129202',
	Minion: '778418736180494347',
	MysteryBox: '680783258488799277',
	Bank: '739459924693614653',
	ItemContract: '988422348434718812',
	HugeXPLamp: '988325171498721290',
	Fishing: '630911040091193356',
};

export const ReactEmoji = globalConfig.isProduction
	? {
		Happy: 'RSHappy:380915244760825857',
		Sad: 'RSSad:380915244652036097',
		Gift: '🎁'
	}
	: {
		Happy: '😃',
		Sad: '😞',
		Gift: '🎁'
	};

export const miscEmojis = {
	barrowsChests: '<:Dharoks_helm:403038864199122947>',
	hespori: '<:Bottomless_compost_bucket:545978484078411777>',
	bryophyta: '<:Bryophytas_essence:455835859799769108>',
	crazyArchaeologist: '<:Fedora:456179157303427092>',
	derangedArchaeologist: '<:Fedora:456179157303427092>',
	mimic: '<:Casket:365003978678730772>',
	obor: '<:Hill_giant_club:421045456194240523>'
} as const;
