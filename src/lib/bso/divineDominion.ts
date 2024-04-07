import { roll, Time } from 'e';
import { Bank, Monsters } from 'oldschooljs';

import { userStatsBankUpdate } from '../../mahoji/mahojiSettings';
import { itemNameFromID } from '../util';
import getOSItem, { getItem } from '../util/getOSItem';
import resolveItems from '../util/resolveItems';

export const gods = [
	{
		name: 'Zamorak',
		pets: resolveItems(['Zamorak egg', 'Baby zamorak hawk', 'Juvenile zamorak hawk', 'Zamorak hawk']),
		warpriestSet: getOSItem('Warpriest of Zamorak set'),
		godItems: resolveItems([
			'Zamorak platebody',
			'Zamorak platelegs',
			'Zamorak full helm',
			'Zamorak kiteshield',
			'Zamorak plateskirt',
			'Zamorak page 1',
			'Zamorak page 2',
			'Zamorak page 3',
			'Zamorak page 4',
			'Zamorak mjolnir',
			'Zamorak bracers',
			"Zamorak d'hide body",
			'Zamorak chaps',
			'Zamorak coif',
			'Zamorak crozier',
			'Zamorak cloak',
			'Zamorak mitre',
			'Zamorak robe top',
			'Zamorak robe legs',
			'Zamorak stole',
			"Zamorak d'hide boots",
			"Zamorak d'hide shield",
			'Zamorak godsword',
			'Zamorakian spear',
			'Zamorakian hasta',
			'Unholy blessing',
			'Staff of the dead'
		]),
		friendlyMonsters: [
			Monsters.Hellhound.id,
			Monsters.KrilTsutsaroth.id,
			Monsters.Skotizo.id,
			Monsters.Vetion.id,
			Monsters.Werewolf.id,
			Monsters.BlackDemon.id,
			Monsters.LesserDemon.id,
			Monsters.AbyssalDemon.id,
			Monsters.RevenantDemon.id,
			Monsters.GreaterDemon.id,
			Monsters.RevenantDemon.id,
			Monsters.ChaosDruid.id,
			Monsters.ChaosDwarf.id
		]
	},
	{
		name: 'Guthix',
		pets: resolveItems(['Guthix egg', 'Baby guthix raptor', 'Juvenile guthix raptor', 'Guthix raptor']),
		godItems: resolveItems([
			'Guthix platebody',
			'Guthix platelegs',
			'Guthix full helm',
			'Guthix kiteshield',
			'Guthix plateskirt',
			'Guthix page 1',
			'Guthix page 2',
			'Guthix page 3',
			'Guthix page 4',
			'Guthix mjolnir',
			'Guthix bracers',
			"Guthix d'hide body",
			'Guthix chaps',
			'Guthix coif',
			'Guthix crozier',
			'Guthix cloak',
			'Guthix mitre',
			'Guthix robe top',
			'Guthix robe legs',
			'Guthix stole',
			"Guthix d'hide boots",
			"Guthix d'hide shield"
		]),
		friendlyMonsters: [
			Monsters.Ent.id,
			Monsters.Gnome.id,
			Monsters.MossGiant.id,
			Monsters.BearCub.id,
			Monsters.BlackBear.id,
			Monsters.TerrorBird.id,
			Monsters.Wolf.id
		]
	},
	{
		name: 'Saradomin',
		pets: resolveItems(['Saradomin egg', 'Baby saradomin owl', 'Juvenile saradomin owl', 'Saradomin owl']),
		warpriestSet: getOSItem('Warpriest of Saradomin set'),
		godItems: resolveItems([
			'Saradomin platebody',
			'Saradomin platelegs',
			'Saradomin full helm',
			'Saradomin kiteshield',
			'Saradomin plateskirt',
			'Saradomin page 1',
			'Saradomin page 2',
			'Saradomin page 3',
			'Saradomin page 4',
			'Saradomin mjolnir',
			'Saradomin bracers',
			"Saradomin d'hide body",
			'Saradomin chaps',
			'Saradomin coif',
			'Saradomin crozier',
			'Saradomin cloak',
			'Saradomin mitre',
			'Saradomin robe top',
			'Saradomin robe legs',
			'Saradomin stole',
			"Saradomin d'hide boots",
			"Saradomin d'hide shield",
			'Saradomin godsword',
			'Saradomin sword',
			'Staff of light',
			'Holy blessing'
		]),
		friendlyMonsters: [Monsters.Barrows.id, Monsters.Paladin.id, Monsters.CommanderZilyana.id, Monsters.Unicorn.id]
	},
	{
		name: 'Bandos',
		warpriestSet: getOSItem('Warpriest of Bandos set'),
		godItems: resolveItems([
			'Bandos platebody',
			'Bandos platelegs',
			'Bandos full helm',
			'Bandos kiteshield',
			'Bandos plateskirt',
			'Bandos page 1',
			'Bandos page 2',
			'Bandos page 3',
			'Bandos page 4',
			'Bandos bracers',
			"Bandos d'hide body",
			'Bandos chaps',
			'Bandos coif',
			'Bandos crozier',
			'Bandos cloak',
			'Bandos mitre',
			'Bandos robe top',
			'Bandos robe legs',
			'Bandos stole',
			"Bandos d'hide boots",
			"Bandos d'hide shield",
			'Bandos godsword',
			'Bandos boots',
			'Bandos tassets',
			'Bandos chestplate',
			'War blessing'
		]),
		friendlyMonsters: [
			Monsters.GeneralGraardor.id,
			Monsters.Goblin.id,
			Monsters.RevenantOrk.id,
			Monsters.Jogre.id,
			Monsters.Ogre.id,
			Monsters.OgressShaman.id,
			Monsters.OgressWarrior.id
		]
	},
	{
		name: 'Armadyl',
		warpriestSet: getOSItem('Warpriest of Armadyl set'),
		godItems: resolveItems([
			'Armadyl platebody',
			'Armadyl platelegs',
			'Armadyl full helm',
			'Armadyl kiteshield',
			'Armadyl plateskirt',
			'Armadyl page 1',
			'Armadyl page 2',
			'Armadyl page 3',
			'Armadyl page 4',
			"Armadyl d'hide body",
			'Armadyl chaps',
			'Armadyl coif',
			'Armadyl crozier',
			'Armadyl cloak',
			'Armadyl mitre',
			'Armadyl robe top',
			'Armadyl robe legs',
			'Armadyl stole',
			"Armadyl d'hide boots",
			"Armadyl d'hide shield",
			'Armadyl godsword',
			'Armadyl bracers'
		]),
		friendlyMonsters: [Monsters.Kreearra.id, Monsters.Aviansie.id]
	}
] as const;

