import { MessageAttachment, MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { cleanString } from 'oldschooljs/dist/util';

import { Color } from '../../lib/constants';
import { defaultGear, resolveGearTypeSetting } from '../../lib/gear';
import { gearPresetToStr, globalPresets } from '../../lib/gear/functions/gearPresets';
import { generateGearImage } from '../../lib/gear/functions/generateGearImage';
import { GearSetupTypes } from '../../lib/gear/types';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { GearPresetsTable } from '../../lib/typeorm/GearPresetsTable.entity';
import { isValidGearSetup } from '../../lib/util';

function maxPresets(user: KlasaUser) {
	return user.perkTier * 2 + 3;
}

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			cooldown: 1,
			description: 'Allows you to manage your gear presets.',
			usageDelim: ' ',
			usage: '[new|delete|equip] [name:str{1,12}] [setup:str]',
			subcommands: true,
			examples: [
				'+gearpresets new pvm melee',
				'+gearpresets delete pvm',
				'+gearpresets equip pvm melee'
			],
			categoryFlags: ['minion', 'skilling']
		});
	}

	async run(msg: KlasaMessage) {
		const presets = await GearPresetsTable.find({ userID: msg.author.id });
		if (presets.length === 0) {
			return msg.send(`You have no presets.`);
		}
		let title = '**Your presets:**';
		let str = '';
		for (const pre of presets) {
			str += `**${pre.name}:** ${gearPresetToStr(pre)}\n`;
		}
		if (str.length > 2000) {
			const attachment = new MessageAttachment(
				Buffer.from(`${title}\n${str}`),
				`${msg.author.username}s-GearPresets.txt`
			);
			return msg.channel.send('Here are your gear presets...', attachment);
		}
		const embed = new MessageEmbed().setColor(Color.Orange).setTitle(title).setDescription(str);
		return msg.channel.send(embed);
	}

	async equip(msg: KlasaMessage, [name, setup]: [string, string]) {
		if (msg.author.minionIsBusy) {
			return msg.send(
				`${msg.author.minionName} is currently out on a trip, so you can't change their gear!`
			);
		}

		if (!name) return msg.send(`You didn't supply a name.`);
		if (!setup) return msg.send(`You didn't supply a setup.`);

		if (!isValidGearSetup(setup)) {
			return msg.send(`That's not a valid gear setup.`);
		}

		const userPreset = await GearPresetsTable.findOne({
			userID: msg.author.id,
			name
		});
		const globalPreset = globalPresets.find(i => i.name === name);
		if (!userPreset && !globalPreset) {
			return msg.send(`You don't have a gear preset with that name.`);
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
			newGear.ammo = {
				item: preset.Ammo,
				quantity: preset.AmmoQuantity!
			};
			toRemove.add(preset.Ammo, preset.AmmoQuantity!);
		}

		if (!msg.author.bank().has(toRemove.bank)) {
			return msg.send(
				`You don't have the items in this preset. You're missing: ${toRemove.remove(
					msg.author.bank()
				)}.`
			);
		}

		try {
			await this.client.commands.get('unequipall')!.run(msg, [setup]);
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

		return msg.send(
			`You equipped the ${preset.name} preset in your ${setup} setup.`,
			new MessageAttachment(image)
		);
	}

	async delete(msg: KlasaMessage, [name]: [string]) {
		if (!name) return msg.send(`You didn't supply a name.`);

		const preset = await GearPresetsTable.findOne({
			userID: msg.author.id,
			name
		});
		if (!preset) {
			return msg.send(`You don't have a gear preset with that name.`);
		}

		await preset.remove();

		return msg.send(`Successfully deleted your preset called \`${name}\`.`);
	}

	async new(msg: KlasaMessage, [name = '', setup = '']: [string, string]) {
		setup = setup.toLowerCase();
		name = cleanString(name).toLowerCase();
		if (!name) return msg.send(`You didn't supply a name.`);
		if (!setup) return msg.send(`You didn't supply a setup.`);

		if (!isValidGearSetup(setup)) {
			return msg.send(`That's not a valid gear setup.`);
		}

		const currentPresets = await GearPresetsTable.find({
			userID: msg.author.id
		});
		if (currentPresets.some(pre => pre.name === name)) {
			return msg.send(`You already have a gear presets called \`${name}\`.`);
		}

		const max = maxPresets(msg.author);
		if (currentPresets.length >= max) {
			return msg.send(`The maximum amount of gear presets you can have is ${max}.`);
		}

		let gearSetup = msg.author.rawGear()[setup as GearSetupTypes];
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
		return msg.send(
			`Successfully made a new preset called \`${preset.name}\` based off your ${setup} setup.`
		);
	}
}
