import { Image } from 'canvas';

export function canvasImageFromBuffer(imageBuffer: Buffer): Promise<Image> {
	return new Promise((resolve, reject) => {
		const canvasImage = new Image();

		canvasImage.onload = () => resolve(canvasImage);
		canvasImage.onerror = () => reject(new Error('Failed to load image.'));
		canvasImage.src = imageBuffer;
	});
}
