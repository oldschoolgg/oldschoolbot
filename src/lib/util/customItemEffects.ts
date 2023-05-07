import { Canvas, Image } from '@napi-rs/canvas';

import itemID from './itemID';

export const customItemEffect = new Map([
	[
		itemID('Eggy'),
		(img: Image, userID: string | undefined) => {
			const userIDEffective = userID ?? '11111';
			const canvas = new Canvas(img.width, img.height);
			const ctx = canvas.getContext('2d');
			ctx.filter = `hue-rotate(${userIDEffective.slice(-3)}deg) saturate(.45)`;
			ctx.drawImage(img, 0, 0);
			return canvas;
		}
	]
]);
