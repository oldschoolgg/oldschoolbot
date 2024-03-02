import { AttachmentBuilder, bold } from 'discord.js';
import { notEmpty, objectEntries, randArrItem, randInt, Time } from 'e';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { divinationEnergies } from '../../../lib/bso/divination';
import { BitField } from '../../../lib/constants';
import { addToDoubleLootTimer } from '../../../lib/doubleLoot';
import { allDyes, dyedItems } from '../../../lib/dyedItems';
import { gearImages } from '../../../lib/gear/functions/generateGearImage';
import { mysteriousStepData } from '../../../lib/mysteryTrail';
import { makeScriptImage } from '../../../lib/scriptImages';
import { assert } from '../../../lib/util';
import getOSItem, { getItem } from '../../../lib/util/getOSItem';
import { flowerTable } from './hotColdCommand';

const messageInABottleMessages = [
	"We are but a week from finishing our journey, yet the seas have claimed my dearest and only friend, Felris, a noble pup. He was loyal and uplifting, and warmed the heart on a cold day. The tragedy of his loss echoes in the lonely crash of the waves, a vivid reminder of a journey he couldn't complete. Alone, I endure, with only his memory as my companion.",
	`Dear Finder,


Let me introduce you to Slippy, a crewmate whose snores are the stuff of legends. Once, in the dead calm of night, his thunderous snoring was mistaken for an approaching storm, causing a panic-induced sail reefing operation. In our world, it's not "Beware of the Kraken", it's "Beware of Slippy's snores".`,
	`Crewmen,


Tis the last time I will warn ye, if we would come upon he who we shall not name, man the ballista's, and remember... FSR.


Focus.
Shoot.
Reload.

~ Your Captain`
];

interface Usable {
	items: Item[];
	run: (user: MUser) => CommandResponse | Awaited<CommandResponse>;
}
export const usables: Usable[] = [];

