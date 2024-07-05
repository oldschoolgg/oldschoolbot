import { exec } from 'node:child_process';
import { promises as fs } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { miniID } from '@oldschoolgg/toolkit';

function randomHexColor(num: number): string {
	const hue = num * 137.508;
	return `hsl(${hue},50%,75%)`;
}

function createGnuplotScript(
	type: 'pie' | 'line' | 'bar',
	format: ChartType,
	title: string,
	values: [string, number, string?][]
): string {
	let script = `
set terminal pngcairo enhanced font 'Verdana,10'
set output 'chart.png'
set title "${title}"
    `;

	if (format === 'percent') {
		script += `\nset format y "%.0f%%";`;
	}

	if (type === 'pie') {
		script += `
set style data histograms
set style fill solid 1.00 border -1
set boxwidth 0.9
plot '-' using 2:xtic(1) title columnheader linecolor rgb variable
        `;
	} else if (type === 'line') {
		script += `
set xlabel "Category"
set ylabel "Value"
plot '-' using 1:2 with linespoints title columnheader linecolor rgb variable
        `;
} else if (type === 'bar') {
	script += `
set yrange [0:*]
set lmargin 10
set rmargin 10
set tmargin 5
set bmargin 5
set style data histograms
set style histogram cluster
set style fill solid
set boxwidth 0.2
set xlabel "Category"
set ylabel "Value"

${values.map(([_label, value, color = randomHexColor(value)], i) => `set style line ${i + 1} lc rgb "${color}"`).join('\n')}

plot ${values.map(([_label, _value, _color], i) => `'-' using 1:3:xtic(2) with boxes linestyle ${i + 1} title ''`).join(', ')}
${values.map(([label, value], i) => `${i + 1} "${label}" ${value}`).join('\n')}
e
`;
}

	return script;
}

async function saveGnuplotChart(script: string): Promise<Buffer> {
	const scriptID = miniID(10);
	const imageID = miniID(10);
	script = script.replace("'chart.png'", `'${path.join(os.tmpdir(), `chart.${imageID}.png`)}'`);
	console.log(script);
	const scriptPath = path.join(os.tmpdir(), `plot_script.${scriptID}.gp`);
	const outputPath = path.join(os.tmpdir(), `chart.${imageID}.png`);

	await fs.writeFile(scriptPath, script);

	return new Promise<Buffer>((resolve, reject) => {
		exec(`gnuplot ${scriptPath}`, async (error, _stdout, stderr) => {
			if (error) {
				console.error(error);
			}
			if (stderr) {
				console.error(stderr);
			}
			try {
				const buffer = await fs.readFile(outputPath);
				resolve(buffer);
			} catch (readError) {
				reject(readError);
			}
		});
	});
}

const types = [
	{ name: 'percent', format: '%' },
	{ name: 'kmb', format: 'idk' }
] as const;
type ChartType = (typeof types)[number]['name'];

export async function pieChart(title: string, format: ChartType, values: [string, number, string?][]): Promise<Buffer> {
	const script = createGnuplotScript('pie', format, title, values);
	return await saveGnuplotChart(script);
}

export async function lineChart(
	title: string,
	format: ChartType,
	values: [string, number, string?][]
): Promise<Buffer> {
	const script = createGnuplotScript('line', format, title, values);
	return await saveGnuplotChart(script);
}

export async function barChart(title: string, format: ChartType, values: [string, number, string?][]): Promise<Buffer> {
	const script = createGnuplotScript('bar', format, title, values);
	return await saveGnuplotChart(script);
}
