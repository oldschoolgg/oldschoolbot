import LootTable from 'oldschooljs/dist/structures/LootTable';

export const Ahrims = new LootTable()
	.add("Ahrim's hood")
	.add("Ahrim's robetop")
	.add("Ahrim's robeskirt")
	.add("Ahrim's staff");

export const Dharoks = new LootTable()
	.add("Dharok's helm")
	.add("Dharok's platebody")
	.add("Dharok's platelegs")
	.add("Dharok's greataxe");

export const Guthans = new LootTable()
	.add("Guthan's helm")
	.add("Guthan's platebody")
	.add("Guthan's chainskirt")
	.add("Guthan's warspear");

export const Karils = new LootTable()
	.add("Karil's coif")
	.add("Karil's leathertop")
	.add("Karil's leatherskirt")
	.add("Karil's crossbow");

export const Torags = new LootTable()
	.add("Torag's helm")
	.add("Torag's platebody")
	.add("Torag's platelegs")
	.add("Torag's hammers");

export const Veracs = new LootTable()
	.add("Verac's helm")
	.add("Verac's brassard")
	.add("Verac's plateskirt")
	.add("Verac's flail");

export const AllBarrows = new LootTable()
	.add(Veracs)
	.add(Karils)
	.add(Torags)
	.add(Dharoks)
	.add(Ahrims)
	.add(Guthans);
