import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { addItemToBank } from 'oldschooljs/dist/util';
import { Canvas } from 'skia-canvas/lib';

import BankImageTask from '../../../tasks/bankImage';
import { UserSettings } from '../../settings/types/UserSettings';
import { stringMatches } from '../../util';
import { canvasImageFromBuffer } from '../../util/canvasUtil';
import getOSItem from '../../util/getOSItem';
import { makeBankImage } from '../../util/makeBankImage';
import Potions from '../data/potions';
import { ItemBank } from './../../types/index';

let bankTask: BankImageTask | null = null;

export async function generatePotionImage(user: KlasaUser) {
	// Init the background images if they are not already
	if (!bankTask) {
		bankTask = globalClient.tasks.get('bankImage') as BankImageTask;
	}

	const bankBg = user.settings.get(UserSettings.BankBackground) ?? 1;

	let { sprite, uniqueSprite, background: userBgImage } = bankTask.getBgAndSprite(bankBg);

	const hexColor = user.settings.get(UserSettings.BankBackgroundHex);

	const userBank = user.bank().values();
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
	const potionBankImage = await makeBankImage({
		bank: new Bank(viewPotions),
		title: 'Currently selected potions to use.',
		background: bankBg,
		flags: { names: 'names' },
		user
	});

	const potionTemplateImage = await canvasImageFromBuffer(potionBankImage.file.buffer);
	const canvas = new Canvas(potionTemplateImage.width, potionTemplateImage.height);
	const ctx = canvas.getContext('2d');
	ctx.imageSmoothingEnabled = false;
	ctx.fillStyle = userBgImage.transparent
		? hexColor
			? hexColor
			: 'transparent'
		: ctx.createPattern(sprite.repeatableBg, 'repeat')!;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	if (!uniqueSprite) {
		ctx.drawImage(
			userBgImage.image!,
			(canvas.width - userBgImage.image!.width) * 0.5,
			(canvas.height - userBgImage.image!.height) * 0.5
		);
	}
	ctx.drawImage(potionTemplateImage, 0, 0, potionTemplateImage.width, potionTemplateImage.height);
	if (!userBgImage.transparent) bankTask?.drawBorder(ctx, sprite, false);

	return canvas.toBuffer('png');
}
