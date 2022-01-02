import { ChartConfiguration } from 'chart.js';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

const width = 1000; // px
const height = 500; // px
const backgroundColour = 'white';
const canvasRenderService = new ChartJSNodeCanvas({ width, height, backgroundColour });

export async function generateChart(config: ChartConfiguration) {
	const buffer = await canvasRenderService.renderToBuffer(config);
	return buffer;
}
