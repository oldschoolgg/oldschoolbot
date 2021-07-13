import { objectKeys } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/structures/BotCommand';

export const petRates = {
	hunter: {
		'Grey chinchompas': 131_395,
		'Red chinchompas': 98_373,
		'Black chinchompas': 82_758
	},
	woodcutting: {
		'Regular Tree': 317_647,
		'Oak Tree': 361_146,
		'Willow Tree': 289_286,
		'Maple Tree': 221_918,
		'Yew Tree': 145_013,
		'Magic & Redwood Trees': 72_321
	},
	agility: {
		'Gnome Stronghold Course': 35_609,
		'Agility Pyramid': 9901,
		'Draynor Village Rooftop': 33_005,
		'Varrock Rooftop': 24_410,
		"Seers' Village": 35_205,
		'East Ardougne Rooftop': 34_440
	},
	fishing: {
		'Shrimp/Anchovies': 435_165,
		'Trout/Salmon': 461_808,
		'Tuna/Swordfish': 128_885,
		Lobster: 116_129,
		Monkfish: 138_583,
		'Leaping Fish': 426_954,
		Sharks: 82_243,
		Minnow: 977_778,
		'Fishing Trawler': 5000
	},
	runecrafting: {
		'Blood runes': 804_984,
		'Soul runes': 782_999,
		'Ourania Altar/ZMI': 1_487_213,
		'Everything Else': 1_795_758
	},
	mining: {
		'Copper/Tin/Clay/Iron/Silver': 741_600,
		Gold: 296_640,
		Sandstone: 741_600,
		Mithril: 148_320,
		Adamantite: 59_328,
		Runite: 42_377,
		'Blast Mine': 123_600,
		'Motherlode Mine': 247_200
	},
	thieving: {
		'Cake Stall': 124_066,
		'Silk Stall': 68_926,
		'Hero/Elf Pickpocket': 99_175,
		'Ardougne Knight/Man Pickpocket': 257_211
	},
	farming: {
		'Magic Tree': 9368,
		'Yew Trees': 11_242,
		'All Fruit Trees': 9000,
		'All Herbs': 98_364,
		'Tithe Farm': 7_494_389
	}
};

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 3,
			oneAtTime: true,
			description: 'Shows the rates of getting skilling pets at certain levels.',
			usage: '<skillLevel:int{1,99}> <hunter|woodcutting|agility|fishing|mining|thieving|farming>',
			usageDelim: ' '
		});
	}

	async run(msg: KlasaMessage, [skillLevel, petName]: [number, keyof typeof petRates]) {
		return msg.channel.send(this.rate(petRates[petName], skillLevel));
	}

	rate(obj: typeof petRates[keyof typeof petRates], lvl: number) {
		const rates = [];
		for (const key of objectKeys(obj)) {
			rates.push(`**${key}:** ${(obj[key] - lvl * 25).toLocaleString()}`);
		}
		return rates.join('\n');
	}
}
