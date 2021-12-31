import { Chart, ChartConfiguration } from 'chart.js';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(ChartDataLabels);
const width = 1000; // px
const height = 500; // px
const backgroundColour = 'white';
const canvasRenderService = new ChartJSNodeCanvas({ width, height, backgroundColour });

export async function generateChart(config: ChartConfiguration) {
	const buffer = await canvasRenderService.renderToBuffer(config);
	return buffer;
}

function randomHexColor(num: number) {
	const hue = num * 137.508; // use golden angle approximation
	return `hsl(${hue},50%,75%)`;
}

export async function pieChart(title: string, values: [string, number][]) {
	const options: ChartConfiguration = {
		type: 'pie',
		data: {
			labels: values.map(i => i[0]),
			datasets: [
				{
					data: values.map(i => i[1]),
					backgroundColor: values.map((_, index) => randomHexColor(index))
				}
			]
		},
		options: {
			plugins: {
				title: { display: true, text: title },
				datalabels: {
					font: {
						weight: 'bolder'
					}
				}
			}
		}
	};
	return generateChart(options);
}