const godNames = gods.map(g => g.name);

export type GodName = (typeof godNames)[number];
export type GodFavourBank = Record<GodName, number>;

export async function divineDominionCheck(user: MUser) {
	const favour = await user.getGodFavour();
	let favourStr = '**Your God Favour:**\n';
	for (const god of gods) {
		const favourForThisGod = favour[god.name];
		favourStr += `${god.name}: ${Math.min(100, favourForThisGod).toFixed(1)}%\n`;
	}

	for (const god of gods) {
		const favourForThisGod = favour[god.name];

		if ('pets' in god && favourForThisGod >= 100) {
			const [egg] = god.pets;
			if (!user.cl.has(egg)) {
				const loot = new Bank().add(egg);
				await user.transactItems({ itemsToAdd: loot, collectionLog: true });
				favourStr += `\nAs a reward for reaching 100% favour with ${god.name}, ${god.name} has awarded you ${loot}.`;
			}
		}
		if ('warpriestSet' in god && favourForThisGod >= 80 && !user.cl.has(god.warpriestSet.id)) {
			const loot = new Bank().add(god.warpriestSet);
			await user.transactItems({ itemsToAdd: loot, collectionLog: true });
			favourStr += `\nAs a reward for reaching 80% favour with ${god.name}, ${god.name} has awarded you ${loot}.`;
		}
	}

	return favourStr;
}
export async function divineDominionSacrificeCommand(user: MUser, itemStr: string, quantity = 1) {
	const item = getItem(itemStr);
	if (!item) {
		return "That item doesn't exist.";
	}

	const cost = new Bank().add(item, quantity);

	if (!user.owns(cost)) {
		return `You don't own ${cost}.`;
	}

	const god = gods.find(g => g.godItems.includes(item.id));
	if (!god) {
		return "That item isn't a god item.";
	}

	const duration = Time.Second * 10;

	await user.transactItems({ itemsToRemove: cost });
	await user.addToGodFavour([god.name], duration * quantity);
	await userStatsBankUpdate(user.id, 'god_items_sacrificed_bank', cost);

	let response = `You sacrificed ${cost} to ${god.name}.

${await divineDominionCheck(user)}`;

	if ('pets' in god) {
		const loot = new Bank();
		for (let i = 0; i < quantity; i++) {
			if (roll(10_000)) {
				response += `\n\n${god.name} has awarded you a ${itemNameFromID(god.pets[0])} for your sacrifice.`;
				loot.add(god.pets[0]);
			}
		}
		if (loot.length > 0) {
			await user.transactItems({ itemsToAdd: loot, collectionLog: true });
		}
	}

	return response;
}

export const allGodlyItems = gods.map(g => g.godItems).flat();
