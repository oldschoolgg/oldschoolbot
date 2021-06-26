import { randArrItem } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { BitField, Emoji } from '../../lib/constants';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { itemID, roll, updateBankSetting } from '../../lib/util';
import getOSItem from '../../lib/util/getOSItem';

const options = {
	max: 1,
	time: 10000,
	errors: ['time']
};

// roll(chanceToDouble) to decide if the item doubles
const chanceToDouble = 100;

// roll(chanceToSave) to decide if the item is saved
const chanceToSave = 10;

const hammyMessages = [
	'You try to use your {item} on Hammy, he swiftly eats it.',
	"You shove the {item} in Hammy's face; he crushes it with his teeth in rage, barely missing your hand.",
	'You offer the {item} to Hammy, and he throws it to the floor.',
	'You gently hand the {item} to Hammy. He squeaks excitedly before tearing it to shreds.',
	'You hand the {item} to Hammy too quickly nearly crushing him. In response, he crushes your {item}.',
	'Hammy tries to hold the {item}, but his hands are too small and he drops it, never to be seen again.',
	'You ask Hammy to play with your {item}, but he breaks it instead not knowing any better.',
	'You hold Hammy up to your {item}, but accidentally drop them both. Luckily Hammy survived.',
	"Your Hammy gnaws on the {item} until it's a worthless piece of junk which you discard.",
	'You show Hammy your {item} and he hides it in his cheeks. You spend hours trying to get it out, only to give up in despair.',
	'The last time Hammy saw your {item} he was too small to eat it, but not anymore!',
	`${Emoji.MoneyBag} Hammy took your {item} and diced it...\n\n He lost. ${Emoji.Sad}`,
	`${Emoji.MoneyBag} Hammy took your {item} and diced it...\n\n He won, but ate the profit as well as your {item}. ${Emoji.Sad}`
];

const hammyFailMessages = [
	'You gave your {item} to Hammy. He hurriedly chokes it down, before spitting it back up in disgust. It seems ok...',
	"Hammy refused to eat your {item} for personal reasons. Don't ask.",
	'Hammy will NEVER eat another {item} after what happened last summer...',
	'You dropped your {item} but Hammy helpfully caught it and slipped it back into your pack.',
	`${Emoji.MoneyBag} Hammy took your {item} and diced it...\n\nHe won, but ate the profit. At least you didn't lose anything ${Emoji.Joy}`
];

const hammyDoubleMessages = [
	`${Emoji.MoneyBag} Hammy took your {item} and diced it...\n\nHe won, and actually brought you the profit! ${Emoji.Joy}`,
	'You feed your {item} to Hammy and he hides it in his cheeks. You go to pull it out and find it doubled. How did that happen?',
	"You give your {item} to Hammy while he's on his hamster wheel. When he stops and the dust settles, you realize there are now two.",
	"Hammy takes your {item} while you aren't looking and runs to the casino. He comes back rich and hands you an extra {item} for your trouble."
];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[item:string]',
			usageDelim: ',',
			oneAtTime: true,
			aliases: ['feed', 'feedhammy'],
			cooldown: 2,
			altProtection: true
		});
	}

	async run(msg: KlasaMessage, [firstItemStr]: [string]) {
		if (msg.flagArgs.help) {
			return msg.send(
				`Usage:\n\n\`${msg.cmdPrefix}hammy --warnings [--enable/--disable]\` ` +
					'Show/enable/disable confirmation\n' +
					`\`${msg.cmdPrefix}hammy Dragon warhammer --cf\` Feeds item to Hammy without confirmation`
			);
		}

		const hammyFeedWarningDisabled = msg.author.settings
			.get(UserSettings.BitField)
			.includes(BitField.DisabledHammyFeedConfirm);

		if (msg.flagArgs.warning || msg.flagArgs.warnings) {
			let nextBool = false;
			if (msg.flagArgs.disable) {
				nextBool = true;
			} else if (msg.flagArgs.enable) {
				nextBool = false;
			} else {
				return msg.send(
					`Hammy's feed warnings are ${!hammyFeedWarningDisabled ? 'enabled' : 'disabled'} for you.\n\n` +
						`Use \`${msg.cmdPrefix}hammy --warnings [--enable/--disable]\` to change this`
				);
			}
			if (hammyFeedWarningDisabled === nextBool) {
				return msg.send(
					`Hammy's feed warnings are already ${!hammyFeedWarningDisabled ? 'enabled' : 'disabled'} for you.`
				);
			}
			await msg.author.settings.update(UserSettings.BitField, BitField.DisabledHammyFeedConfirm);
			return msg.send(`Hammy's feed warnings are now ${!nextBool ? 'enabled' : 'disabled'} for you.`);
		}

		if (firstItemStr === undefined) {
			return msg.send('Item name is a required argument.');
		}

		// Start the actually Hammy code
		const bank = msg.author.bank();
		const firstItem = getOSItem(firstItemStr);

		if (!bank.has(firstItem.id)) {
			return msg.send(`You don't have a ${firstItem.name}.`);
		}
		if (!bank.has(itemID('Hammy')) && msg.author.equippedPet() !== itemID('Hammy')) {
			return msg.send("You don't have a Hammy, so how could you feed it?");
		}

		if (!hammyFeedWarningDisabled && !msg.flagArgs.confirm && !msg.flagArgs.cf && !msg.flagArgs.yes) {
			const dropMsg = await msg.channel.send(
				`${msg.author}, are you sure you want to give ${firstItem.name} to Hammy? You probably won't get it back... Type \`confirm\` to confirm.`
			);

			try {
				await msg.channel.awaitMessages(
					_msg => _msg.author.id === msg.author.id && _msg.content.toLowerCase() === 'confirm',
					options
				);
			} catch (err) {
				return dropMsg.edit(
					`You decide it's not worth risking your ${firstItem.name}, leaving Hammy to fend for himself.`
				);
			}
		}

		if (roll(chanceToDouble)) {
			let loot = new Bank();
			loot.add(firstItem.id);
			updateBankSetting(this.client, ClientSettings.EconomyStats.HammyDoubled, loot);
			await msg.author.addItemsToBank(loot, false);
			return msg.send(randArrItem(hammyDoubleMessages).replace(/\{item\}/g, firstItem.name));
		}

		if (roll(chanceToSave)) {
			let spared = new Bank();
			spared.add(firstItem.id);
			updateBankSetting(this.client, ClientSettings.EconomyStats.HammySpared, spared);
			await msg.author.addItemsToBank(spared, false);
			return msg.send(randArrItem(hammyFailMessages).replace(/\{item\}/g, firstItem.name));
		}

		let lost = new Bank();
		lost.add(firstItem.id);
		updateBankSetting(this.client, ClientSettings.EconomyStats.HammyDestroyed, lost);
		await msg.author.removeItemFromBank(firstItem.id);
		return msg.send(randArrItem(hammyMessages).replace(/\{item\}/g, firstItem.name));
	}
}