interface UsableUnlock {
	item: Item;
	bitfield: BitField;
	resultMessage: string;
}
const usableUnlocks: UsableUnlock[] = [
	{
		item: getOSItem('Torn prayer scroll'),
		bitfield: BitField.HasTornPrayerScroll,
		resultMessage: 'You used your Torn prayer scroll, and unlocked the Preserve prayer.'
	},
	{
		item: getOSItem('Dexterous prayer scroll'),
		bitfield: BitField.HasDexScroll,
		resultMessage: 'You used your Dexterous prayer scroll, and unlocked the Rigour prayer.'
	},
	{
		item: getOSItem('Arcane prayer scroll'),
		bitfield: BitField.HasArcaneScroll,
		resultMessage: 'You used your Arcane prayer scroll, and unlocked the Augury prayer.'
	},
	{
		item: getOSItem('Slepey tablet'),
		bitfield: BitField.HasSlepeyTablet,
		resultMessage: 'You used your Slepey tablet, and unlocked the Slepe teleport.'
	},
	{
		item: getOSItem('Scroll of farming'),
		bitfield: BitField.HasScrollOfFarming,
		resultMessage:
			'You have used your Scroll of farming - you feel your Farming skills have improved and are now able to use more Farming patches.'
	},
	{
		item: getOSItem('Scroll of longevity'),
		bitfield: BitField.HasScrollOfLongevity,
		resultMessage:
			'You have used your Scroll of longevity - your future slayer tasks will always have 2x more quantity.'
	},
	{
		item: getOSItem('Scroll of the hunt'),
		bitfield: BitField.HasScrollOfTheHunt,
		resultMessage: 'You have used your Scroll of the hunt - you feel your hunting skills have improved.'
	},
	{
		item: getOSItem('Banana enchantment scroll'),
		bitfield: BitField.HasBananaEnchantmentScroll,
		resultMessage: 'You have used your Banana enchantment scroll - you feel your monkey magic skills have improved.'
	},
	{
		item: getOSItem('Daemonheim agility pass'),
		bitfield: BitField.HasDaemonheimAgilityPass,
		resultMessage: 'You show your pass to the Daemonheim guards, and they grant you access to their rooftops.'
	},
	{
		item: getOSItem('Guthix engram'),
		bitfield: BitField.HasGuthixEngram,
		resultMessage: "You place the Guthix engram in Juna's cave, restoring some balance to the world..."
	},
	{
		item: getOSItem('Runescroll of bloodbark'),
		bitfield: BitField.HasBloodbarkScroll,
		resultMessage: 'You used your Runescroll of bloodbark, and unlocked the ability to create Bloodbark armour.'
	},
	{
		item: getOSItem('Runescroll of swampbark'),
		bitfield: BitField.HasSwampbarkScroll,
		resultMessage: 'You used your Runescroll of Swampbark, and unlocked the ability to create Swampbark armour.'
	},
	{
		item: getOSItem("Saradomin's light"),
		bitfield: BitField.HasSaradominsLight,
		resultMessage: "You used your Saradomin's light."
	},
	{
		item: getOSItem('Frozen tablet'),
		bitfield: BitField.UsedFrozenTablet,
		resultMessage: 'You used your Frozen tablet.'
	},
	{
		item: getOSItem('Scarred tablet'),
		bitfield: BitField.UsedScarredTablet,
		resultMessage: 'You used your Scarred tablet.'
	},
	{
		item: getOSItem('Sirenic tablet'),
		bitfield: BitField.UsedSirenicTablet,
		resultMessage: 'You used your Sirenic tablet.'
	},
	{
		item: getOSItem('Strangled tablet'),
		bitfield: BitField.UsedStrangledTablet,
		resultMessage: 'You used your Strangled tablet.'
	},
	{
		item: getOSItem('Moondash charm'),
		bitfield: BitField.HasMoondashCharm,
		resultMessage: 'You used your Moondash charm, the power of the moon now boosts your farming trips.'
	},
	...divinationEnergies
		.filter(e => e.boonBitfield !== null)
		.map(e => ({
			item: e.boon!,
			bitfield: e.boonBitfield!,
			resultMessage: `You used your ${e.boon!.name}, and now receive bonus XP!`
		}))
];
for (const usableUnlock of usableUnlocks) {
	usables.push({
		items: [usableUnlock.item],
		run: async user => {
			if (user.bitfield.includes(usableUnlock.bitfield)) {
				return "You already used this item, you can't use it again.";
			}
			await user.removeItemsFromBank(new Bank().add(usableUnlock.item.id));
			await user.update({
				bitfield: {
					push: usableUnlock.bitfield
				}
			});
			return usableUnlock.resultMessage;
		}
	});
}

