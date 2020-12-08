import { CanvasRenderingContext2D } from 'canvas';

export function fillTextXTimesInCtx(
	ctx: CanvasRenderingContext2D,
	text: string,
	x: number,
	y: number,
	numberOfTimes = 3
) {
	for (let i = 0; i < numberOfTimes; i++) {
		ctx.fillText(text, x, y);
	}
}
