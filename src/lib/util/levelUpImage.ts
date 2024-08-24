import * as fs from 'node:fs';
import { Canvas, loadImage } from '@napi-rs/canvas';
import { AttachmentBuilder } from 'discord.js';

import { toTitleCase } from '@oldschoolgg/toolkit';
import { printWrappedText } from './canvasUtil';

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
	const levelUpImage = await loadImage(skillLevelUpImages[skill]);
	const bg = await loadImage(textBoxFile);
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

	/* For future
	//Change with levelUpTable in future
	let messages: string[] | undefined = [{
		lvl: 1,
		messages: ['catch Crimson swifts', 'lay 1 Trap at a time', 'track Polar kebbits'],
		skill: SkillsEnum.Hunter
	},
	{
		lvl: 3,
		messages: ['track Common kebbits'],
		skill: SkillsEnum.Hunter
	},].find(
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
	*/

	return canvas.encode('png');
}

export default async function levelUpImage({ lvl, skill }: { lvl: number; skill: keyof typeof skillLevelUpImages }) {
	const image = await newLevelUpImage({ lvl, skill });
	return new AttachmentBuilder(image);
}

export async function mahojiLevelUp({ lvl, skill }: { lvl: number; skill: keyof typeof skillLevelUpImages }) {
	const image = await newLevelUpImage({ lvl, skill });
	return {
		file: { attachment: image, name: 'image.jpg' }
	};
}
