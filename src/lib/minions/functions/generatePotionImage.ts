import { createCanvas } from 'canvas';
import { KlasaClient, KlasaUser } from 'klasa';
import { addItemToBank } from 'oldschooljs/dist/util';

import BankImageTask from '../../../tasks/bankImage';
import { UserSettings } from '../../settings/types/UserSettings';
import { stringMatches } from '../../util';
import { canvasImageFromBuffer } from '../../util/canvasImageFromBuffer';
import getOSItem from '../../util/getOSItem';
import Potions from '../data/potions';
import { ItemBank } from './../../types/index';

let bankTask: BankImageTask | null = null;

export async function generatePotionImage(client: KlasaClient, user: KlasaUser) {
	// Init the background images if they are not already
	if (!bankTask) {
		bankTask = client.tasks.get('bankImage') as BankImageTask;
	}

	const userBgID = user.settings.get(UserSettings.BankBackground) ?? 1;
	const userBg = bankTask.backgroundImages.find(i => i.id === userBgID)!.image!;
	const userBank = user.settings.get(UserSettings.Bank);
	const potionSetup = user.settings.get(UserSettings.SelectedPotions);
	let viewPotions: ItemBank = {};

	for (const currentPotion of potionSetup) {
		const potion = Potions.find(_potion => stringMatches(_potion.name, currentPotion));
		if (!potion) continue;
		try {
			const item = getOSItem(potion.items[3]);
			if (userBank[item.id] && !viewPotions[item.id]) {
				viewPotions = addItemToBank(viewPotions, item.id, userBank[item.id]);
			}
		} catch (_) {}
	}
	const potionBankImage = await client.tasks
		.get('bankImage')!
		.generateBankImage(
			viewPotions,
			`Currently selected potions to use.`,
			false,
			{ userBgID, names: 'names' },
			user
		);
	const potionTemplateImage = await canvasImageFromBuffer(potionBankImage);
	const canvas = createCanvas(potionTemplateImage.width, potionTemplateImage.height);
	const ctx = canvas.getContext('2d');
	ctx.imageSmoothingEnabled = false;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(
		userBg,
		(canvas.width - userBg.width) * 0.5,
		(canvas.height - userBg.height) * 0.5
	);
	ctx.drawImage(potionTemplateImage, 0, 0, potionTemplateImage.width, potionTemplateImage.height);
	bankTask?.drawBorder(canvas, false);

	return canvas.toBuffer();
}
