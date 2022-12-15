import { AttachmentBuilder } from 'discord.js';
import * as fs from 'fs';
import { Canvas } from 'skia-canvas/lib';
import { SkillsEnum } from '../skilling/types';

import { canvasImageFromBuffer, printWrappedText } from './canvasUtil';
import { toTitleCase } from './toTitleCase';

export const textBoxFile = fs.readFileSync('./src/lib/resources/images/textbox.png');
const fishingLevelUpImage = fs.readFileSync('./src/lib/resources/images/skillLevelUpImages/fishing.png');
const cookingLevelUpImage = fs.readFileSync('./src/lib/resources/images/skillLevelUpImages/cooking.png');
const agilityLevelUpImage = fs.readFileSync('./src/lib/resources/images/skillLevelUpImages/agility.png');
const constructionLevelUpImage = fs.readFileSync('./src/lib/resources/images/skillLevelUpImages/construction.png');
const woodcuttingLevelUpImage = fs.readFileSync('./src/lib/resources/images/skillLevelUpImages/woodcutting.png');
const firemakingLevelUpImage = fs.readFileSync('./src/lib/resources/images/skillLevelUpImages/firemaking.png');
const hunterLevelUpImage = fs.readFileSync('./src/lib/resources/images/skillLevelUpImages/hunter.png');
const thievingLevelUpImage = fs.readFileSync('./src/lib/resources/images/skillLevelUpImages/thieving.png');
const fletchingLevelUpImage = fs.readFileSync('./src/lib/resources/images/skillLevelUpImages/fletching.png');
const herbloreLevelUpImage = fs.readFileSync('./src/lib/resources/images/skillLevelUpImages/herblore.png');
const miningLevelUpImage = fs.readFileSync('./src/lib/resources/images/skillLevelUpImages/mining.png');
const prayerLevelUpImage = fs.readFileSync('./src/lib/resources/images/skillLevelUpImages/prayer.png');
const runecraftLevelUpImage = fs.readFileSync('./src/lib/resources/images/skillLevelUpImages/runecraft.png');
const smithingLevelUpImage = fs.readFileSync('./src/lib/resources/images/skillLevelUpImages/smithing.png');
const craftingLevelUpImage = fs.readFileSync('./src/lib/resources/images/skillLevelUpImages/crafting.png');
const slayerLevelUpImage = fs.readFileSync('./src/lib/resources/images/skillLevelUpImages/slayer.png');
const farmingLevelUpImage = fs.readFileSync('./src/lib/resources/images/skillLevelUpImages/farming.png');
const attackLevelUpImage = fs.readFileSync('./src/lib/resources/images/skillLevelUpImages/attack.png');
const strengthLevelUpImage = fs.readFileSync('./src/lib/resources/images/skillLevelUpImages/strength.png');
const defenceLevelUpImage = fs.readFileSync('./src/lib/resources/images/skillLevelUpImages/defence.png');
const hitpointsLevelUpImage = fs.readFileSync('./src/lib/resources/images/skillLevelUpImages/hitpoints.png');
const rangedLevelUpImage = fs.readFileSync('./src/lib/resources/images/skillLevelUpImages/ranged.png');
const magicLevelUpImage = fs.readFileSync('./src/lib/resources/images/skillLevelUpImages/magic.png');