const genericUsables: {
	items: [Item, Item] | [Item];
	cost: Bank;
	loot: Bank | (() => Bank) | null;
	response: (loot: Bank) => CommandResponse | Awaited<CommandResponse>;
	addToCL?: boolean;
}[] = [
	{
		items: [getOSItem('Banana'), getOSItem('Monkey')],
		cost: new Bank().add('Banana').freeze(),
		loot: null,
		response: () => 'You fed a Banana to your Monkey!'
	},
	{
		items: [getOSItem('Knife'), getOSItem('Turkey')],
		cost: new Bank().add('Turkey'),
		loot: new Bank().add('Turkey drumstick', 3),
		response: () => 'You cut your Turkey into 3 drumsticks!',
		addToCL: true
	},
	{
		items: [getOSItem('Shiny mango'), getOSItem('Magus scroll')],
		cost: new Bank().add('Shiny mango').add('Magus scroll'),
		loot: new Bank().add('Magical mango'),
		response: () => 'You enchanted your Shiny mango into a Magical mango!',
		addToCL: true
	},
	{
		items: [getOSItem('Blabberbeak'), getOSItem('Magical mango')],
		cost: new Bank().add('Magical mango').add('Blabberbeak'),
		loot: new Bank().add('Mangobeak'),
		response: () =>
			'You fed a Magical mango to Blabberbeak, and he transformed into a weird-looking mango bird, oops.',
		addToCL: true
	},
	{
		items: [getOSItem('Candle'), getOSItem('Celebratory cake')],
		cost: new Bank().add('Candle').add('Celebratory cake'),
		loot: new Bank().add('Celebratory cake with candle'),
		response: () => 'You stick a candle in your cake.',
		addToCL: true
	},
	{
		items: [getOSItem('Tinderbox'), getOSItem('Celebratory cake with candle')],
		cost: new Bank().add('Celebratory cake with candle'),
		loot: new Bank().add('Lit celebratory cake'),
		response: () => 'You light the candle in your cake.',
		addToCL: true
	},
	{
		items: [getOSItem('Klik'), getOSItem('Celebratory cake with candle')],
		cost: new Bank().add('Celebratory cake with candle'),
		loot: new Bank().add('Burnt celebratory cake'),
		response: () => 'You try to get Klik to light the candle... but he burnt the cake..',
		addToCL: true
	},
	{
		items: [getOSItem('Mithril seeds')],
		cost: new Bank().add('Mithril seeds').freeze(),
		loot: () => flowerTable.roll(),
		response: loot => `You planted a Mithril seed and got ${loot}!`
	},
	{
		items: [getOSItem('Gloom and doom potion'), getOSItem('Broomstick')],
		cost: new Bank().add('Gloom and doom potion').add('Broomstick'),
		loot: new Bank().add('Grim sweeper'),
		response: () =>
			'You pour the Gloom and doom potion on the Broomstick... it transforms into an evil.. deathly broom with a scythe on one end and a skull handle!',
		addToCL: true
	},
	{
		items: [getOSItem('Message in a bottle')],
		cost: new Bank().add('Message in a bottle'),
		loot: null,
		response: async () => ({
			content: 'You open the bottle, reading the scroll inside, and then return it to the ocean...',
			files: [
				new AttachmentBuilder(await makeScriptImage(randArrItem(messageInABottleMessages)), {
					name: 'image.png'
				})
			]
		})
	},
	{
		items: [getOSItem('Spooky aura'), getOSItem('Spooky sheet')],
		cost: new Bank().add('Spooky aura').add('Spooky sheet'),
		loot: new Bank().add('Casper'),
		response: () =>
			'You throw the spooky sheet onto the spooky aura, only to realize the aura is actually a ghost! Wow!',
		addToCL: true
	},
	/**
	 *
	 * Milk
	 *
	 */
	// Raw rat milk
	{
		items: [getOSItem('Bucket'), getOSItem('Remy')],
		cost: new Bank().add('Bucket'),
		loot: new Bank().add('Raw rat milk'),
		response: () => 'You milk Remy (???) and obtain some raw rat milk. Gross.',
		addToCL: true
	},
	// Scorched rat milk
	{
		items: [getOSItem('Raw rat milk'), getOSItem('Klik')],
		cost: new Bank().add('Raw rat milk'),
		loot: new Bank().add('Scorched rat milk'),
		response: () =>
			'You hold up the raw rat milk to Klik, and look away as he breathes a hot fire on it, purifying it.',
		addToCL: true
	},
	// Fresh rat milk
	{
		items: [getOSItem('Scorched rat milk'), getOSItem('Wintertoad')],
		cost: new Bank().add('Scorched rat milk'),
		loot: new Bank().add('Fresh rat milk'),
		response: () => 'You put your Wintertoad in the milk to cool it down.',
		addToCL: true
	},
	{
		items: [getOSItem('Scorched rat milk'), getOSItem('Frosty')],
		cost: new Bank().add('Scorched rat milk'),
		loot: new Bank().add('Fresh rat milk'),
		response: () => 'You dip your Frosty into the milk, cooling it down. Frosty seems a little slimmer now.',
		addToCL: true
	},
	/**
	 *
	 * Chocolate bar
	 *
	 */
	// Chomped chocolate bits
	{
		items: [getOSItem('Cocoa bean'), getOSItem('Steve')],
		cost: new Bank().add('Cocoa bean'),
		loot: new Bank().add('Chomped chocolate bits'),
		response: () => "You throw the cocoa bean in Steve's mouth, who then chomps it into tiny pieces.",
		addToCL: true
	},
	{
		items: [getOSItem('Cocoa bean'), getOSItem('Frostbite')],
		cost: new Bank().add('Cocoa bean'),
		loot: new Bank().add('Chomped chocolate bits'),
		response: () => "You throw the cocoa bean in Frostbite's mouth, who then chomps it into tiny pieces.",
		addToCL: true
	},
	// Metallic cocolate dust
	{
		items: [getOSItem('Chomped chocolate bits'), getOSItem('Takon')],
		cost: new Bank().add('Chomped chocolate bits'),
		loot: new Bank().add('Metallic chocolate dust'),
		response: () =>
			'Takon smashes the chocolate bits on his anvil, turning them into chocolate dust... *tastes some* metallic... chocolate dust.',
		addToCL: true
	},
	{
		items: [getOSItem('Chomped chocolate bits'), getOSItem('Ori')],
		cost: new Bank().add('Chomped chocolate bits'),
		loot: new Bank().add('Metallic chocolate dust'),
		response: () =>
			'Ori smashes the chocolate bits on his anvil, turning them into chocolate dust... *tastes some* metallic... chocolate dust.',
		addToCL: true
	},
	// Chocolate bar
	{
		items: [getOSItem('Metallic chocolate dust'), getOSItem('Fresh rat milk')],
		cost: new Bank().add('Metallic chocolate dust').add('Fresh rat milk'),
		loot: new Bank().add('Pristine chocolate bar'),
		response: () => 'You created a Pristine chocolate bar.',
		addToCL: true
	},
	// Ashy Flour
	{
		items: [getOSItem('Ashes'), getOSItem('Skipper')],
		cost: new Bank().add('Ashes'),
		loot: new Bank().add('Ashy flour'),
		response: () => "Skipper manages to do some paperwork magic, and legally classify the ashes as 'Ashy flour'.",
		addToCL: true
	},
	/**
	 *
	 * Snail oil
	 *
	 */
	{
		items: [getOSItem('Vial'), getOSItem('Gary')],
		cost: new Bank().add('Vial'),
		loot: new Bank().add('Snail oil'),
		response: () => "You scrape some of Gary's oil into a vial.",
		addToCL: true
	},
	{
		items: [getOSItem('Vial'), getOSItem('Plopper')],
		cost: new Bank().add('Vial'),
		loot: new Bank().add('Snail oil'),
		response: () => 'You pick some snails off Ploppers skin and squeeze them into the vials.',
		addToCL: true
	},
	/**
	 *
	 * Grimy salt
	 *
	 */
	{
		items: [getOSItem('Vial'), getOSItem('Herbert')],
		cost: new Bank().add('Vial'),
		loot: new Bank().add('Grimy salt'),
		response: () => 'You scrape a knife along Herberts back, collecting some salt.',
		addToCL: true
	},
	{
		items: [getOSItem('Vial'), getOSItem('Ishi')],
		cost: new Bank().add('Vial'),
		loot: new Bank().add('Grimy salt'),
		response: () => 'You collect some salt from Ishi.',
		addToCL: true
	},
	/**
	 *
	 * Banana-butter
	 *
	 */
	{
		items: [getOSItem('Wooden spoon'), getOSItem('Fresh rat milk')],
		cost: new Bank().add('Wooden spoon').add('Fresh rat milk'),
		loot: new Bank().add('Milk with spoon'),
		response: () => 'You put a spoon in the bucket, someone just needs to mix it now.',
		addToCL: true
	},
	{
		items: [getOSItem('Milk with spoon'), getOSItem('Harry')],
		cost: new Bank().add('Milk with spoon'),
		loot: new Bank().add('Hairy banana-butter'),
		response: () =>
			'Harry mixes the butter, accidentally dropping mixing a banana into it... and some hair (someone should peck it out).',
		addToCL: true
	},
	{
		items: [getOSItem('Hairy banana-butter'), getOSItem('Peky')],
		cost: new Bank().add('Hairy banana-butter'),
		loot: new Bank().add('Banana-butter'),
		response: () =>
			'Peky picks out all their hairs from the butter, leaving you with a fresh batch of Banana-butter.',
		addToCL: true
	},
	// Phoenix egg (u)
	{
		items: [getOSItem('Logs'), getOSItem('Phoenix eggling')],
		cost: new Bank().add('Logs'),
		loot: new Bank().add('Smokey egg'),
		response: () => 'You feed some logs to your Phoenix eggling, and it poops out a hot, smokey egg.',
		addToCL: true
	},
	{
		items: [getOSItem('Egg'), getOSItem('Klik')],
		cost: new Bank().add('Egg'),
		loot: new Bank().add('Smokey egg'),
		response: () => 'You hold a egg to Klik, he sets it on fire, and it turns into a smokey egg.',
		addToCL: true
	},
	// Ginger root
	{
		items: [getOSItem('Christmas cake recipe'), getOSItem('Doug')],
		cost: new Bank(),
		loot: new Bank().add('Ginger root'),
		response: () => 'You show the recipe to Doug, who goes off digging and returns with a Ginger root.',
		addToCL: true
	},
	{
		items: [getOSItem('Christmas cake recipe'), getOSItem('Wilvus')],
		cost: new Bank(),
		loot: new Bank().add('Ginger root'),
		response: () => 'You show the recipe to Wilvus, who goes off and steals it from a mole who had one.',
		addToCL: true
	},
	// Dodgy bread
	{
		items: [getOSItem('Ashy flour'), getOSItem('Fresh rat milk')],
		cost: new Bank().add('Ashy flour').add('Fresh rat milk'),
		loot: new Bank().add('Dodgy bread'),
		response: () => 'You make some Dodgy bread.',
		addToCL: true
	},
	// Gingerbread
	{
		items: [getOSItem('Ginger root'), getOSItem('Dodgy bread')],
		cost: new Bank().add('Ginger root').add('Dodgy bread'),
		loot: new Bank().add('Gingerbread'),
		response: () => 'You make some Gingerbread.',
		addToCL: true
	},
	{
		items: [getOSItem('Note from pets')],
		cost: new Bank(),
		loot: null,
		response: async () => {
			if (Date.now() < 1_703_373_960 * 1000) {
				return "You can't open the note until Christmas.";
			}

			return {
				files: [
					new AttachmentBuilder(await makeScriptImage(''), {
						name: 'image.png'
					})
				]
			};
		}
	}
];
usables.push({
	items: [getOSItem('Ivy seed')],
	run: async user => {
		if (user.bitfield.includes(BitField.HasPlantedIvy)) {
			return 'You already planted Ivy in your PoH.';
		}
		if (user.skillsAsLevels.farming < 80) {
			return 'You need 80 Farming to plant the Ivy seeds in your PoH.';
		}
		await user.removeItemsFromBank(new Bank().add('Ivy seed'));
		await user.update({
			bitfield: {
				push: BitField.HasPlantedIvy
			}
		});
		return 'You planted Ivy seeds in your PoH! You can now chop Ivy.';
	}
});
usables.push({
	items: [getOSItem('Spooky gear frame unlock')],
	run: async user => {
		const gearFrame = gearImages[1];
		if (user.user.unlocked_gear_templates.includes(gearFrame.id)) {
			return 'You already have this gear frame unlocked.';
		}
		await user.removeItemsFromBank(new Bank().add('Spooky gear frame unlock'));
		await user.update({
			unlocked_gear_templates: {
				push: gearFrame.id
			}
		});
		return 'You unlocked a spooky gear frame! You can switch to it using `/config user gearframe`';
	}
});
usables.push({
	items: [getOSItem('Mysterious token')],
	run: async () => {
		return 'Nothing mysterious happens.';
	}
});

