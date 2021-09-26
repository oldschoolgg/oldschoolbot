import { MessageAttachment, MessageEmbed } from 'discord.js';
import { objectValues } from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { Color } from '../../lib/constants';
import { defaultGear, globalPresets, resolveGearTypeSetting } from '../../lib/gear';
import { generateGearImage } from '../../lib/gear/functions/generateGearImage';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { GearPresetsTable } from '../../lib/typeorm/GearPresetsTable.entity';
import { cleanString, isValidGearSetup } from '../../lib/util';

function maxPresets(user: KlasaUser) {
	return user.perkTier * 2 + 3;
}

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			cooldown: 1,
			description: 'Allows you to manage your gear presets.',
			aliases: ['gps'],
			usageDelim: ' ',
			usage: '[new|update|delete|equip|share|rename] [name:str{1,12}] [user:user|setup:str]',
			subcommands: true,
			examples: ['+gearpresets new pvm melee', '+gearpresets delete pvm', '+gearpresets equip pvm melee'],
			categoryFlags: ['minion', 'skilling']
		});
	}

	async run(msg: KlasaMessage) {
		const presets = await GearPresetsTable.find({ userID: msg.author.id });
		if (presets.length === 0) {
			return msg.channel.send('You have no presets.');
		}
		let title = '**Your presets:**';
		let str = '';
		for (const pre of presets) {
			str += `**${pre.name}:** ${pre}\n`;
		}
		if (str.length > 2000) {
			const attachment = new MessageAttachment(
				Buffer.from(`${title}\n${str}`),
				`${msg.author.username}s-GearPresets.txt`
			);
			return msg.channel.send({ content: 'Here are your gear presets...', files: [attachment] });
		}
		const embed = new MessageEmbed().setColor(Color.Orange).setTitle(title).setDescription(str);
		return msg.channel.send({ embeds: [embed] });
	}

	async equip(msg: KlasaMessage, [name, setup]: [string, string]) {
		if (msg.author.minionIsBusy) {
			return msg.channel.send(
				`${msg.author.minionName} is currently out on a trip, so you can't change their gear!`
			);
		}

		if (!name) return msg.channel.send("You didn't supply a name.");
		if (!setup) return msg.channel.send("You didn't supply a setup.");

		if (!isValidGearSetup(setup)) {
			return msg.channel.send("That's not a valid gear setup.");
		}

		const userPreset = await GearPresetsTable.findOne({ userID: msg.author.id, name });
		const globalPreset = globalPresets.find(i => i.name === name);
		if (!userPreset && !globalPreset) {
			return msg.channel.send("You don't have a gear preset with that name.");
		}
		const preset = (userPreset ?? globalPreset) as GearPresetsTable;

		const toRemove = new Bank();
		function gearItem(val: null | number) {
			if (val === null) return null;
			toRemove.add(val);
			return {
				item: val,
				quantity: 1
			};
		}

		const newGear = { ...defaultGear };
		newGear.head = gearItem(preset.Head);
		newGear.neck = gearItem(preset.Neck);
		newGear.body = gearItem(preset.Body);
		newGear.legs = gearItem(preset.Legs);
		newGear.cape = gearItem(preset.Cape);
		newGear['2h'] = gearItem(preset.TwoHanded);
		newGear.hands = gearItem(preset.Hands);
		newGear.feet = gearItem(preset.Feet);
		newGear.shield = gearItem(preset.Shield);
		newGear.weapon = gearItem(preset.Weapon);
		newGear.ring = gearItem(preset.Ring);

		if (preset.Ammo) {
			newGear.ammo = { item: preset.Ammo, quantity: preset.AmmoQuantity! };
			toRemove.add(preset.Ammo, preset.AmmoQuantity!);
		}

		const userBankWithEquippedItems = msg.author.bank().clone();
		for (const e of objectValues(msg.author.getGear(setup).raw())) {
			if (e) userBankWithEquippedItems.add(e.item, e.quantity);
		}

		if (!userBankWithEquippedItems.has(toRemove.bank)) {
			return msg.channel.send(
				`You don't have the items in this preset. You're missing: ${toRemove.remove(msg.author.bank())}.`
			);
		}

		try {
			const unequipAllMessage = await this.client.commands.get('unequipall')!.run(msg, [setup]);
			if (
				!(unequipAllMessage instanceof KlasaMessage) ||
				(!(unequipAllMessage as KlasaMessage).content.toLowerCase().includes('you unequipped all items') &&
					!(unequipAllMessage as KlasaMessage).content.toLowerCase().includes('you have no items in your'))
			) {
				return msg.channel.send(
					`It was not possible to equip your **${preset.name}** on your ${setup} gear setup.`
				);
			}
		} catch (_) {}

		await msg.author.removeItemsFromBank(toRemove.bank);

		await msg.author.settings.update(resolveGearTypeSetting(setup), newGear);
		const image = await generateGearImage(
			this.client,
			msg.author,
			msg.author.getGear(setup),
			setup,
			msg.author.settings.get(UserSettings.Minion.EquippedPet)
		);

		return msg.channel.send({
			content: `You equipped the ${preset.name} preset in your ${setup} setup.`,
			files: [new MessageAttachment(image)]
		});
	}

	async delete(msg: KlasaMessage, [name]: [string]) {
		if (!name) return msg.channel.send("You didn't supply a name.");

		const preset = await GearPresetsTable.findOne({ userID: msg.author.id, name });
		if (!preset) {
			return msg.channel.send("You don't have a gear preset with that name.");
		}

		await preset.remove();

		return msg.channel.send(`Successfully deleted your preset called \`${name}\`.`);
	}

	async update(msg: KlasaMessage, [name = '', setup = '']: [string, string]) {
		return this.new(msg, [name, setup, true]);
	}

	async new(msg: KlasaMessage, [name = '', setup = '', update = false]: [string, string, boolean]) {
		setup = setup.toLowerCase();
		name = cleanString(name).toLowerCase();
		if (!name) return msg.channel.send("You didn't supply a name.");
		if (!setup) return msg.channel.send("You didn't supply a setup.");

		if (!isValidGearSetup(setup)) {
			return msg.channel.send("That's not a valid gear setup.");
		}

		const currentPresets = await GearPresetsTable.find({ userID: msg.author.id });
		if (currentPresets.some(pre => pre.name === name) && !update) {
			return msg.channel.send(`You already have a gear presets called \`${name}\`.`);
		}
		if (!currentPresets.some(pre => pre.name === name) && update) {
			return msg.channel.send('You cant update a gearpreset you dont have.');
		}

		const max = maxPresets(msg.author);
		if (currentPresets.length >= max && !update) {
			return msg.channel.send(`The maximum amount of gear presets you can have is ${max}.`);
		}

		let gearSetup = msg.author.rawGear()[setup];
		const preset = new GearPresetsTable();

		preset.Head = gearSetup.head?.item ?? null;
		preset.Neck = gearSetup.neck?.item ?? null;
		preset.Body = gearSetup.body?.item ?? null;
		preset.Legs = gearSetup.legs?.item ?? null;
		preset.Cape = gearSetup.cape?.item ?? null;
		preset.TwoHanded = gearSetup['2h']?.item ?? null;
		preset.Hands = gearSetup.hands?.item ?? null;
		preset.Feet = gearSetup.feet?.item ?? null;
		preset.Shield = gearSetup.shield?.item ?? null;
		preset.Weapon = gearSetup.weapon?.item ?? null;
		preset.Ring = gearSetup.ring?.item ?? null;
		preset.Ammo = gearSetup.ammo?.item ?? null;
		preset.AmmoQuantity = gearSetup.ammo?.quantity ?? null;

		preset.name = name;
		preset.userID = msg.author.id;
		await preset.save();
		return msg.channel.send(
			`Successfully ${update ? 'updated the' : 'made a new'} preset called \`${
				preset.name
			}\` based off your ${setup} setup.`
		);
	}

	async share(msg: KlasaMessage, [name = '', user]: [string, KlasaUser]) {
		const preset = await GearPresetsTable.findOne({ userID: msg.author.id, name });
		if (!name) return msg.channel.send('You must specify the name of the preset you want to share.');
		if (!preset) return msg.channel.send(`You do not have any preset called ${name}.`);
		if (user === msg.author) return msg.channel.send("You can't share a preset with yourself.");

		// Check if user can receive the preset
		const userPresets = await GearPresetsTable.find({ userID: user.id });
		if (userPresets.some(pre => pre.name === name)) {
			return msg.channel.send(`${user.username} already have a gear presets called \`${name}\`.`);
		}
		const max = maxPresets(user);
		if (userPresets.length >= max) {
			return msg.channel.send(`The maximum amount of gear presets ${user.username} can have is ${max}.`);
		}

		// Ask for the user confirmation
		const originalUser = msg.author;
		msg.author = user;
		await msg.confirm(
			`${user.username}, do you want to receive ${originalUser.username}'s ${preset.name} preset (Only the preset will be shared, not the items)?`
		);
		const newPreset = new GearPresetsTable();
		newPreset.Head = preset.Head;
		newPreset.Neck = preset.Neck;
		newPreset.Body = preset.Body;
		newPreset.Legs = preset.Legs;
		newPreset.Cape = preset.Cape;
		newPreset.TwoHanded = preset.TwoHanded;
		newPreset.Hands = preset.Hands;
		newPreset.Feet = preset.Feet;
		newPreset.Shield = preset.Shield;
		newPreset.Weapon = preset.Weapon;
		newPreset.Ring = preset.Ring;
		newPreset.Ammo = preset.Ammo;
		newPreset.AmmoQuantity = preset.AmmoQuantity;
		newPreset.name = preset.name;
		newPreset.userID = user.id;
		await newPreset.save();
		return msg.channel.send(`${user.username}, you can now use the preset ${newPreset.name}.`);
	}

	async rename(msg: KlasaMessage, [name = '', newName = '']: [string, string]) {
		if (!name || !newName)
			return msg.channel.send(
				`You must specify the preset you want to rename and the new name. Example: \`${
					msg.cmdPrefix
				}gearpresets rename ${name || 'currentname'} newname\``
			);
		const realNewName = newName.substr(0, 12);
		const preset = await GearPresetsTable.findOne({ userID: msg.author.id, name });
		if (!preset) {
			return msg.channel.send("You don't have a gear preset with that name.");
		}
		const presetNewName = await GearPresetsTable.findOne({ userID: msg.author.id, name: realNewName });
		if (presetNewName) {
			return msg.channel.send(`You already have a preset called ${realNewName}.`);
		}
		await GearPresetsTable.update(
			{
				userID: msg.author.id,
				name
			},
			{ name: realNewName }
		);
		return msg.channel.send(`Successfully renamed your preset from \`${name}\` to \`${realNewName}\`.`);
	}
}
