import { MessageAttachment, MessageEmbed } from 'discord.js';
import { objectValues } from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { Color } from '../../lib/constants';
import { defaultGear, gearPresetToString, globalPresets, resolveGearTypeSetting } from '../../lib/gear';
import { generateGearImage } from '../../lib/gear/functions/generateGearImage';
import { unEquipAllCommand } from '../../lib/minions/functions/unequipAllCommand';
import { prisma } from '../../lib/settings/prisma';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { cleanString, isValidGearSetup } from '../../lib/util';
import { GearPreset } from '.prisma/client';

function maxPresets(user: KlasaUser) {
	return user.perkTier * 2 + 3;
}

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
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
		const presets = await prisma.gearPreset.findMany({ where: { user_id: msg.author.id } });
		if (presets.length === 0) {
			return msg.channel.send('You have no presets.');
		}
		let title = '**Your presets:**';
		let str = '';
		for (const pre of presets) {
			str += `**${pre.name}:** ${gearPresetToString(pre)}\n`;
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

		const userPreset = await prisma.gearPreset.findFirst({ where: { user_id: msg.author.id, name } });
		const globalPreset = globalPresets.find(i => i.name === name);
		if (!userPreset && !globalPreset) {
			return msg.channel.send("You don't have a gear preset with that name.");
		}
		const preset = (userPreset ?? globalPreset) as GearPreset;

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
		newGear.head = gearItem(preset.head);
		newGear.neck = gearItem(preset.neck);
		newGear.body = gearItem(preset.body);
		newGear.legs = gearItem(preset.legs);
		newGear.cape = gearItem(preset.cape);
		newGear['2h'] = gearItem(preset.two_handed);
		newGear.hands = gearItem(preset.hands);
		newGear.feet = gearItem(preset.feet);
		newGear.shield = gearItem(preset.shield);
		newGear.weapon = gearItem(preset.weapon);
		newGear.ring = gearItem(preset.ring);

		if (preset.ammo) {
			newGear.ammo = { item: preset.ammo, quantity: preset.ammo_qty! };
			toRemove.add(preset.ammo, preset.ammo_qty!);
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

		const unequipAllMessage = await unEquipAllCommand(msg, setup);
		if (
			!(unequipAllMessage instanceof KlasaMessage) ||
			(!(unequipAllMessage as KlasaMessage).content.toLowerCase().includes('you unequipped all items') &&
				!(unequipAllMessage as KlasaMessage).content.toLowerCase().includes('you have no items in your'))
		) {
			return msg.channel.send(
				`It was not possible to equip your **${preset.name}** preset on your ${setup} gear setup.`
			);
		}

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
		const preset = await prisma.gearPreset.findFirst({ where: { user_id: msg.author.id, name } });
		if (!preset) {
			return msg.channel.send("You don't have a gear preset with that name.");
		}

		await prisma.gearPreset.delete({
			where: {
				user_id_name: {
					user_id: msg.author.id,
					name
				}
			}
		});

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

		const userPresets = await prisma.gearPreset.findMany({ where: { user_id: msg.author.id } });
		if (userPresets.some(pre => pre.name === name) && !update) {
			return msg.channel.send(`You already have a gear presets called \`${name}\`.`);
		}
		if (!userPresets.some(pre => pre.name === name) && update) {
			return msg.channel.send('You cant update a gearpreset you dont have.');
		}

		const max = maxPresets(msg.author);
		if (userPresets.length >= max && !update) {
			return msg.channel.send(`The maximum amount of gear presets you can have is ${max}.`);
		}

		let gearSetup = msg.author.rawGear()[setup];

		const gearData = {
			head: gearSetup.head?.item ?? null,
			neck: gearSetup.neck?.item ?? null,
			body: gearSetup.body?.item ?? null,
			legs: gearSetup.legs?.item ?? null,
			cape: gearSetup.cape?.item ?? null,
			two_handed: gearSetup['2h']?.item ?? null,
			hands: gearSetup.hands?.item ?? null,
			feet: gearSetup.feet?.item ?? null,
			shield: gearSetup.shield?.item ?? null,
			weapon: gearSetup.weapon?.item ?? null,
			ring: gearSetup.ring?.item ?? null,
			ammo: gearSetup.ammo?.item ?? null,
			ammo_qty: gearSetup.ammo?.quantity ?? null
		};

		const preset = await prisma.gearPreset.upsert({
			where: {
				user_id_name: {
					user_id: msg.author.id,
					name
				}
			},
			update: gearData,
			create: {
				...gearData,
				name,
				user_id: msg.author.id
			}
		});

		return msg.channel.send(
			`Successfully ${update ? 'updated the' : 'made a new'} preset called \`${
				preset.name
			}\` based off your ${setup} setup.`
		);
	}

	async share(msg: KlasaMessage, [name = '', user]: [string, KlasaUser]) {
		const preset = await prisma.gearPreset.findFirst({ where: { user_id: msg.author.id, name } });
		if (!name) return msg.channel.send('You must specify the name of the preset you want to share.');
		if (!preset) return msg.channel.send(`You do not have any preset called ${name}.`);
		if (user === msg.author) return msg.channel.send("You can't share a preset with yourself.");

		// Check if user can receive the preset
		const userPresets = await prisma.gearPreset.findMany({ where: { user_id: user.id } });
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

		const newPreset = await prisma.gearPreset.create({
			data: {
				head: preset.head,
				neck: preset.neck,
				body: preset.body,
				legs: preset.legs,
				cape: preset.cape,
				two_handed: preset.two_handed,
				hands: preset.hands,
				feet: preset.feet,
				shield: preset.shield,
				weapon: preset.weapon,
				ring: preset.ring,
				ammo: preset.ammo,
				ammo_qty: preset.ammo_qty,
				name,
				user_id: msg.author.id
			}
		});

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
		const preset = await prisma.gearPreset.findFirst({ where: { user_id: msg.author.id, name } });
		if (!preset) {
			return msg.channel.send("You don't have a gear preset with that name.");
		}
		const presetNewName = await prisma.gearPreset.findFirst({
			where: { user_id: msg.author.id, name: realNewName }
		});
		if (presetNewName) {
			return msg.channel.send(`You already have a preset called ${realNewName}.`);
		}
		await prisma.gearPreset.update({
			where: {
				user_id_name: {
					user_id: msg.author.id,
					name
				}
			},
			data: { name: realNewName }
		});
		return msg.channel.send(`Successfully renamed your preset from \`${name}\` to \`${realNewName}\`.`);
	}
}