usables.push({
	items: [getOSItem('Echo'), getOSItem('Banana')],
	run: async () => {
		return 'https://media.tenor.com/LqrZCROBYzQAAAAd/eat-banana-bat.gif';
	}
});

usables.push({
	items: [getOSItem('Guthixian cache boost')],
	run: async user => {
		const cost = new Bank().add('Guthixian cache boost');
		if (!user.owns(cost)) {
			return `You don't own ${cost}.`;
		}
		await user.removeItemsFromBank(cost);
		await user.update({
			guthixian_cache_boosts_available: {
				increment: 1
			}
		});
		return `You used a Guthixian cache boost, you now have ${user.user.guthixian_cache_boosts_available} boosts available.`;
	}
});

usables.push({
	items: [getOSItem('Christmas cake recipe')],
	run: async () => {
		return {
			files: [
				new AttachmentBuilder(
					await makeScriptImage(`Christmas Cake Recipe:
- The Christmas Spirit; loving help of friends.
- 1x Fresh rodent milk
- 1x Pristine chocolate bar
- 1x A special egg
- 1x Gingerbread
- 1x Grimy salt
- 1x Snail oil
- 1x Banana-butter
- 1x Ashy flour`),
					{
						name: 'image.png'
					}
				)
			]
		};
	}
});

