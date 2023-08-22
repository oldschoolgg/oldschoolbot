import type { ChartConfiguration } from 'chart.js';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

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

export async function pieChart(title: string, format: (value: any) => string, values: [string, number, string?][]) {
	const options: ChartConfiguration = {
		type: 'pie',
		data: {
			labels: values.map(i => i[0]),
			datasets: [
				{
					data: values.map(i => i[1]),
					backgroundColor: values.map((val, index) => val[2] ?? randomHexColor(index))
				}
			]
		},
		options: {
			plugins: {
				title: { display: true, text: title },
				datalabels: {
					font: {
						weight: 'bolder'
					},
					formatter(value) {
						return format(value);
					}
				}
			}
		}
	};
	return generateChart(options);
}
export async function lineChart(
	title: string,
	values: [string, number, string?][],
	yFormat: (value: any) => string = (value: any) => value,
	xFormat: (value: any) => string = (value: any) => value
) {
	const options: ChartConfiguration = {
		type: 'line',
		data: {
			labels: values.map(i => `${xFormat(i[0])}`),
			datasets: [
				{
					data: values.map(i => i[1]),
					backgroundColor: values.map((val, index) => val[2] ?? randomHexColor(index))
				}
			]
		},
		options: {
			plugins: {
				title: { display: true, text: title },
				datalabels: {
					font: {
						weight: 'bolder'
					},
					formatter(value) {
						return `${yFormat(value)}`;
					}
				},
				legend: {
					display: false
				}
			}
		}
	};
	return generateChart(options);
}

export async function barChart(title: string, format: (value: any) => string, values: [string, number, string?][]) {
	const options: ChartConfiguration = {
		type: 'bar',
		data: {
			labels: values.map(i => format(i[0])),
			datasets: [
				{
					data: values.map(i => i[1]),
					backgroundColor: values.map((val, index) => val[2] ?? randomHexColor(index))
				}
			]
		},
		options: {
			plugins: {
				title: { display: true, text: title },
				datalabels: {
					font: {
						weight: 'bolder'
					},
					formatter(value) {
						return format(value);
					}
				},
				legend: {
					display: false
				}
			}
		}
	};
	return generateChart(options);
}