const hunterLevelUpTable = [
	{
		lvl: 1,
		messages: ['catch Crimson swifts', 'lay 1 Trap at a time', 'track Polar kebbits'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 3,
		messages: ['track Common kebbits'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 5,
		messages: ['catch Golden warblers', 'use Bird houses'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 7,
		messages: ['track Feldip weasels'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 9,
		messages: ['catch Copper longtails'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 11,
		messages: ['catch Cerulean twitches'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 13,
		messages: ['track Desert devils'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 14,
		messages: ['use Oak bird houses'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 15,
		messages: ['catch Ruby harvests', 'dig for Sandworms'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 17,
		messages: ['access Puro-Puro', 'catch Baby implings'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 19,
		messages: ['catch Tropical Wagtails'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 20,
		messages: ['lay 2 Traps at a time'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 22,
		messages: ['catch Young implings'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 23,
		messages: ['catch Wild kebbits'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 24,
		messages: ['use Willow bird houses'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 25,
		messages: ['catch Sapphire glacialis'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 27,
		messages: ['catch Baby implings (barehanded)', 'catch Ferrets', 'catch White rabbits'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 28,
		messages: ['catch Gourmet implings'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 29,
		messages: ['catch Swamp lizards'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 31,
		messages: ['catch Spined larupias'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 32,
		messages: ['catch Young implings (barehanded)'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 33,
		messages: ['catch Barb-tailed kebbits'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 34,
		messages: ['use Teak bird houses'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 35,
		messages: ['catch Bluegills', 'catch Snowy Knights'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 36,
		messages: ['catch Earth implings'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 37,
		messages: ['catch Prickly kebbits'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 38,
		messages: ['catch Gourmet implings (barehanded)'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 40,
		messages: ['lay 3 Traps at a time'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 41,
		messages: ['catch Horned graahks'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 42,
		messages: ['catch Essence implings'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 43,
		messages: ['catch Spotted kebbits'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 44,
		messages: ['catch Fish shoals', 'use Maple bird houses'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 45,
		messages: ['catch Black warlocks'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 46,
		messages: ['catch Earth implings (barehanded)'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 47,
		messages: ['catch Orange salamanders'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 49,
		messages: ['track Razor-backed kebbits', 'use Mahogany bird houses'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 50,
		messages: ['catch Eclectic implings'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 51,
		messages: ['catch Common tenches', 'catch Sabre-toothed kebbits'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 52,
		messages: ['catch Essence implings (barehanded)'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 53,
		messages: ['catch Chinchompas'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 55,
		messages: ['catch Sabre-toothed Kyatts'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 57,
		messages: ['catch Dark kebbits'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 58,
		messages: ['catch Nature implings'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 59,
		messages: ['catch Red salamanders', 'use Yew bird houses'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 60,
		messages: ['catch Eclectic implings (barehanded)', 'catch Maniacal monkeys', 'lay 4 Traps at a time'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 63,
		messages: ['catch Carnavorous chinchompas'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 65,
		messages: ['catch Magpie implings'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 67,
		messages: ['catch Black salamanders'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 68,
		messages: ['catch Mottled eels', 'catch Nature implings (barehanded)'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 69,
		messages: ['catch Dashing kebbits'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 71,
		messages: ['catch Imps'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 73,
		messages: ['catch Black chinchompas'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 74,
		messages: ['catch Ninja implings', 'use Magic bird houses'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 75,
		messages: ['catch Magpie implings (barehanded)'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 80,
		messages: ['catch Crystal implings', 'lay 5 Traps at a time', 'track Herbiboars'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 83,
		messages: ['catch Dragon implings'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 84,
		messages: ['catch Ninja implings (barehanded)'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 87,
		messages: ['catch Greater sirens'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 89,
		messages: ['catch Lucky implings', 'use Redwood bird houses'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 90,
		messages: ['catch Crystal implings (barehanded)'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 93,
		messages: ['catch Dragon implings (barehanded)'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 99,
		messages: ['buy the Hunter cape and hood', 'catch Lucky implings (barehanded)'],
		skill: SkillsEnum.Hunter
	}
];

export const skillLevelUpImages = {
	agility: agilityLevelUpImage,
	cooking: cookingLevelUpImage,
	fishing: fishingLevelUpImage,
	mining: miningLevelUpImage,
	smithing: smithingLevelUpImage,
	woodcutting: woodcuttingLevelUpImage,
	firemaking: firemakingLevelUpImage,
	runecraft: runecraftLevelUpImage,
	crafting: craftingLevelUpImage,
	prayer: prayerLevelUpImage,
	fletching: fletchingLevelUpImage,
	farming: farmingLevelUpImage,
	herblore: herbloreLevelUpImage,
	thieving: thievingLevelUpImage,
	hunter: hunterLevelUpImage,
	construction: constructionLevelUpImage,
	magic: magicLevelUpImage,
	attack: attackLevelUpImage,
	strength: strengthLevelUpImage,
	defence: defenceLevelUpImage,
	ranged: rangedLevelUpImage,
	hitpoints: hitpointsLevelUpImage,
	slayer: slayerLevelUpImage
};

export async function newLevelUpImage({ lvl, skill }: { lvl: number; skill: keyof typeof skillLevelUpImages }) {
	const canvas = new Canvas(518, 142);
	const ctx = canvas.getContext('2d');
	ctx.imageSmoothingEnabled = false;
	const levelUpImage = await canvasImageFromBuffer(skillLevelUpImages[skill]);
	const bg = await canvasImageFromBuffer(textBoxFile);
	const skillName = toTitleCase(skill);
	ctx.drawImage(bg, 0, 0);
	ctx.drawImage(
		levelUpImage,
		38 - Math.floor(levelUpImage.width / (6 * 1.9)),
		Math.floor(bg.height / 2 - levelUpImage.height / (2 * 1.9) + 2),
		Math.floor(levelUpImage.width / 1.9),
		Math.floor(levelUpImage.height / 1.9)
	);
	ctx.font = '16px RuneScape Quill 8';

	ctx.fillStyle = '#0a0880';
	const congratzMessage = `Congratulations, you just advanced ${
		skill.startsWith('a') ? 'an' : 'a'
	} ${skillName} level.`;
	const congratzMessageWidth = Math.floor(ctx.measureText(congratzMessage).width);
	ctx.fillText(congratzMessage, Math.floor(287 - congratzMessageWidth / 2), 52);
	ctx.fillStyle = '#000';
	const levelUpMessage = `Your ${skillName} level is now ${lvl}.`;
	printWrappedText(ctx, levelUpMessage, 287, bg.height / 2 + 12, 361);

	//Change with levelUpTable in future
	let messages: string[] | undefined = hunterLevelUpTable.find(
		content => content.lvl === lvl && content.skill === skill
	)?.messages;

	if (messages) {
		ctx.font = '16px RuneScape Quill 8';
		messages = messages.sort(() => 0.5 - Math.random()).slice(0, 3);
		messages = messages.map(i => `You can now ${i}!`);
		let y = bg.height / 2 + 28;

		for (const message of messages) {
			printWrappedText(ctx, message, 287, y, 361);
			y += 16;
		}
	}

	return canvas.toBuffer('png');
}

export default async function levelUpImage({ lvl, skill }: { lvl: number; skill: keyof typeof skillLevelUpImages }) {
	const image = await newLevelUpImage({ lvl, skill });
	return new AttachmentBuilder(image);
}

export async function mahojiLevelUp({ lvl, skill }: { lvl: number; skill: keyof typeof skillLevelUpImages }) {
	const image = await newLevelUpImage({ lvl, skill });
	return {
		files: [{ attachment: image, name: 'image.jpg' }]
	};
}