for (const group of dyedItems) {
	for (const dyedVersion of group.dyedVersions) {
		for (const dye of allDyes.filter(i => i !== dyedVersion.dye)) {
			const resultingItem = group.dyedVersions.find(i => i.dye === dye);
			if (!resultingItem) continue;
			genericUsables.push({
				items: [dyedVersion.item, dye],
				cost: new Bank().add(dyedVersion.item.id).add(dye.id),
				loot: new Bank().add(resultingItem.item.id),
				response: () =>
					`You used a ${dye.name} on your ${dyedVersion.item.name}, and received a ${resultingItem.item.name}.`,
				addToCL: false
			});
		}
	}
}

for (const genericU of genericUsables) {
	usables.push({
		items: genericU.items,
		run: async user => {
			const cost = genericU.cost ? genericU.cost : undefined;
			const loot =
				genericU.loot === null ? undefined : genericU.loot instanceof Bank ? genericU.loot : genericU.loot();
			if (loot || cost)
				await user.transactItems({
					itemsToAdd: loot,
					itemsToRemove: cost,
					collectionLog: genericU.addToCL ?? false
				});
			return genericU.response(loot ?? new Bank());
		}
	});
}
usables.push({
	items: [getOSItem('Double loot token')],
	run: async (user: MUser) => {
		await user.removeItemsFromBank(new Bank().add('Double loot token'));
		await addToDoubleLootTimer(Time.Minute * randInt(6, 36), `${user} used a Double Loot token!`);
		return 'You used your Double Loot Token!';
	}
});

