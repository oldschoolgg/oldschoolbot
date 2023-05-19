const { writeFileSync } = require("fs");
const { Monsters } = require("oldschooljs");

const arr = [
	{
		Monster: "Aberrant Spectre",
		Name: "Noxious Foe",
		Description: "Kill an Aberrant Spectre.",
		Type: "Kill Count",
	},
	{
		Monster: "Barrows",
		Name: "Barrows Novice",
		Description: "Open the Barrows chest 10 times.",
		Type: "Kill Count",
	},
	{
		Monster: "Barrows",
		Name: "Defence? What Defence?",
		Description: "Kill any Barrows Brother using only magical damage.",
		Type: "Restriction",
	},
	{
		Monster: "Black Dragon",
		Name: "Big, Black and Fiery",
		Description: "Kill a Black Dragon.",
		Type: "Kill Count",
	},
	{
		Monster: "Bloodveld",
		Name: "The Demonic Punching Bag",
		Description: "Kill a Bloodveld.",
		Type: "Kill Count",
	},
	{
		Monster: "Bryophyta",
		Name: "Preparation Is Key",
		Description: "Kill Bryophyta without suffering any poison damage.",
		Type: "Perfection",
	},
	{
		Monster: "Bryophyta",
		Name: "Fighting as Intended II",
		Description: "Kill Bryophyta on a free to play world.",
		Type: "Restriction",
	},
	{
		Monster: "Bryophyta",
		Name: "Bryophyta Novice",
		Description: "Kill Bryophyta once.",
		Type: "Kill Count",
	},
	{
		Monster: "Bryophyta",
		Name: "A Slow Death",
		Description:
			"Kill Bryophyta with either poison or venom being the final source of damage.",
		Type: "Restriction",
	},
	{
		Monster: "Bryophyta",
		Name: "Protection from Moss",
		Description:
			"Kill Bryophyta with the Protect from Magic prayer active.",
		Type: "Mechanical",
	},
	{
		Monster: "Deranged Archaeologist",
		Name: "Deranged Archaeologist Novice",
		Description: "Kill the Deranged Archaeologist 10 times.",
		Type: "Kill Count",
	},
	{
		Monster: "Fire Giant",
		Name: "The Walking Volcano",
		Description: "Kill a Fire Giant.",
		Type: "Kill Count",
	},
	{
		Monster: "Giant Mole",
		Name: "Giant Mole Novice",
		Description: "Kill the Giant Mole 10 times.",
		Type: "Kill Count",
	},
	{
		Monster: "Greater Demon",
		Name: "A Greater Foe",
		Description: "Kill a Greater Demon.",
		Type: "Kill Count",
	},
	{
		Monster: "Greater Demon",
		Name: "Not So Great After All",
		Description: "Finish off a Greater Demon with a demonbane weapon.",
		Type: "Restriction",
	},
	{
		Monster: "Hellhound",
		Name: "A Demon's Best Friend",
		Description: "Kill a Hellhound.",
		Type: "Kill Count",
	},
	{
		Monster: "King Black Dragon",
		Name: "King Black Dragon Novice",
		Description: "Kill the King Black Dragon 10 times.",
		Type: "Kill Count",
	},
	{
		Monster: "Lizardman Shaman",
		Name: "A Scaley Encounter",
		Description: "Kill a Lizardman Shaman.",
		Type: "Kill Count",
	},
	{
		Monster: "Lizardman Shaman",
		Name: "Shayzien Protector",
		Description:
			"Kill a Lizardman Shaman in Molch which has not dealt damage to anyone. (excluding its Spawns)",
		Type: "Perfection",
	},
	{
		Monster: "N/A",
		Name: "Into the Den of Giants",
		Description:
			"Kill a Hill Giant, Moss Giant and Fire Giant in the Giant Cave within the Shayzien region.",
		Type: "Kill Count",
	},
	{
		Monster: "Obor",
		Name: "Obor Novice",
		Description: "Kill Obor once.",
		Type: "Kill Count",
	},
	{
		Monster: "Obor",
		Name: "Fighting as Intended",
		Description: "Kill Obor on a free to play world.",
		Type: "Restriction",
	},
	{
		Monster: "Obor",
		Name: "Sleeping Giant",
		Description: "Kill Obor whilst he is immobilized.",
		Type: "Mechanical",
	},
	{
		Monster: "Sarachnis",
		Name: "Sarachnis Novice",
		Description: "Kill Sarachnis 10 times.",
		Type: "Kill Count",
	},
	{
		Monster: "Tempoross",
		Name: "Master of Buckets",
		Description:
			"Extinguish at least 5 fires during a single Tempoross fight.",
		Type: "Mechanical",
	},
	{
		Monster: "Tempoross",
		Name: "Calm Before the Storm",
		Description: "Repair either a mast or a totem pole.",
		Type: "Mechanical",
	},
	{
		Monster: "Tempoross",
		Name: "Fire in the Hole!",
		Description:
			"Attack Tempoross from both sides by loading both cannons on both ships.",
		Type: "Mechanical",
	},
	{
		Monster: "Tempoross",
		Name: "Tempoross Novice",
		Description: "Subdue Tempoross 5 times.",
		Type: "Kill Count",
	},
	{
		Monster: "Wintertodt",
		Name: "Handyman",
		Description:
			"Repair a brazier which has been destroyed by the Wintertodt.",
		Type: "Mechanical",
	},
	{
		Monster: "Wintertodt",
		Name: "Cosy",
		Description:
			"Subdue the Wintertodt with four pieces of warm equipment equipped.",
		Type: "Restriction",
	},
	{
		Monster: "Wintertodt",
		Name: "Mummy!",
		Description: "Heal a pyromancer after they have fallen.",
		Type: "Mechanical",
	},
	{
		Monster: "Wintertodt",
		Name: "Wintertodt Novice",
		Description: "Subdue the Wintertodt 5 times.",
		Type: "Kill Count",
	},
	{
		Monster: "Wyrm",
		Name: "A Slithery Encounter",
		Description: "Kill a Wyrm.",
		Type: "Kill Count",
	},
];

function extractFirstNumber(str) {
	const match = str.match(/\d+/);
	return match ? parseInt(match[0]) : null;
}

const overrides = [
	["Wintertodt", "wintertodt"],
	["Tempoross", "tempoross"],
];

let idBase = 1;
writeFileSync(
	"tasks.json",
	JSON.stringify(
		arr.map((i) => {
			let kcReq =
				i.Monster && i.Type === "Kill Count"
					? {
							monsterID: Monsters.find(
								(t) =>
									t.name.toLowerCase() ===
									i.Monster?.toLowerCase()
							)?.id,
							qty: extractFirstNumber(i.Description) ?? 1,
					  }
					: undefined;

			if (!kcReq?.monsterID) {
				kcReq = undefined;
			}

			let minigameReq = undefined;
			if (i.Type === "Kill Count") {
				for (const [srcName, minigameName] of overrides) {
					if (i.Monster !== srcName) continue;
					kcReq = undefined;
					minigameReq = {
						minigame: minigameName,
						qty: extractFirstNumber(i.Description),
					};
				}
			}
			return {
				name: i.Name,
				type: i.Type.toLowerCase().replace(/ /g, "_"),
				desc: i.Description,
				id: idBase++,
				kcReq,
				minigameReq,
			};
		}),
		null,
		4
	)
);