for (const [_, val] of objectEntries(mysteriousStepData)) {
	if (!val.clueItem) continue;
	usables.push({
		items: [val.clueItem],
		run: async (user: MUser) => {
			const { step, track, stepData, minionMessage } = user.getMysteriousTrailData();
			if (!step || !track || !stepData) return 'Hmmm..';
			return `You read the ${val.clueItem.name} and it says...

${bold(step.hint)}

${minionMessage}`;
		}
	});
}
usables.push({
	items: [getOSItem('Mysterious clue (1)')],
	run: async (user: MUser) => {
		const { step, track, stepData, minionMessage } = user.getMysteriousTrailData();
		if (!step || !track || !stepData) return 'Hmmm..';
		return `You read the Mysterious clue (1) and it says...

${bold(`In Lumbridge's dawn, where bovine graze,
Lay one to rest in the morning haze,
In its yield, your path will blaze.`)}

This looks like a treasure trail. ${minionMessage}`;
	}
});

export const allUsableItems = new Set(usables.map(i => i.items.map(i => i.id)).flat(2));

export async function useCommand(user: MUser, _firstItem: string, _secondItem?: string) {
	const firstItem = getItem(_firstItem);
	const secondItem = _secondItem === undefined ? null : getItem(_secondItem);
	if (!firstItem || (_secondItem !== undefined && !secondItem)) return "That's not a valid item.";
	const items = [firstItem, secondItem].filter(notEmpty);
	assert(items.length === 1 || items.length === 2);

	const { bank } = user;
	const checkBank = new Bank();
	for (const i of items) checkBank.add(i.id);
	if (!bank.has(checkBank)) return `You don't own ${checkBank}.`;

	const usable = usables.find(i => i.items.length === items.length && i.items.every(t => items.includes(t)));
	if (!usable) return `That's not a usable ${items.length === 1 ? 'item' : 'combination'}.`;
	return usable.run(user);
}
